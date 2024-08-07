/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, assert } from 'chai';
import { JsonMap } from '@salesforce/ts-types';
import { ensureNoUppercaseKeys } from '../../../src/util/findUppercaseKeys';

describe('findUpperCaseKeys', () => {
  const fn = ensureNoUppercaseKeys('testPath')();

  const messageFromFailure = (obj: JsonMap): string => {
    const failMessage = 'should have thrown';
    try {
      fn(obj);
      expect.fail(failMessage);
    } catch (e) {
      assert(e instanceof Error);
      assert(e.message !== failMessage);
      return e.message;
    }
  };

  it('should throw on top-level uppercase keys', () => {
    const testObj = {
      lowercase: true,
      UpperCase: false,
      nested: { camelCase: true },
    };
    expect(messageFromFailure(testObj)).to.include('UpperCase');
  });

  it('should throw with multiple uppercase keys', () => {
    const testObj = {
      lowercase: true,
      UpperCase: false,
      nested: { camelCase: true },
      AnotherUpperCase: false,
    };
    const msg = messageFromFailure(testObj);
    expect(msg).to.include('UpperCase');
    expect(msg).to.include('AnotherUpperCase');
  });

  it('should throw with multiple uppercase keys when one is nested', () => {
    const testObj = {
      lowercase: true,
      UpperCase: false,
      nested: { camelCase: true, AnotherUpperCase: true },
    };
    const msg = messageFromFailure(testObj);
    expect(msg).to.include('UpperCase');
    expect(msg).to.include('AnotherUpperCase');
  });

  it('should throw if nested uppercase keys', () => {
    const testObj = {
      lowercase: true,
      uppercase: false,
      nested: { NestedUpperCase: true },
    };
    expect(messageFromFailure(testObj)).to.include('NestedUpperCase');
  });

  it('returns all non-blocked keys when no uppercase keys are found', () => {
    const testObj = {
      lowercase: true,
      uppercase: false,
      nested: { camelCase: true },
    };
    expect(fn(testObj)).to.deep.equal(['lowercase', 'uppercase', 'nested', 'camelCase']);
  });

  it('allowList can have uppercase keys inside it', () => {
    const testObj = {
      lowercase: true,
      uppercase: false,
      nested: { NestedUpperCase: true },
    };
    expect(ensureNoUppercaseKeys('testPath')(['nested'])(testObj)).to.deep.equal(['lowercase', 'uppercase']);
  });

  it('allowList can have top-level uppercase keys', () => {
    const testObj = {
      lowercase: true,
      TopLevel: false,
    };
    expect(ensureNoUppercaseKeys('testPath')(['TopLevel'])(testObj)).to.deep.equal(['lowercase']);
  });

  it('handles keys starting with numbers', () => {
    const testObj = {
      '1abc': true,
      Abc: false,
      nested: { '2abc': true },
    };
    expect(messageFromFailure(testObj)).to.include('Abc');
  });
  it('handles keys starting with numbers', () => {
    const testObj = {
      '1abc': true,
      nested: { '2abc': true, Upper: false },
    };
    expect(messageFromFailure(testObj)).to.include('Upper');
  });
});
