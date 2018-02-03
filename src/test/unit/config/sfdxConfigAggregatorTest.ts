/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import { join as pathJoin } from 'path';

import { sandbox as sinonSandbox } from 'sinon';
import { expect, assert } from 'chai';

import { SfdxUtil } from '../../../lib/util';
import { SfdxConfigAggregator } from '../../../lib/config/sfdxConfigAggregator';
import { tmpdir as osTmpdir } from 'os';
import { SfdxConstant } from '../../../lib/sfdxConstants';
import { SfdxConfig } from '../../../lib/config/sfdxConfig';

const _sandbox = sinonSandbox.create();

function getTestLocalPath(): string {
    return pathJoin(osTmpdir(), 'local');
}

function getTestGlobalPath(): string {
    return pathJoin(osTmpdir(), 'global');
}

async function retrieveRootPath(isGlobal: boolean): Promise<string> {
    return isGlobal ? Promise.resolve(getTestGlobalPath()) : Promise.resolve(getTestLocalPath());
}

describe('SfdxConfigAggregator', () => {

    afterEach(() => {
        delete process.env.SFDX_DEFAULTUSERNAME;
        _sandbox.restore();
    });

    describe('instantiation', () => {
        it('creates local and global config', async () => {
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            expect(aggregator.getLocalConfig()).to.be.exist;
            expect(aggregator.getGlobalConfig()).to.be.exist;
        });

        it('converts env vars', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            expect(aggregator.getPropertyValue(SfdxConstant.DEFAULT_USERNAME)).to.equal('test');
        });

        describe('with no workspace', () => {
            it('does not have a local config', async () => {
                try {
                    await SfdxConfigAggregator.create();
                    assert.fail('expected an error to be thrown');
                } catch (err) {
                    expect(err).to.have.property('name', 'InvalidProjectWorkspace');
                }
            });
        });
    });

    describe('initialization', () => {
        before(() => {
            _sandbox.stub(SfdxConfig.prototype, 'read').callsFake(async function() {
                return this.isGlobal ? await Promise.resolve({ defaultusername: 2 }) :
                    await Promise.resolve({ defaultusername: 1 });
            });
        });
        it('local overrides global', async () => {
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            expect(await aggregator.getPropertyValue(SfdxConstant.DEFAULT_USERNAME)).to.equal(1);
        });

        it('env overrides local and global', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            expect(await aggregator.getPropertyValue(SfdxConstant.DEFAULT_USERNAME)).to.equal('test');
        });
    });

    describe('locations', () => {
        it('local', async () => {
            _sandbox.stub(SfdxUtil, 'readJSON').callsFake(async (path) => {
                if (path) {
                    if (path.includes(getTestGlobalPath())) {
                        return Promise.resolve({defaultusername: 2});
                    } else if (path.includes(getTestLocalPath())) {
                        return Promise.resolve({defaultusername: 1});
                    }
                }
                return Promise.resolve();
            });
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            expect(aggregator.getLocation(SfdxConstant.DEFAULT_USERNAME)).to.equal('Local');
        });

        it('global', async () => {
            _sandbox.stub(SfdxUtil, 'readJSON').callsFake(async (path) => {
                if (path) {
                    if (path.includes(getTestGlobalPath())) {
                        return Promise.resolve({defaultusername: 2});
                    } else if (path.includes(getTestLocalPath())) {
                        return Promise.resolve({});
                    }
                }
                return Promise.resolve();
            });
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            expect(aggregator.getLocation(SfdxConstant.DEFAULT_USERNAME)).to.equal('Global');
        });

        it('env', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            _sandbox.stub(SfdxUtil, 'readJSON').callsFake(async (path) => {
                if (path) {
                    if (path.includes(getTestGlobalPath())) {
                        return Promise.resolve({ defaultusername: 1 });
                    } else if (path.includes(getTestLocalPath())) {
                        return Promise.resolve({ defaultusername: 2 });
                    }
                }
                return Promise.resolve();
            });
            expect(aggregator.getLocation(SfdxConstant.DEFAULT_USERNAME)).to.equal('Environment');
        });

        it('configInfo', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            _sandbox.stub(SfdxUtil, 'readJSON').returns(Promise.resolve({}));

            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create(retrieveRootPath);
            const info = aggregator.getConfigInfo()[0];
            expect(info.key).to.equal('defaultusername');
            expect(info.value).to.equal('test');
            expect(info.location).to.equal('Environment');
        });
    });
});
