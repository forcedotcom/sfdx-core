/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import fs from 'node:fs';
import { assert, expect } from 'chai';
import { KeychainAccess, keyChainImpl } from '../../../src/crypto/keyChainImpl';
import { shouldThrow, TestContext } from '../../../src/testSetup';

const testImpl = {
  getProgram() {
    return 'path/to/program';
  },

  getProgramOptions() {
    return [];
  },

  getCommandFunc(opts: any, fn: any) {
    return fn(testImpl.getProgram(), testImpl.getProgramOptions());
  },

  async onGetCommandClose(code: any, stdout: any, stderr: any, opts: any, fn: any) {
    fn(null, '');
  },

  setProgramOptions() {
    return [];
  },

  setCommandFunc(opts: any, fn: any) {
    return fn(testImpl.getProgram(), testImpl.setProgramOptions());
  },

  async onSetCommandClose(code: any, stdout: any, stderr: any, opts: any, fn: any) {
    fn();
  },
};

describe('KeyChainImpl Tests', () => {
  const $$ = new TestContext();

  beforeEach(() => {
    // Testing crypto functionality, so restore global stubs.
    $$.SANDBOXES.CRYPTO.restore();
  });

  describe('keychain program file issues', () => {
    it('File not found', async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await keyChainImpl.validateProgram.bind(null, `/foo/bar/${$$.uniqid()}`, fs);
        assert('keyChainImpl.validateProgram() should have thrown an error');
      } catch (err) {
        expect(err).to.have.property('name', 'MissingCredentialProgramError');
      }
    });

    it('File not executable', async () => {
      const fsImpl = {
        statSync() {
          return {
            mode: 1,
            gid: 1,
            uid: 1,
          };
        },
      };

      try {
        // @ts-expect-error - no overloaded method matches
        // eslint-disable-next-line @typescript-eslint/await-thenable
        await keyChainImpl.validateProgram.bind(null, `/foo/bar/${$$.uniqid()}`, fsImpl, () => false);
        assert('keyChainImpl.validateProgram() should have thrown an error');
      } catch (err) {
        expect(err).to.have.property('name', 'CredentialProgramAccessError');
      }
    });
  });

  describe('KeyChainAccess', () => {
    describe('getPassword', () => {
      it('missing program', async () => {
        const access = new KeychainAccess(testImpl, fs);

        try {
          await shouldThrow(access.getPassword({ account: '', service: '', password: '' }, () => {}));
        } catch (error) {
          expect((error as Error).name).to.equal('MissingCredentialProgramError');
        }
      });
      (process.platform !== 'win32' ? it : it.skip)('program access', async () => {
        // @ts-expect-error - invalid type
        $$.SANDBOX.stub(fs, 'statSync').returns(true);
        const access = new KeychainAccess(testImpl, fs);

        try {
          await shouldThrow(access.getPassword({ account: '', service: '', password: '' }, () => {}));
        } catch (error) {
          expect((error as Error).name).to.equal('CredentialProgramAccessError');
        }
      });
      it('requires account', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        // @ts-expect-error: null account
        await access.getPassword({ account: null, service: '', password: '' }, (error) => {
          expect((error as Error).name).to.equal('KeyChainAccountRequiredError');
          set = true;
        });
        assert(set);
      });
      it('requires service', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        // @ts-expect-error: null service
        await access.getPassword({ account: '', service: null, password: '' }, (error) => {
          expect((error as Error).name).to.equal('KeyChainServiceRequiredError');
          set = true;
        });
        assert(set);
      });
    });

    describe('setPassword', () => {
      it('requires account', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        // @ts-expect-error: null account
        await access.setPassword({ account: null, service: '', password: '' }, (error) => {
          expect((error as Error).name).to.equal('KeyChainAccountRequiredError');
          set = true;
        });
        assert(set);
      });
      it('requires service', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        // @ts-expect-error: null service
        await access.setPassword({ account: '', service: null, password: '' }, (error) => {
          expect((error as Error).name).to.equal('KeyChainServiceRequiredError');
          set = true;
        });
        assert(set);
      });
      it('requires service', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        // @ts-expect-error: null password
        await access.setPassword({ account: '', service: '', password: null }, (error) => {
          expect((error as Error).name).to.equal('PasswordRequiredError');
          set = true;
        });
        assert(set);
      });
    });
  });

  describe('OS Tests', () => {
    const platforms = {
      DARWIN: 'darwin',
      LINUX: 'linux',
      GENERIC_UNIX: 'generic_unix',
      GENERIC_WINDOWS: 'generic_windows',
    };

    const keyChainOptions = {
      service: 'venkman',
      account: 'spengler',
      password: 'keymaster',
    };

    const _testForPlatform = function (done: any) {
      // @ts-expect-error - this is any
      expect(this.platformImpl).not.to.be.null;
      // @ts-expect-error - this is any
      expect(this.platformImpl).not.to.be.undefined;
      done();
    };

    const _getCommandFunc = function (done: any) {
      const testFunc = function (pgmPath: string, options: any) {
        /// @ts-expect-error - this is any
        expect(pgmPath).to.equal(this.platformImpl.osImpl.getProgram());
        expect(options).to.include(keyChainOptions.service).and.to.include(keyChainOptions.account);
      };

      // @ts-expect-error - this is any
      this.platformImpl.osImpl.getCommandFunc(keyChainOptions, testFunc.bind(this));
      done();
    };

    const _OnGetCommandError = function (done: any) {
      const responseFunc = function (err: unknown) {
        expect(err).to.have.property('name', 'PasswordNotFoundError');
      };

      // @ts-expect-error - this is any
      this.platformImpl.osImpl.onGetCommandClose(1, 'zuul', 'dana', keyChainOptions, responseFunc.bind(this));
      done();
    };

    const _OnGetCommandMacUserCanceled = function (done: any) {
      const responseFunc = function (err: unknown) {
        expect(err).to.have.property('name', 'KeyChainUserCanceledError');
      };

      // @ts-expect-error - this is any
      this.platformImpl.osImpl.onGetCommandClose(128, 'zuul', 'dana', null, responseFunc.bind(this));
      done();
    };

    const _OnSetFunc = function (done: any) {
      const testFunc = function (pgmPath: any, options: any) {
        // @ts-expect-error - this is any
        expect(pgmPath).to.equal(this.platformImpl.osImpl.getProgram());
        expect(options).to.include(keyChainOptions.password);
        expect(options).to.include(keyChainOptions.service).and.to.include(keyChainOptions.account);
      };
      // passwords for linux are read properly from stdin. Boo Windows and Mac
      // @ts-expect-error - this is any
      if (this.platform !== platforms.LINUX) {
        // @ts-expect-error - this is any
        this.platformImpl.osImpl.setCommandFunc(keyChainOptions, testFunc.bind(this));
      }
      done();
    };

    const _OnGetCommandLinuxRetry = async function () {
      // @ts-expect-error - this is any
      const onGetCommandCloseFn = this.platformImpl.osImpl.onGetCommandClose.bind(
        null,
        1,
        null,
        'invalid or unencryptable secret',
        keyChainOptions,
        () => {}
      );
      try {
        await shouldThrow(onGetCommandCloseFn());
      } catch (err) {
        expect(err).to.have.property('retry', true);
      }
    };

    const _tests = function (this: any) {
      it('Found Impl', _testForPlatform.bind(this));
      it('getCommandFunc', _getCommandFunc.bind(this));
      it('OnGetCommand Close Error', _OnGetCommandError.bind(this));
      it('OnSetFunc', _OnSetFunc.bind(this));

      if (this.platform === platforms.DARWIN) {
        it('User canceled keychain user/password prompt', _OnGetCommandMacUserCanceled.bind(this));
      }

      if (this.platform === platforms.LINUX) {
        it('Should indicate retry logic', _OnGetCommandLinuxRetry.bind(this));
      }
    };

    Object.keys(platforms).forEach((platformKey) => {
      if (Object.hasOwnProperty.call(platforms, platformKey)) {
        // @ts-expect-error - element is any
        const platform = platforms[platformKey];
        // this test is very much tied to various internal keychain impls. generic_unix doesn't rely on a
        // third-party program.
        if (!(platform === platforms.GENERIC_UNIX || platform === platforms.GENERIC_WINDOWS)) {
          // @ts-expect-error - element is any
          const platformImpl = keyChainImpl[platform];

          describe(`${platform} tests`, _tests.bind({ platformImpl, platform }));
        }
      }
    });
  });
});
