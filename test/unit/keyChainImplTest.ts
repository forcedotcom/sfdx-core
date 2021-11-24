/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import { KeychainAccess, keyChainImpl } from '../../src/keyChainImpl';
import { testSetup } from '../../src/testSetup';
import { fs } from '../../src/util/fs';

// Setup the test environment.
const $$ = testSetup();

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
  beforeEach(() => {
    // Testing crypto functionality, so restore global stubs.
    $$.SANDBOXES.CRYPTO.restore();
  });

  describe('keychain program file issues', () => {
    it('File not found', async () => {
      try {
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
        // @ts-ignore
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
          await access.getPassword({ account: '', service: '', password: '' }, () => {});
          assert.fail('should throw');
        } catch (error) {
          expect(error.name).to.equal('MissingCredentialProgramError');
        }
      });
      (process.platform !== 'win32' ? it : it.skip)('program access', async () => {
        // @ts-ignore
        $$.SANDBOX.stub(fs, 'statSync').returns(true);
        const access = new KeychainAccess(testImpl, fs);

        try {
          await access.getPassword({ account: '', service: '', password: '' }, () => {});
          assert(false, 'should throw');
        } catch (error) {
          expect(error.name).to.equal('CredentialProgramAccessError');
        }
      });
      it('requires account', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        await access.getPassword({ account: null, service: '', password: '' }, (error) => {
          expect(error.name).to.equal('KeyChainAccountRequiredError');
          set = true;
        });
        assert(set);
      });
      it('requires service', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        await access.getPassword({ account: '', service: null, password: '' }, (error) => {
          expect(error.name).to.equal('KeyChainServiceRequiredError');
          set = true;
        });
        assert(set);
      });
    });

    describe('setPassword', () => {
      it('requires account', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        await access.setPassword({ account: null, service: '', password: '' }, (error) => {
          expect(error.name).to.equal('KeyChainAccountRequiredError');
          set = true;
        });
        assert(set);
      });
      it('requires service', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        await access.setPassword({ account: '', service: null, password: '' }, (error) => {
          expect(error.name).to.equal('KeyChainServiceRequiredError');
          set = true;
        });
        assert(set);
      });
      it('requires service', async () => {
        const access = new KeychainAccess(testImpl, fs);
        let set = false;
        await access.setPassword({ account: '', service: '', password: null }, (error) => {
          expect(error.name).to.equal('PasswordRequiredError');
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
      expect(this.platformImpl).not.to.be.null;
      expect(this.platformImpl).not.to.be.undefined;
      done();
    };

    const _getCommandFunc = function (done: any) {
      const testFunc = function (pgmPath, options) {
        expect(pgmPath).to.equal(this.platformImpl.osImpl.getProgram());
        expect(options).to.include(keyChainOptions.service).and.to.include(keyChainOptions.account);
      };

      this.platformImpl.osImpl.getCommandFunc(keyChainOptions, testFunc.bind(this));
      done();
    };

    const _OnGetCommandError = function (done: any) {
      const responseFunc = function (err) {
        expect(err).to.have.property('name', 'PasswordNotFoundError');
      };

      this.platformImpl.osImpl.onGetCommandClose(1, 'zuul', 'dana', keyChainOptions, responseFunc.bind(this));
      done();
    };

    const _OnGetCommandMacUserCanceled = function (done: any) {
      const responseFunc = function (err) {
        expect(err).to.have.property('name', 'KeyChainUserCanceledError');
      };

      this.platformImpl.osImpl.onGetCommandClose(128, 'zuul', 'dana', null, responseFunc.bind(this));
      done();
    };

    const _OnSetFunc = function (done: any) {
      const testFunc = function (pgmPath: any, options: any) {
        expect(pgmPath).to.equal(this.platformImpl.osImpl.getProgram());
        expect(options).to.include(keyChainOptions.password);
        expect(options).to.include(keyChainOptions.service).and.to.include(keyChainOptions.account);
      };
      // passwords for linux are read properly from stdin. Boo Windows and Mac
      if (this.platform !== platforms.LINUX) {
        this.platformImpl.osImpl.setCommandFunc(keyChainOptions, testFunc.bind(this));
      }
      done();
    };

    const _OnGetCommandLinuxRetry = async function () {
      const onGetCommandCloseFn = this.platformImpl.osImpl.onGetCommandClose.bind(
        null,
        1,
        null,
        'invalid or unencryptable secret',
        keyChainOptions,
        () => {}
      );
      try {
        await onGetCommandCloseFn();
        assert.fail('onGetCommandClose() should have thrown an error.');
      } catch (err) {
        expect(err).to.have.property('retry', true);
      }
    };

    const _tests = function () {
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
        const platform = platforms[platformKey];
        // this test is very much tied to various internal keychain impls. generic_unix doesn't rely on a
        // third-party program.
        if (!(platform === platforms.GENERIC_UNIX || platform === platforms.GENERIC_WINDOWS)) {
          const platformImpl = keyChainImpl[platform];

          describe(`${platform} tests`, _tests.bind({ platformImpl, platform }));
        }
      }
    });
  });
});
