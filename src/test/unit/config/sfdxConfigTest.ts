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

// Setup the test environment.
const $$ = testSetup();

const configFileContents = {
    defaultdevhubusername: 'sfdxConfigTest_devhub',
    defaultusername: 'sfdxConfigTest_default'
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

describe('SfdxConfigFile', () => {

    afterEach(() => {
        $$.SANDBOX.restore();
    });

    describe('instantiation', () => {
        const id: string = $$.uniqid();
        it('using global', async () => {
            const config: SfdxConfig = await SfdxConfig.create(true, () => $$.rootPathRetriever(true, id));
            expect(config.getPath()).to.not.contain(await $$.localPathRetriever(id));
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
        it('not using global', async () => {
            const config: SfdxConfig = await SfdxConfig.create(false, () => $$.rootPathRetriever(false, id));
            expect(config.getPath()).to.contain(await $$.localPathRetriever(id));
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
    });

    describe('read', () => {

        it('adds content of the config file from this.path to this.contents', async () => {
            const config: SfdxConfig = await SfdxConfig.create(true, $$.rootPathRetriever);

            $$.SANDBOX.stub(SfdxUtil, 'readJSON')
                .withArgs(config.getPath(), false)
                .returns(Promise.resolve(clone(configFileContents)));

            const content = await config.read();

            expect(content).to.deep.equal(configFileContents);
            expect(config.getContents()).to.deep.equal(configFileContents);

        });
    });

    describe('set', () => {

        it('calls SfdxConfig.write with updated file contents', async () => {

            $$.SANDBOX.stub(SfdxUtil, 'readJSON').callsFake(async () => Promise.resolve(clone(configFileContents)));
            const writeStub = $$.SANDBOX.stub(SfdxConfig.prototype, 'write');

            const expectedFileContents = clone(configFileContents);
            const newUsername = 'updated_val';
            expectedFileContents.defaultusername = newUsername;

            await SfdxConfig.setPropertyValue(false, 'defaultusername', newUsername, $$.rootPathRetriever);

            expect(writeStub.calledWith(expectedFileContents)).to.be.true;
        });

        it('calls SfdxConfig.write with deleted file contents', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'readJSON').callsFake(() => Promise.resolve(clone(configFileContents)));
            const writeStub = $$.SANDBOX.stub(SfdxConfig.prototype, 'write');
            const { defaultdevhubusername } = configFileContents;

            await SfdxConfig.setPropertyValue(false, 'defaultusername', undefined, $$.rootPathRetriever);

            expect(writeStub.calledWith({ defaultdevhubusername })).to.be.true;
        });
    });

    describe('setPropertyValue', () => {
        it('UnknownConfigKey', async () => {
            const config: SfdxConfig = await SfdxConfig.create(undefined, $$.rootPathRetriever);
            try {
                await config.setPropertyValue('foo', 'bar');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'UnknownConfigKey');
            }
        });

        it('invalidConfigValue', async () => {
            const config: SfdxConfig = await SfdxConfig.create(undefined, $$.rootPathRetriever);
            try {
                await config.setPropertyValue('apiVersion', '1');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'invalidConfigValue');
            }
        });

        it('noPropertyInput validation', async () => {
            const config: SfdxConfig = await SfdxConfig.create(undefined, $$.rootPathRetriever);
            config.setContents([]);
            await config.setPropertyValue(SfdxConfig.DEFAULT_USERNAME, 'foo@example.com');
            expect(config.getContents()[SfdxConfig.DEFAULT_USERNAME]).to.be.equal('foo@example.com');
        });
    });
});
