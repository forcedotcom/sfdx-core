/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * Refresh Token Rotation (RTR) concurrency NUT.
 *
 * Proves that when many connections/AuthInfos for the SAME web-OAuth auth refresh at once, the
 * token-rotation lock in AuthInfo.refreshFn serializes them: exactly one (a few, at most) actually
 * rotates the refresh token and the rest adopt the already-rotated token from disk. Without the lock,
 * every contender would POST the same refresh token simultaneously and RTR would fail them with
 * "Token request is already being processed" (and invalidate the current token).
 *
 * This test hits a REAL org and rotates real tokens, so it is OFF by default. It is gated behind
 * RTR_NUT and is intended to run ad-hoc/locally (like the long sandbox tests), not in the standard
 * CI matrix. Enable and target it with:
 *
 *   # Reuse an existing web-authed scratch org (username or alias):
 *   RTR_NUT=1 RTR_SCRATCH_USERNAME=should-be-web-auth \
 *     yarn mocha test/nut/refreshTokenRotation.nut.ts --timeout 600000
 *
 *   # Or let it create + clean up a fresh 1-day scratch org from a WEB-AUTHED dev hub:
 *   RTR_NUT=1 RTR_DEVHUB=my-web-authed-hub \
 *     yarn mocha test/nut/refreshTokenRotation.nut.ts --timeout 600000
 *
 * The dev hub must be web/refresh-token authed, NOT JWT. Scratch orgs inherit the hub's OAuth flow
 * (see scratchOrgInfoApi.buildOAuth2Options), so a web-authed hub yields a web/refresh-token-authed
 * scratch org, while a JWT hub yields a JWT org with no refresh token (RTR would not apply). The hub's
 * connected app must also have RTR enabled; assertion (3) below verifies the token actually rotated.
 *
 * Optional: RTR_CONCURRENCY (default 30).
 */

import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { expect } from 'chai';
import { OAuth2 } from '@jsforce/jsforce-node';
import { AuthInfo } from '../../src/org/authInfo';
import { Connection } from '../../src/org/connection';
import { StateAggregator } from '../../src/stateAggregator/stateAggregator';

const execProm = promisify(exec);

const CONCURRENCY = Number(process.env.RTR_CONCURRENCY ?? 30);
const enabled = Boolean(process.env.RTR_NUT);

/** Resolve an alias (or pass through a raw username) to the underlying auth-file username. */
async function resolveUsername(usernameOrAlias: string): Promise<string> {
  const stateAggregator = await StateAggregator.getInstance();
  return stateAggregator.aliases.getUsername(usernameOrAlias) ?? usernameOrAlias;
}

/**
 * Create a throwaway, web/refresh-token-authed scratch org from a WEB-AUTHED dev hub.
 *
 * Scratch orgs inherit the dev hub's OAuth flow (see scratchOrgInfoApi.buildOAuth2Options): when the
 * hub has no `privateKey` (it is web/refresh-token authed), signup takes the auth-code exchange path
 * and the resulting scratch org gets its own refresh token -- exactly what RTR needs. A JWT hub would
 * instead yield a JWT scratch org with no refresh token, so this NUT requires a web-authed hub.
 * Returns the username and the temp project dir (for cleanup).
 */
async function createWebAuthedScratchOrg(): Promise<{ username: string; projectDir: string }> {
  const devhub = process.env.RTR_DEVHUB;
  if (!devhub) {
    throw new Error(
      'Set RTR_SCRATCH_USERNAME to reuse a web-authed org, or RTR_DEVHUB to a web-authed dev hub to create one.'
    );
  }
  const projectDir = await mkdtemp(join(tmpdir(), 'rtr-nut-'));
  await writeFile(
    join(projectDir, 'sfdx-project.json'),
    JSON.stringify({ packageDirectories: [{ path: 'force-app', default: true }], namespace: '' }, null, 2)
  );
  await mkdir(join(projectDir, 'force-app'), { recursive: true });
  await mkdir(join(projectDir, 'config'), { recursive: true });
  await writeFile(
    join(projectDir, 'config', 'project-scratch-def.json'),
    JSON.stringify({ orgName: 'RTR NUT', edition: 'Developer' }, null, 2)
  );

  let stdout: string;
  try {
    ({ stdout } = await execProm(
      `sf org create scratch --definition-file config/project-scratch-def.json --target-dev-hub ${devhub} --duration-days 1 --wait 10 --json`,
      { cwd: projectDir, maxBuffer: 10 * 1024 * 1024 }
    ));
  } catch (err: unknown) {
    const e = err as Error & { stdout?: string; stderr?: string };
    throw new Error(
      `sf org create scratch failed.\nstdout: ${e.stdout ?? '(empty)'}\nstderr: ${e.stderr ?? '(empty)'}`,
      { cause: err }
    );
  }
  const parsed = JSON.parse(stdout) as { result: { username: string } };
  return { username: parsed.result.username, projectDir };
}

