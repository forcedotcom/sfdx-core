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
import { uniqid } from '../../src/util/uniqid';

describe('testSetup', () => {
  describe('uniqueId', () => {
    it('should return a unique id of default length of 32', () => {
      const id1 = uniqid();
      const id2 = uniqid();
      expect(id1).to.not.equal(id2);
      expect(id1).to.have.length(32);
      expect(id2).to.have.length(32);
    });
    it('should return a unique id with a length of 16', () => {
      const id1 = uniqid({ length: 16 });
      expect(id1).to.have.length(16);
    });
    it('should return a unique id with a length of 15', () => {
      const id1 = uniqid({ length: 15 });
      expect(id1).to.have.length(15);
    });
    it('should return a unique id appended to a template string', () => {
      const id1 = uniqid({ template: 'append-to-this' });
      expect(id1).to.have.length('append-to-this'.length + 32);
    });
    it('should return a unique id prepended to a template string', () => {
      const id1 = uniqid({ template: '%sprepend-to-this' });
      expect(id1).to.have.length('prepend-to-this'.length + 32);
      expect(id1).to.match(/prepend-to-this$/);
    });
    it('should return a unique id embedded in a template string', () => {
      const id1 = uniqid({ template: 'embed-%s-in-this' });
      expect(id1).to.match(/^embed-.{32}-in-this$/);
    });
  });
});
