/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as sinon from 'sinon';

import { KeyValueStore } from '../../lib/config/fileKeyValueStore';
import { ConfigFile } from '../../lib/config/configFile';
import { testSetup } from '../testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('fileKeyValueStore', () => {
    let validate;
    let aliases;
    let store;

    beforeEach(async () => {
        validate = () => {};
        aliases = {};

        $$.SANDBOX.stub(ConfigFile, 'getRootFolder').callsFake($$.rootPathRetriever);

        store = await KeyValueStore.create('testfetchConfigInfos.json', 'orgs');
        $$.SANDBOX.stub(ConfigFile.prototype, 'write').callsFake((config) => {
            validate(config);
            return Promise.resolve();
        });
        $$.SANDBOX.stub(ConfigFile.prototype, 'readJSON').callsFake(() => Promise.resolve(aliases));
    });

    it('saves key value pair', async () => {
        validate = (config) => {
            expect(config.default.test).to.equal('val');
        };
        await store.update('test', 'val');
        expect(sinon.assert.calledOnce(ConfigFile.prototype.write));
    });

    it('unsets multiple key value pairs', async () => {
        aliases = { default: { test1: 'val1', test2: 'val2', test3: 'val3' } };
        validate = (config) => {
            expect(config.default).to.deep.equal({ test2: 'val2' });
        };
        await store.unset(['test1', 'test3']);
        expect(sinon.assert.calledOnce(ConfigFile.prototype.write));
    });

    it('unsets a single value', async () => {
        aliases = { default: { test1: 'val1', test2: 'val2', test3: 'val3' } };
        validate = (config) => {
            expect(config.default).to.deep.equal({ test2: 'val2', test3: 'val3' });
        };
        await store.unset(['test1']);
        expect(sinon.assert.calledOnce(ConfigFile.prototype.write));
    });

    it('returns a list of values under a group', async () => {
        aliases = { default: { test1: 'val1', test2: 'val2', test3: 'val3' } };
        const values = await store.list();
        expect(sinon.assert.calledOnce(ConfigFile.prototype.readJSON));
        expect(values).to.deep.equal(aliases.default);
    });

    it('undefined removes value', async () => {
        aliases = { default: { test: 'val' } };
        validate = (config) => {
            expect(config.default.test).to.be.undefined;
        };
        await store.update('test', undefined);
        expect(sinon.assert.calledOnce(ConfigFile.prototype.write));
    });

    it('only allows one value', async () => {
        aliases = { default: { test: 'val' } };
        validate = (config) => {
            expect(config.default.test).to.be.undefined;
            expect(config.default.another).to.equal('val');
        };
        await store.update('another', 'val');
        expect(sinon.assert.calledOnce(ConfigFile.prototype.write));
    });

    describe('updateValues', () => {
        it('one value', async () => {
            validate = (config) => {
                expect(config.default.another).to.equal('val');
            };
            await store.updateValues({ another: 'val' });
            expect(sinon.assert.calledOnce(ConfigFile.prototype.write));
        });

        it('two of same value', async () => {
            validate = (config) => {
                expect(config.default.another).to.be.undefined;
                expect(config.default.some).to.equal('val');
            };
            await store.updateValues({ another: 'val', some: 'val' });
            expect(sinon.assert.calledOnce(ConfigFile.prototype.write));
        });
    });
});
