/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import { assert, expect } from 'chai';
import { SfdxConfig } from '../../../lib/config/sfdxConfig';
import { SfdxUtil } from '../../../lib/util';
import { testSetup } from '../../testSetup';
import { ConfigFile } from '../../../lib/config/configFile';

// Setup the test environment.
const $$ = testSetup();

const configFileContents = {
    defaultdevhubusername: 'sfdxConfigTest_devhub',
    defaultusername: 'sfdxConfigTest_default'
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

describe('SfdxConfig', () => {
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
            const config: SfdxConfig = await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(true));
            expect(config.getPath()).to.not.contain(await $$.localPathRetriever(id));
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
        it('not using global', async () => {
            const config: SfdxConfig = await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(false));
            expect(config.getPath()).to.contain(await $$.localPathRetriever(id));
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
    });

    describe('read', () => {

        it('adds content of the config file from this.path to this.contents', async () => {
            const config: SfdxConfig = await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(true));

            $$.SANDBOX.stub(SfdxUtil, 'readJSON')
                .withArgs(config.getPath())
                .returns(Promise.resolve(clone(configFileContents)));

            const content = await config.read();

            expect(content.get('defaultusername')).to.equal(configFileContents.defaultusername);
            expect(content.get('defaultdevhubusername')).to.equal(configFileContents.defaultdevhubusername);
            expect(config.toObject()).to.deep.equal(configFileContents);

        });
    });

    describe('set', () => {

        it('calls SfdxConfig.write with updated file contents', async () => {

            $$.SANDBOX.stub(SfdxUtil, 'readJSON').callsFake(async () => Promise.resolve(clone(configFileContents)));
            const writeStub = $$.SANDBOX.stub(SfdxUtil, 'writeJSON');

            const expectedFileContents = clone(configFileContents);
            const newUsername = 'updated_val';
            expectedFileContents.defaultusername = newUsername;

            await SfdxConfig.update(false, 'defaultusername', newUsername);

            expect(writeStub.getCall(0).args[1]).to.deep.equal(expectedFileContents);
        });

        it('calls SfdxConfig.write with deleted file contents', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'readJSON').callsFake(() => Promise.resolve(clone(configFileContents)));
            const writeStub = $$.SANDBOX.stub(SfdxUtil, 'writeJSON');
            const { defaultdevhubusername } = configFileContents;

            await SfdxConfig.update(false, 'defaultusername');

            expect(writeStub.getCall(0).args[1]).to.deep.equal({ defaultdevhubusername });
        });
    });

    describe('set', () => {
        it('UnknownConfigKey', async () => {
            const config: SfdxConfig = await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(true));
            try {
                config.set('foo', 'bar');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'UnknownConfigKey');
            }
        });

        it('InvalidConfigValue', async () => {
            const config: SfdxConfig = await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(true));
            try {
                config.set('apiVersion', '1');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'InvalidConfigValue');
            }
        });

        it('noPropertyInput validation', async () => {
            const config: SfdxConfig = await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(true));
            await config.set(SfdxConfig.DEFAULT_USERNAME, 'foo@example.com');
            expect(config.get(SfdxConfig.DEFAULT_USERNAME)).to.be.equal('foo@example.com');
        });
    });

    describe('crypto props', () => {
        it('calls ConfigFile.write with encrypted values contents', async () => {

            const TEST_VAL = 'test';

            const writeStub = $$.SANDBOX.stub(ConfigFile.prototype, ConfigFile.prototype.write.name).callsFake(async function() {
                expect(this.get('isvDebuggerSid').length).to.be.greaterThan(TEST_VAL.length);
                expect(this.get('isvDebuggerSid')).to.not.equal(TEST_VAL);
            });

            const config: SfdxConfig = await SfdxConfig.create<SfdxConfig>(SfdxConfig.getDefaultOptions(true));
            await config.set(SfdxConfig.ISV_DEBUGGER_SID, TEST_VAL);
            await config.write();

            expect(writeStub.called).to.be.true;
        });
    });
});
