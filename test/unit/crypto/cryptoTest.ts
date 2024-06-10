/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/ban-types */

import os from 'node:os';
import { stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { Crypto } from '../../../src/crypto/crypto';
import { SfError } from '../../../src/sfError';
import { Messages } from '../../../src/messages';
import { TestContext, shouldThrowSync } from '../../../src/testSetup';

const TEST_KEY_V1 = {
  service: 'sfdx',
  account: 'local',
  key: '8e8fd1e6dc06a37bf420898dbc3ee35c',
};

const TEST_KEY_V2 = {
  service: 'sfdx',
  account: 'local',
  key: 'f699321865468a386434e78b3a4a5cf3b151e09a4391741e06fdbe8272ac07c0',
};

const setCryptoVersionEnvVar = (envVarValue?: boolean) => {
  if (envVarValue === true) {
    process.env.SF_CRYPTO_V2 = 'true';
  } else if (envVarValue === false) {
    process.env.SF_CRYPTO_V2 = 'false';
  } else {
    delete process.env.SF_CRYPTO_V2;
  }
};

describe('CryptoTests', function () {
  // Save env var original state
  const disableEncryptionEnvVar = process.env.SFDX_DISABLE_ENCRYPTION;
  const cryptoVersionEnvVar = process.env.SF_CRYPTO_V2;
  let crypto: Crypto;

  const $$ = new TestContext();

  beforeEach(() => {
    // Testing crypto functionality, so restore global stubs.
    $$.SANDBOXES.CRYPTO.restore();
  });

  afterEach(() => {
    crypto.close();
  });

  after(() => {
    // Reset env vars to original state
    if (disableEncryptionEnvVar) {
      process.env.SFDX_DISABLE_ENCRYPTION = disableEncryptionEnvVar;
    } else {
      delete process.env.SFDX_DISABLE_ENCRYPTION;
    }

    if (cryptoVersionEnvVar) {
      process.env.SF_CRYPTO_V2 = cryptoVersionEnvVar;
    } else {
      delete process.env.SF_CRYPTO_V2;
    }
  });

  const runTests = ({ keyVersion, envVarValue }: { keyVersion: 'v1' | 'v2'; envVarValue?: boolean }) => {
    if (process.platform === 'darwin') {
      this.timeout(3 * 60 * 1000);

      const text = 'Unencrypted text';
      let secret: string | undefined;

      const key = keyVersion === 'v2' ? TEST_KEY_V2.key : TEST_KEY_V1.key;

      beforeEach(() => {
        stubMethod($$.SANDBOX, Crypto.prototype, 'getKeyChain').callsFake(() =>
          Promise.resolve({
            setPassword: () => Promise.resolve(),
            getPassword: (data: unknown, cb: (arg1: undefined, arg2: string) => {}) => cb(undefined, key),
          })
        );
        // @ts-expect-error Using a private static method for testing
        Crypto.unsetCryptoVersion();
      });

      it('Should have encrypted the string.', async () => {
        setCryptoVersionEnvVar(envVarValue);
        process.env.SFDX_DISABLE_ENCRYPTION = 'false';

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        secret = crypto.encrypt(text);
        expect(secret).to.not.equal(text);
      });

      it('Should have decrypted the string', async () => {
        setCryptoVersionEnvVar(envVarValue);
        process.env.SFDX_DISABLE_ENCRYPTION = 'false';

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        if (!secret) throw new Error('secret is undefined');
        const decrypted = crypto.decrypt(secret);
        expect(decrypted).to.equal(text);
      });

      it('Should have encrypted the string even if SFDX_DISABLE_ENCRYPTION is true.', async () => {
        setCryptoVersionEnvVar(envVarValue);
        process.env.SFDX_DISABLE_ENCRYPTION = 'true';

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        secret = crypto.encrypt(text);
        expect(secret).to.not.equal(text);
      });

      it('Should have encrypted the string because SFDX_DISABLE_ENCRYPTION is not defined.', async () => {
        setCryptoVersionEnvVar(envVarValue);
        delete process.env.SFDX_DISABLE_ENCRYPTION;

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        secret = crypto.encrypt(text);
        expect(secret).to.not.equal(text);
      });

      it('Should have decrypted the string even if SFDX_DISABLE_ENCRYPTION is "true"', async () => {
        setCryptoVersionEnvVar(envVarValue);
        process.env.SFDX_DISABLE_ENCRYPTION = 'true';

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        const str = '123456';
        const encrypted = crypto.encrypt(str);
        const decrypted = crypto.decrypt(encrypted);
        expect(encrypted).to.not.equal(str);
        expect(decrypted).to.equal(str);
      });

      it('InvalidEncryptedFormatError action', async () => {
        setCryptoVersionEnvVar(envVarValue);
        process.env.SFDX_DISABLE_ENCRYPTION = 'false';

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        expect(Crypto.prototype.decrypt.bind(crypto, 'foo')).to.throw(Error).and.have.property('actions');
      });

      it('InvalidEncryptedFormatError name', async () => {
        setCryptoVersionEnvVar(envVarValue);
        process.env.SFDX_DISABLE_ENCRYPTION = 'false';

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        expect(Crypto.prototype.decrypt.bind(crypto, ''))
          .to.throw(Error)
          .and.have.property('name', 'InvalidEncryptedFormatError');
      });

      it('Should return null if text is null.', async () => {
        setCryptoVersionEnvVar(envVarValue);
        delete process.env.SFDX_DISABLE_ENCRYPTION;

        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        // @ts-expect-error -> null cannot be assigned to string
        secret = crypto.encrypt(null);
        expect(secret).to.equal(undefined);
      });

      it('Should return null if text is undefined.', async () => {
        setCryptoVersionEnvVar(envVarValue);
        delete process.env.SFDX_DISABLE_ENCRYPTION;

        crypto = new Crypto();
        // @ts-expect-error: access protected method
        await crypto.init();
        // @ts-expect-error: falsy value
        secret = crypto.encrypt(undefined);
        expect(secret).to.equal(undefined);
      });

      it('Decrypt should fail without env var, and add extra message', async () => {
        setCryptoVersionEnvVar(envVarValue);
        const message = Messages.loadMessages('@salesforce/core', 'encryption').getMessage('macKeychainOutOfSync');
        const err = Error('Failed to decipher auth data. reason: Unsupported state or unable to authenticate data.');
        const sfdxErr = SfError.wrap(err);
        sfdxErr.actions = [];
        sfdxErr.actions[0] = message;
        stubMethod($$.SANDBOX, os, 'platform').returns('darwin');
        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        $$.SANDBOX.stub(crypto, 'decrypt').throws(sfdxErr);
        expect(() => crypto.decrypt('abcdefghijklmnopqrstuvwxyz:123456789')).to.throw(
          'Failed to decipher auth data. reason: Unsupported state or unable to authenticate data.'
        );
        try {
          shouldThrowSync(() => crypto.decrypt('abcdefghijklmnopqrstuvwxyz:123456789'));
        } catch (error) {
          const sfError = error as SfError;
          if (!sfError.actions) throw new Error('sfError.actions is undefined');
          expect(sfError.actions[0]).to.equal(message);
        }
      });

      it('Decrypt should fail but not add extra message with env var', async () => {
        setCryptoVersionEnvVar(envVarValue);
        process.env.SF_USE_GENERIC_UNIX_KEYCHAIN = 'false';
        const message: string = Messages.loadMessages('@salesforce/core', 'encryption').getMessage('authDecryptError');
        const errorMessage: object = SfError.wrap(new Error(message));
        stubMethod($$.SANDBOX, os, 'platform').returns('darwin');
        stubMethod($$.SANDBOX, crypto, 'decrypt').callsFake(() => ({
          setAuthTag: () => {
            throw errorMessage;
          },
          update: () => {},
          final: () => {},
        }));
        crypto = new Crypto();
        // @ts-expect-error -> init is protected
        await crypto.init();
        // @ts-expect-error: secret is not a string
        expect(() => crypto.decrypt(secret)).to.not.throw(message);
        delete process.env.SF_USE_GENERIC_UNIX_KEYCHAIN;
      });
    }
  };

  describe('crypto with v1 key, no env var, does v1 crypto', () => {
    runTests({ keyVersion: 'v1' });
  });

  describe('crypto with v1 key, SF_CRYPTO_V2=false, does v1 crypto', () => {
    runTests({ keyVersion: 'v1', envVarValue: false });
  });

  describe('crypto with v1 key, SF_CRYPTO_V2=true, does v1 crypto', () => {
    runTests({ keyVersion: 'v1', envVarValue: true });
  });

  describe('crypto with v2 key, no env var, does v2 crypto', () => {
    runTests({ keyVersion: 'v2' });
  });

  describe('crypto with v2 key, SF_CRYPTO_V2=true, does v2 crypto', () => {
    runTests({ keyVersion: 'v2', envVarValue: true });
  });

  describe('crypto with v2 key, SF_CRYPTO_V2=false, does v2 crypto', () => {
    runTests({ keyVersion: 'v2', envVarValue: false });
  });
});
