/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as _ from 'lodash';
import { getRootKey } from '../../../src/util/utils';

describe('root keys', () => {
  const obj = {
    a: { 'some.user@example.com': 'baz', b: { c: 'foo' } },
  };
  it('should handle key with "." separators', () => {
    const key = getRootKey('a.b.c');
    expect(key).to.be.equal('["a"]');
    expect(_.get(obj, key)).to.be.ok;
  });
  it('should handle key with "[]"', () => {
    const key = getRootKey('["a"]["b"]["c"]');
    expect(_.get(obj, key)).to.be.ok;
  });
  it('should handle key with "[]" and "." separators', () => {
    const key = getRootKey('a.["b"]c');
    expect(key).to.be.equal('["a"]');
    expect(_.get(obj, key)).to.be.ok;
  });
  it('should return base key', () => {
    const key = getRootKey('a.["b"]c', ['a']);
    expect(key).to.be.equal('["a"]["b"]');
    expect(_.get(obj, key)).to.be.ok;
  });
});
