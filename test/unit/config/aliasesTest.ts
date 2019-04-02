/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Aliases } from '../../../src/config/aliases';
import { ConfigGroup } from '../../../src/config/configGroup';
import { testSetup } from '../../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('Alias no key value mock', () => {
  it('steel thread', async () => {
    const KEY = 'foo';
    const VALUE = 'bar';
    await Aliases.parseAndUpdate([`${KEY}=${VALUE}`]);
    const r = await Aliases.fetch(KEY);
    expect(r).eq(VALUE);

    const keys = (await Aliases.create(Aliases.getDefaultOptions())).getKeysByValue(VALUE);
    expect(keys.length).eq(1);
    expect(keys[0]).eq(KEY);
  });
});

describe('Alias', () => {
  describe('#set', () => {
    it('has the right object on write', async () => {
      const key = 'test';
      const value = 'val';

      const aliases = await Aliases.create(Aliases.getDefaultOptions());
      aliases.set(key, value);
      await aliases.write();
      expect(sinon.assert.calledOnce(ConfigGroup.prototype.write as sinon.SinonSpy));
      expect($$.getConfigStubContents('Aliases')).to.deep.equal({
        orgs: { test: 'val' }
      });
    });

    it('supports aliases with dots', async () => {
      const aliases = await Aliases.create(Aliases.getDefaultOptions());
      aliases.set('test.with.dots', 'val');
      await aliases.write();
      expect(sinon.assert.calledOnce(ConfigGroup.prototype.write as sinon.SinonSpy));
      expect($$.getConfigStubContents('Aliases')).to.deep.equal({
        orgs: { 'test.with.dots': 'val' }
      });
    });
  });

  it('gets aliases with dots', async () => {
    const testContents = {
      contents: {
        orgs: { 'test.with.dots': 'val' }
      }
    };

    $$.setConfigStubContents('Aliases', testContents);

    const aliases = await Aliases.create(Aliases.getDefaultOptions());
    expect(aliases.get('test.with.dots')).to.equal('val');
  });

  describe('#unset', () => {
    it('passes the correct values to FileKeyValueStore#unset', async () => {
      const testContents = {
        contents: {
          orgs: { test1: 'val', test2: 'val', test3: 'val' }
        }
      };

      $$.setConfigStubContents('Aliases', testContents);

      const keyArray = ['test1', 'test3'];
      const aliases = await Aliases.create(Aliases.getDefaultOptions());
      aliases.unsetAll(keyArray);
      await aliases.write();
      expect(sinon.assert.calledOnce(ConfigGroup.prototype.write as sinon.SinonSpy));
      expect($$.getConfigStubContents('Aliases')).to.deep.equal({
        orgs: { test2: 'val' }
      });
    });
  });

  describe('#parseAndSet', () => {
    describe('passes the right values to FileKeyValueStore#updateValues', () => {
      it('for one value', async () => {
        await Aliases.parseAndUpdate(['another=val']);
        expect(sinon.assert.calledOnce(ConfigGroup.prototype.write as sinon.SinonSpy));
        expect($$.getConfigStubContents('Aliases')).to.deep.equal({
          orgs: { another: 'val' }
        });
      });

      it('for two of same value', async () => {
        await Aliases.parseAndUpdate(['another=val', 'some=val']);
        expect(sinon.assert.calledOnce(ConfigGroup.prototype.write as sinon.SinonSpy));
        expect($$.getConfigStubContents('Aliases')).to.deep.equal({
          orgs: {
            another: 'val',
            some: 'val'
          }
        });
      });
    });

    it('should handle invalid alias formats', async () => {
      const invalidFormats = ['another', 'foo==bar'];
      for (const element of invalidFormats) {
        try {
          await Aliases.parseAndUpdate([element]);
        } catch (err) {
          if (err.name === 'AssertionError') {
            throw err;
          }
          expect(err.name).to.equal('InvalidFormat');
        }
      }
    });
  });
});
