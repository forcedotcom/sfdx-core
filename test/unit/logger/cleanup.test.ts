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
    it('100 days old files when maxMS is higher', () => {
      const files = [`sf-${new Date(Date.now() - 1000 * 60 * 60 * 24 * 100).toISOString().slice(0, 10)}.log`];
      expect(getOldLogFiles(files, 1000 * 60 * 60 * 24 * 200)).to.deep.equal([]);
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
    it('1 day old files when maxMs = 0', () => {
      const files = [`sf-${new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString().slice(0, 10)}.log`];
      expect(getOldLogFiles(files, 0)).to.deep.equal(files);
    });
  });
});
