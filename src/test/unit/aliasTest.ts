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

        const keys = (await Aliases.retrieve<Aliases>()).getKeysByValue(VALUE);
        expect(keys.length).eq(1);
        expect(keys[0]).eq(KEY);
    });
});

describe('Alias', () => {
    let read;
    let validate;
    const group = 'orgs';

    beforeEach(() => {
        validate = () => {};
        $$.SANDBOX.stub(ConfigFile, 'resolveRootFolder').callsFake($$.rootPathRetriever);

        read = async () => {};

        const stubMethod = function(...args) {
            validate(this.content, ...args);
            return Promise.resolve();
        };

        // Stub the methods on the configGroup
        $$.SANDBOX.stub(ConfigGroup.prototype, 'read').callsFake(read);
        $$.SANDBOX.stub(ConfigGroup.prototype, 'write').callsFake(function() {
            validate(this.toObject());
            return Promise.resolve();
        });
    });

    describe('#set', () => {
        it('has the right object on write', async () => {
            const key = 'test';
            const value = 'val';
            validate = (...args) => {
                expect(args[0]).to.deep.equal({
                    orgs: { test: 'val' }
                });
            };
            const aliases = await Aliases.retrieve<Aliases>();
            aliases.set(key, value);
            await aliases.write();
            expect(sinon.assert.calledOnce(ConfigGroup.prototype.write));
        });
    });

    describe('#unset', () => {
        it('passes the correct values to FileKeyValueStore#unset', async () => {
            read = async () => Promise.resolve({
                orgs: { test1: 'val', test2: 'val', test3: 'val' }
            });
            const keyArray = ['test1', 'test3'];
            validate = (...args) => {
                expect(args[0]).to.deep.equal({
                    orgs: { test2: 'val' }
                });
            };
            const aliases = await Aliases.retrieve<Aliases>();
            aliases.unsetAll(keyArray);
            await aliases.write();
            expect(sinon.assert.calledOnce(ConfigGroup.prototype.write));
        });
    });

    describe('#parseAndSet', () => {
        describe('passes the right values to FileKeyValueStore#updateValues', () => {
            it('for one value', async () => {
                validate = (...args) => {
                    expect(args[0]).to.deep.equal({
                        orgs: { another: 'val' }
                    });
                    expect(args[1]).to.equal(group);
                };
                await Aliases.parseAndUpdate(['another=val']);
                expect(sinon.assert.calledOnce(ConfigGroup.prototype.write));
            });

            it('for two of same value', async () => {
                validate = (...args) => {
                    expect(args[0]).to.deep.equal({ orgs: {
                        another: 'val',
                        some: 'val'
                    }});
                    expect(args[1]).to.equal(group);
                };
                await Aliases.parseAndUpdate(['another=val', 'some=val']);
                expect(sinon.assert.calledOnce(ConfigGroup.prototype.write));
            });
        });

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
