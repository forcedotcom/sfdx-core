/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */

'use strict';

import { expect, assert } from 'chai';
import { ConfigAggregator } from '../../../lib/config/configAggregator';
import { Config } from '../../../lib/config/config';
import { testSetup } from '../../testSetup';
import { ConfigFile } from '../../../lib/config/configFile';
import * as fs from '../../../lib/util/fs';

// Setup the test environment.
const $$ = testSetup();

describe('ConfigAggregator', () => {
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
            const aggregator: ConfigAggregator = await ConfigAggregator.create();
            expect(aggregator.getLocalConfig()).to.be.exist;
            expect(aggregator.getGlobalConfig()).to.be.exist;
        });

        it('converts env vars', async () => {
            process.env.SFDX_DEFAULTUSERNAME = 'test';
            const aggregator: ConfigAggregator = await ConfigAggregator.create();
            expect(aggregator.getPropertyValue(Config.DEFAULT_USERNAME)).to.equal('test');
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

    describe('initialization', () => {
        beforeEach(() => {
            $$.SANDBOX.stub(Config.prototype, 'read').callsFake(async function() {
                const config = this.isGlobal() ? await Promise.resolve(new Map([['defaultusername', 2]])) :
                    await Promise.resolve(new Map([['defaultusername', 1]]));
                this.setContents(config);
                return config;
            });
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
            $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async (path) => {
                if (path) {
                    if (path.includes(await $$.globalPathRetriever(id))) {
                        return Promise.resolve({defaultusername: 2});
                    } else if (path.includes(await $$.localPathRetriever(id))) {
                        return Promise.resolve({defaultusername: 1});
                    }
                }
                return Promise.resolve();
            });
            const aggregator: ConfigAggregator = await ConfigAggregator.create();
            expect(aggregator.getLocation(Config.DEFAULT_USERNAME)).to.equal('Local');
        });

        it('global', async () => {
            $$.SANDBOX.stub(fs, 'readJsonMap').callsFake(async (path) => {
                if (path) {
                    if (path.includes(await $$.globalPathRetriever(id))) {
                        return Promise.resolve({defaultusername: 2});
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
            $$.SANDBOX.stub(fs, 'readJson').callsFake(async (path) => {
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
});
