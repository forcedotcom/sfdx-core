/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { expect } from 'chai';
import * as sinon from 'sinon';

import { ConfigGroup, ConfigGroupOptions } from '../../../lib/config/configGroup';
import { ConfigFile, ConfigOptions } from '../../../lib/config/configFile';
import { testSetup } from '../../testSetup';
import { SfdxUtil } from '../../../lib/util';

// Setup the test environment.
const $$ = testSetup();

describe('ConfigGroup live file', () => {

    let rootFolder;
    const filename = 'test_keyvalue.json';
    beforeEach(async () => {
        rootFolder = await $$.rootPathRetriever(true);
        $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder').callsFake(() => Promise.resolve(rootFolder));

        const content = { orgs: { foo: 'foo@example.com' } };
        const sfdxPath = pathJoin(rootFolder, '.sfdx');
        await SfdxUtil.mkdirp(sfdxPath);
        await SfdxUtil.writeJSON(pathJoin(sfdxPath, filename), content);
    });

    it('file already exists', async () => {
        const options: ConfigGroupOptions = ConfigGroup.getOptions('orgs', filename);
        options.rootFolder = rootFolder;
        const store: ConfigGroup = await ConfigGroup.retrieve<ConfigGroup>(options);
        expect(store.getInGroup('foo', 'orgs')).to.eq('foo@example.com');
    });
});

describe('ConfigGroup', () => {
    let validate;
    let aliases;
    let store: ConfigGroup;

    beforeEach(async () => {
        validate = () => {};
        aliases = {};

        $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder').callsFake($$.rootPathRetriever);

        store = await ConfigGroup.create<ConfigGroup>(ConfigGroup.getOptions('default', 'testfetchConfigInfos.json'));
        $$.SANDBOX.stub(SfdxUtil, 'writeFile').callsFake((...args) => {
            validate(JSON.parse(args[1]));
            return Promise.resolve();
        });
        $$.SANDBOX.stub(ConfigFile.prototype, 'read').callsFake(() => Promise.resolve(aliases));
    });

    it('set key value pair', async () => {
        store.set('test', 'val');
        expect(store.get('test')).equals('val');
        expect(store.getInGroup('test')).equals('val');
        expect(store.getGroup('default').get('test')).equals('val');
    });

    it('set key value pair is not accessible in another group', async () => {
        store.setInGroup('test', 'val', 'worldly');
        expect(store.get('test')).equals(undefined);
        expect(store.getInGroup('test', 'worldly')).equals('val');
        expect(store.getGroup('worldly').get('test')).equals('val');
    });

    it('set key value pair using default group', async () => {
        store.set('test', 'val');
        store.setDefaultGroup('worldly');
        store.set('test', 'val2');
        expect(store.get('test')).equals('val2');
        expect(store.getInGroup('test')).equals('val2');
        expect(store.getInGroup('test', 'default')).equals('val');
        expect(store.getInGroup('test', 'worldly')).equals('val2');
        expect(store.getGroup('worldly').get('test')).equals('val2');
    });

    it('unset key', async () => {
        store.set('test', 'val');
        store.unset('test');
        expect(store.get('test')).equals(undefined);
    });

    it('unset single key', async () => {
        store.set('test1', 'val1');
        store.set('test2', 'val2');
        store.unset('test1');
        expect(store.get('test1')).equals(undefined);
        expect(store.get('test2')).equals('val2');
    });

    it('unset key in different group', async () => {
        store.setInGroup('test', 'val', 'worldly');
        store.unset('test');
        expect(store.get('test')).equals(undefined);
        expect(store.getInGroup('test', 'worldly')).equals('val');
    });

    it('unset all key', async () => {
        store.set('test1', 'val1');
        store.set('test2', 'val2');
        store.set('test3', 'val3');
        store.unsetAll(['test1', 'test3']);
        expect(store.get('test1')).equals(undefined);
        expect(store.get('test2')).equals('val2');
        expect(store.get('test3')).equals(undefined);
    });

    it('set contents from object', async () => {
        store.setContentsFromObject({
            default: { test1: 'val1', test2: 'val2' }
        });
        expect(store.get('test1')).equals('val1');
        expect(store.get('test2')).equals('val2');
    });

    it('to object', async () => {
        store.set('test1', 'val1');
        store.set('test2', 'val2');
        expect(store.toObject()).to.deep.equal({
            default: { test1: 'val1', test2: 'val2' }
        });
    });

    it('returns a list of values under a group', async () => {
        store.setContentsFromObject({
            default: { test1: 'val1', test2: 'val2', test3: 'val3' }
        });

        expect(store.keys()).to.deep.equal(['test1', 'test2', 'test3']);
        expect(store.values()).to.deep.equal(['val1', 'val2', 'val3']);
        expect(store.entries()).to.deep.equal([['test1', 'val1'], ['test2', 'val2'], ['test3', 'val3']]);
    });

    describe('write', () => {
        it('set key value pair', async () => {
            validate = (config) => {
                expect(config.default.test).to.equal('val');
            };
            store.set('test', 'val');
            await store.write();
            expect(sinon.assert.calledOnce(SfdxUtil.writeFile));
        });

        describe('updateValues', () => {
            it('one value', async () => {
                validate = (config) => {
                    expect(config.default.another).to.equal('val');
                };
                await store.updateValues({ another: 'val' });
                expect(sinon.assert.calledOnce(SfdxUtil.writeFile));
            });

            it('two of same value', async () => {
                validate = (config) => {
                    expect(config.default.another).to.equal('val');
                    expect(config.default.some).to.equal('val');
                };
                await store.updateValues({ another: 'val', some: 'val' });
                expect(sinon.assert.calledOnce(SfdxUtil.writeFile));
            });
        });
    });
});
