/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Messages } from '../../src/messages';
import { SfdxError } from '../../src/sfdxError';

Messages.importMessageFile('pname', 'testMessages.json');

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
      expect(mySfdxError.fullStack).to.contain('Caused by:').and.contain(myError.stack);
    });

    it('should return a wrapped error with a code', () => {
      class CodeError extends Error {
        public code?: string;
      }
      const myErrorCode = 'OhMyError';
      const myError = new CodeError('test');
      myError.code = myErrorCode;
      const mySfdxError = SfdxError.wrap(myError);
      expect(mySfdxError).to.be.an.instanceOf(SfdxError);
      expect(mySfdxError.code).to.equal(myErrorCode);
    });

    it('should return a new error with just a string', () => {
      const mySfdxError = SfdxError.wrap('test');
      expect(mySfdxError).to.be.an.instanceOf(SfdxError);
      expect(mySfdxError.message).to.equal('test');
    });

    it('should return the error if already a SfdxError', () => {
      const existingSfdxError = new SfdxError('test');
      const mySfdxError = SfdxError.wrap(existingSfdxError);
      expect(mySfdxError).to.be.an.instanceOf(SfdxError);
      expect(mySfdxError).to.equal(existingSfdxError);
    });
  });

  describe('toObject', () => {
    it('should return the proper JSON object WITH context and data', () => {
      const message = 'its a trap!';
      const name = 'BadError';
      const actions = ['do the opposite'];
      const exitCode = 100;
      const context = 'TestContext1';
      const data = { foo: 'pity the foo' };

      const sfdxError = new SfdxError(message, name, actions, exitCode);
      sfdxError.setContext(context).setData(data);

      expect(sfdxError.toObject()).to.deep.equal({
        name,
        message,
        exitCode,
        actions,
        context,
        data,
      });
    });

    it('should return the proper JSON object WITHOUT context and data', () => {
      const message = "it's a trap!";
      const name = 'BadError';

      const sfdxError = new SfdxError(message, name);

      expect(sfdxError.toObject()).to.deep.equal({
        name,
        message,
        exitCode: 1,
        actions: undefined,
      });
    });
  });
});
