/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { JsonMap } from '@salesforce/ts-types';
import { Duration, sleep } from '@salesforce/kit';
import { TTLConfig } from '../../../src/config/ttlConfig';
import { TestContext } from '../../../src/testSetup';
import { Global } from '../../../src/global';

describe('TTLConfig', () => {
  const $$ = new TestContext();

  class TestConfig extends TTLConfig<TTLConfig.Options, JsonMap> {
    private static testId: string = $$.uniqid();

    public static getTestLocalPath() {
      return $$.localPathRetrieverSync(TestConfig.testId);
    }

    public static getDefaultOptions(isGlobal = false, filename?: string): TTLConfig.Options {
      return {
        rootFolder: $$.rootPathRetrieverSync(isGlobal, TestConfig.testId),
        isGlobal,
        isState: true,
        filename: filename || TestConfig.getFileName(),
        stateFolder: Global.SFDX_STATE_FOLDER,
        ttl: Duration.days(1),
      };
    }

    public static getFileName() {
      return 'testFileName';
    }
  }

  describe('set', () => {
    it('should timestamp every entry', async () => {
      const config = await TestConfig.create();
      config.set('123', { foo: 'bar' });
      const entry = config.get('123');
      expect(entry).to.have.property('timestamp');
    });
  });

  describe('getLatestEntry', () => {
    it('should return the latest entry', async () => {
      const config = await TestConfig.create();
      config.set('1', { one: 'one' });
      await sleep(1000);
      config.set('2', { two: 'two' });
      const latest = config.getLatestEntry();
      expect(latest).to.deep.equal(['2', config.get('2')]);
    });

    it('should return null if there are no entries', async () => {
      const config = await TestConfig.create();
      const latest = config.getLatestEntry();
      expect(latest).to.equal(null);
    });
  });

  describe('getLatestKey', () => {
    it('should return the key of the latest entry', async () => {
      const config = await TestConfig.create();
      config.set('1', { one: 'one' });
      await sleep(1000);
      config.set('2', { two: 'two' });
      const latest = config.getLatestKey();
      expect(latest).to.equal('2');
    });

    it('should return null if there are no entries', async () => {
      const config = await TestConfig.create();
      const latest = config.getLatestKey();
      expect(latest).to.equal(null);
    });
  });

  describe('isExpired', () => {
    it('should return true if timestamp is older than TTL', async () => {
      const config = await TestConfig.create();
      config.set('1', { one: 'one' });
      const isExpired = config.isExpired(new Date().getTime() + Duration.days(7).milliseconds, config.get('1'));
      expect(isExpired).to.be.true;
    });

    it('should return false if timestamp is not older than TTL', async () => {
      const config = await TestConfig.create();
      config.set('1', { one: 'one' });
      const isExpired = config.isExpired(new Date().getTime(), config.get('1'));
      expect(isExpired).to.be.false;
    });
    it('should remove expired entries during init', async () => {
      let config = await TestConfig.create();
      config.setContents({
        '1': { one: 'one', timestamp: new Date(new Date().getTime() - Duration.days(7).milliseconds).toISOString() },
        '2': { two: 'two', timestamp: new Date().toISOString() },
      });
      config.writeSync();

      config = await TestConfig.create();
      expect(config.get('1')).to.be.undefined;
      expect(config.get('2')).to.not.be.undefined;
    });
  });
});
