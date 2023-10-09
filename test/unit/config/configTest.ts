/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as fs from 'fs';
import { stubMethod } from '@salesforce/ts-sinon';
import { ensureString, JsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import { Config, ConfigPropertyMeta } from '../../../src/config/config';
import { ConfigFile } from '../../../src/config/configFile';
import { ConfigContents } from '../../../src/config/configStackTypes';
import { OrgConfigProperties } from '../../../src/exported';
import { shouldThrowSync, TestContext } from '../../../src/testSetup';

const configFileContentsString = '{"target-dev-hub": "configTest_devhub","target-org": "configTest_default"}';
const configFileContentsJson = { 'target-dev-hub': 'configTest_devhub', 'target-org': 'configTest_default' };

const clone = (obj: JsonMap) => JSON.parse(JSON.stringify(obj));

describe('Config', () => {
  const $$ = new TestContext();

  let id: string;

  beforeEach(() => {
    // Testing config functionality, so restore global stubs.
    $$.SANDBOXES.CONFIG.restore();

    id = $$.uniqid();
    stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolder').callsFake((isGlobal: boolean) =>
      $$.rootPathRetriever(isGlobal, id)
    );
    stubMethod($$.SANDBOX, ConfigFile, 'resolveRootFolderSync').callsFake((isGlobal: boolean) =>
      $$.rootPathRetrieverSync(isGlobal, id)
    );
  });

  describe('instantiation', () => {
    it('using partial global', async () => {
      const config = await Config.create({ isGlobal: true });
      expect(config.getPath()).to.not.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
    it('using global', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));
      expect(config.getPath()).to.not.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
    it('using defaults', async () => {
      const config = await Config.create();
      expect(config.getPath()).to.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
    it('not using global', async () => {
      const config = await Config.create(Config.getDefaultOptions(false));
      expect(config.getPath()).to.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
  });

  describe('read', () => {
    it('adds content of the config file from this.path to this.contents', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));

      stubMethod($$.SANDBOX, fs.promises, 'readFile').withArgs(config.getPath()).resolves(configFileContentsString);

      // Manipulate config.hasRead to force a read
      // @ts-expect-error -> hasRead is protected. Ignore for testing.
      config.hasRead = false;

      const content: ConfigContents = await config.read();

      expect(content['target-org']).to.equal(configFileContentsJson['target-org']);
      expect(content['target-dev-hub']).to.equal(configFileContentsJson['target-dev-hub']);
      expect(config.toObject()).to.deep.equal(configFileContentsJson);
    });
  });

  describe('set', () => {
    it('calls Config.write with updated file contents', async () => {
      stubMethod($$.SANDBOX, fs.promises, 'readFile').resolves(configFileContentsString);
      const writeStub = stubMethod($$.SANDBOX, fs.promises, 'writeFile');

      const expectedFileContents = clone(configFileContentsJson);
      const newUsername = 'updated_val';
      expectedFileContents['target-org'] = newUsername;

      await Config.update(false, 'target-org', newUsername);

      expect(writeStub.getCall(0).args[1]).to.deep.equal(JSON.stringify(expectedFileContents, null, 2));
    });

    it('calls Config.write with deleted file contents', async () => {
      const expectedFileContents = clone(configFileContentsJson);
      const newUsername = 'updated_val';
      expectedFileContents['target-org'] = newUsername;

      await Config.update(false, 'target-org', newUsername);

      stubMethod($$.SANDBOX, fs.promises, 'readFile').resolves(configFileContentsString);
      const writeStub = stubMethod($$.SANDBOX, fs.promises, 'writeFile');
      const targetDevhub = configFileContentsJson['target-dev-hub'];

      await Config.update(false, 'target-org');
      expect(writeStub.getCall(0).args[1]).to.deep.equal(JSON.stringify({ 'target-dev-hub': targetDevhub }, null, 2));
    });
  });

  describe('set throws', () => {
    it('UnknownConfigKeyError', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));
      try {
        shouldThrowSync(() => config.set('foo', 'bar'));
      } catch (err) {
        expect(err).to.have.property('name', 'UnknownConfigKeyError');
      }
    });

    describe('InvalidConfigValueError', () => {
      it('org-api-version', async () => {
        const config = await Config.create(Config.getDefaultOptions(true));
        try {
          shouldThrowSync(() => config.set('org-api-version', '1'));
        } catch (err) {
          expect(err).to.have.property('name', 'InvalidConfigValueError');
        }
      });
      it('org-isv-debugger-url', async () => {
        const config = await Config.create(Config.getDefaultOptions(true));
        try {
          shouldThrowSync(() => config.set('org-isv-debugger-url', 23));
        } catch (err) {
          expect(err).to.have.property('name', 'InvalidConfigValueError');
        }
      });
      it('org-isv-debugger-sid', async () => {
        const config = await Config.create(Config.getDefaultOptions(true));
        try {
          shouldThrowSync(() => config.set('org-isv-debugger-sid', 23));
        } catch (err) {
          expect(err).to.have.property('name', 'InvalidConfigValueError');
        }
      });
      describe('org-max-query-limit', () => {
        it('will throw an error when value is mixed alphanumeric', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          try {
            shouldThrowSync(() => config.set('org-max-query-limit', '123abc'));
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will throw an error when value is not numeric', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          try {
            shouldThrowSync(() => config.set('org-max-query-limit', 'abc'));
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });

        it('will throw an error when value is negative', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          try {
            shouldThrowSync(() => config.set('org-max-query-limit', '-123'));
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });

        it('will throw an error when value is negative decimal', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          try {
            shouldThrowSync(() => config.set('org-max-query-limit', '-123.456'));
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will throw an error when value is negative integer', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          try {
            shouldThrowSync(() => config.set('org-max-query-limit', '-123'));
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will throw an error when value is 0', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          try {
            shouldThrowSync(() => config.set('org-max-query-limit', '0'));
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will set config value with stringified number', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          const res = config.set('org-max-query-limit', '123');
          expect(res['org-max-query-limit']).to.equal('123');
        });
        it('will set config value with as number as it should be', async () => {
          const config = await Config.create(Config.getDefaultOptions(true));
          const res = config.set('org-max-query-limit', 123);
          expect(res['org-max-query-limit']).to.equal(123);
        });
      });
    });

    it('PropertyInput validation', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.TARGET_ORG, 'foo@example.com');
      expect(config.get(OrgConfigProperties.TARGET_ORG)).to.be.equal('foo@example.com');
    });
  });

  describe('unset', () => {
    it('calls Config.write with updated file contents', async () => {
      stubMethod($$.SANDBOX, fs.promises, 'readFile').resolves(configFileContentsString);
      const writeStub = stubMethod($$.SANDBOX, fs.promises, 'writeFile');

      const expectedFileContents = clone(configFileContentsJson);
      delete expectedFileContents['target-org'];

      const config = await Config.create({ isGlobal: false });
      config.unset('target-org');
      await config.write();

      expect(writeStub.getCall(0).args[1]).to.deep.equal(JSON.stringify(expectedFileContents, null, 2));
    });
  });

  describe('unset throws', () => {
    it('UnknownConfigKeyError', async () => {
      const config = await Config.create(Config.getDefaultOptions(true));
      try {
        shouldThrowSync(() => config.unset('foo'));
      } catch (err) {
        expect(err).to.have.property('name', 'UnknownConfigKeyError');
      }
    });
  });

  describe('crypto props', () => {
    it('calls ConfigFile.write with encrypted values contents', async () => {
      const TEST_VAL = 'test';

      const writeStub = stubMethod($$.SANDBOX, ConfigFile.prototype, ConfigFile.prototype.write.name).callsFake(
        async function (this: Config) {
          expect(ensureString(this.get('org-isv-debugger-sid')).length).to.be.greaterThan(TEST_VAL.length);
          expect(ensureString(this.get('org-isv-debugger-sid'))).to.not.equal(TEST_VAL);
        }
      );

      const config = await Config.create(Config.getDefaultOptions(true));
      config.set(OrgConfigProperties.ORG_ISV_DEBUGGER_SID, TEST_VAL);
      await config.write();

      expect(writeStub.called).to.be.true;
    });

    it('calls ConfigFile.read with unknown key and does not throw on crypt', async () => {
      stubMethod($$.SANDBOX, ConfigFile.prototype, ConfigFile.prototype.readSync.name).callsFake(async () => {});
      stubMethod($$.SANDBOX, ConfigFile.prototype, ConfigFile.prototype.read.name).callsFake(async function () {
        // @ts-expect-error -> this is any
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this.setContentsFromObject({ unknown: 'unknown config key and value' });
      });

      const config = await Config.create({ isGlobal: true });
      expect(config).to.exist;
    });
  });

  describe('allowed properties', () => {
    let originalAllowedProperties: ConfigPropertyMeta[];

    beforeEach(() => {
      originalAllowedProperties = (Config as any).allowedProperties;
      (Config as any).allowedProperties = [];
    });

    afterEach(() => {
      (Config as any).allowedProperties = originalAllowedProperties;
    });

    it('has default properties assigned', () => {
      expect(originalAllowedProperties.length).to.be.greaterThan(0);

      expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        originalAllowedProperties.some((meta: ConfigPropertyMeta) => meta.key === 'instanceUrl'),
        'it has one of the default allowed properties'
      ).to.be.true;
    });

    it('can add allowed properties', () => {
      const configMetas = [
        {
          key: 'hello',
          description: 'hello',
          hidden: false,
          encrypted: false,
        },
      ];

      Config.addAllowedProperties(configMetas);
      const addedConfigMeta = Config.getAllowedProperties().find((configMeta) => configMeta.key === 'hello');

      expect(addedConfigMeta?.key).to.equal('hello');
      expect(addedConfigMeta?.hidden).to.equal(false);
      expect(addedConfigMeta?.encrypted).to.equal(false);
    });
  });
});
