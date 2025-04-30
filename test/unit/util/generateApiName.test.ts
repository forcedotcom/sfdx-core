/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { generateApiName } from '../../../src';

describe('generateApiName', () => {
  it('should create valid API name with spaces', () => {
    expect(generateApiName('My Test Agent')).to.equal('My_Test_Agent');
  });
  it('should create valid API name with no spaces', () => {
    expect(generateApiName('MyTestAgent')).to.equal('MyTestAgent');
  });
  it('should create valid API name with beginning underscore', () => {
    expect(generateApiName('_My Test Agent')).to.equal('My_Test_Agent');
  });
  it('should create valid API name with multiple beginning underscores', () => {
    expect(generateApiName('___My Test Agent')).to.equal('My_Test_Agent');
  });
  it('should create valid API name with special characters', () => {
    expect(generateApiName('My ()*&^$% Test @!""; Agent')).to.equal('My_Test_Agent');
  });
  it('should create valid API name with weird spacing', () => {
    expect(generateApiName(' My   Test Agent  ')).to.equal('My_Test_Agent');
  });
});
