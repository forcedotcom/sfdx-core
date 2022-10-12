/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Messages } from '../../src/messages';
import { SfError } from '../../src/sfError';

Messages.importMessageFile('pname', 'testMessages.json');

describe('SfError', () => {
  describe('constructor', () => {
    it('should return a mutable SfError', () => {
      const msg = 'this is a test message';
      const err = new SfError(msg);
      expect(err.message).to.equal(msg);
      expect(err.name).to.equal('SfError');
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
      const mySfError = SfError.wrap(myError);
      expect(mySfError).to.be.an.instanceOf(SfError);
      expect(mySfError.message).to.equal(myErrorMsg);
      expect(mySfError.name).to.equal(myErrorName);
      expect(mySfError.fullStack).to.contain('Caused by:').and.contain(myError.stack);
    });

    it('should return a wrapped error with a code', () => {
      class CodeError extends Error {
        public code?: string;
      }
      const myErrorCode = 'OhMyError';
      const myError = new CodeError('test');
      myError.code = myErrorCode;
      const mySfError = SfError.wrap(myError);
      expect(mySfError).to.be.an.instanceOf(SfError);
      expect(mySfError.code).to.equal(myErrorCode);
    });

    it('should return a new error with just a string', () => {
      const mySfError = SfError.wrap('test');
      expect(mySfError).to.be.an.instanceOf(SfError);
      expect(mySfError.message).to.equal('test');
    });

    it('should return the error if already a SfError', () => {
      const existingSfError = new SfError('test');
      const mySfError = SfError.wrap(existingSfError);
      expect(mySfError).to.be.an.instanceOf(SfError);
      expect(mySfError).to.equal(existingSfError);
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

      const sfError = new SfError(message, name, actions, exitCode);
      sfError.setContext(context).setData(data);

      expect(sfError.toObject()).to.deep.equal({
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

      const sfError = new SfError(message, name);

      expect(sfError.toObject()).to.deep.equal({
        name,
        message,
        exitCode: 1,
        actions: undefined,
      });
    });
  });
});
