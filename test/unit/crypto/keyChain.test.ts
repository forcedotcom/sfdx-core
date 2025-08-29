/*
 * Copyright 2025, Salesforce, Inc.
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

import * as path from 'node:path';
import * as fs from 'node:fs';
import { Nullable } from '@salesforce/ts-types';
import { expect } from 'chai';
import { retrieveKeychain } from '../../../src/crypto/keyChain';
import {
  GenericUnixKeychainAccess,
  GenericWindowsKeychainAccess,
  keyChainImpl,
} from '../../../src/crypto/keyChainImpl';
import { TestContext } from '../../../src/testSetup';

describe('keyChain', () => {
  const $$ = new TestContext();
  const OLD_SFDX_GENERIC_VAL = process.env.SF_USE_GENERIC_UNIX_KEYCHAIN;
  const OLD_GENERIC_VAL = process.env.USE_GENERIC_UNIX_KEYCHAIN;

  beforeEach(() => {
    // Testing crypto functionality, so restore global stubs.
    $$.SANDBOXES.CRYPTO.restore();

    process.env.SF_USE_GENERIC_UNIX_KEYCHAIN = 'false';
    process.env.USE_GENERIC_UNIX_KEYCHAIN = 'false';
  });

  after(() => {
    process.env.SF_USE_GENERIC_UNIX_KEYCHAIN = OLD_SFDX_GENERIC_VAL ?? '';
    process.env.USE_GENERIC_UNIX_KEYCHAIN = OLD_GENERIC_VAL ?? '';
  });

  it('should return OSX keychain and lib secret', async () => {
    $$.SANDBOX.stub(keyChainImpl.linux, 'validateProgram').resolves();

    const testArray = [
      { osName: 'linux', validateString: 'secret' },
      {
        osName: 'darwin',
        validateString: 'security',
      },
    ];

    const keyChains = await Promise.all(testArray.map((obj) => retrieveKeychain(obj.osName)));
    keyChains.map((kc) => {
      expect(kc).to.have.property('osImpl');
      // @ts-expect-error osImpl is a private member
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const program = kc['osImpl'].getProgram();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const testArrayMeta = testArray.find((elem) => program.includes(elem.validateString));
      expect(testArrayMeta == null).to.be.false;
    });
    // return Promise.all(promiseArray).then((_keychains) => {
    //   _.forEach(_keychains, (_keychain: any) => {
    //     expect(_keychain).to.have.property('osImpl');
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    //     const program = _keychain['osImpl'].getProgram();
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    //     const testArrayMeta = _.find(testArray, (elem: any) => program.includes(elem.validateString));
    //     expect(testArrayMeta == null).to.be.false;
    //   });
    // });
  });

  it('should return generic unix for OSX and Linux', async () => {
    process.env.SF_USE_GENERIC_UNIX_KEYCHAIN = 'true';
    const darwinKeychain = await retrieveKeychain('darwin');
    const linuxKeychain = await retrieveKeychain('linux');

    expect(darwinKeychain).to.be.instanceOf(GenericUnixKeychainAccess);
    expect(linuxKeychain).to.be.instanceOf(GenericUnixKeychainAccess);
  });

  it('should return generic windows for windows and win32 platform', async () => {
    const windowsKeychain = await retrieveKeychain('windows');
    const win32Keychain = await retrieveKeychain('win32');
    expect(windowsKeychain).to.be.instanceOf(GenericWindowsKeychainAccess);
    expect(win32Keychain).to.be.instanceOf(GenericWindowsKeychainAccess);
  });

  it('no key.json file should result in a PasswordNotFoundError', async () => {
    const TEST_PASSWORD = 'foo';
    const windowsKeychain = await retrieveKeychain('windows');

    const accessSpy = $$.SANDBOX.stub(fs.promises, 'access').throws({ code: 'ENOENT' });
    const writeFileStub = $$.SANDBOX.stub(fs.promises, 'writeFile').resolves(undefined);

    const service = 'sfdx';
    const account = 'local';

    return windowsKeychain
      .getPassword({ service, account }, (getPasswordError: Nullable<Error>) => {
        expect(getPasswordError).have.property('name', 'PasswordNotFoundError');
        expect(accessSpy.called).to.be.true;
        const arg: string = accessSpy.args[0][0] as string;
        expect(arg.endsWith('.sfdx')).to.be.true;
        accessSpy.resetHistory();
      })
      .then(() =>
        windowsKeychain.setPassword(
          { service, account, password: TEST_PASSWORD },
          (setPasswordError: Nullable<Error>) => {
            expect(setPasswordError).to.be.null;
            expect(writeFileStub.called).to.be.true;
            expect(writeFileStub.args).to.have.length(1);
            expect(writeFileStub.args[0]).to.have.length(3);
            expect(writeFileStub.args[0][0]).to.include(path.join('.sfdx', 'key.json'));
            expect(writeFileStub.args[0][1]).to.include(TEST_PASSWORD);
          }
        )
      );
  });
});
