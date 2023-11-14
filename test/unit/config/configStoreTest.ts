/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { AuthInfoConfig } from '../../../src/config/authInfoConfig';
import { BaseConfigStore } from '../../../src/config/configStore';
import { ConfigContents } from '../../../src/config/configStackTypes';
import { TestContext } from '../../../src/testSetup';

const specialKey = 'spe@cial.property';

type CarInfo = {
  model: string;
  make: string;
  color: string;
  cost: number;
  year: number;
  owner: {
    name: string;
    phone: string;
    creditCardNumber: string;
    originalOwner: boolean;
    [specialKey]: string;
    superPassword: string;
  };
  serialNumber: string;
};

class CarConfig extends BaseConfigStore<Record<string, unknown>, CarInfo> {
  protected static encryptedKeys = ['serialNumber', 'creditCardNumber', specialKey, /password/i];
}
class TestConfig<P extends ConfigContents> extends BaseConfigStore<BaseConfigStore.Options, P> {}

describe('ConfigStore', () => {
  const $$ = new TestContext();

  it('for each value', async () => {
    const config = await TestConfig.create();
    config.set('1', 'a');
    config.set('2', 'b');

    let st = '';
    config.forEach((key, val) => {
      st += `${key}${val}`;
    });
    expect(st).to.equal('1a2b');
  });

  it('returns the object reference', async () => {
    const config = new TestConfig<{ '1': { a: string } }>();
    config.set('1', { a: 'a' });

    config.get('1').a = 'b';

    expect(config.get('1').a).to.equal('b');
  });

  it('updates the object reference', async () => {
    const config = new TestConfig<{ '1': { a: string; b: string } }>();
    config.set('1', { a: 'a', b: 'b' });

    config.update('1', { b: 'c' });

    expect(config.get('1').a).to.equal('a');
    expect(config.get('1').b).to.equal('c');
  });

  describe('encryption', () => {
    beforeEach(() => {
      $$.SANDBOXES.CONFIG.restore();
      $$.SANDBOX.restore();
    });

    it('throws if crypto is not initialized', () => {
      const config = new CarConfig({});
      expect(() => config.update('owner', { creditCardNumber: 'n/a' }))
        .to.throw()
        .property('name', 'CryptoNotInitializedError');
    });

    it('throws if value is not strings', async () => {
      const config = await CarConfig.create();
      // @ts-expect-error it should be a string, but testing what happens when it's not
      expect(() => config.update('owner', { creditCardNumber: 12 }))
        .to.throw()
        .property('name', 'InvalidCryptoValueError');
    });

    it('encrypts top level key', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      config.set('serialNumber', expected);
      // encrypted
      expect(config.get('serialNumber')).to.not.equal(expected);
      // decrypted
      expect(config.get('serialNumber', true)).to.equal(expected);
    });

    it('encrypts nested key', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      config.update('owner', {
        name: 'Bob',
        creditCardNumber: expected,
        phone: '707-bob-cell',
        originalOwner: true,
        [specialKey]: 'test',
      });
      const owner = config.get('owner');
      // encrypted
      expect(owner.creditCardNumber).to.not.equal(expected);
      // decrypted
      expect(config.get('owner', true).creditCardNumber).to.equal(expected);
    });

    it('encrypts nested key using regexp', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      config.set('owner', {
        name: 'Bob',
        creditCardNumber: 'test',
        phone: '707-bob-cell',
        originalOwner: true,
        [specialKey]: 'test',
        superPassword: expected,
      });
      const owner = config.get('owner');
      // encrypted
      expect(owner.superPassword).to.not.equal(expected);
      // decrypted
      expect(config.get('owner', true).superPassword).to.equal(expected);
    });

    it('decrypt returns copies', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const owner = { name: 'Bob', creditCardNumber: expected };
      // @ts-expect-error that's not a full owner, not all required props are set
      config.set('owner', owner);

      const decryptedOwner = config.get('owner', true);
      // Because we retrieved an decrypted object on a config with encryption,
      // it should return a clone so it doesn't accidentally save decrypted data.
      decryptedOwner.creditCardNumber = 'invalid';
      expect(config.get('owner').creditCardNumber).to.not.equal('invalid');
      expect(config.get('owner', true).creditCardNumber).to.equal(expected);
    });

    // Ensures accessToken and refreshToken are both decrypted upon config.get()
    it('decrypts multiple regex matches per AuthInfoConfig encryptedKeys', async () => {
      $$.SANDBOX.stub(AuthInfoConfig.prototype, 'read');
      const accessToken = '1234';
      const refreshToken = '5678';
      const config = await AuthInfoConfig.create({});
      const auth = { accessToken, refreshToken };
      config.setContentsFromObject(auth);

      expect(config.get('accessToken')).to.not.equal(accessToken);
      expect(config.get('refreshToken')).to.not.equal(refreshToken);
      expect(config.get('accessToken', true)).to.equal(accessToken);
      expect(config.get('refreshToken', true)).to.equal(refreshToken);
    });

    it('does not fail when saving an already encrypted object', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const owner = { name: 'Bob', creditCardNumber: expected };
      // @ts-expect-error incomplete owner
      config.set('owner', owner);
      const encryptedCreditCardNumber = config.get('owner').creditCardNumber;
      const contents = config.getContents();
      contents.owner.name = 'Tim';
      // @ts-expect-error private method
      config.setContents(contents);
      expect(config.get('owner').name).to.equal(contents.owner.name);
      expect(config.get('owner').creditCardNumber).to.equal(encryptedCreditCardNumber);
    });

    it('updates encrypted object', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const owner = { name: 'Bob', creditCardNumber: 'old credit card number' };
      // @ts-expect-error incomplete owner
      config.set('owner', owner);

      config.update('owner', { creditCardNumber: expected });

      expect(config.get('owner').name).to.equal(owner.name);
      expect(config.get('owner', true).creditCardNumber).to.equal(expected);
    });
  });
});
