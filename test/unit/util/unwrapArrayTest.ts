/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { unwrapArray } from '../../../src/util/unwrapArray';

describe('unwrapArray', () => {
  it('empty array', () => {
    expect(unwrapArray([])).to.deep.equal([]);
  });
  it('single object in array', () => {
    expect(unwrapArray([{ foo: 'bar' }])).to.deep.equal({ foo: 'bar' });
  });
  it('single string in array', () => {
    expect(unwrapArray(['foo'])).to.equal('foo');
  });
  it('2 strings in an array', () => {
    expect(unwrapArray(['foo', 'bar'])).to.deep.equal(['foo', 'bar']);
  });
  it('2 objects in array', () => {
    expect(unwrapArray([{ foo: 'bar' }, { bar: 'foo' }])).to.deep.equal([{ foo: 'bar' }, { bar: 'foo' }]);
  });
  it('nested array with single object at the botom', () => {
    expect(unwrapArray([[{ foo: 'bar' }]])).to.deep.equal({ foo: 'bar' });
  });
  it('nested arrays with two strings at the bottom', () => {
    expect(unwrapArray([['foo', 'bar']])).to.deep.equal(['foo', 'bar']);
  });
});
