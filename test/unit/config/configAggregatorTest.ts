/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect } from 'chai';
import { Config, ConfigProperties, SfdxPropertyKeys } from '../../../src/config/config';
import { ConfigAggregator } from '../../../src/config/configAggregator';
import { ConfigFile } from '../../../src/config/configFile';
import { OrgConfigProperties } from '../../../src/exported';
import { testSetup } from '../../../src/testSetup';
import { fs } from '../../../src/util/fs';
import { Cache } from '../../../src/util/cache';

// Setup the test environment.
const $$ = testSetup();

describe('ConfigAggregator', () => {
  let id: string;
  beforeEach(() => {
    Cache.instance().clear();
    // Testing config functionality, so restore global stubs.
    $$.SANDBOXES.CONFIG.restore();

    id = $$.uniqid();
    $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder').callsFake((isGlobal: boolean) =>
      $$.rootPathRetriever(isGlobal, id)
    );
    $$.SANDBOX.stub(ConfigFile, 'resolveRootFolderSync').callsFake((isGlobal: boolean) =>
      $$.rootPathRetrieverSync(isGlobal, id)
    );
  });

  afterEach(() => {
    delete process.env.SFDX_TARGET_ORG;
    delete process.env['target-org'];
  });

  describe('instantiation', () => {
    it('creates local and global config', async () => {
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getLocalConfig()).to.be.exist;
      expect(aggregator.getGlobalConfig()).to.be.exist;
    });

    it('converts env vars', async () => {
      process.env.SFDX_TARGET_ORG = 'test';
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.TARGET_ORG)).to.equal('test');
    });

    it('constructor creates local and global config', async () => {
      const aggregator: ConfigAggregator = ConfigAggregator.getInstance();
      expect(aggregator.getLocalConfig()).to.be.exist;
      expect(aggregator.getGlobalConfig()).to.be.exist;
    });

    describe('with no workspace', () => {
      it('does not have a local config', async () => {
        try {
          // Should not throw
          await ConfigAggregator.create();
        } catch (err) {
          assert.fail('expected an error to be thrown');
        }
      });
    });
  });

  it('static getter', async () => {
    const expected = '49.0';
    $$.SANDBOX.stub(Config.prototype, 'readSync').returns({ apiVersion: expected });
    expect(ConfigAggregator.getValue(SfdxPropertyKeys.API_VERSION).value, expected);
  });

  it('reload decrypts config values', async () => {
    // readSync doesn't decrypt values
    $$.SANDBOX.stub(Config.prototype, 'readSync').callsFake(function () {
      this.setContents({ isvDebuggerSid: 'encrypted' });
      return this.getContents();
    });
    // read decrypts values
    $$.SANDBOX.stub(Config.prototype, 'read').callsFake(async function () {
      this.setContents({ isvDebuggerSid: 'decrypted' });
      return this.getContents();
    });
    const aggregator: ConfigAggregator = ConfigAggregator.getInstance();
    expect(aggregator.getInfo('isvDebuggerSid').value).to.equal('encrypted');
    await aggregator.reload();
    expect(aggregator.getInfo('isvDebuggerSid').value).to.equal('decrypted');
  });

  describe('initialization', () => {
    beforeEach(() => {
      $$.SANDBOX.stub(Config.prototype, 'read').callsFake(async function (this: Config) {
        const config: ConfigProperties = this.isGlobal() ? { 'target-org': 2 } : { 'target-org': 1 };
        this.setContents(config);
        return config;
      });
    });
    it('local overrides global', async () => {
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.TARGET_ORG)).to.equal(1);
    });

    it('env overrides local and global', async () => {
      process.env.SFDX_TARGET_ORG = 'test';
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.TARGET_ORG)).to.equal('test');
    });
  });

  describe('locations', () => {
    it('local', async () => {
      // @ts-ignore
      $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve({ 'target-org': 2 });
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve({ 'target-org': 1 });
          }
        }
        return Promise.resolve();
      });
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getLocation(OrgConfigProperties.TARGET_ORG)).to.equal('Local');
    });

    it('global', async () => {
      // @ts-ignore
      $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve({ 'target-org': 2 });
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve({});
          }
        }
        return Promise.resolve();
      });
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getLocation(OrgConfigProperties.TARGET_ORG)).to.equal('Global');
    });

    it('env', async () => {
      process.env.SFDX_TARGET_ORG = 'test';
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      // @ts-ignore
      $$.SANDBOX.stub(fs, 'readJson').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve({ 'target-org': 1 });
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve({ 'target-org': 2 });
          }
        }
        return Promise.resolve();
      });
      expect(aggregator.getLocation(OrgConfigProperties.TARGET_ORG)).to.equal('Environment');
    });

    it('configInfo with env', async () => {
      process.env.SFDX_TARGET_ORG = 'test';
      $$.SANDBOX.stub(fs, 'readJson').returns(Promise.resolve({}));

      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      const info = aggregator.getConfigInfo()[0];
      expect(info.key).to.equal('target-org');
      expect(info.value).to.equal('test');
      expect(info.location).to.equal('Environment');
    });

    it('configInfo ignores invalid entries', async () => {
      $$.SANDBOX.stub(fs, 'readJsonMap').returns(Promise.resolve({ invalid: 'entry', apiVersion: 49.0 }));

      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      const info = aggregator.getConfigInfo()[0];
      expect(info.key).to.equal('apiVersion');
      expect(info.value).to.equal(49.0);
      expect(info.location).to.equal('Local');
    });
  });
});
