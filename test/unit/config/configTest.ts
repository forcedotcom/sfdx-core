/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import { assert, expect } from 'chai';
import { Config } from '../../../src/config/config';
import { ConfigFile } from '../../../src/config/configFile';
import { testSetup } from '../../../src/testSetup';
import * as fs from '../../../src/util/fs';
import { ConfigContents } from '../../../src/config/configStore';
import { ensureString, JsonMap } from '@salesforce/ts-types';

// Setup the test environment.
const $$ = testSetup();

const configFileContents = {
    defaultdevhubusername: 'configTest_devhub',
    defaultusername: 'configTest_default'
};

const clone = (obj: JsonMap) => JSON.parse(JSON.stringify(obj));

describe('Config', () => {
    let id: string;

    beforeEach(() => {
        // Testing config functionality, so restore global stubs.
        $$.SANDBOXES.CONFIG.restore();

        id = $$.uniqid();
        $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder')
            .callsFake((isGlobal: boolean) => $$.rootPathRetriever(isGlobal, id));
    });

    describe('instantiation', () => {
        it('using global', async () => {
            const config: Config = await Config.create<Config>(Config.getDefaultOptions(true));
            expect(config.getPath()).to.not.contain(await $$.localPathRetriever(id));
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
        it('not using global', async () => {
            const config: Config = await Config.create<Config>(Config.getDefaultOptions(false));
            expect(config.getPath()).to.contain(await $$.localPathRetriever(id));
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
    });

    describe('read', () => {
        it('adds content of the config file from this.path to this.contents', async () => {
            const config: Config = await Config.create<Config>(Config.getDefaultOptions(true));

            $$.SANDBOX.stub(fs, 'readJsonMap')
                .withArgs(config.getPath())
                .returns(Promise.resolve(clone(configFileContents)));

            const content: ConfigContents = await config.read();

            expect(content.defaultusername).to.equal(configFileContents.defaultusername);
            expect(content.defaultdevhubusername).to.equal(configFileContents.defaultdevhubusername);
            expect(config.toObject()).to.deep.equal(configFileContents);

        });
    });

    describe('set', () => {
        it('calls Config.write with updated file contents', async () => {
            $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async () => Promise.resolve(clone(configFileContents)));
            const writeStub = $$.SANDBOX.stub(fs, 'writeJson');

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

            $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async () => Promise.resolve(clone(configFileContents)));
            const writeStub = $$.SANDBOX.stub(fs, 'writeJson');
            const { defaultdevhubusername } = configFileContents;

            await Config.update(false, 'defaultusername');
            expect(writeStub.getCall(0).args[1]).to.deep.equal({ defaultdevhubusername });
        });
    });

    describe('set', () => {
        it('UnknownConfigKey', async () => {
            const config: Config = await Config.create<Config>(Config.getDefaultOptions(true));
            try {
                config.set('foo', 'bar');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'UnknownConfigKey');
            }
        });

        it('enable preferpolling for org:create', async () => {
            const config: Config = await Config.create<Config>(Config.getDefaultOptions(true));
            config.set(Config.USE_BACKUP_POLLING_ORG_CREATE, 'true');
            expect(config.get(Config.USE_BACKUP_POLLING_ORG_CREATE)).to.be.equal('true');
        });

        it('InvalidConfigValue', async () => {
            const config: Config = await Config.create<Config>(Config.getDefaultOptions(true));
            try {
                config.set('apiVersion', '1');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'InvalidConfigValue');
            }
        });

        it('PropertyInput validation', async () => {
            const config: Config = await Config.create<Config>(Config.getDefaultOptions(true));
            await config.set(Config.DEFAULT_USERNAME, 'foo@example.com');
            expect(config.get(Config.DEFAULT_USERNAME)).to.be.equal('foo@example.com');
        });
    });

    describe('crypto props', () => {
        it('calls ConfigFile.write with encrypted values contents', async () => {
            const TEST_VAL = 'test';

            const writeStub = $$.SANDBOX.stub(ConfigFile.prototype, ConfigFile.prototype.write.name)
                .callsFake(async function(this: Config) {
                    expect(ensureString(this.get('isvDebuggerSid')).length).to.be.greaterThan(TEST_VAL.length);
                    expect(ensureString(this.get('isvDebuggerSid'))).to.not.equal(TEST_VAL);
                });

            const config: Config = await Config.create<Config>(Config.getDefaultOptions(true));
            await config.set(Config.ISV_DEBUGGER_SID, TEST_VAL);
            await config.write();

            expect(writeStub.called).to.be.true;
        });
    });
});
