/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import { assert, expect } from 'chai';

import { Messages } from '../../lib/messages';
import { testSetup } from '../testSetup';
import { SfdxError } from '../../lib/sfdxError';

// Setup the test environment.
const $$ = testSetup();

describe('Messages', () => {
    const testMessages = {
        msg1: 'test message 1',
        msg2: 'test message 2 %s and %s'
    };

    const msgMap = new Map();
    msgMap.set('msg1', testMessages.msg1);
    msgMap.set('msg2', testMessages.msg2);

    describe('getMessage', () => {
        const messages = new Messages('myBundle', Messages.getLocale(), msgMap);

        it('should return the proper messages', () => {
            expect(messages.getMessage('msg1')).to.equal(testMessages.msg1);
            expect(messages.getMessage('msg2', ['blah', 864])).to.equal('test message 2 blah and 864');
        });

        it('should throw an error if the message is not found', () => {
            try {
                messages.getMessage('msg3');
                assert.fail('should have thrown an error that the message was not found');
            } catch (err) {
                expect(err.message).to.equal('Missing message myBundle:msg3 for locale en_US.');
            }
        });
    });

    describe('importMessageFile', () => {
        it('should throw when file extension is not json', () => {
            try {
                Messages.importMessageFile('package name', 'myPluginMessages.txt');
                assert.fail('should have thrown an error that only json files are allowed.');
            } catch (err) {
                expect(err.message).to.contain('Only json and js message files are allowed, not .txt');
            }
        });

        it('should add the json message file to the map of loaders', () => {
            const loaderSetStub = $$.SANDBOX.stub(Messages, 'setLoaderFunction');
            $$.SANDBOX.stub(Messages, 'generateFileLoaderFunction').returns('loaderFunction');
            Messages.importMessageFile('package name', 'myPluginMessages.json');
            expect(loaderSetStub.firstCall.args[0]).to.equal('package name');
            expect(loaderSetStub.firstCall.args[1]).to.equal('myPluginMessages');
            expect(loaderSetStub.firstCall.args[2]).to.equal('loaderFunction');
        });

        it('should add the js message file to the map of loaders', () => {
            const loaderSetStub = $$.SANDBOX.stub(Messages, 'setLoaderFunction');
            $$.SANDBOX.stub(Messages, 'generateFileLoaderFunction').returns('loaderFunction');
            Messages.importMessageFile('package name', 'myPluginMessages.js');
            expect(loaderSetStub.firstCall.args[0]).to.equal('package name');
            expect(loaderSetStub.firstCall.args[1]).to.equal('myPluginMessages');
            expect(loaderSetStub.firstCall.args[2]).to.equal('loaderFunction');
        });

        it('should NOT add the message file to the map of loaders when the bundle already exists', () => {
            $$.SANDBOX.stub(Messages, 'isCached').returns(true);
            const loaderSetStub = $$.SANDBOX.stub(Messages, 'setLoaderFunction');
            $$.SANDBOX.stub(Messages, 'generateFileLoaderFunction').returns('loaderFunction');
            Messages.importMessageFile('package name', 'myPluginMessages.json');
            expect(loaderSetStub.called).to.be.false;
        });
    });

    describe('importMessagesDirectory', () => {
        let importMessageFileStub;
        let readdirSyncStub;
        let statSyncStub;

        const msgFiles = [
            'apexMessages.json',
            'soqlMessages.json'
        ];

        const messagesDirPath = `myModule${path.sep}dist${path.sep}lib`;
        const truncateErr = new SfdxError('truncate error');
        truncateErr['code'] = 'ENOENT';
        let truncatePath = 'myModule';

        beforeEach(() => {
            importMessageFileStub = $$.SANDBOX.stub(Messages, 'importMessageFile');
            readdirSyncStub = $$.SANDBOX.stub(fs, 'readdirSync');
            readdirSyncStub.returns(msgFiles);
            statSyncStub = $$.SANDBOX.stub(fs, 'statSync');
            statSyncStub.callsFake((statPath) => {
                if (!statPath.match(/messages/) && statPath !== `${truncatePath}${path.sep}package.json`) { throw truncateErr; }
                return { isDirectory: () => false, isFile: () => true };
            });
            $$.SANDBOX.stub(Messages, '_readFile').returns({name: 'pname'});
        });

        it('should import each message file', () => {
            Messages.importMessagesDirectory(messagesDirPath, false);
            const expectedMsgDirPath = path.join('myModule', 'dist', 'lib', 'messages');
            expect(readdirSyncStub.called).to.be.true;
            expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
            expect(importMessageFileStub.firstCall.args[0]).to.equal('pname');
            expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
            expect(importMessageFileStub.secondCall.args[0]).to.equal('pname');
            expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
        });

        it('should remove the "/dist" from the module dir path', () => {
            Messages.importMessagesDirectory(messagesDirPath);
            const expectedMsgDirPath = path.join('myModule', 'messages');
            expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
            expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
            expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
        });

        it('should remove the "/lib" from the module dir path if there is not dist', () => {
            Messages.importMessagesDirectory(messagesDirPath.replace(`${path.sep}dist`, ''));
            const expectedMsgDirPath = path.join('myModule', 'messages');
            expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
            expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
            expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
        });

        it('should not remove the "/lib" if dist is already removed', () => {
            truncatePath = '/var/lib/sfdx-core/dist';
            Messages.importMessagesDirectory('/var/lib/sfdx-core/dist/lib/utils.js');
            const expectedMsgDirPath = '/var/lib/sfdx-core/dist/messages';
            expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
            expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
            expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
        });
    });

    describe('generateFileLoaderFunction', () => {
        it('should throw an error when the file does not exist', async () => {
            const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.json');

            try {
                await loaderFn(Messages.getLocale());
                assert.fail('should have thrown an error that the message file was not found.');
            } catch (err) {
                expect(err.message).to.contain('Cannot find module');
                expect(err.message).to.contain('myPluginMessages.json');
            }
        });

        it('should throw an error when the file is empty', () => {
            const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.json');
            $$.SANDBOX.stub(Messages, '_readFile').returns('');

            try {
                loaderFn(Messages.getLocale());
                assert.fail('should have thrown an error that the file was empty.');
            } catch (err) {
                expect(err.name).to.equal('SfdxError');
                expect(err.message).to.equal('Invalid message file: myPluginMessages.json. No content.');
            }
        });

        it('should throw an error when the file is invalid JSON', () => {
            const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.json');
            $$.SANDBOX.stub(Messages, '_readFile').returns('key1=value1,key2=value2');

            try {
                loaderFn(Messages.getLocale());
                assert.fail('should have thrown an error that the file not valid JSON.');
            } catch (err) {
                expect(err.name).to.equal('Error');
                expect(err.message).to.equal('Found returned content type \'string\'. Check file.');
            }
        });

        it('should return a Messages object', () => {
            const loaderFn = Messages.generateFileLoaderFunction('myBundleName', 'myPluginMessages.json');
            $$.SANDBOX.stub(Messages, '_readFile').returns(testMessages);
            const messages = loaderFn(Messages.getLocale());
            expect(messages).to.have.property('bundleName', 'myBundleName');
            expect(messages).to.have.property('locale', Messages.getLocale());
            expect(messages.getMessage('msg1')).to.equal(testMessages.msg1);
            expect(messages.getMessage('msg2', ['token1', 222])).to.equal('test message 2 token1 and 222');
        });
    });

    describe('loadMessages', () => {
        it('should return a cached bundle', async () => {
            const spy = $$.SANDBOX.spy(() => new Messages('myBundle', Messages.getLocale(), msgMap));
            Messages.setLoaderFunction('pname', 'myBundle', spy);
            // Load messages
            Messages.loadMessages('pname', 'myBundle');

            // Call cache
            const messages = Messages.loadMessages('pname', 'myBundle');
            expect(messages.getMessage('msg1')).to.equal(testMessages.msg1);
            expect(messages.getMessage('msg2', ['token1', 222])).to.equal('test message 2 token1 and 222');
            expect(spy.calledOnce).to.be.true;
        });

        it('should load and return a bundle not in cache', async () => {
            // create a new bundle
            const otherMsgMap = new Map();
            otherMsgMap.set('otherMsg1', 'this is a test message too');
            const msgs = new Messages('myOtherBundle', Messages.getLocale(), otherMsgMap);

            // import the bundle with a custom loader
            Messages.setLoaderFunction('pname', 'myOtherBundle', () => msgs);

            // now load the bundle
            const messages = Messages.loadMessages('pname', 'myOtherBundle');
            expect(messages.getMessage('otherMsg1')).to.equal(otherMsgMap.get('otherMsg1'));
        });

        it('should throw an error if the bundle is not found', async () => {
            try {
                Messages.loadMessages('pname', 'notfound');
                assert.fail('should have thrown an error that the bundle was not found.');
            } catch (err) {
                expect(err.message).to.equal('Missing bundle pname:notfound for locale en_US.');
            }
        });
    });
});
