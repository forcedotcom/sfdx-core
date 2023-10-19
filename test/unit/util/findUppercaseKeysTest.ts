/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { findUpperCaseKeys } from '../../../src/util/findUppercaseKeys';

describe('findUpperCaseKeys', () => {
  it('should return the first upper case key', () => {
    const testObj = {
      lowercase: true,
      UpperCase: false,
      nested: { camelCase: true },
    };
    expect(findUpperCaseKeys(testObj)).to.equal('UpperCase');
  });

  it('should return the first nested upper case key', () => {
    const testObj = {
      lowercase: true,
      uppercase: false,
      nested: { NestedUpperCase: true },
    };
    expect(findUpperCaseKeys(testObj)).to.equal('NestedUpperCase');
  });

  it('should return undefined when no upper case key is found', () => {
    const testObj = {
      lowercase: true,
      uppercase: false,
      nested: { camelCase: true },
    };
    expect(findUpperCaseKeys(testObj)).to.be.undefined;
  });

  it('should return the first nested upper case key unless blocklisted', () => {
    const testObj = {
      lowercase: true,
      uppercase: false,
      nested: { NestedUpperCase: true },
    };
    expect(findUpperCaseKeys(testObj, ['nested'])).to.equal(undefined);
  });

  it('handles keys starting with numbers', () => {
    const testObj = {
      '1abc': true,
      Abc: false,
      nested: { '2abc': true },
    };
    expect(findUpperCaseKeys(testObj)).to.equal('Abc');
  });
  it('handles keys starting with numbers', () => {
    const testObj = {
      '1abc': true,
      nested: { '2abc': true, Upper: false },
    };
    expect(findUpperCaseKeys(testObj)).to.equal('Upper');
  });
});
