/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import fs from 'node:fs';
import { assert, expect, config as chaiConfig } from 'chai';
import { Config, ConfigProperties, SFDX_ALLOWED_PROPERTIES, SfdxPropertyKeys } from '../../../src/config/config';
import { ConfigAggregator, ConfigInfo } from '../../../src/config/configAggregator';
import { ConfigFile } from '../../../src/config/configFile';
import { Messages, OrgConfigProperties, Lifecycle, ORG_CONFIG_ALLOWED_PROPERTIES } from '../../../src/exported';
import { TestContext } from '../../../src/testSetup';

// if you add to this, make sure you use both the old and new name
const testEnvVars = ['SF_TARGET_ORG', 'SFDX_MAX_QUERY_LIMIT', 'SF_ORG_MAX_QUERY_LIMIT', 'SFDX_DEFAULTUSERNAME'];

chaiConfig.truncateThreshold = 0;

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'config');
const envMessages = Messages.loadMessages('@salesforce/core', 'envVars');

const telemetryConfigFilter = (i: ConfigInfo) => i.key !== 'disable-telemetry';

describe('ConfigAggregator', () => {
  let id: string;
  let warnStub: sinon.SinonStub;

  const $$ = new TestContext();

  beforeEach(() => {
    // Testing config functionality, so restore global stubs.
    $$.SANDBOXES.CONFIG.restore();
    $$.SANDBOX.stub(Lifecycle, 'getInstance').returns(Lifecycle.prototype);
    warnStub = $$.SANDBOX.stub(Lifecycle.prototype, 'emitWarning');

    id = $$.uniqid();
    $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder').callsFake((isGlobal: boolean) =>
      $$.rootPathRetriever(isGlobal, id)
    );
    $$.SANDBOX.stub(ConfigFile, 'resolveRootFolderSync').callsFake((isGlobal: boolean) =>
      $$.rootPathRetrieverSync(isGlobal, id)
    );
  });

  afterEach(() => {
    for (const envVar of testEnvVars) {
      delete process.env[envVar];
    }
  });

  describe('locations', () => {
    beforeEach(() => {
      // @ts-expect-error there's a lot more properties we're not mocking
      $$.SANDBOX.stub(fs.promises, 'stat').resolves({ mtimeNs: BigInt(new Date().valueOf() - 1_000 * 60 * 5) });
    });
    it('local', async () => {
      // @ts-expect-error async function signature not quite same as expected
      $$.SANDBOX.stub(fs.promises, 'readFile').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve('{ "target-org": 2 }');
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve('{ "target-org": 1 }');
          }
        }
        return Promise.resolve();
      });
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getLocation(OrgConfigProperties.TARGET_ORG)).to.equal('Local');
    });

    it('global', async () => {
      // @ts-expect-error async function signature not quite same as expected
      $$.SANDBOX.stub(fs.promises, 'readFile').callsFake(async (path: string) => {
        if (path) {
          if (path.includes(await $$.globalPathRetriever(id))) {
            return Promise.resolve('{ "target-org": 2 }');
          } else if (path.includes(await $$.localPathRetriever(id))) {
            return Promise.resolve('{}');
          }
        }
        return Promise.resolve();
      });
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getLocation(OrgConfigProperties.TARGET_ORG)).to.equal('Global');
    });

    it('env', async () => {
      process.env.SF_TARGET_ORG = 'test';
      const aggregator = await ConfigAggregator.create();
      // @ts-expect-error async function signature not quite same as expected
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      $$.SANDBOX.stub(fs, 'readFile').callsFake(async (path: string) => {
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
      process.env.SF_TARGET_ORG = 'test';
      $$.SANDBOX.stub(fs, 'readFile').resolves({});

      const aggregator = await ConfigAggregator.create();
      const info = aggregator.getConfigInfo().filter(telemetryConfigFilter)[0];
      expect(info.key).to.equal('target-org');
      expect(info.value).to.equal('test');
      expect(info.location).to.equal('Environment');
    });

    it('configInfo ignores invalid entries', async () => {
      $$.SANDBOX.stub(fs.promises, 'readFile').resolves('{ "invalid": "entry", "org-api-version": 49.0 }');

      const aggregator = await ConfigAggregator.create();
      const info = aggregator.getConfigInfo().filter(telemetryConfigFilter)[0];
      expect(info.key).to.equal('org-api-version');
      expect(info.value).to.equal(49.0);
      expect(info.location).to.equal('Local');
    });
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
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.TARGET_ORG)).to.equal(1);
    });

    it('env overrides local and global', async () => {
      process.env.SF_TARGET_ORG = 'test';
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.TARGET_ORG)).to.equal('test');
    });
  });

  describe('instantiation', () => {
    it('creates local and global config', async () => {
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getLocalConfig()).to.exist;
      expect(aggregator.getGlobalConfig()).to.exist;
    });

    it('converts env vars', async () => {
      process.env.SF_TARGET_ORG = 'test';
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.TARGET_ORG)).to.equal('test');
    });

    it('converts env var synonyms (sfdx -> sf)', async () => {
      process.env.SFDX_MAX_QUERY_LIMIT = '5';
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.ORG_MAX_QUERY_LIMIT)).to.equal('5');
      expect(warnStub.getCalls().flatMap((call) => call.args as string[])).to.deep.include(
        envMessages.getMessage('deprecatedEnv', ['SFDX_MAX_QUERY_LIMIT', 'SF_ORG_MAX_QUERY_LIMIT'])
      );
    });

    it('converts env var synonyms (sf -> sfdx)', async () => {
      process.env.SF_ORG_MAX_QUERY_LIMIT = '5';
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.equal('5');
      expect(warnStub.getCalls().flatMap((call) => call.args as string[])).to.deep.include(
        messages.getMessage('deprecatedConfigKey', [SfdxPropertyKeys.MAX_QUERY_LIMIT, 'org-max-query-limit'])
      );
    });

    it('both versions of an env and they match', async () => {
      process.env.SF_ORG_MAX_QUERY_LIMIT = '5';
      process.env.SFDX_MAX_QUERY_LIMIT = '5';
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.ORG_MAX_QUERY_LIMIT)).to.equal('5');
      expect(warnStub.callCount).to.equal(0);
    });

    it('when both versions of an envs are present, sf wins when asked for old name', async () => {
      process.env.SF_ORG_MAX_QUERY_LIMIT = '5';
      process.env.SFDX_MAX_QUERY_LIMIT = '4';
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(SfdxPropertyKeys.MAX_QUERY_LIMIT)).to.equal('5');
      expect(warnStub.getCalls().flatMap((call) => call.args as string[])).to.deep.include(
        messages.getMessage('deprecatedConfigKey', [SfdxPropertyKeys.MAX_QUERY_LIMIT, 'org-max-query-limit'])
      );
      expect(warnStub.getCalls().flatMap((call) => call.args as string[])).to.deep.include(
        envMessages.getMessage('deprecatedEnvDisagreement', [
          'SFDX_MAX_QUERY_LIMIT',
          'SF_ORG_MAX_QUERY_LIMIT',
          'SF_ORG_MAX_QUERY_LIMIT',
        ])
      );
    });

    it('when both versions of an envs are present, sf wins when asked for new name', async () => {
      process.env.SF_ORG_MAX_QUERY_LIMIT = '5';
      process.env.SFDX_MAX_QUERY_LIMIT = '4';
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyValue(OrgConfigProperties.ORG_MAX_QUERY_LIMIT)).to.equal('5');
      expect(warnStub.getCalls().flatMap((call) => call.args as string[])).to.deep.include(
        envMessages.getMessage('deprecatedEnvDisagreement', [
          'SFDX_MAX_QUERY_LIMIT',
          'SF_ORG_MAX_QUERY_LIMIT',
          'SF_ORG_MAX_QUERY_LIMIT',
        ])
      );
      expect(warnStub.callCount).to.equal(1);
    });

    it('constructor creates local and global config', async () => {
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getLocalConfig()).to.exist;
      expect(aggregator.getGlobalConfig()).to.exist;
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
    it('reload decrypts config values', async () => {
      // readSync doesn't decrypt values
      $$.SANDBOX.stub(Config.prototype, 'readSync').callsFake(function () {
        // @ts-expect-error this is any
        this.setContents({ 'org-isv-debugger-sid': 'encrypted' });
        // @ts-expect-error this is any
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.getContents();
      });
      // read decrypts values
      $$.SANDBOX.stub(Config.prototype, 'read').callsFake(async function () {
        // @ts-expect-error this is any
        this.setContents({ 'org-isv-debugger-sid': 'decrypted' });
        // @ts-expect-error this is any
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.getContents();
      });

      // @ts-expect-error because private method
      const aggregator = ConfigAggregator.getInstance();
      expect(aggregator.getInfo('org-isv-debugger-sid').value).to.equal('encrypted');
      await aggregator.reload();
      expect(aggregator.getInfo('org-isv-debugger-sid').value).to.equal('decrypted');
    });
  });

  describe('static getter', () => {
    it('request by current key', async () => {
      const expected = '47.0';
      $$.SANDBOX.stub(Config.prototype, 'readSync').returns({ 'org-api-version': expected });
      expect(ConfigAggregator.getValue(OrgConfigProperties.ORG_API_VERSION)?.value, expected);
    });

    it('request by current key matches value stored under old key', async () => {
      const expected = '48.0';
      $$.SANDBOX.stub(Config.prototype, 'readSync').returns({ apiVersion: expected });
      expect(ConfigAggregator.getValue(OrgConfigProperties.ORG_API_VERSION)?.value, expected);
    });

    it('request by old key matches value stored under current key', async () => {
      const expected = '49.0';
      $$.SANDBOX.stub(Config.prototype, 'readSync').returns({ 'org-api-version': expected });
      expect(ConfigAggregator.getValue(SfdxPropertyKeys.API_VERSION)?.value, expected);
    });

    it('request by old key matches new when both new and old are present', async () => {
      const expected = '50.0';
      $$.SANDBOX.stub(Config.prototype, 'readSync').returns({ 'org-api-version': expected, apiVersion: '50.0' });
      expect(ConfigAggregator.getValue(SfdxPropertyKeys.API_VERSION)?.value, expected);
    });

    it('request by new key matches new when both new and old are present', async () => {
      const expected = '51.0';
      $$.SANDBOX.stub(Config.prototype, 'readSync').returns({ 'org-api-version': expected, apiVersion: '50.0' });
      expect(ConfigAggregator.getValue(OrgConfigProperties.ORG_API_VERSION)?.value, expected);
    });
  });

  describe('getPropertyMeta', () => {
    it('key is current, has matching meta', async () => {
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyMeta(OrgConfigProperties.ORG_API_VERSION)).to.equal(
        ORG_CONFIG_ALLOWED_PROPERTIES.find((meta) => meta.key === OrgConfigProperties.ORG_API_VERSION)
      );
      expect(warnStub.callCount).to.equal(0);
    });
    it('key is deprecated, has matching meta', async () => {
      const aggregator = await ConfigAggregator.create();
      expect(aggregator.getPropertyMeta(SfdxPropertyKeys.INSTANCE_URL)).to.equal(
        SFDX_ALLOWED_PROPERTIES.find((meta) => meta.key === SfdxPropertyKeys.INSTANCE_URL)
      );
      expect(warnStub.callCount).to.equal(1);
    });
    describe('old key is known, new key comes from outside sfdx-core, but has matching meta for old key', () => {
      it('permanent generic example', async () => {
        // this scenario happens for 'org-metadata-rest-deploy' because 'restDeploy' is still in core, and knows its new key,
        // but that config lives in PDR
        // we want to fall back to avoid "Error (1): Unknown config name: org-metadata-rest-deploy."
        const aggregator = await ConfigAggregator.create();
        // simulate 'restDeploy`
        const oldConfigMeta = { key: 'oldProp', deprecated: true, newKey: 'newProp', description: 'whatever' };
        aggregator.addAllowedProperties([oldConfigMeta]);
        expect(aggregator.getPropertyMeta('newProp')).to.equal(oldConfigMeta);
        expect(warnStub.callCount).to.equal(0);
      });
      it('org-metadata-rest-deploy finds restDeploy', async () => {
        const aggregator = await ConfigAggregator.create();
        expect(aggregator.getPropertyMeta('org-metadata-rest-deploy')).to.equal(
          SFDX_ALLOWED_PROPERTIES.find((meta) => meta.key === SfdxPropertyKeys.REST_DEPLOY)
        );
        expect(warnStub.callCount).to.equal(0);
      });
    });
  });
});
