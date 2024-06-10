/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import fs from 'node:fs';
import path from 'node:path';
import { EOL } from 'node:os';
import { assert, expect } from 'chai';
import { SinonStub } from 'sinon';
import { Messages } from '../../src/messages';
import { SfError } from '../../src/sfError';
import { shouldThrowSync, TestContext } from '../../src/testSetup';

describe('Messages', () => {
  const $$ = new TestContext();

  const testMessages = {
    msg1: 'test message 1',
    msg2: 'test message 2 %s and %s',
    manyMsgs: ['hello', 'world', 'test message 2 %s and %s'],
  };

  const msgMap = new Map();
  msgMap.set('msg1', testMessages.msg1);
  msgMap.set('msg1.actions', testMessages.msg2);
  msgMap.set('msg2', testMessages.msg2);
  msgMap.set('msg3', structuredClone(testMessages));
  msgMap.get('msg3').msg3 = structuredClone(testMessages);
  msgMap.set('manyMsgs', testMessages.manyMsgs);

  describe('getMessage', () => {
    const messages = new Messages('myBundle', Messages.getLocale(), msgMap);

    it('should return the proper messages', () => {
      expect(messages.getMessage('msg1')).to.equal(testMessages.msg1);
      expect(messages.getMessage('msg2', ['blah', 864])).to.equal('test message 2 blah and 864');
    });

    it('should return nested messages', () => {
      expect(messages.getMessage('msg3.msg1')).to.equal(testMessages.msg1);
      expect(messages.getMessage('msg3.msg2', ['blah', 864])).to.equal('test message 2 blah and 864');
      expect(messages.getMessage('msg3.msg3.msg1')).to.equal(testMessages.msg1);
      expect(messages.getMessage('msg3.msg3.msg2', ['blah', 864])).to.equal('test message 2 blah and 864');
    });

    it('should throw an error if the message is not found', () => {
      try {
        shouldThrowSync(() => messages.getMessage('msg4'));
      } catch (err) {
        expect((err as Error).message).to.equal('Missing message myBundle:msg4 for locale en_US.');
      }
    });

    it('should throw an error if the nested message is not found', () => {
      try {
        messages.getMessage('msg3.msg4');
        shouldThrowSync(() => messages.getMessage('msg3.msg4'));
      } catch (err) {
        expect((err as Error).message).to.equal('Missing message myBundle:msg4 for locale en_US.');
      }
    });

    it('should return single string from array of messages', () => {
      expect(messages.getMessage('manyMsgs', ['blah', 864])).to.equal(
        `hello blah 864${EOL}world blah 864${EOL}test message 2 blah and 864`
      );
    });

    it('should return multiple string from array of messages', () => {
      expect(messages.getMessages('manyMsgs', ['blah', 864])).to.deep.equal([
        'hello blah 864',
        'world blah 864',
        'test message 2 blah and 864',
      ]);
    });
  });

  describe('importMessageFile', () => {
    it('should throw when file extension is not json', () => {
      try {
        shouldThrowSync(() => Messages.importMessageFile('package name', 'myPluginMessages.txt'));
      } catch (err) {
        expect((err as Error).message).to.contain('Only json, js and md message files are allowed, not .txt');
      }
    });

    it('should add the json message file to the map of loaders', () => {
      const loaderSetStub = $$.SANDBOX.stub(Messages, 'setLoaderFunction');
      // @ts-expect-error string not assignable to Loader function
      $$.SANDBOX.stub(Messages, 'generateFileLoaderFunction').returns('loaderFunction');
      Messages.importMessageFile('package name', 'myPluginMessages.json');
      expect(loaderSetStub.firstCall.args[0]).to.equal('package name');
      expect(loaderSetStub.firstCall.args[1]).to.equal('myPluginMessages');
      expect(loaderSetStub.firstCall.args[2]).to.equal('loaderFunction');
    });

    it('should add the js message file to the map of loaders', () => {
      const loaderSetStub = $$.SANDBOX.stub(Messages, 'setLoaderFunction');
      // @ts-expect-error string not assignable to Loader function
      $$.SANDBOX.stub(Messages, 'generateFileLoaderFunction').returns('loaderFunction');
      Messages.importMessageFile('package name', 'myPluginMessages.js');
      expect(loaderSetStub.firstCall.args[0]).to.equal('package name');
      expect(loaderSetStub.firstCall.args[1]).to.equal('myPluginMessages');
      expect(loaderSetStub.firstCall.args[2]).to.equal('loaderFunction');
    });

    it('should NOT add the message file to the map of loaders when the bundle already exists', () => {
      $$.SANDBOX.stub(Messages, 'isCached').returns(true);
      const loaderSetStub = $$.SANDBOX.stub(Messages, 'setLoaderFunction');
      // @ts-expect-error string not assignable to Loader function
      $$.SANDBOX.stub(Messages, 'generateFileLoaderFunction').returns('loaderFunction');
      Messages.importMessageFile('package name', 'myPluginMessages.json');
      expect(loaderSetStub.called).to.be.false;
    });
  });

  describe('importMessagesDirectory', () => {
    let importMessageFileStub: SinonStub;
    let readdirSyncStub: SinonStub;
    let statSyncStub: SinonStub;

    const msgFiles = ['apexMessages.json', 'soqlMessages.json'];

    const messagesDirPath = `${path.sep}root${path.sep}myModule${path.sep}dist${path.sep}lib`;
    const truncateErr = new SfError('truncate error');
    truncateErr['code'] = 'ENOENT';
    let truncatePath = `${path.sep}root${path.sep}myModule`;

    beforeEach(() => {
      importMessageFileStub = $$.SANDBOX.stub(Messages, 'importMessageFile');
      readdirSyncStub = $$.SANDBOX.stub(fs, 'readdirSync');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      readdirSyncStub.returns(msgFiles);
      statSyncStub = $$.SANDBOX.stub(fs, 'statSync');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      statSyncStub.callsFake((statPath) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        if (!statPath.match(/messages/) && statPath !== `${truncatePath}${path.sep}package.json`) {
          throw truncateErr;
        }
        return { isDirectory: () => false, isFile: () => true };
      });
      $$.SANDBOX.stub(Messages, 'readFile').returns({ name: 'pname' });
    });

    it('should import each message file', () => {
      Messages.importMessagesDirectory(messagesDirPath, false);
      const expectedMsgDirPath = path.sep + path.join('root', 'myModule', 'dist', 'lib', 'messages');
      expect(readdirSyncStub.called).to.be.true;
      expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
      expect(importMessageFileStub.firstCall.args[0]).to.equal('pname');
      expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
      expect(importMessageFileStub.secondCall.args[0]).to.equal('pname');
      expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
    });

    it('should remove the "/dist" from the module dir path', () => {
      Messages.importMessagesDirectory(messagesDirPath);
      const expectedMsgDirPath = path.sep + path.join('root', 'myModule', 'messages');
      expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
      expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
      expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
    });

    it('should remove the "/lib" from the module dir path if there is not dist', () => {
      Messages.importMessagesDirectory(messagesDirPath.replace(`${path.sep}dist`, ''));
      const expectedMsgDirPath = path.sep + path.join('root', 'myModule', 'messages');
      expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
      expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
      expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
    });

    it('should not remove the "/lib" if dist is already removed', () => {
      truncatePath = path.join('/var', 'src', 'sfdx-core', 'dist');
      Messages.importMessagesDirectory(path.join('/var', 'src', 'sfdx-core', 'dist', 'src', 'utils.js'));
      const expectedMsgDirPath = path.join('/var', 'src', 'sfdx-core', 'dist', 'messages');
      expect(readdirSyncStub.firstCall.args[0]).to.equal(expectedMsgDirPath);
      expect(importMessageFileStub.firstCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[0]));
      expect(importMessageFileStub.secondCall.args[1]).to.equal(path.join(expectedMsgDirPath, msgFiles[1]));
    });

    it('should throw on relative paths', () => {
      try {
        shouldThrowSync(() => Messages.importMessagesDirectory('./'));
      } catch (e) {
        expect((e as Error).message).to.contain('Invalid module path.');
      }
    });
  });

  describe('generateFileLoaderFunction', () => {
    it('should throw an error when the file does not exist', async () => {
      const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.json');

      try {
        shouldThrowSync(() => loaderFn(Messages.getLocale()));
      } catch (err) {
        assert(err instanceof Error);
        expect(err.message).to.contain('Cannot find module');
        expect(err.message).to.contain('myPluginMessages.json');
      }
    });

    it('should throw an error when the file is empty', () => {
      const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.json');
      $$.SANDBOX.stub(Messages, 'readFile').returns('');

      try {
        shouldThrowSync(() => loaderFn(Messages.getLocale()));
      } catch (err) {
        assert(err instanceof Error);
        expect(err.name).to.equal('SfError');
        expect(err.message).to.equal('Invalid message file: myPluginMessages.json. No content.');
      }
    });

    it('should throw an error when the file is invalid JSON', () => {
      const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.json');
      $$.SANDBOX.stub(Messages, 'readFile').returns('key1=value1,key2=value2');

      try {
        shouldThrowSync(() => loaderFn(Messages.getLocale()));
      } catch (err) {
        assert(err instanceof Error);
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal(
          "Invalid JSON content in message file: myPluginMessages.json\nUnexpected token. Found returned content type 'string'."
        );
      }
    });

    it('should return a Messages object', () => {
      const loaderFn = Messages.generateFileLoaderFunction('myBundleName', 'myPluginMessages.json');
      $$.SANDBOX.stub(Messages, 'readFile').returns(testMessages);
      const messages = loaderFn(Messages.getLocale());
      expect(messages).to.have.property('bundleName', 'myBundleName');
      expect(messages).to.have.property('locale', Messages.getLocale());
      expect(messages.getMessage('msg1')).to.equal(testMessages.msg1);
      expect(messages.getMessage('msg2', ['token1', 222])).to.equal('test message 2 token1 and 222');
    });
  });

  describe('markdown parsing', () => {
    it('should parse keys from main headers', () => {
      const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.md');
      $$.SANDBOX.stub(fs, 'readFileSync').returns('# myKey\nmyValue');

      const messages = loaderFn(Messages.getLocale());
      expect(messages.getMessage('myKey')).to.equal('myValue');
    });

    it('should get messages from markdown list', () => {
      const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.md');
      $$.SANDBOX.stub(fs, 'readFileSync').returns('# myKey\n* my value 1\n* my value 2');

      const messages = loaderFn(Messages.getLocale());
      expect(messages.getMessages('myKey')).to.deep.equal(['my value 1', 'my value 2']);
    });

    it('should get messages from markdown list with multi lines', () => {
      const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.md');
      $$.SANDBOX.stub(fs, 'readFileSync').returns(`
# myKey
* my value 1

  more value 1
- my value 2
  more value 2
`);

      const messages = loaderFn(Messages.getLocale());
      // markdown will ignore the extra line in the same list item, so we should too.
      expect(messages.getMessages('myKey')).to.deep.equal(['my value 1\nmore value 1', 'my value 2\nmore value 2']);
    });

    it('should throw if no value', () => {
      const loaderFn = Messages.generateFileLoaderFunction('myPluginMessages', 'myPluginMessages.md');
      $$.SANDBOX.stub(fs, 'readFileSync').returns('# myKey\n# secondKey\nmyValue');

      try {
        shouldThrowSync(() => loaderFn(Messages.getLocale()));
      } catch (err) {
        assert(err instanceof Error);
        expect(err.name).to.equal('Error');
        expect(err.message).to.equal(
          'Invalid markdown message file: myPluginMessages.md\nThe line "# <key>" must be immediately followed by the message on a new line.'
        );
      }
    });
  });

  describe('load', () => {
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
        shouldThrowSync(() => Messages.loadMessages('pname', 'notfound'));
      } catch (err) {
        expect((err as Error).message).to.equal('Missing bundle pname:notfound for locale en_US.');
      }
    });
  });

  describe('createError', () => {
    it('creates error with actions', () => {
      const messages = new Messages('myBundle', Messages.getLocale(), msgMap);
      const error = messages.createError('msg1');

      expect(error.name).to.equal('Msg1Error');
      expect(error.message).to.equal(testMessages.msg1);
      if (error.actions) {
        expect(error.actions.length).to.equal(1);
        expect(error.actions[0]).to.equal(testMessages.msg2);
      } else {
        throw new Error('error.actions should not be undefined');
      }
    });

    it('creates error with removed error prefix', () => {
      msgMap.set('error.msg1', msgMap.get('msg1'));
      msgMap.set('error.msg1.actions', ['from prefix']);
      const messages = new Messages('myBundle', Messages.getLocale(), msgMap);
      const error = messages.createError('error.msg1');

      expect(error.name).to.equal('Msg1Error');
      expect(error.message).to.equal(testMessages.msg1);
      if (error.actions) {
        expect(error.actions.length).to.equal(1);
        expect(error.actions[0]).to.equal('from prefix');
      } else {
        throw new Error('error.actions should not be undefined');
      }
    });

    it('creates error with removed errors prefix', () => {
      msgMap.set('errors.msg1', msgMap.get('msg1'));
      msgMap.set('errors.msg1.actions', ['from prefix']);
      msgMap.set('errors.msg1', msgMap.get('msg1'));
      msgMap.set('errors.msg1.actions', ['from prefix']);
      const messages = new Messages('myBundle', Messages.getLocale(), msgMap);
      const error = messages.createError('errors.msg1');

      expect(error.name).to.equal('Msg1Error');
      expect(error.message).to.equal(testMessages.msg1);
      if (error.actions) {
        expect(error.actions.length).to.equal(1);
        expect(error.actions[0]).to.equal('from prefix');
      } else {
        throw new Error('error.actions should not be undefined');
      }
    });
  });
  describe('createWarning', () => {
    it('creates warning with actions', () => {
      const messages = new Messages('myBundle', Messages.getLocale(), msgMap);
      const warning = messages.createWarning('msg1');

      expect(warning.name).to.equal('Msg1Warning');
      expect(warning.message).to.equal(testMessages.msg1);
      if (warning.actions) {
        expect(warning.actions.length).to.equal(1);
        expect(warning.actions[0]).to.equal(testMessages.msg2);
      } else {
        throw new Error('warning.actions should not be undefined');
      }
    });

    it('creates warning with removed warning prefix', () => {
      msgMap.set('warning.msg1', msgMap.get('msg1'));
      msgMap.set('warning.msg1.actions', ['from prefix']);
      const messages = new Messages('myBundle', Messages.getLocale(), msgMap);
      const warning = messages.createWarning('warning.msg1');

      expect(warning.name).to.equal('Msg1Warning');
      expect(warning.message).to.equal(testMessages.msg1);
      if (warning.actions) {
        expect(warning.actions.length).to.equal(1);
        expect(warning.actions[0]).to.equal('from prefix');
      } else {
        throw new Error('warning.actions should not be undefined');
      }
    });
  });
  describe('createInfo', () => {
    it('creates info with actions', () => {
      const messages = new Messages('myBundle', Messages.getLocale(), msgMap);
      const info = messages.createInfo('msg1');

      expect(info.name).to.equal('Msg1Info');
      expect(info.message).to.equal(testMessages.msg1);
      if (info.actions) {
        expect(info.actions.length).to.equal(1);
        expect(info.actions[0]).to.equal(testMessages.msg2);
      } else {
        throw new Error('info.actions should not be undefined');
      }
    });

    it('creates info with removed info prefix', () => {
      msgMap.set('info.msg1', msgMap.get('msg1'));
      msgMap.set('info.msg1.actions', ['from prefix']);
      const messages = new Messages('myBundle', Messages.getLocale(), msgMap);
      const info = messages.createInfo('info.msg1');

      expect(info.name).to.equal('Msg1Info');
      expect(info.message).to.equal(testMessages.msg1);
      if (info.actions) {
        expect(info.actions.length).to.equal(1);
        expect(info.actions[0]).to.equal('from prefix');
      } else {
        throw new Error('info.actions should not be undefined');
      }
    });
  });
});
