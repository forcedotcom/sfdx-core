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

import { expect } from 'chai';
import { JsonMap } from '@salesforce/ts-types';
import { Duration, sleep } from '@salesforce/kit';
import { TTLConfig } from '../../../src/config/ttlConfig';
import { TestContext } from '../../../src/testSetup';
import { Global } from '../../../src/global';
import { ScratchOrgCache } from '../../../src/org/scratchOrgCache';

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

  class TestScratchOrgCache extends ScratchOrgCache {
    public hasCryptoInitialized(): boolean {
      return !!this.crypto;
    }
    public shouldEncryptKey(key: string): boolean {
      return !!this.isCryptoKey(key);
    }
  }

  describe('ScratchOrgCache', () => {
    describe('set', () => {
      it('should timestamp every entry', async () => {
        const config = await TestScratchOrgCache.create();
        config.set('123', { hubUsername: 'foo' });
        const entry = config.get('123');
        expect(entry).to.have.property('timestamp');
        expect(config.hasCryptoInitialized()).to.be.true;
      });
      it('should encrypt clientSecret', async () => {
        const clientSecret = '4947FFFDE29D89CFC3F';
        const config = await TestScratchOrgCache.create();
        config.set('123', { clientSecret });
        expect(config.shouldEncryptKey('clientSecret')).to.be.true;
        const nonDecryptedEntry = config.get('123');
        expect(nonDecryptedEntry).to.have.property('clientSecret').and.not.equal(clientSecret);
        const decryptedEntry = config.get('123', true);
        expect(decryptedEntry).to.have.property('clientSecret', clientSecret);
      });
    });
  });

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
      await sleep(200);
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
      await sleep(200);
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

  describe('filters expired keys on init', () => {
    it('should omit expired keys', async () => {
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

      const config = await TestConfig.create();
      const keys = config.keys();
      expect(keys).to.include('current');
      expect(keys).to.include('future');
      expect(keys).to.not.include('old');
    });
  });
});
