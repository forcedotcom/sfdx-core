/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';

import { SfdxErrorConfig, SfdxError } from '../../lib/sfdxError';
import Messages from '../../lib/messages';

const testMessages = {
    Test1Error: 'This is test error message 1',
    Test2Error: 'This is test error message 2: %s',
    Test2ErrorAction: 'When this happens: %s you should do this: %s',
    Test3Error: 'This is test error message 3: %s with error: %s',
    Test3ErrorAction1: 'Take this action',
    Test3ErrorAction2: 'Or take this action: %s',
    Test3ErrorAction3: 'Why not both?: %s and %s'
};

Messages.importMessageFile('testMessages.json');

const sandbox = sinon.sandbox.create();

describe('SfdxError', () => {

    describe('constructor', () => {
        it('should return a mutable SfdxError', () => {
            const msg = 'this is a test message';
            const err = new SfdxError(msg);
            expect(err.message).to.equal(msg);
            expect(err.name).to.equal('SfdxError');
            expect(err.actions).to.be.undefined;
            expect(err.exitCode).to.equal(1);
            const actions = ['Do this action', 'Do that action'];
            err.actions = actions;
            expect(err.actions).to.equal(actions);
            err.exitCode = 100;
            expect(err.exitCode).to.equal(100);
        });
    });

    describe('create', () => {
        let _readFileStub;

        beforeEach(() => {
            _readFileStub = sandbox.stub(Messages, '_readFile');
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should return a new SfdxError when passed a bundle and key', async () => {
            _readFileStub.returns(Promise.resolve(JSON.stringify(testMessages)));
            const testMsg1: SfdxError = await SfdxError.create('testMessages', 'Test1Error');
            expect(testMsg1).to.have.property('name', 'Test1Error');
            expect(testMsg1).to.have.property('message', testMessages.Test1Error);
            expect(testMsg1).to.have.property('actions', undefined);
            expect(testMsg1).to.have.property('exitCode', 1);
        });

        it('should return a new SfdxError when passed a bundle, key, and error tokens', async () => {
            _readFileStub.returns(Promise.resolve(JSON.stringify(testMessages)));
            const tokens = ['token one'];
            const testMsg1: SfdxError = await SfdxError.create('testMessages', 'Test2Error', tokens);
            expect(testMsg1).to.have.property('name', 'Test2Error');
            expect(testMsg1).to.have.property('message', testMessages.Test2Error.replace('%s', tokens[0]));
            expect(testMsg1).to.have.property('actions', undefined);
            expect(testMsg1).to.have.property('exitCode', 1);
        });

        it('should return a new SfdxError when passed an SfdxErrorConfig object WITHOUT actions', async () => {
            _readFileStub.returns(Promise.resolve(JSON.stringify(testMessages)));
            const tokens = ['failure one'];
            const errConfig = new SfdxErrorConfig('testMessages', 'Test2Error', tokens);
            const testMsg1: SfdxError = await SfdxError.create(errConfig);
            expect(testMsg1).to.have.property('name', 'Test2Error');
            expect(testMsg1).to.have.property('message', testMessages.Test2Error.replace('%s', tokens[0]));
            expect(testMsg1).to.have.property('actions', undefined);
            expect(testMsg1).to.have.property('exitCode', 1);
        });

        it('should return a new SfdxError when passed an SfdxErrorConfig object WITH actions', async () => {
            _readFileStub.returns(Promise.resolve(JSON.stringify(testMessages)));
            const tokens = ['failure one', 2];
            const actionKey = 'Test3ErrorAction2';
            const actionTokens = ['reboot'];
            const errConfig = new SfdxErrorConfig('testMessages', 'Test3Error', tokens, actionKey, actionTokens);
            const testMsg1: SfdxError = await SfdxError.create(errConfig);
            expect(testMsg1).to.have.property('name', 'Test3Error');
            expect(testMsg1).to.have.property('message', 'This is test error message 3: failure one with error: 2');
            expect(testMsg1).to.have.deep.property('actions', ['Or take this action: reboot']);
            expect(testMsg1).to.have.property('exitCode', 1);
        });
    });

    describe('wrap', () => {
        it('should return a wrapped error', () => {
            const myErrorMsg = 'yikes! What did you do?';
            const myErrorName = 'OhMyError';
            const myError = new Error(myErrorMsg);
            myError.name = myErrorName;
            const mySfdxError = SfdxError.wrap(myError);
            expect(mySfdxError).to.be.an.instanceOf(SfdxError);
            expect(mySfdxError.message).to.equal(myErrorMsg);
            expect(mySfdxError.name).to.equal(myErrorName);
        });
    });
});

describe('SfdxErrorConfig', () => {

    afterEach(() => {
        sandbox.restore();
    });

    it('is mutable except for bundle', () => {
        const bundle : string = 'testMessages';
        const errorKey : string = 'Test1Error';
        const errConfig: SfdxErrorConfig = new SfdxErrorConfig(bundle, errorKey);
        expect(errConfig).to.have.property('bundle', bundle);
        expect(errConfig).to.have.property('errorKey', errorKey);
        expect(errConfig).to.have.deep.property('errorTokens', []);
        expect(errConfig).to.have.deep.property('actions', new Map());

        // Set new config properties
        const errorKey2 : string = 'Test2Error';
        const errorTokens2 = ['abcd', 123, false];
        const actionKey : string = 'Action1';
        const actionTokens = [true, 321, 'dcba'];
        errConfig.setErrorKey(errorKey2).setErrorTokens(errorTokens2).addAction(actionKey, actionTokens);

        // verify new properties
        const actions = new Map();
        actions.set(actionKey, actionTokens);
        expect(errConfig).to.have.property('bundle', bundle);
        expect(errConfig).to.have.property('errorKey', errorKey2);
        expect(errConfig).to.have.deep.property('errorTokens', errorTokens2);
        expect(errConfig).to.have.deep.property('actions', actions);

        // add another action
        const actionKey2 : string = 'Action2';
        const action2Tokens = [false, 9, 'hobbs'];
        errConfig.addAction(actionKey2, action2Tokens);
        actions.set(actionKey2, action2Tokens);
        expect(errConfig).to.have.deep.property('actions', actions);

        // remove all actions
        errConfig.removeActions();
        expect(errConfig).to.have.deep.property('actions', new Map());
    });

    it('should call Messages.loadMessages with the bundle name for load()', async () => {
        const messages = { sampleMsgKey: 'here is a sample message' };
        const bundle = 'sfdx-core';
        const loadMessagesStub = sandbox.stub(Messages, 'loadMessages');
        loadMessagesStub.returns(Promise.resolve(messages));
        const errConfig = new SfdxErrorConfig(bundle, 'foo');
        const msgs = await errConfig.load();
        expect(msgs).to.deep.equal(messages);
        expect(loadMessagesStub.getCall(0).args[0]).to.equal(bundle);
    });

    it('should throw an error when getError() is called without first calling load()', () => {
        const errConfig = new SfdxErrorConfig('sfdx-core', 'foo');
        try {
            errConfig.getError();
        }  catch(error) {
            expect(error.message).to.equal('SfdxErrorConfig not loaded.')
        }
    });

    it('should throw an error when getActions() is called without first calling load()', () => {
        const errConfig = new SfdxErrorConfig('sfdx-core', 'foo');
        try {
            errConfig.getActions();
        }  catch(error) {
            expect(error.message).to.equal('SfdxErrorConfig not loaded.')
        }
    });
});
