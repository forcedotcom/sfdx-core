/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { KeyValueStore, KeyValueStoreConfigOptions } from '../../lib/config/fileKeyValueStore';
import { Config } from '../../lib/config/config';
import { testSetup } from '../testSetup';
import { SfdxUtil } from '../../lib/util';

// Setup the test environment.
const $$ = testSetup();

describe('fileKeyValueStore live file', () => {

    let rootFolder;
    const filename = 'test_keyvalue.json';
    beforeEach(async () => {
        rootFolder = await $$.rootPathRetriever(true);
        $$.SANDBOX.stub(Config, 'resolveRootFolder').callsFake(() => Promise.resolve(rootFolder));

        const content = { orgs: { foo: 'foo@example.com' } };
        const sfdxPath = pathJoin(rootFolder, '.sfdx');
        await SfdxUtil.mkdirp(sfdxPath);
        await SfdxUtil.writeJSON(pathJoin(sfdxPath, filename), content);
    });

    it ('file already exists', async () => {
        const options: KeyValueStoreConfigOptions = KeyValueStore.getDefaultOptions(filename, 'orgs');
        options.rootFolder = rootFolder;
        const store: KeyValueStore =
            await KeyValueStore.create(options);
        expect(await store.fetch('foo', 'orgs')).to.eq('foo@example.com');
    });
});

describe('fileKeyValueStore', () => {
    let validate;
    let aliases;
    let store;

    beforeEach(async () => {
        validate = () => {};
        aliases = {};

        $$.SANDBOX.stub(Config, 'resolveRootFolder').callsFake($$.rootPathRetriever);

        store = await KeyValueStore.create(KeyValueStore.getDefaultOptions('testfetchConfigInfos.json', 'orgs'));
        $$.SANDBOX.stub(Config.prototype, 'write').callsFake((config) => {
            validate(config);
            return Promise.resolve();
        });
        $$.SANDBOX.stub(Config.prototype, 'readJSON').callsFake(() => Promise.resolve(aliases));
    });

    it('saves key value pair', async () => {
        validate = (config) => {
            expect(config.default.test).to.equal('val');
        };
        await store.update('test', 'val');
        expect(sinon.assert.calledOnce(Config.prototype.write));
    });

    it('unsets multiple key value pairs', async () => {
        aliases = { default: { test1: 'val1', test2: 'val2', test3: 'val3' } };
        validate = (config) => {
            expect(config.default).to.deep.equal({ test2: 'val2' });
        };
        await store.unset(['test1', 'test3']);
        expect(sinon.assert.calledOnce(Config.prototype.write));
    });

    it('unsets a single value', async () => {
        aliases = { default: { test1: 'val1', test2: 'val2', test3: 'val3' } };
        validate = (config) => {
            expect(config.default).to.deep.equal({ test2: 'val2', test3: 'val3' });
        };
        await store.unset(['test1']);
        expect(sinon.assert.calledOnce(Config.prototype.write));
    });

    it('returns a list of values under a group', async () => {
        aliases = { default: { test1: 'val1', test2: 'val2', test3: 'val3' } };
        const values = await store.list();
        expect(sinon.assert.calledOnce(Config.prototype.readJSON));
        expect(values).to.deep.equal(aliases.default);
    });

    it('undefined removes value', async () => {
        aliases = { default: { test: 'val' } };
        validate = (config) => {
            expect(config.default.test).to.be.undefined;
        };
        await store.update('test', undefined);
        expect(sinon.assert.calledOnce(Config.prototype.write));
    });

    it('only allows one value', async () => {
        aliases = { default: { test: 'val' } };
        validate = (config) => {
            expect(config.default.test).to.be.undefined;
            expect(config.default.another).to.equal('val');
        };
        await store.update('another', 'val');
        expect(sinon.assert.calledOnce(Config.prototype.write));
    });

    describe('updateValues', () => {
        it('one value', async () => {
            validate = (config) => {
                expect(config.default.another).to.equal('val');
            };
            await store.updateValues({ another: 'val' });
            expect(sinon.assert.calledOnce(Config.prototype.write));
        });

        it('two of same value', async () => {
            validate = (config) => {
                expect(config.default.another).to.be.undefined;
                expect(config.default.some).to.equal('val');
            };
            await store.updateValues({ another: 'val', some: 'val' });
            expect(sinon.assert.calledOnce(Config.prototype.write));
        });
    });
});
