/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
