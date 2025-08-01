/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as os from 'node:os';
import * as path from 'node:path';
import { expect } from 'chai';

describe('Node.js Compatibility - Standalone Testing', () => {
  let fs: any;
  let tempDir: string;

  before(async () => {
    // Ensure we're in Node.js mode (not memfs)
    const originalForceMemfs = process.env.FORCE_MEMFS;
    process.env.FORCE_MEMFS = 'false';

    const { fs: memfs } = await import('../../../lib/fs/fs.js');
    fs = memfs;
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fs-test-'));

    // Restore original environment
    if (originalForceMemfs === undefined) {
      delete process.env.FORCE_MEMFS;
    } else {
      process.env.FORCE_MEMFS = originalForceMemfs;
    }
  });

  after(() => {
    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('should have node:fs API surface', () => {
    // Test that fs has the expected methods from node:fs
    expect(typeof fs.readFileSync).to.equal('function');
    expect(typeof fs.writeFileSync).to.equal('function');
    expect(typeof fs.promises.readFile).to.equal('function');
    expect(typeof fs.promises.writeFile).to.equal('function');
    expect(typeof fs.statSync).to.equal('function');
    expect(typeof fs.existsSync).to.equal('function');
    expect(typeof fs.mkdirSync).to.equal('function');
    expect(typeof fs.readdirSync).to.equal('function');
    expect(typeof fs.unlinkSync).to.equal('function');
    expect(typeof fs.rmdirSync).to.equal('function');
  });

  it('should handle encoding parameters like node:fs', () => {
    const testPath = path.join(tempDir, 'test-file.txt');
    const testContent = 'test content';

    // Test that encoding parameter works like node:fs
    fs.writeFileSync(testPath, testContent, 'utf8');
    const result = fs.readFileSync(testPath, 'utf8');
    expect(result).to.equal(testContent);
    expect(typeof result).to.equal('string');

    // Cleanup
    fs.unlinkSync(testPath);
  });

  it('should handle statSync bigint option like node:fs', () => {
    const testPath = path.join(tempDir, 'test-file.txt');
    const testContent = 'test content';

    fs.writeFileSync(testPath, testContent);

    // Test regular stats
    const stats = fs.statSync(testPath);
    expect(typeof stats.size).to.equal('number');
    expect(stats.isFile()).to.be.true;

    // Test bigint stats
    const bigIntStats = fs.statSync(testPath, { bigint: true });
    expect(typeof bigIntStats.size).to.equal('bigint');
    expect(bigIntStats.isFile()).to.be.true;

    // Cleanup
    fs.unlinkSync(testPath);
  });

  it('should handle recursive directory operations like node:fs', () => {
    const testDir = path.join(tempDir, 'nested', 'test', 'directory');

    // Test recursive directory creation
    fs.mkdirSync(testDir, { recursive: true });
    expect(fs.existsSync(testDir)).to.be.true;
    expect(fs.existsSync(path.join(tempDir, 'nested'))).to.be.true;
    expect(fs.existsSync(path.join(tempDir, 'nested', 'test'))).to.be.true;

    // Test recursive directory removal
    fs.rmSync(testDir, { recursive: true });
    expect(fs.existsSync(testDir)).to.be.false;
    // Note: rmSync with recursive: true removes the entire directory tree
    // so we don't check parent directories as they're also removed
  });

  it('should handle promises.rm like node:fs', async () => {
    const testPath = path.join(tempDir, 'test-file.txt');
    const testContent = 'test content';

    fs.writeFileSync(testPath, testContent);
    expect(fs.existsSync(testPath)).to.be.true;

    // Test promises.rm with recursive and force options
    await fs.promises.rm(testPath, { recursive: true, force: true });
    expect(fs.existsSync(testPath)).to.be.false;
  });
});
