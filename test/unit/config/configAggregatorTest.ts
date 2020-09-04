/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect } from 'chai';
import { Config } from '../../../src/config/config';
import { ConfigAggregator } from '../../../src/config/configAggregator';
import { ConfigFile } from '../../../src/config/configFile';
import { ConfigContents } from '../../../src/config/configStore';
import { testSetup } from '../../../src/testSetup';
import { fs } from '../../../src/util/fs';

// Setup the test environment.
const $$ = testSetup();

describe('ConfigAggregator', () => {
  let id: string;
  beforeEach(() => {
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
    delete process.env.SFDX_DEFAULTUSERNAME;
    delete process.env.SFDX_CUSTOM_CONFIG_PROP;
  });

  describe('instantiation', () => {
    it('creates local and global config', async () => {
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getLocalConfig()).to.be.exist;
      expect(aggregator.getGlobalConfig()).to.be.exist;
    });

    it('converts env vars', async () => {
      process.env.SFDX_DEFAULTUSERNAME = 'test';
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(Config.DEFAULT_USERNAME)).to.equal('test');
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
    expect(ConfigAggregator.getValue(Config.API_VERSION).value, expected);
  });

  it('reload decrypts config values', async () => {
    // readSync doesn't decrypt values
    $$.SANDBOX.stub(Config.prototype, 'readSync').returns({ isvDebuggerSid: 'encrypted' });
    // read decrypts values
    $$.SANDBOX.stub(Config.prototype, 'read').returns({ isvDebuggerSid: 'decrypted' });
    const aggregator: ConfigAggregator = ConfigAggregator.getInstance();
    expect(aggregator.getInfo('isvDebuggerSid').value).to.equal('encrypted');
    await aggregator.reload();
    expect(aggregator.getInfo('isvDebuggerSid').value).to.equal('decrypted');
  });

  describe('initialization', () => {
    beforeEach(() => {
      $$.SANDBOX.stub(Config.prototype, 'read').callsFake(async function(this: Config) {
        const config: ConfigContents = this.isGlobal()
          ? await Promise.resolve({ defaultusername: 2 })
          : await Promise.resolve({ defaultusername: 1 });
        this.setContents(config);
        return config;
      });
      $$.SANDBOX.stub(Config.prototype, 'exists').returns(Promise.resolve(true));
    });
    it('local overrides global', async () => {
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(await aggregator.getPropertyValue(Config.DEFAULT_USERNAME)).to.equal(1);
    });

    it('env overrides local and global', async () => {
      process.env.SFDX_DEFAULTUSERNAME = 'test';
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(await aggregator.getPropertyValue(Config.DEFAULT_USERNAME)).to.equal('test');
    });
  });

  describe('locations', () => {
    it('local', async () => {
      $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve({ defaultusername: 2 });
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve({ defaultusername: 1 });
          }
        }
        return Promise.resolve();
      });
      $$.SANDBOX.stub(Config.prototype, 'exists').returns(Promise.resolve(true));
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getLocation(Config.DEFAULT_USERNAME)).to.equal('Local');
    });

    it('global', async () => {
      $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve({ defaultusername: 2 });
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve({});
          }
        }
        return Promise.resolve();
      });
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      expect(aggregator.getLocation(Config.DEFAULT_USERNAME)).to.equal('Global');
    });

    it('env', async () => {
      process.env.SFDX_DEFAULTUSERNAME = 'test';
      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      $$.SANDBOX.stub(fs, 'readJson').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve({ defaultusername: 1 });
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve({ defaultusername: 2 });
          }
        }
        return Promise.resolve();
      });
      expect(aggregator.getLocation(Config.DEFAULT_USERNAME)).to.equal('Environment');
    });

    it('configInfo', async () => {
      process.env.SFDX_DEFAULTUSERNAME = 'test';
      $$.SANDBOX.stub(fs, 'readJson').returns(Promise.resolve({}));

      const aggregator: ConfigAggregator = await ConfigAggregator.create();
      const info = aggregator.getConfigInfo()[0];
      expect(info.key).to.equal('defaultusername');
      expect(info.value).to.equal('test');
      expect(info.location).to.equal('Environment');
    });
  });

  describe('custom config properties', () => {
    beforeEach(() => {
      $$.SANDBOX.stub(Config.prototype, 'read').callsFake(async function(this: Config) {
        const config: ConfigContents = await Promise.resolve({ CustomConfigProp: 'test' });
        this.setContents(config);
        return config;
      });
      // @ts-ignore
      ConfigAggregator.instance = null;
    });

    it('creates local and global config with custom config properties', async () => {
      const aggregator: ConfigAggregator = await ConfigAggregator.create({
        customConfigProperties: [{ key: 'CustomConfigProp' }]
      });

      // @ts-ignore because getPropertyConfig is a private method
      expect(aggregator.getLocalConfig().getPropertyConfig('CustomConfigProp')).to.exist;
      // @ts-ignore because getPropertyConfig is a private method
      expect(aggregator.getGlobalConfig().getPropertyConfig('CustomConfigProp')).to.exist;
    });

    it('creates local and global config with custom config properties using getInstance', async () => {
      await ConfigAggregator.create({
        customConfigProperties: [{ key: 'CustomConfigProp' }]
      });

      const instance = ConfigAggregator.getInstance();

      // @ts-ignore because getPropertyConfig is a private method
      expect(instance.getLocalConfig().getPropertyConfig('CustomConfigProp')).to.exist;
      // @ts-ignore because getPropertyConfig is a private method
      expect(instance.getGlobalConfig().getPropertyConfig('CustomConfigProp')).to.exist;
    });

    it('converts env vars for custom properties', async () => {
      process.env.SFDX_CUSTOM_CONFIG_PROP = 'test';
      const aggregator: ConfigAggregator = await ConfigAggregator.create({
        customConfigProperties: [{ key: 'CustomConfigProp' }]
      });
      expect(aggregator.getPropertyValue('CustomConfigProp')).to.equal('test');
    });

    it('can get and set custom properties', async () => {
      const aggregator: ConfigAggregator = await ConfigAggregator.create({
        customConfigProperties: [{ key: 'CustomConfigProp' }]
      });
      expect(aggregator.getPropertyValue('CustomConfigProp')).to.equal('test');
      expect(ConfigAggregator.getValue('CustomConfigProp').value).to.equal('test');
    });
  });
});
