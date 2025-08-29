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
