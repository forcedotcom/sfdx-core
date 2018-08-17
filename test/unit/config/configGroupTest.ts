/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, assert } from 'chai';
import * as sinon from 'sinon';

import { ConfigGroup, ConfigGroupOptions } from '../../../src/config/configGroup';
import { testSetup } from '../../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('ConfigGroup retrieve calls read', () => {
    const filename = 'test_keyvalue.json';
    beforeEach(async () => {
        $$.configStubs.ConfigGroup = {
            contents: { orgs: { foo: 'foo@example.com' } }
        };
    });

    it('file already exists', async () => {
        const options: ConfigGroupOptions = ConfigGroup.getOptions('orgs', filename);
        const store: ConfigGroup = await ConfigGroup.retrieve<ConfigGroup>(options);
        expect(store.getInGroup('foo', 'orgs')).to.eq('foo@example.com');
    });
});

describe('ConfigGroup', () => {
    let store: ConfigGroup;

    beforeEach(async () => {
        store = await ConfigGroup.create<ConfigGroup>(ConfigGroup.getOptions('default', 'testfetchConfigInfos.json'));
    });

    it('set key value pair', async () => {
        store.set('test', 'val');
        expect(store.get('test')).equals('val');
        expect(store.getInGroup('test')).equals('val');
        expect(store.getGroup('default').get('test')).equals('val');
    });

    it ('setDefaultGroup: false value for groupname', async () => {
        try {
            store.setDefaultGroup(undefined);
            assert.fail('This call shouldn\'t succeed');
        } catch (e) {
            expect(e.name).equals('MissingGroupName');
        }
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
            store.set('test', 'val');
            await store.write();
            expect($$.configStubs.ConfigGroup.contents['default'].test).to.equal('val');
        });

        describe('updateValues', () => {
            it('one value', async () => {
                await store.updateValues({ another: 'val' });
                expect(sinon.assert.calledOnce(ConfigGroup.prototype.write as sinon.SinonSpy));
                expect($$.configStubs.ConfigGroup.contents['default'].another).to.equal('val');
            });

            it('two of same value', async () => {
                await store.updateValues({ another: 'val', some: 'val' });
                expect(sinon.assert.calledOnce(ConfigGroup.prototype.write as sinon.SinonSpy));
                expect($$.configStubs.ConfigGroup.contents['default'].another).to.equal('val');
                expect($$.configStubs.ConfigGroup.contents['default'].some).to.equal('val');
            });
        });
    });
});
