/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { stubMethod } from '@salesforce/ts-sinon';
import { ensureString, JsonMap } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import { Config, SfdxPropertyKeys } from '../../../src/config/config';
import { ConfigFile } from '../../../src/config/configFile';
import { ConfigContents } from '../../../src/config/configStore';
import { testSetup } from '../../../src/testSetup';
import { fs } from '../../../src/util/fs';

// Setup the test environment.
const $$ = testSetup();

const configFileContents = {
  defaultdevhubusername: 'configTest_devhub',
  defaultusername: 'configTest_default',
};

const clone = (obj: JsonMap) => JSON.parse(JSON.stringify(obj));

describe('Config', () => {
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
      const config: Config = await Config.create({ isGlobal: true });
      expect(config.getPath()).to.not.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
    it('using global', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));
      expect(config.getPath()).to.not.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
    it('using defaults', async () => {
      const config: Config = await Config.create();
      expect(config.getPath()).to.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
    it('not using global', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(false));
      expect(config.getPath()).to.contain(await $$.localPathRetriever(id));
      expect(config.getPath()).to.contain('.sf');
      expect(config.getPath()).to.contain('config.json');
    });
  });

  describe('read', () => {
    it('adds content of the config file from this.path to this.contents', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));

      stubMethod($$.SANDBOX, fs, 'readJsonMap')
        .withArgs(config.getPath())
        .returns(Promise.resolve(clone(configFileContents)));

      // Manipulate config.hasRead to force a read
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore -> hasRead is protected. Ignore for testing.
      config.hasRead = false;

      const content: ConfigContents = await config.read();

      expect(content.defaultusername).to.equal(configFileContents.defaultusername);
      expect(content.defaultdevhubusername).to.equal(configFileContents.defaultdevhubusername);
      expect(config.toObject()).to.deep.equal(configFileContents);
    });
  });

  describe('set', () => {
    it('calls Config.write with updated file contents', async () => {
      stubMethod($$.SANDBOX, fs, 'readJsonMap').callsFake(async () => Promise.resolve(clone(configFileContents)));
      const writeStub = stubMethod($$.SANDBOX, fs, 'writeJson');

      const expectedFileContents = clone(configFileContents);
      const newUsername = 'updated_val';
      expectedFileContents.defaultusername = newUsername;

      await Config.update(false, 'defaultusername', newUsername);

      expect(writeStub.getCall(0).args[1]).to.deep.equal(expectedFileContents);
    });

    it('calls Config.write with deleted file contents', async () => {
      const expectedFileContents = clone(configFileContents);
      const newUsername = 'updated_val';
      expectedFileContents.defaultusername = newUsername;

      await Config.update(false, 'defaultusername', newUsername);

      stubMethod($$.SANDBOX, fs, 'readJsonMap').callsFake(async () => Promise.resolve(clone(configFileContents)));
      const writeStub = stubMethod($$.SANDBOX, fs, 'writeJson');
      const { defaultdevhubusername } = configFileContents;

      await Config.update(false, 'defaultusername');
      expect(writeStub.getCall(0).args[1]).to.deep.equal({
        defaultdevhubusername,
      });
    });
  });

  describe('set throws', () => {
    it('UnknownConfigKeyError', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));
      try {
        config.set('foo', 'bar');
        assert.fail('Expected an error to be thrown.');
      } catch (err) {
        expect(err).to.have.property('name', 'UnknownConfigKeyError');
      }
    });

    describe('InvalidConfigValueError', () => {
      it('apiVersoin', async () => {
        const config: Config = await Config.create(Config.getDefaultOptions(true));
        try {
          config.set('apiVersion', '1');
          assert.fail('Expected an error to be thrown.');
        } catch (err) {
          expect(err).to.have.property('name', 'InvalidConfigValueError');
        }
      });
      it('isvDebuggerUrl', async () => {
        const config: Config = await Config.create(Config.getDefaultOptions(true));
        try {
          config.set('isvDebuggerUrl', 23);
          assert.fail('Expected an error to be thrown.');
        } catch (err) {
          expect(err).to.have.property('name', 'InvalidConfigValueError');
        }
      });
      it('isvDebuggerSid', async () => {
        const config: Config = await Config.create(Config.getDefaultOptions(true));
        try {
          config.set('isvDebuggerSid', 23);
          assert.fail('Expected an error to be thrown.');
        } catch (err) {
          expect(err).to.have.property('name', 'InvalidConfigValueError');
        }
      });
      describe('maxQueryLimit', () => {
        it('will throw an error when value is mixed alphanumeric', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          try {
            config.set('maxQueryLimit', '123abc');
            assert.fail('Expected an error to be thrown.');
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will throw an error when value is not numeric', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          try {
            config.set('maxQueryLimit', 'abc');
            assert.fail('Expected an error to be thrown.');
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });

        it('will throw an error when value is negative', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          try {
            config.set('maxQueryLimit', '-123');
            assert.fail('Expected an error to be thrown.');
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });

        it('will throw an error when value is negative decimal', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          try {
            config.set('maxQueryLimit', '-123.456');
            assert.fail('Expected an error to be thrown.');
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will throw an error when value is negative integer', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          try {
            config.set('maxQueryLimit', '-123');
            assert.fail('Expected an error to be thrown.');
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will throw an error when value is 0', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          try {
            config.set('maxQueryLimit', '0');
            assert.fail('Expected an error to be thrown.');
          } catch (err) {
            expect(err).to.have.property('name', 'InvalidConfigValueError');
          }
        });
        it('will set config value with stringified number', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          const res = config.set('maxQueryLimit', '123');
          expect(res.maxQueryLimit).to.equal('123');
        });
        it('will set config value with as number as it should be', async () => {
          const config: Config = await Config.create(Config.getDefaultOptions(true));
          const res = config.set('maxQueryLimit', 123);
          expect(res.maxQueryLimit).to.equal(123);
        });
      });
    });

    it('PropertyInput validation', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));
      config.set(SfdxPropertyKeys.DEFAULT_USERNAME, 'foo@example.com');
      expect(config.get(SfdxPropertyKeys.DEFAULT_USERNAME)).to.be.equal('foo@example.com');
    });
  });

  describe('unset', () => {
    it('calls Config.write with updated file contents', async () => {
      stubMethod($$.SANDBOX, fs, 'readJsonMap').callsFake(async () => Promise.resolve(clone(configFileContents)));
      const writeStub = stubMethod($$.SANDBOX, fs, 'writeJson');

      const expectedFileContents = clone(configFileContents);
      delete expectedFileContents.defaultusername;

      const config = await Config.create({ isGlobal: false });
      config.unset('defaultusername');
      await config.write();

      expect(writeStub.getCall(0).args[1]).to.deep.equal(expectedFileContents);
    });
  });

  describe('unset throws', () => {
    it('UnknownConfigKeyError', async () => {
      const config: Config = await Config.create(Config.getDefaultOptions(true));
      try {
        config.unset('foo');
        assert.fail('Expected an error to be thrown.');
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
          expect(ensureString(this.get('isvDebuggerSid')).length).to.be.greaterThan(TEST_VAL.length);
          expect(ensureString(this.get('isvDebuggerSid'))).to.not.equal(TEST_VAL);
        }
      );

      const config: Config = await Config.create(Config.getDefaultOptions(true));
      config.set(SfdxPropertyKeys.ISV_DEBUGGER_SID, TEST_VAL);
      await config.write();

      expect(writeStub.called).to.be.true;
    });

    it('calls ConfigFile.read with unknown key and does not throw on crypt', async () => {
      stubMethod($$.SANDBOX, ConfigFile.prototype, ConfigFile.prototype.readSync.name).callsFake(async function () {});
      stubMethod($$.SANDBOX, ConfigFile.prototype, ConfigFile.prototype.read.name).callsFake(async function () {
        this.setContentsFromObject({ unknown: 'unknown config key and value' });
      });

      const config: Config = await Config.create({ isGlobal: true });
      expect(config).to.exist;
    });
  });

  describe('allowed properties', () => {
    let originalAllowedProperties;

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
        originalAllowedProperties.some((meta) => meta.key === 'instanceUrl'),
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

      expect(addedConfigMeta.key).to.equal('hello');
      expect(addedConfigMeta.hidden).to.equal(false);
      expect(addedConfigMeta.encrypted).to.equal(false);
    });
  });
});
