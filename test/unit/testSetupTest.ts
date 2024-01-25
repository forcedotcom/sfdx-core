/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
