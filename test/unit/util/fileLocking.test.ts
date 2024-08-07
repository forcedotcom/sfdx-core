/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import * as fs from 'node:fs';
import { tmpdir } from 'node:os';
import { expect } from 'chai';
import { lockInit, lockInitSync } from '../../../src/util/fileLocking';
import { uniqid } from '../../../src/util/uniqid';

describe('fileLocking', () => {
  describe('lockInit', () => {
    const targetFolder = join(tmpdir(), uniqid('fileLockingTest'));
    const file1 = join(targetFolder, 'file1.txt');

    it('should create a dir and lock the directory if the file does not exist', async () => {
      const lock = await lockInit(file1);
      await lock.unlock();
      expect(fs.existsSync(targetFolder)).to.be.true;
      expect(fs.existsSync(file1)).to.be.false;
    });
    it('should write to locked file that does not exist', async () => {
      const lock = await lockInit(file1);
      await lock.writeAndUnlock('hey');
      expect(fs.existsSync(targetFolder)).to.be.true;
      expect(fs.readFileSync(file1, 'utf8')).to.equal('hey');
    });

    it('should lock the file if it exists', async () => {
      const lock = await lockInit(file1);
      await lock.unlock();
      expect(fs.readFileSync(file1, 'utf8')).to.equal('hey');
    });

    it('should write to locked file that does exist', async () => {
      const lock = await lockInit(file1);
      await lock.writeAndUnlock('hey, you');
      expect(fs.readFileSync(file1, 'utf8')).to.equal('hey, you');
    });
  });

  describe('lockInitSync', () => {
    const targetFolder = join(tmpdir(), uniqid('fileLockingTestSync'));
    const file2 = join(targetFolder, 'file2.txt');

    it('should create a dir and lock the directory if the file does not exist', () => {
      const lock = lockInitSync(file2);
      lock.unlock();
      expect(fs.existsSync(targetFolder)).to.be.true;
      expect(fs.existsSync(file2)).to.be.false;
    });
    it('should write to locked file that does not exist', () => {
      const lock = lockInitSync(file2);
      lock.writeAndUnlock('hey');
      expect(fs.readFileSync(file2, 'utf8')).to.equal('hey');
    });

    it('should lock the file if it exists', () => {
      const lock = lockInitSync(file2);
      lock.unlock();
      expect(fs.readFileSync(file2, 'utf8')).to.equal('hey');
    });

    it('should write to locked file that does exist', () => {
      const lock = lockInitSync(file2);
      lock.writeAndUnlock('hey, you');
      expect(fs.readFileSync(file2, 'utf8')).to.equal('hey, you');
    });
  });

  describe('validate lock behavior', () => {
    const targetFolder = join(tmpdir(), uniqid('fileLockingTestConcurrency'));
    describe('async', () => {
      it('waits for a lock using writeAndUnlock', async () => {
        const file3 = join(targetFolder, 'file3.txt');
        const lock = await lockInit(file3);
        const [lock2] = await Promise.all([lockInit(file3), lock.writeAndUnlock('hey')]);
        await lock2.writeAndUnlock('hey, you');
        expect(fs.readFileSync(file3, 'utf8')).to.equal('hey, you');
      });
      it('waits for a lock using unlock', async () => {
        const file4 = join(targetFolder, 'file3.txt');
        fs.writeFileSync(file4, 'hey, buddy');
        const lock = await lockInit(file4);
        const [lock2] = await Promise.all([lockInit(file4), lock.unlock()]);
        await lock2.unlock();
        expect(fs.readFileSync(file4, 'utf8')).to.equal('hey, buddy');
      });
    });
  });
});
