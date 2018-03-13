/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import { join as pathJoin } from 'path';

import { expect, assert } from 'chai';

import { SfdxUtil } from '../../../lib/util';
import { SfdxConfigAggregator } from '../../../lib/config/sfdxConfigAggregator';
import { tmpdir as osTmpdir } from 'os';
import { SfdxConfig } from '../../../lib/config/sfdxConfig';
import { testSetup } from '../../testSetup';
import { ConfigFile } from '../../../lib/config/configFile';

// Setup the test environment.
const $$ = testSetup();

describe('SfdxConfigAggregator', () => {
    let id: string;
    beforeEach(() => {
        // Testing config functionality, so restore global stubs.
        $$.SANDBOXES.CONFIG.restore();

        id = $$.uniqid();
        $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder')
            .callsFake((isGlobal: boolean) => $$.rootPathRetriever(isGlobal, id));
    });

    afterEach(() => {
        delete process.env.SFDX_DEFAULTUSERNAME;
    });

    describe('instantiation', () => {
        it('creates local and global config', async () => {
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            expect(aggregator.getLocalConfig()).to.be.exist;
            expect(aggregator.getGlobalConfig()).to.be.exist;
        });

        it('converts env vars', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            expect(aggregator.getPropertyValue(SfdxConfig.DEFAULT_USERNAME)).to.equal('test');
        });

        describe('with no workspace', () => {
            it('does not have a local config', async () => {
                try {
                    // Should not throw
                    await SfdxConfigAggregator.create();
                } catch (err) {
                    assert.fail('expected an error to be thrown');
                }
            });
        });
    });

    describe('initialization', () => {
        beforeEach(() => {
            $$.SANDBOX.stub(SfdxConfig.prototype, 'read').callsFake(async function() {
                const config = this.isGlobal() ? await Promise.resolve(new Map([['defaultusername', 2]])) :
                    await Promise.resolve(new Map([['defaultusername', 1]]));
                this.setContents(config);
                return config;
            });
        });
        it('local overrides global', async () => {
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            expect(await aggregator.getPropertyValue(SfdxConfig.DEFAULT_USERNAME)).to.equal(1);
        });

        it('env overrides local and global', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            expect(await aggregator.getPropertyValue(SfdxConfig.DEFAULT_USERNAME)).to.equal('test');
        });
    });

    describe('locations', () => {
        it('local', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'readJSON').callsFake(async (path) => {
                if (path) {
                    if (path.includes(await $$.globalPathRetriever(id))) {
                        return Promise.resolve({defaultusername: 2});
                    } else if (path.includes(await $$.localPathRetriever(id))) {
                        return Promise.resolve({defaultusername: 1});
                    }
                }
                return Promise.resolve();
            });
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            expect(aggregator.getLocation(SfdxConfig.DEFAULT_USERNAME)).to.equal('Local');
        });

        it('global', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'readJSON').callsFake(async (path) => {
                if (path) {
                    if (path.includes(await $$.globalPathRetriever(id))) {
                        return Promise.resolve({defaultusername: 2});
                    } else if (path.includes(await $$.localPathRetriever(id))) {
                        return Promise.resolve({});
                    }
                }
                return Promise.resolve();
            });
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            expect(aggregator.getLocation(SfdxConfig.DEFAULT_USERNAME)).to.equal('Global');
        });

        it('env', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            $$.SANDBOX.stub(SfdxUtil, 'readJSON').callsFake(async (path) => {
                if (path) {
                    if (path.includes(await $$.globalPathRetriever(id))) {
                        return Promise.resolve({ defaultusername: 1 });
                    } else if (path.includes(await $$.localPathRetriever(id))) {
                        return Promise.resolve({ defaultusername: 2 });
                    }
                }
                return Promise.resolve();
            });
            expect(aggregator.getLocation(SfdxConfig.DEFAULT_USERNAME)).to.equal('Environment');
        });

        it('configInfo', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            $$.SANDBOX.stub(SfdxUtil, 'readJSON').returns(Promise.resolve({}));

            const aggregator: SfdxConfigAggregator = await SfdxConfigAggregator.create();
            const info = aggregator.getConfigInfo()[0];
            expect(info.key).to.equal('defaultusername');
            expect(info.value).to.equal('test');
            expect(info.location).to.equal('Environment');
        });
    });
});
