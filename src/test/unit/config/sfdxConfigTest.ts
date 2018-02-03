/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import * as Path from 'path';

import { assert, expect } from 'chai';

import { sandbox as sinonSandbox } from 'sinon';

import { SfdxConfig } from '../../../lib/config/sfdxConfig';
import { SfdxUtil } from '../../../lib/util';
import { tmpdir as osTmpdir } from 'os';
import { SfdxConstant } from '../../../lib/sfdxConstants';

const sandbox = sinonSandbox.create();

const configFileContents = {
    defaultdevhubusername: 'sfdxConfigTest_devhub',
    defaultusername: 'sfdxConfigTest_default'
};

const clone = (obj) => JSON.parse(JSON.stringify(obj));

function getTestLocalPath(): string {
    return Path.join(osTmpdir(), 'local');
}

async function retrieveRootPath(isGlobal: boolean): Promise<string> {
    return isGlobal ?
        Promise.resolve(Path.join(osTmpdir(), 'global')) : Promise.resolve(Path.join(osTmpdir(), 'local'));
}

describe('SfdxConfigFile', () => {

    afterEach(() => {
        sandbox.restore();
    });

    describe('instantiation', () => {
        it('using global', async () => {
            const config: SfdxConfig = await SfdxConfig.create(true, retrieveRootPath);
            expect(config.getPath()).to.not.contain(getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
        it('not using global', async () => {
            const config: SfdxConfig = await SfdxConfig.create(false, retrieveRootPath);
            expect(config.getPath()).to.contain(getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
            expect(config.getPath()).to.contain('sfdx-config.json');
        });
    });

    describe('read', () => {

        it('adds content of the config file from this.path to this.contents', async () => {
            const config: SfdxConfig = await SfdxConfig.create(true, retrieveRootPath);

            sandbox.stub(SfdxUtil, 'readJSON')
                .withArgs(config.getPath(), false)
                .returns(Promise.resolve(clone(configFileContents)));

            const content = await config.read();

            expect(content).to.deep.equal(configFileContents);
            expect(config.getContents()).to.deep.equal(configFileContents);

        });
    });

    describe('set', () => {

        it('calls SfdxConfig.write with updated file contents', async () => {

            sandbox.stub(SfdxUtil, 'readJSON').callsFake(async () => Promise.resolve(clone(configFileContents)));
            const writeStub = sandbox.stub(SfdxConfig.prototype, 'write');

            const expectedFileContents = clone(configFileContents);
            const newUsername = 'updated_val';
            expectedFileContents.defaultusername = newUsername;

            await SfdxConfig.setPropertyValue(false, 'defaultusername', newUsername, retrieveRootPath);

            expect(writeStub.calledWith(expectedFileContents)).to.be.true;
        });

        it('calls SfdxConfig.write with deleted file contents', async () => {
            sandbox.stub(SfdxUtil, 'readJSON').callsFake(() => Promise.resolve(clone(configFileContents)));
            const writeStub = sandbox.stub(SfdxConfig.prototype, 'write');
            const { defaultdevhubusername } = configFileContents;

            await SfdxConfig.setPropertyValue(false, 'defaultusername', undefined, retrieveRootPath);

            expect(writeStub.calledWith({ defaultdevhubusername })).to.be.true;
        });
    });

    describe('setPropertyValue', () => {
        it('UnknownConfigKey', async () => {
            const config: SfdxConfig = await SfdxConfig.create(undefined, retrieveRootPath);
            try {
                await config.setPropertyValue('foo', 'bar');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'UnknownConfigKey');
            }
        });

        it('invalidConfigValue', async () => {
            const config: SfdxConfig = await SfdxConfig.create(undefined, retrieveRootPath);
            try {
                await config.setPropertyValue('apiVersion', '1');
                assert.fail('Expected an error to be thrown.');
            } catch (err) {
                expect(err).to.have.property('name', 'invalidConfigValue');
            }
        });

        it('noPropertyInput validation', async () => {
            const config: SfdxConfig = await SfdxConfig.create(undefined, retrieveRootPath);
            config.setContents([]);
            config.setPropertyValue(SfdxConstant.DEFAULT_USERNAME, 'foo@example.com');
            expect(config.getContents()[SfdxConstant.DEFAULT_USERNAME]).to.be.equal('foo@example.com');
        });
    });
});
