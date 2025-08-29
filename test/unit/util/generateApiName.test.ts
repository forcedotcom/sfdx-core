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
