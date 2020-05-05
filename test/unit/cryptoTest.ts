/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import * as _crypto from 'crypto';
import * as os from 'os';
import { Crypto } from '../../src/crypto';
import { SfdxError } from '../../src/exported';
import { Messages } from '../../src/messages';
import { testSetup } from '../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();

const TEST_KEY = {
  service: 'sfdx',
  account: 'local',
  key: '8e8fd1e6dc06a37bf420898dbc3ee35c'
};

describe('CryptoTest', function() {
  const disableEncryptionEnvVar = process.env.SFDX_DISABLE_ENCRYPTION;
  let crypto;

  beforeEach(() => {
    // Testing crypto functionality, so restore global stubs.
    $$.SANDBOXES.CRYPTO.restore();

    stubMethod($$.SANDBOX, Crypto.prototype, 'getKeyChain').callsFake(() =>
      Promise.resolve({
        setPassword: () => Promise.resolve(),
        getPassword: (data, cb) => cb(undefined, TEST_KEY.key)
      })
    );
  });

  afterEach(() => {
    crypto.close();
    process.env.SFDX_DISABLE_ENCRYPTION = disableEncryptionEnvVar || '';
  });

  if (process.platform === 'darwin') {
    this.timeout(3 * 60 * 1000);

    const text = 'Unencrypted text';
    let secret;

    it('Should have encrypted the string.', async () => {
      process.env.SFDX_DISABLE_ENCRYPTION = 'false';

      crypto = new Crypto();
      await crypto.init();
      secret = crypto.encrypt(text);
      expect(secret).to.not.equal(text);
    });

    it('Should have decrypted the string', async () => {
      process.env.SFDX_DISABLE_ENCRYPTION = 'false';

      crypto = new Crypto();
      await crypto.init();
      const decrypted = crypto.decrypt(secret);
      expect(decrypted).to.equal(text);
    });

    it('Should have encrypted the string even if SFDX_DISABLE_ENCRYPTION is true.', async () => {
      process.env.SFDX_DISABLE_ENCRYPTION = 'true';

      crypto = new Crypto();
      await crypto.init();
      secret = crypto.encrypt(text);
      expect(secret).to.not.equal(text);
    });

    it('Should have encrypted the string because SFDX_DISABLE_ENCRYPTION is not defined.', async () => {
      delete process.env.SFDX_DISABLE_ENCRYPTION;

      crypto = new Crypto();
      await crypto.init();
      secret = crypto.encrypt(text);
      expect(secret).to.not.equal(text);
    });

    it('Should have decrypted the string even if SFDX_DISABLE_ENCRYPTION is "true"', async () => {
      process.env.SFDX_DISABLE_ENCRYPTION = 'true';

      crypto = new Crypto();
      await crypto.init();
      const str = '123456';
      const encrypted = crypto.encrypt(str);
      const decrypted = crypto.decrypt(encrypted);
      expect(encrypted).to.not.equal(str);
      expect(decrypted).to.equal(str);
    });

    it('InvalidEncryptedFormatError action', async () => {
      process.env.SFDX_DISABLE_ENCRYPTION = 'false';

      crypto = new Crypto();
      await crypto.init();
      expect(Crypto.prototype.decrypt.bind(crypto, 'foo'))
        .to.throw(Error)
        .and.have.property('actions');
    });

    it('InvalidEncryptedFormatError name', async () => {
      process.env.SFDX_DISABLE_ENCRYPTION = 'false';

      crypto = new Crypto();
      await crypto.init();
      expect(Crypto.prototype.decrypt.bind(crypto, ''))
        .to.throw(Error)
        .and.have.property('name', 'InvalidEncryptedFormatError');
    });

    it('Should return null if text is null.', async () => {
      delete process.env.SFDX_DISABLE_ENCRYPTION;

      crypto = new Crypto();
      await crypto.init();
      secret = crypto.encrypt(null);
      expect(secret).to.equal(undefined);
    });

    it('Should return null if text is undefined.', async () => {
      delete process.env.SFDX_DISABLE_ENCRYPTION;

      crypto = new Crypto();
      await crypto.init();
      secret = crypto.encrypt(undefined);
      expect(secret).to.equal(undefined);
    });

    it('Decrypt should fail without env var, and add extra message', async () => {
      const message: string = Messages.loadMessages('@salesforce/core', 'crypto').getMessage('MacKeychainOutOfSync');
      const err = Error('Failed to decipher auth data. reason: Unsupported state or unable to authenticate data.');
      const sfdxErr: object = SfdxError.wrap(err);
      sfdxErr['actions'] = message;
      stubMethod($$.SANDBOX, os, 'platform').returns('darwin');
      crypto = new Crypto();
      await crypto.init();
      $$.SANDBOX.stub(crypto, 'decrypt').throws(sfdxErr);
      expect(() => crypto.decrypt('abcdefghijklmnopqrstuvwxyz:123456789')).to.throw(
        'Failed to decipher auth data. reason: Unsupported state or unable to authenticate data.'
      );
      try {
        // are there any better ways to assert on the actions of the error?
        crypto.decrypt('abcdefghijklmnopqrstuvwxyz:123456789');
        chai.assert.fail('the above must fail');
      } catch (err) {
        expect(err.actions).to.equal(message);
      }
    });

    it('Decrypt should fail but not add extra message with env var', async () => {
      process.env.SFDX_USE_GENERIC_UNIX_KEYCHAIN = 'false';
      const message: string = Messages.loadMessages('@salesforce/core', 'encryption').getMessage('AuthDecryptError');
      const errorMessage: object = SfdxError.wrap(new Error(message));
      stubMethod($$.SANDBOX, os, 'platform').returns('darwin');
      stubMethod($$.SANDBOX, crypto, 'decrypt').callsFake(() => ({
        setAuthTag: () => {
          throw errorMessage;
        },
        update: () => {},
        final: () => {}
      }));
      crypto = new Crypto();
      await crypto.init();
      expect(() => crypto.decrypt(secret)).to.not.throw(message);
      delete process.env.SFDX_USE_GENERIC_UNIX_KEYCHAIN;
    });
  }
});
