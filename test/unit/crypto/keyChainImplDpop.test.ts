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
import childProcess, { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { expect } from 'chai';
import { KeychainAccess, keyChainImpl } from '../../../src/crypto/keyChainImpl';
import { TestContext } from '../../../src/testSetup';

type OsImpl = ConstructorParameters<typeof KeychainAccess>[0];

type SpawnedCommand = {
  program: string;
  args: string[];
  stdin: string;
};

const PRIVATE_KEY = 'private-key-material';
const REFERENCE = { service: 'sfdx-dpop', account: 'test-reference' };

// Every program "exists" and is executable, so validation never touches the real file system.
const executableFs = {
  statSync: () => ({ mode: 0o755, gid: 0, uid: 0 }),
} as unknown as ConstructorParameters<typeof KeychainAccess>[1];

const osImplOf = (access: KeychainAccess): OsImpl => (access as unknown as { osImpl: OsImpl }).osImpl;

/**
 * Stubs child_process.spawn with fake processes that record their arguments and stdin.
 * `respond` returns stdout for the nth recorded command.
 */
const stubSpawn = (
  $$: TestContext,
  respond: (command: SpawnedCommand, index: number) => string
): { commands: SpawnedCommand[] } => {
  const commands: SpawnedCommand[] = [];
  $$.SANDBOX.stub(childProcess, 'spawn').callsFake((program: string, args: readonly string[] = []) => {
    const command: SpawnedCommand = { program, args: [...args], stdin: '' };
    const index = commands.push(command) - 1;
    const child = new EventEmitter() as ChildProcess;
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const stderr = new PassThrough();
    stdin.on('data', (chunk: Buffer) => {
      command.stdin += chunk.toString();
    });
    stdin.on('finish', () => {
      setImmediate(() => {
        stdout.end(respond(command, index));
        stderr.end();
        child.emit('exit', 0, null);
        child.emit('close', 0, null);
      });
    });
    Object.assign(child, { stdin, stdout, stderr, pid: 1000 + index });
    return child;
  });
  return { commands };
};

const encoded = Buffer.from(PRIVATE_KEY).toString('base64');

describe('KeychainAccess DPoP secrets', () => {
  const $$ = new TestContext();

  beforeEach(() => {
    $$.SANDBOXES.CRYPTO.restore();
  });

  it('stores, retrieves, and deletes DPoP secrets in the macOS keychain over stdin, not process arguments', async () => {
    const access = new KeychainAccess(osImplOf(keyChainImpl.darwin), executableFs);
    let nativeCall = 0;
    const { commands } = stubSpawn($$, () => {
      nativeCall += 1;
      return nativeCall === 2 ? encoded : 'ok';
    });

    await access.setSecret(REFERENCE, PRIVATE_KEY);
    const secret = await access.getSecret(REFERENCE);
    await access.deleteSecret(REFERENCE);

    expect(secret).to.equal(PRIVATE_KEY);
    expect(commands).to.have.length(3);
    expect(commands.every((command) => command.stdin.length > 0)).to.be.true;
    const argv = commands.flatMap((command) => [command.program, ...command.args]).join(' ');
    expect(argv).to.not.include(PRIVATE_KEY);
    expect(argv).to.not.include(encoded);
    expect(commands[0].stdin).to.not.include(PRIVATE_KEY);
    expect(commands[0].stdin).to.include(encoded);
  });

  it('stores, retrieves, and deletes DPoP secrets in Linux secret-tool over stdin', async () => {
    const access = new KeychainAccess(osImplOf(keyChainImpl.linux), executableFs);
    let nativeCall = 0;
    const { commands } = stubSpawn($$, () => {
      nativeCall += 1;
      return nativeCall === 2 ? `${encoded}\n` : '';
    });

    await access.setSecret(REFERENCE, PRIVATE_KEY);
    const secret = await access.getSecret(REFERENCE);
    await access.deleteSecret(REFERENCE);

    expect(secret).to.equal(PRIVATE_KEY);
    expect(commands).to.have.length(3);
    expect(commands.map((command) => command.program)).to.deep.equal(
      Array(3).fill(osImplOf(keyChainImpl.linux).getProgram())
    );
    expect(commands.map((command) => command.args[0])).to.deep.equal(['store', 'lookup', 'clear']);
    expect(commands[0].stdin).to.equal(encoded);
    const argv = commands.flatMap((command) => command.args).join(' ');
    expect(argv).to.not.include(PRIVATE_KEY);
    expect(argv).to.not.include(encoded);
    expect(argv).to.include(REFERENCE.service);
    expect(argv).to.include(REFERENCE.account);
  });

  it('rejects when the native program reports a missing secret', async () => {
    const access = new KeychainAccess(osImplOf(keyChainImpl.linux), executableFs);
    stubSpawn($$, () => '');

    try {
      await access.getSecret(REFERENCE);
      expect.fail('expected getSecret to reject');
    } catch (e) {
      expect(e).to.be.an('error');
      expect((e as Error).message).to.not.include(PRIVATE_KEY);
    }
  });
});
