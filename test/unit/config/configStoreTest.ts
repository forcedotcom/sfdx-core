/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { BaseConfigStore, ConfigContents } from '../../../src/config/configStore';
import { deepCopy } from '../../../src/util/utils';

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
  it('await each value', async () => {
    const config = await TestConfig.create();
    config.set('1', 'a');
    config.set('2', 'b');

    let st = '';
    await config.awaitEach(async (key, val) => {
      st += `${key}${val}`;
    });
    expect(st).to.equal('1a2b');
  });

  it('returns the object reference', async () => {
    const config = new TestConfig<{ '1': { a: string } }>();
    config.set('1', { a: 'a' });

    config.get('1').a = 'b';

    expect(config.get('1').a).to.equal('b');
    expect(config.get('1.a')).to.equal('b');
  });

  it('updates the object reference', async () => {
    const config = new TestConfig<{ '1': { a: string; b: string } }>();
    config.set('1', { a: 'a', b: 'b' });

    config.update('1', { b: 'c' });

    expect(config.get('1').a).to.equal('a');
    expect(config.get('1').b).to.equal('c');
  });

  describe('encryption', () => {
    it('throws if crypto is not initialized', () => {
      const config = new CarConfig({});
      expect(() => config.set('owner.creditCardNumber', 'n/a'))
        .to.throw()
        .property('name', 'CryptoNotInitializedError');
    });

    it('throws if value is not strings', async () => {
      const config = await CarConfig.create();
      expect(() => config.set('owner.creditCardNumber', 12))
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
      config.set('owner', {
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

    it('encrypts nested query key using dot notation', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      config.set('owner.creditCardNumber', expected);
      // encrypted
      expect(config.get('owner.creditCardNumber')).to.not.equal(expected);
      // decrypted
      expect(config.get('owner.creditCardNumber', true)).to.equal(expected);
    });

    it('encrypts nested query key using accessor with single quotes', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      config.set('owner["creditCardNumber"]', expected);
      // encrypted
      expect(config.get("owner['creditCardNumber']")).to.not.equal(expected);
      // decrypted
      expect(config.get("owner['creditCardNumber']", true)).to.equal(expected);
    });

    it('encrypts nested query key using accessor with double quotes', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      config.set('owner["creditCardNumber"]', expected);
      // encrypted
      expect(config.get('owner["creditCardNumber"]')).to.not.equal(expected);
      // decrypted
      expect(config.get('owner["creditCardNumber"]', true)).to.equal(expected);
    });

    it('encrypts nested query special key using accessor with single quotes', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const query = `owner['${specialKey}']`;
      config.set(query, expected);
      // encrypted
      expect(config.get(query)).to.not.equal(expected);
      // decrypted
      expect(config.get(query, true)).to.equal(expected);
    });

    it('encrypts nested query special key using accessor with double quotes', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const query = `owner["${specialKey}"]`;
      config.set(query, expected);
      // encrypted
      expect(config.get(query)).to.not.equal(expected);
      // decrypted
      expect(config.get(query, true)).to.equal(expected);
    });

    it('decrypt returns copies', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const owner = { name: 'Bob', creditCardNumber: expected };
      // I would love for this to throw an error, but the current typing doesn't quite work like get does.
      config.set('owner', owner);

      const decryptedOwner = config.get('owner', true);
      // Because we retrieved an decrypted object on a config with encryption,
      // it should return a clone so it doesn't accidentally save decrypted data.
      decryptedOwner.creditCardNumber = 'invalid';
      expect(config.get('owner').creditCardNumber).to.not.equal('invalid');
      expect(config.get('owner', true).creditCardNumber).to.equal(expected);
      expect(config.get('owner.creditCardNumber', true)).to.equal(expected);
    });

    it('does not fail when saving an already encrypted object', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const owner = { name: 'Bob', creditCardNumber: expected };
      config.set('owner', owner);
      const encryptedCreditCardNumber = config.get('owner.creditCardNumber');
      const contents = config.getContents();
      contents.owner.name = 'Tim';
      config.setContents(contents);
      expect(config.get('owner.name')).to.equal(contents.owner.name);
      expect(config.get('owner.creditCardNumber')).to.equal(encryptedCreditCardNumber);
    });

    it('updates encrypted object', async () => {
      const expected = 'a29djf0kq3dj90d3q';
      const config = await CarConfig.create();
      const owner = { name: 'Bob', creditCardNumber: 'old credit card number' };
      config.set('owner', owner);

      config.update('owner', { creditCardNumber: expected });

      expect(config.get('owner.name')).to.equal(owner.name);
      expect(config.get('owner.creditCardNumber', true)).to.equal(expected);
    });
  });
});
describe('diff and patch', () => {
  const baseData = {
    foo: { name: 'bar', color: 'red', rating: 5 },
    baz: { name: 'qux', color: 'blue', rating: 10 },
  };

  it('should handle all empty stores', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy({}));
    config.setOriginalContents(deepCopy({}));
    config.diffAndPatchContents({});
    expect(config.getContents()).to.deep.equal({});
  });
  it('should delete all config entries when as-is is empty and no local changes', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.diffAndPatchContents({});
    expect(config.getContents()).to.deep.equal({});
  });
  it('should delete unchanged config entries when as-is is empty and some local changes', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.set('baz.rating', 0);
    config.diffAndPatchContents({});
    expect(config.getContents()).to.deep.equal({ baz: { ...baseData.baz, rating: 0 } });
  });
  it('should merge changes from as-is and current within the same config entry', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.set('baz.rating', 0);
    const asIs = deepCopy(baseData);
    asIs.baz.name = 'asIsqux';
    delete asIs.foo.name;
    config.diffAndPatchContents(asIs);
    const expected = { foo: { ...baseData.foo }, baz: { ...baseData.baz, rating: 0 } };
    delete expected.foo.name;
    expect(config.getContents()).to.deep.equal(expected);
  });
  it('should save entries when as-is and original are empty', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy({}));
    config.set('baz.rating', 0);
    config.diffAndPatchContents({});
    expect(config.getContents()).to.deep.equal({ foo: { ...baseData.foo }, baz: { ...baseData.baz, rating: 0 } });
  });
  it('should remove all locally deleted root entries', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.unset('baz');
    config.diffAndPatchContents(deepCopy(baseData));
    expect(config.getContents()).to.deep.equal({ foo: { ...baseData.foo } });
  });
  it('should remove only nested values that are unset', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.unset('baz.rating');
    config.diffAndPatchContents(deepCopy(baseData));
    const expected = { foo: { ...baseData.foo }, baz: { ...baseData.baz } };
    delete expected.baz.rating;
    expect(config.getContents()).to.deep.equal(expected);
  });
  it('should remove deleted as-is entry and all locally deleted root entries', async () => {
    const config = await TestConfig.create();
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.set('bingo', deepCopy(baseData.foo));
    config.unset('baz');
    const asIs = deepCopy(baseData);
    delete asIs.foo;
    config.diffAndPatchContents(asIs);
    expect(config.getContents()).to.deep.equal({ bingo: { ...baseData.foo } });
  });
  it('should retain as-is, when as-is is not empty and original is empty and no local changes', async () => {
    const config = await TestConfig.create();
    config.setContents({});
    config.setOriginalContents({});
    config.diffAndPatchContents(deepCopy(baseData));
    expect(config.getContents()).to.deep.equal(baseData);
  });
});
// given a config with base keys, can diff and patch isolate changes to a base key
describe('diff and patch store with base keys', () => {
  const baseData = {
    a: {
      foo: { name: 'bar', color: 'red', rating: 5 },
      baz: { name: 'qux', color: 'blue', rating: 10 },
    },
    b: {
      foo: { name: 'bar', color: 'red', rating: 5 },
      baz: { name: 'qux', color: 'blue', rating: 10 },
    },
  };
  it('should delete all config entries when as-is is empty and no local changes using base keys', async () => {
    const config = await TestConfig.create({ baseKeys: ['a', 'b'] });
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.diffAndPatchContents({});
    expect(config.getContents()).to.deep.equal({});
  });
  it('should delete unchanged config entries when as-is is empty and some local changes', async () => {
    const config = await TestConfig.create({ baseKeys: ['a', 'b'] });
    config.setContents(deepCopy(baseData));
    config.setOriginalContents(deepCopy(baseData));
    config.set('a.baz.rating', 0);
    config.set('a.baz.name', undefined);
    config.diffAndPatchContents({});
    expect(config.getContents()).to.deep.equal({
      a: {
        baz: {
          color: 'blue',
          rating: 0,
        },
      },
    });
  });
});
