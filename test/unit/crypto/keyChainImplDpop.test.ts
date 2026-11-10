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

type Response = string | { stdout?: string; stderr?: string; code?: number };

/**
 * Stubs child_process.spawn with fake processes that record their arguments and stdin.
 * `respond` returns stdout, or the stdout, stderr, and exit code, for the nth recorded command.
 */
const stubSpawn = (
  $$: TestContext,
  respond: (command: SpawnedCommand, index: number) => Response
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
        const response = respond(command, index);
        const {
          stdout: out = '',
          stderr: err = '',
          code = 0,
        } = typeof response === 'string' ? { stdout: response } : response;
        stdout.end(out);
        stderr.end(err);
        // Let the output reach its listeners before the process closes, as it does for a real process.
        setImmediate(() => {
          child.emit('exit', code, null);
          child.emit('close', code, null);
        });
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

  describe('macOS', () => {
    const SECURITY = '/usr/bin/security';
    const PEM = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49\n-----END PRIVATE KEY-----\n';
    const hexOf = (value: string): string => Buffer.from(value).toString('hex');
    const darwin = (): KeychainAccess => new KeychainAccess(osImplOf(keyChainImpl.darwin), executableFs);

    /** Retrieves a secret with `security find-generic-password -g` writing `stderr`. */
    const retrieveWith = async (stderr: string): Promise<string> => {
      stubSpawn($$, () => ({ stderr: `keychain: "/Users/me/Library/Keychains/login.keychain-db"\n${stderr}\n` }));
      return darwin().getSecret(REFERENCE);
    };

    const rejection = async (promise: Promise<unknown>): Promise<Error> => {
      try {
        await promise;
      } catch (e) {
        return e as Error;
      }
      throw new Error('expected a rejection');
    };

    it('stores, retrieves, and deletes secrets with /usr/bin/security, with the secret only on stdin', async () => {
      const access = darwin();
      const { commands } = stubSpawn($$, (command) =>
        command.args[0] === 'find-generic-password' ? { stderr: `password: 0x${hexOf(PEM).toUpperCase()}  "..."` } : ''
      );

      await access.setSecret(REFERENCE, PEM);
      const secret = await access.getSecret(REFERENCE);
      await access.deleteSecret(REFERENCE);

      expect(secret).to.equal(PEM);
      expect(commands.map((command) => command.program)).to.deep.equal([SECURITY, SECURITY, SECURITY]);
      expect(commands.map((command) => command.args)).to.deep.equal([
        ['-i'],
        ['find-generic-password', '-a', REFERENCE.account, '-s', REFERENCE.service, '-g'],
        ['delete-generic-password', '-a', REFERENCE.account, '-s', REFERENCE.service],
      ]);
      expect(commands[0].stdin).to.equal(
        `add-generic-password -U -a ${REFERENCE.account} -s ${REFERENCE.service} -X ${hexOf(PEM)}\n`
      );
      const argv = commands.flatMap((command) => command.args).join(' ');
      expect(argv).to.not.include(hexOf(PEM));
      expect(argv).to.not.include(Buffer.from(PEM).toString('base64'));
    });

    it('reads a value that security writes as text', async () => {
      expect(await retrieveWith('password: "abc"')).to.equal('abc');
    });

    it('reads a value with quotes that security writes as text', async () => {
      expect(await retrieveWith('password: "he said "hi""')).to.equal('he said "hi"');
    });

    it('reads a value that looks like hex but security writes as text', async () => {
      expect(await retrieveWith('password: "deadbeef"')).to.equal('deadbeef');
    });

    it('rejects a missing secret without the output in the error', async () => {
      stubSpawn($$, () => ({
        stderr: 'security: SecKeychainSearchCopyNext: The specified item could not be found in the keychain.',
        code: 44,
      }));

      const error = await rejection(darwin().getSecret(REFERENCE));

      expect(error).to.have.property('name', 'SecretCommandError');
      expect(error.message).to.include('44');
    });

    it('rejects a failed store', async () => {
      stubSpawn($$, () => ({ stderr: 'add-generic-password: returned -25299', code: 45 }));

      const error = await rejection(darwin().setSecret(REFERENCE, PEM));

      expect(error).to.have.property('name', 'SecretCommandError');
    });

    it('rejects deleting a missing secret', async () => {
      stubSpawn($$, () => ({ code: 44 }));

      const error = await rejection(darwin().deleteSecret(REFERENCE));

      expect(error).to.have.property('name', 'SecretCommandError');
    });

    it('refuses a store too long for one security -i line without running security', async () => {
      const { commands } = stubSpawn($$, () => '');

      const error = await rejection(darwin().setSecret(REFERENCE, 'x'.repeat(3000)));

      expect(error).to.have.property('name', 'SecretCommandError');
      expect(commands).to.be.empty;
    });

    it('refuses a store whose names security -i would split, without running security', async () => {
      const { commands } = stubSpawn($$, () => '');

      const error = await rejection(darwin().setSecret({ ...REFERENCE, account: 'a b -X 00' }, PEM));

      expect(error).to.have.property('name', 'SecretCommandError');
      expect(commands).to.be.empty;
    });
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
