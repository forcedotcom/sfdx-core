/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, assert } from 'chai';
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

    it('does not change the error name if provided', () => {
      const msg = 'this is a test message';
      const err = new SfError(msg, 'myErrorName');
      expect(err.name).to.equal('myErrorName');
    });

    it('sets actions', () => {
      const msg = 'this is a test message';
      const actions = ['Do this action', 'Do that action'];
      const err = new SfError(msg, 'myErrorName', actions);
      expect(err.actions).to.equal(actions);
    });

    it('cause as 4th property', () => {
      const msg = 'this is a test message';
      const cause = new Error('cause');
      const err = new SfError(msg, 'myErrorName', undefined, cause);
      expect(err.cause).to.equal(cause);
    });

    it('cause as 5th property + exitCode', () => {
      const msg = 'this is a test message';
      const cause = new Error('cause');
      const err = new SfError(msg, 'myErrorName', undefined, 2, cause);
      expect(err.cause).to.equal(cause);
      expect(err.exitCode).to.equal(2);
    });

    it('exitCode is 1 when undefined is provided', () => {
      const msg = 'this is a test message';
      const cause = new Error('cause');
      const err = new SfError(msg, 'myErrorName', undefined, undefined, cause);
      expect(err.cause).to.equal(cause);
      expect(err.exitCode).to.equal(1);
    });

    it('exitCode is 1 when no arg is provided', () => {
      const msg = 'this is a test message';
      const err = new SfError(msg, 'myErrorName');
      expect(err.cause).to.equal(undefined);
      expect(err.exitCode).to.equal(1);
    });
  });

  describe('fullStack', () => {
    it('returned `name:message` when no cause', () => {
      const err = new SfError('test');
      expect(err.fullStack).to.include('SfError: test');
      expect(err.fullStack).to.include('sfErrorTest.ts');
      expect(err.fullStack).to.not.include('Caused by:');
    });
    it('1 cause', () => {
      const nestedError = new Error('nested');
      const err = new SfError('test', undefined, undefined, nestedError);
      expect(err.fullStack).to.include('SfError: test');
      expect(err.fullStack).to.include('sfErrorTest.ts');
      expect(err.fullStack).to.include('nested');
      expect(err.fullStack?.match(/Caused by:/g)).to.have.lengthOf(1);
    });
    it('recurse through stacked causes', () => {
      const nestedError = new Error('nested');
      const nestedError2 = new Error('nested2', { cause: nestedError });
      const err = new SfError('test', undefined, undefined, nestedError2);
      expect(err.fullStack).to.include('SfError: test');
      expect(err.fullStack).to.include('sfErrorTest.ts');
      expect(err.fullStack).to.include('nested');
      expect(err.fullStack).to.include('nested2');
      expect(err.fullStack?.match(/Caused by:/g)).to.have.lengthOf(2);
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

    describe('handling "other" stuff that is not Error', () => {
      it('undefined', () => {
        const wrapMe = undefined;
        const mySfError = SfError.wrap(wrapMe);
        expect(mySfError).to.be.an.instanceOf(SfError);
        expect(mySfError.message === 'An unexpected error occurred');
        expect(mySfError.name === 'TypeError');
        assert(mySfError.cause instanceof TypeError);
        expect(mySfError.cause.message === 'An unexpected error occurred');
        expect(mySfError.cause.cause).to.equal(wrapMe);
      });
      it('a number', () => {
        const wrapMe = 2;
        const mySfError = SfError.wrap(wrapMe);
        expect(mySfError).to.be.an.instanceOf(SfError);
        assert(mySfError.cause instanceof TypeError);
        expect(mySfError.cause.cause).to.equal(wrapMe);
      });
      it('an object', () => {
        const wrapMe = { a: 2 };
        const mySfError = SfError.wrap(wrapMe);
        expect(mySfError).to.be.an.instanceOf(SfError);
        assert(mySfError.cause instanceof TypeError);
        expect(mySfError.cause.cause).to.equal(wrapMe);
      });
      it('an object that has a code', () => {
        const wrapMe = { a: 2, code: 'foo' };
        const mySfError = SfError.wrap(wrapMe);
        expect(mySfError).to.be.an.instanceOf(SfError);
        assert(mySfError.cause instanceof TypeError);
        expect(mySfError.cause.cause).to.equal(wrapMe);
        expect(mySfError.code).to.equal('foo');
      });
      it('an array', () => {
        const wrapMe = [1, 5, 6];
        const mySfError = SfError.wrap(wrapMe);
        expect(mySfError).to.be.an.instanceOf(SfError);
        assert(mySfError.cause instanceof TypeError);
        expect(mySfError.cause.cause).to.equal(wrapMe);
      });
      it('a class', () => {
        const wrapMe = new (class Test {})();
        const mySfError = SfError.wrap(wrapMe);
        expect(mySfError).to.be.an.instanceOf(SfError);
        assert(mySfError.cause instanceof TypeError);
        expect(mySfError.cause.cause).to.equal(wrapMe);
      });
    });
  });

  describe('generic for data', () => {
    class ErrorWithBooleanData extends SfError<boolean> {}
    it('should accept a generic for data and allow a valid set', () => {
      const err = new ErrorWithBooleanData('test');
      err.setData(true);
      expect(err.data).to.equal(true);
    });

    it('should not allow an invalid set', () => {
      const err = new ErrorWithBooleanData('test');
      // @ts-expect-error invalid boolean
      err.setData(5);
      // @ts-expect-error invalid boolean
      err.setData('foo');
    });

    it('should allow anything on the original unknown', () => {
      const err = new SfError('test');
      err.setData(5);
      err.setData('foo');
      err.setData({ bar: 6 });
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

  describe('create', () => {
    it('message only sets the default error name', () => {
      const message = 'its a trap!';
      const error = SfError.create({ message });
      expect(error.message).to.equal(message);
      expect(error.name).to.equal('SfError');
    });
    it('sets name', () => {
      const message = 'its a trap!';
      const name = 'BadError';
      const error = SfError.create({ message, name });
      expect(error.message).to.equal(message);
      expect(error.name).to.equal(name);
    });
    it('sets cause', () => {
      const cause = new Error('cause');
      const error = SfError.create({ message: 'its a trap!', cause });
      expect(error.cause).to.equal(cause);
    });
    it('sets exit code', () => {
      const message = 'its a trap!';
      const exitCode = 100;
      const error = SfError.create({ message, exitCode });
      expect(error.message).to.equal(message);
      expect(error.exitCode).to.equal(exitCode);
    });
    it('sets actions', () => {
      const message = 'its a trap!';
      const actions = ['do the opposite'];
      const error = SfError.create({ message, actions });
      expect(error.message).to.equal(message);
      expect(error.actions).to.equal(actions);
    });
    it('sets data', () => {
      const message = 'its a trap!';
      const data = { foo: 'pity the foo' };
      const error = SfError.create({ message, data });
      expect(error.message).to.equal(message);
      expect(error.data).to.equal(data);
    });
    it('sets data (typed)', () => {
      const message = 'its a trap!';
      const data = { foo: 'pity the foo' };
      const error = SfError.create<{ foo: string }>({ message, data });
      expect(error.message).to.equal(message);
      expect(error.data).to.equal(data);
    });
    it('sets context', () => {
      const message = 'its a trap!';
      const context = 'TestContext1';
      const error = SfError.create({ message, context });
      expect(error.message).to.equal(message);
      expect(error.context).to.equal(context);
    });
    it('all the things', () => {
      const message = 'its a trap!';
      const name = 'BadError';
      const actions = ['do the opposite'];
      const cause = new Error('cause');
      const exitCode = 100;
      const context = 'TestContext1';
      const data = { foo: 'pity the foo' };

      const error = SfError.create({
        message,
        name,
        actions,
        cause,
        exitCode,
        context,
        data,
      });

      expect(error.message).to.equal(message);
      expect(error.name).to.equal(name);
      expect(error.actions).to.equal(actions);
      expect(error.cause).to.equal(cause);
      expect(error.exitCode).to.equal(exitCode);
      expect(error.context).to.equal(context);
      expect(error.data).to.equal(data);
    });
  });
});
