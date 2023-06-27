/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { getOldLogFiles } from '../../../src/logger/cleanup';

describe('cleanup', () => {
  describe('not deleted', () => {
    it('non log files', () => {
      expect(getOldLogFiles(['foo.txt', 'sf-2021-08-10.not-a-log'])).to.deep.equal([]);
    });
    it('files from bunyan logger', () => {
      const files = ['sf.log', 'sf.log.1', 'sf.log.2'];
      expect(getOldLogFiles(files)).to.deep.equal([]);
    });
    it('very recent files', () => {
      const files = [`sf-${new Date().toISOString().slice(0, 10)}.log`];
      expect(getOldLogFiles(files)).to.deep.equal([]);
    });
    it('6 days old files', () => {
      const files = [`sf-${new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString().slice(0, 10)}.log`];
      expect(getOldLogFiles(files)).to.deep.equal([]);
    });
  });
  describe('deleted', () => {
    it('will delete an old daily file', () => {
      const files = ['sf-2021-08-10.log'];
      expect(getOldLogFiles(files)).to.deep.equal(files);
    });
    it('will delete an old hourly file', () => {
      const files = ['sf-2021-08-10T18.log'];
      expect(getOldLogFiles(files)).to.deep.equal(files);
    });
    it('8 day old files', () => {
      const files = [`sf-${new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString().slice(0, 10)}.log`];
      expect(getOldLogFiles(files)).to.deep.equal(files);
    });
  });
});
