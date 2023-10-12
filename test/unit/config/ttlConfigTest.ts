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
        filename: filename ?? TestConfig.getFileName(),
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
  });

  describe.only('filters expired keys on init', () => {
    $$.setConfigStubContents('TestConfig', {
      contents: {
        old: {
          value: 1,
          timestamp: new Date().getTime() - Duration.days(7).milliseconds,
        },
        current: {
          value: 2,
          timestamp: new Date().getTime(),
        },
        future: {
          value: 3,
          timestamp: new Date().getTime() + Duration.days(7).milliseconds,
        },
      },
    });

    it('should omit expired keys', async () => {
      const config = await TestConfig.create();
      const keys = config.keys();
      expect(keys).to.include('current');
      expect(keys).to.include('future');
      expect(keys).to.not.include('old');
    });
  });
});