(enabled ? describe : describe.skip)('Refresh Token Rotation concurrency (NUT, ad-hoc)', () => {
  let username: string;
  let createdProjectDir: string | undefined;

  before(async function () {
    this.timeout(600_000);
    if (process.env.RTR_SCRATCH_USERNAME) {
      username = await resolveUsername(process.env.RTR_SCRATCH_USERNAME);
    } else {
      const created = await createWebAuthedScratchOrg();
      username = created.username;
      createdProjectDir = created.projectDir;
    }
  });

  after(async function () {
    this.timeout(120_000);
    // Only clean up an org WE created; never delete a user-provided org.
    if (createdProjectDir) {
      await execProm(`sf org delete scratch --target-org ${username} --no-prompt`).catch(() => {});
      await rm(createdProjectDir, { recursive: true, force: true });
    }
  });

  it(`serializes ${CONCURRENCY} concurrent refreshes: one rotates, the rest adopt (no RTR contention errors)`, async function () {
    this.timeout(600_000);

    // Precondition: this must be a web/refresh-token auth (RTR only applies here), not JWT.
    StateAggregator.clearInstance();
    const seed = await AuthInfo.create({ username });
    const fields = seed.getFields(true);
    expect(fields.refreshToken, 'target org must be web/refresh-token authed').to.be.a('string');
    expect(fields.privateKey, 'target org must not be JWT-authed').to.be.undefined;
    const originalRefreshToken = fields.refreshToken;

    // Invalidate the on-disk access token so the next API call 401s (INVALID_SESSION_ID) and triggers
    // a real refresh through core's refreshFn.
    seed.update({ accessToken: '00Dxx0000000000!INVALID_ACCESS_TOKEN_forcing_a_refresh' });
    await seed.save();

    // Count real refresh POSTs to the token endpoint (in-process, so we can wrap while still hitting
    // the network). One rotation is expected; adopters skip the endpoint entirely.
    const originalRefresh = OAuth2.prototype.refreshToken;
    let realRefreshCalls = 0;
    OAuth2.prototype.refreshToken = async function (...args: Parameters<typeof originalRefresh>) {
      realRefreshCalls++;
      return originalRefresh.apply(this, args);
    };

    let results: Array<PromiseSettledResult<unknown>>;
    try {
      // N independent Connections (each with its own SessionRefreshDelegate) to the same auth — the
      // real multi-connection hazard. Fire their queries concurrently so they all refresh at once.
      const connections = await Promise.all(
        Array.from({ length: CONCURRENCY }, async () => {
          const authInfo = await AuthInfo.create({ username });
          return Connection.create({ authInfo });
        })
      );
      results = await Promise.allSettled(
        connections.map((conn) => conn.singleRecordQuery('SELECT Id FROM Organization'))
      );
    } finally {
      OAuth2.prototype.refreshToken = originalRefresh;
    }

    const rejected = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');
    const failureMessages = rejected.map((r) => (r.reason as Error).message);

    // (1) Every concurrent request succeeds.
    expect(
      rejected,
      `all ${CONCURRENCY} requests should succeed; failures: ${failureMessages.join(' | ')}`
    ).to.have.length(0);

    // (2) No RTR contention error (the exact failure the lock prevents).
    expect(
      failureMessages.some((m) => /already being processed/i.test(m)),
      'no "Token request is already being processed" errors'
    ).to.be.false;

    // (3) The refresh token actually rotated — proves RTR is live for this app and the flow persisted it.
    StateAggregator.clearInstance();
    const afterFields = (await AuthInfo.create({ username })).getFields(true);
    expect(afterFields.refreshToken, 'refresh token should have rotated').to.not.equal(originalRefreshToken);

    // (4) The lock+adopt collapsed N contenders into far fewer real refreshes (ideally 1). Exact count
    // is timing-dependent (all AuthInfos share the per-dir StateAggregator cache), so assert strictly
    // fewer than the fan-out and at least one, and log the actual number.
    // eslint-disable-next-line no-console
    console.log(`[RTR NUT] concurrency=${CONCURRENCY} realRefreshCalls=${realRefreshCalls}`);
    expect(realRefreshCalls, 'at least one real rotation must happen').to.be.greaterThan(0);
    expect(realRefreshCalls, 'adoption should avoid one refresh per connection').to.be.lessThan(CONCURRENCY);

    // (5) No lockout: a fresh connection still works after the storm.
    StateAggregator.clearInstance();
    const post = await Connection.create({ authInfo: await AuthInfo.create({ username }) });
    const org = await post.singleRecordQuery<{ Id: string }>('SELECT Id FROM Organization');
    expect(org.Id, 'org should still be usable after concurrent rotation').to.be.a('string');
  });
});
