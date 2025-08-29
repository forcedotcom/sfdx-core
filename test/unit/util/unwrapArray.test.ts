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
