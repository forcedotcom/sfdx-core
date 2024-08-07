/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { Cache } from '../../../src/util/cache';

describe('cache', () => {
  before(() => {
    Cache.enable();
  });
  afterEach(() => {
    Cache.enable();
  });
  it('should store a key and string value', () => {
    Cache.set('key', 'a value');
    const value = Cache.get('key');
    expect(typeof value).to.be.equal('string');
    expect(value).to.be.equal('a value');
  });
  it('should store a key and number value', () => {
    Cache.set('key', 42);
    const value = Cache.get('key');
    expect(typeof value).to.be.equal('number');
    expect(value).to.be.equal(42);
  });
  it('should return undefined for key not in cache', () => {
    const value = Cache.get('somotherkey');
    expect(value).to.not.be.ok;
  });
  it('should record cache hits', () => {
    Cache.set('key', 'a value');
    Cache.get('key');
    expect(Cache.hits).to.be.greaterThan(0);
  });
  it('number of lookups should be greater than hits', () => {
    Cache.set('key', 'a value');
    Cache.get('key');
    expect(Cache.lookups).to.be.greaterThan(Cache.hits);
  });
  it('should disable cache', () => {
    Cache.set('key', 'a value');
    expect(Cache.get('key')).to.be.ok;
    Cache.disable();
    expect(Cache.get('key')).to.not.be.ok;
  });
});
