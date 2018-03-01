/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

// Thirdparty
import { expect } from 'chai';
import * as sinon from 'sinon';

// Local
import { ConfigGroup } from '../../lib/config/configGroup';
import { Aliases } from '../../lib/config/aliases';
import { testSetup } from '../testSetup';
import { ConfigFile } from '../../lib/config/configFile';

// Setup the test environment.
const $$ = testSetup();

describe('Alias no key value mock', () => {
    beforeEach(() => {
        $$.SANDBOX.stub(ConfigGroup, 'resolveRootFolder')
            .callsFake((isGlobal) => $$.rootPathRetriever(isGlobal));
    });

    it ('steel thread', async () => {
        const KEY = 'foo';
        const VALUE = 'bar';
        await Aliases.parseAndUpdate([`${KEY}=${VALUE}`]);
        expect(await Aliases.fetch(KEY)).eq(VALUE);

        const keys = (await Aliases.retrieve()).getKeysByValue(VALUE);
        expect(keys.length).eq(1);
        expect(keys[0]).eq(KEY);
    });
});

describe('Alias', () => {
    let validate;
    const group = 'orgs';

    beforeEach(() => {
        validate = () => {};
        $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder').callsFake($$.rootPathRetriever);

        const stubMethod = function(...args) {
            validate(this.content, ...args);
            return Promise.resolve();
        };

        // Stub the methods on the configGroup
        $$.SANDBOX.stub(ConfigGroup.prototype, 'read').callsFake(async () => {});
        $$.SANDBOX.stub(ConfigGroup.prototype, 'write').callsFake(function() {
            validate(JSON.parse(JSON.stringify(this.content)));
            return Promise.resolve();
        });
    });

    describe('#set', () => {
        it.only('passes the correct values to FileKeyValueStore#update', async () => {
            const key = 'test';
            const value = 'val';
            validate = (...args) => {
                expect(args[0]).to.equal({
                    orgs: { test: 'val' }
                });
            };
            const aliases = await Aliases.retrieve();
            aliases.set(key, value);
            await aliases.write();
            expect(sinon.assert.calledOnce(ConfigGroup.prototype.write));
        });
    });

    describe('#unset', () => {
        it('passes the correct values to FileKeyValueStore#unset', async () => {
            const keyArray = ['test1', 'test3'];
            validate = (...args) => {
                expect(args[0]).to.deep.equal(keyArray);
                expect(args[1]).to.equal(group);
            };
            const aliases = await Aliases.retrieve();
            aliases.unsetAll(keyArray);
            await aliases.write();
            expect(sinon.assert.calledOnce(ConfigGroup.prototype.unset));
        });
    });

    describe('#parseAndSet', () => {
        // describe('passes the right values to FileKeyValueStore#updateValues', () => {
        //     it('for one value', async () => {
        //         validate = (...args) => {
        //             expect(args[0]).to.deep.equal({
        //                 another: 'val'
        //             });
        //             expect(args[1]).to.equal(group);
        //         };
        //         await Alias.parseAndUpdate(['another=val']);
        //         expect(sinon.assert.calledOnce(KeyValueStore.prototype.updateValues));
        //     });

        //     it('for two of same value', async () => {
        //         validate = (...args) => {
        //             expect(args[0]).to.deep.equal({
        //                 another: 'val',
        //                 some: 'val'
        //             });
        //             expect(args[1]).to.equal(group);
        //         };
        //         await Alias.parseAndUpdate(['another=val', 'some=val']);
        //         expect(sinon.assert.calledOnce(KeyValueStore.prototype.updateValues));
        //     });
        // });

        it('should handle invalid alias formats', async () => {
            const invalidFormats = ['another', 'foo==bar'];
            for (const element of invalidFormats) {
                try {
                    await Aliases.parseAndUpdate([element]);
                } catch (err) {
                    if (err.name === 'AssertionError') {
                        throw err;
                    }
                    expect(err.name).to.equal('InvalidFormat');
                }
            }
        });
    });
});
