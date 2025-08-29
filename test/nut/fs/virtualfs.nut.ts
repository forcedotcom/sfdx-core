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

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { expect } from 'chai';

describe('VirtualFS - Memfs Compatibility Tests', () => {
  let originalWindow: any;
  let originalForceMemfs: string | undefined;
  let fs: any;

  before(async () => {
    // Save original environment
    originalWindow = (globalThis as any).window;
    originalForceMemfs = process.env.FORCE_MEMFS;

    // Force memfs mode using environment variable
    process.env.FORCE_MEMFS = 'true';

    // Import fs after setting up environment and set a fresh memfs instance
    const { setFs, getVirtualFs } = await import('../../../lib/fs/fs.js');
    const freshFs = getVirtualFs();
    setFs(freshFs);
    fs = freshFs;
  });

  after(() => {
    // Restore original environment
    (globalThis as any).window = originalWindow;
    if (originalForceMemfs === undefined) {
      delete process.env.FORCE_MEMFS;
    } else {
      process.env.FORCE_MEMFS = originalForceMemfs;
    }
  });

  describe('Type Safety and Function Overloads', () => {
    it('should have proper function overloads for readFileSync', () => {
      const testPath = '/test-file.txt';

      // Create a test file first
      fs.writeFileSync(testPath, 'test content');

      // Test Buffer return (no encoding)
      const bufferResult = fs.readFileSync(testPath);
      expect(Buffer.isBuffer(bufferResult)).to.be.true;

      // Test string return (with utf8 encoding)
      const stringResult = fs.readFileSync(testPath, 'utf8');
      expect(typeof stringResult).to.equal('string');
      expect(stringResult).to.equal('test content');

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should have proper function overloads for promises.readFile', async () => {
      const testPath = '/test-file.txt';

      // Create a test file first
      fs.writeFileSync(testPath, 'test content');

      // Test Buffer return (no encoding)
      const bufferResult = await fs.promises.readFile(testPath);
      expect(Buffer.isBuffer(bufferResult)).to.be.true;

      // Test string return (with utf8 encoding)
      const stringResult = await fs.promises.readFile(testPath, 'utf8');
      expect(typeof stringResult).to.equal('string');
      expect(stringResult).to.equal('test content');

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should have proper function overloads for statSync', () => {
      const testPath = '/test-file.txt';

      // Create a test file first
      fs.writeFileSync(testPath, 'test content');

      // Test Stats return (no bigint option)
      const statsResult = fs.statSync(testPath);
      expect(typeof statsResult.size).to.equal('number');
      expect(typeof statsResult.mtimeMs).to.equal('number');

      // Test BigIntStats return (with bigint option)
      const bigIntStatsResult = fs.statSync(testPath, { bigint: true });
      expect(typeof bigIntStatsResult.size).to.equal('bigint');
      expect(typeof bigIntStatsResult.mtimeNs).to.equal('bigint');

      // Cleanup
      fs.unlinkSync(testPath);
    });
  });

  describe('Override Methods - Encoding Parameter Handling', () => {
    it('should handle writeFileSync encoding parameter correctly (override)', () => {
      const testPath = '/test-file.txt';
      const testContent = 'test content with encoding';

      // Test with string encoding parameter (memfs override)
      fs.writeFileSync(testPath, testContent, 'utf8');
      const result = fs.readFileSync(testPath, 'utf8');
      expect(result).to.equal(testContent);

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should handle promises.writeFile encoding parameter correctly (override)', async () => {
      const testPath = '/test-file.txt';
      const testContent = 'test content with encoding';

      // Test with string encoding parameter (memfs override)
      await fs.promises.writeFile(testPath, testContent, 'utf8');
      const result = await fs.promises.readFile(testPath, 'utf8');
      expect(result).to.equal(testContent);

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should handle readFileSync return type correctly (override)', () => {
      const testPath = '/test-file.txt';
      const testContent = 'test content';

      fs.writeFileSync(testPath, testContent);

      // Test that utf8 encoding returns string (not Buffer)
      const result = fs.readFileSync(testPath, 'utf8');
      expect(typeof result).to.equal('string');
      expect(result).to.equal(testContent);

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should handle promises.readFile return type correctly (override)', async () => {
      const testPath = '/test-file.txt';
      const testContent = 'test content';

      fs.writeFileSync(testPath, testContent);

      // Test that utf8 encoding returns string (not Buffer)
      const result = await fs.promises.readFile(testPath, 'utf8');
      expect(typeof result).to.equal('string');
      expect(result).to.equal(testContent);

      // Cleanup
      fs.unlinkSync(testPath);
    });
  });

  describe('Core File Operations', () => {
    it('should handle basic file read/write operations', () => {
      const testPath = '/test-file.txt';
      const testContent = 'test content';

      // Write file
      fs.writeFileSync(testPath, testContent);
      expect(fs.existsSync(testPath)).to.be.true;

      // Read file
      const result = fs.readFileSync(testPath, 'utf8');
      expect(result).to.equal(testContent);

      // Cleanup
      fs.unlinkSync(testPath);
      expect(fs.existsSync(testPath)).to.be.false;
    });

    it('should handle async file operations', async () => {
      const testPath = '/test-file.txt';
      const testContent = 'async test content';

      // Write file
      await fs.promises.writeFile(testPath, testContent);
      expect(fs.existsSync(testPath)).to.be.true;

      // Read file
      const result = await fs.promises.readFile(testPath, 'utf8');
      expect(result).to.equal(testContent);

      // Cleanup
      await fs.promises.unlink(testPath);
      expect(fs.existsSync(testPath)).to.be.false;
    });

    it('should handle Buffer operations', () => {
      const testPath = '/buffer-test.bin';
      const bufferData = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);

      // Write buffer
      fs.writeFileSync(testPath, bufferData);
      expect(fs.existsSync(testPath)).to.be.true;

      // Read as buffer
      const result = fs.readFileSync(testPath);
      expect(Buffer.isBuffer(result)).to.be.true;
      expect(result).to.deep.equal(bufferData);

      // Cleanup
      fs.unlinkSync(testPath);
    });
  });

  describe('Directory Operations', () => {
    it('should handle directory creation and traversal', () => {
      const testDir = '/test-dir';
      const testFile = `${testDir}/test-file.txt`;
      const testContent = 'file in directory';

      // Create directory
      fs.mkdirSync(testDir, { recursive: true });
      expect(fs.existsSync(testDir)).to.be.true;

      // Create file in directory
      fs.writeFileSync(testFile, testContent);
      expect(fs.existsSync(testFile)).to.be.true;

      // List directory
      const files = fs.readdirSync(testDir);
      expect(files).to.include('test-file.txt');

      // Cleanup
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);
      expect(fs.existsSync(testDir)).to.be.false;
    });

    it('should handle nested directory operations', () => {
      const testDir = '/deeply/nested/directory';
      const testFile = `${testDir}/test-file.txt`;
      const testContent = 'file in nested directory';

      // Create nested directory structure
      fs.mkdirSync(testDir, { recursive: true });
      expect(fs.existsSync(testDir)).to.be.true;

      // Create file in nested directory
      fs.writeFileSync(testFile, testContent);
      expect(fs.existsSync(testFile)).to.be.true;

      // Read file from nested directory
      const result = fs.readFileSync(testFile, 'utf8');
      expect(result).to.equal(testContent);

      // Cleanup
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);
      fs.rmdirSync('/deeply/nested');
      fs.rmdirSync('/deeply');
    });

    it('should handle directory listing with buffer encoding', () => {
      const testDir = '/test-dir';

      // Create directory and files
      fs.mkdirSync(testDir);
      fs.writeFileSync(`${testDir}/file1.txt`, 'test1');
      fs.writeFileSync(`${testDir}/file2.txt`, 'test2');

      // List with string encoding (default)
      const stringFiles = fs.readdirSync(testDir);
      expect(Array.isArray(stringFiles)).to.be.true;
      expect(stringFiles.every((file: any) => typeof file === 'string')).to.be.true;

      // List with buffer encoding
      const bufferFiles = fs.readdirSync(testDir, { encoding: 'buffer' });
      expect(Array.isArray(bufferFiles)).to.be.true;
      expect(bufferFiles.every((file: any) => Buffer.isBuffer(file))).to.be.true;

      // Cleanup
      fs.unlinkSync(`${testDir}/file1.txt`);
      fs.unlinkSync(`${testDir}/file2.txt`);
      fs.rmdirSync(testDir);
    });
  });

  describe('File System Statistics', () => {
    it('should handle stat operations correctly', () => {
      const testPath = '/test-file.txt';
      const testContent = 'test content for stats';

      // Create file
      fs.writeFileSync(testPath, testContent);

      // Get stats
      const stats = fs.statSync(testPath);
      expect(stats.isFile()).to.be.true;
      expect(stats.isDirectory()).to.be.false;
      expect(typeof stats.size).to.equal('number');
      expect(stats.size).to.be.greaterThan(0);

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should handle bigint stats correctly', () => {
      const testPath = '/test-file.txt';
      const testContent = 'test content for bigint stats';

      // Create file
      fs.writeFileSync(testPath, testContent);

      // Get bigint stats
      const bigIntStats = fs.statSync(testPath, { bigint: true });
      expect(typeof bigIntStats.size).to.equal('bigint');
      expect(typeof bigIntStats.mtimeNs).to.equal('bigint');
      expect(bigIntStats.isFile()).to.be.true;

      // Cleanup
      fs.unlinkSync(testPath);
    });
  });

  describe('Error Handling', () => {
    it('should handle file not found errors', async () => {
      const nonExistentPath = '/non-existent-file.txt';

      // Test sync readFile
      let errorThrown = false;
      try {
        fs.readFileSync(nonExistentPath);
      } catch {
        errorThrown = true;
      }
      expect(errorThrown).to.be.true;

      // Test async readFile
      errorThrown = false;
      try {
        await fs.promises.readFile(nonExistentPath);
      } catch {
        errorThrown = true;
      }
      expect(errorThrown).to.be.true;
    });

    it('should handle directory not empty errors', () => {
      const testDir = '/test-dir';
      const testFile = `${testDir}/test-file.txt`;

      // Create directory with file
      fs.mkdirSync(testDir);
      fs.writeFileSync(testFile, 'test content');

      // Try to remove non-empty directory without recursive
      let errorThrown = false;
      try {
        fs.rmdirSync(testDir);
      } catch {
        errorThrown = true;
      }
      expect(errorThrown).to.be.true;

      // Cleanup
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);
    });

    it('should handle nested error scenarios', () => {
      const testDir = '/test-dir';
      const testFile = `${testDir}/test-file.txt`;

      // Try to create file in non-existent directory
      let errorThrown = false;
      try {
        fs.writeFileSync(testFile, 'test content');
      } catch {
        errorThrown = true;
      }
      expect(errorThrown).to.be.true;

      // Create directory and then file
      fs.mkdirSync(testDir);
      fs.writeFileSync(testFile, 'test content');
      expect(fs.existsSync(testFile)).to.be.true;

      // Try to create directory that already exists
      errorThrown = false;
      try {
        fs.mkdirSync(testDir);
      } catch {
        errorThrown = true;
      }
      expect(errorThrown).to.be.true;

      // Cleanup
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);
    });
  });

  describe('Complex Operations', () => {
    it('should handle large file operations', () => {
      const testPath = '/large-file.txt';
      const largeContent = 'x'.repeat(100_000); // 100KB file

      fs.writeFileSync(testPath, largeContent);
      const result = fs.readFileSync(testPath, 'utf8');
      expect(result).to.equal(largeContent);
      expect(result.length).to.equal(100_000);

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should handle concurrent operations', async () => {
      const testPath = '/concurrent-file.txt';
      const testContent = 'concurrent test content';

      // Create initial file
      fs.writeFileSync(testPath, testContent);

      // Perform concurrent reads
      const readPromises = Array.from({ length: 10 }, () => fs.promises.readFile(testPath, 'utf8'));

      const results = await Promise.all(readPromises);
      results.forEach((result) => {
        expect(result).to.equal(testContent);
      });

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should handle file copying patterns', () => {
      const sourcePath = '/source-file.txt';
      const destPath = '/dest-file.txt';
      const sourceContent = 'This is the source file content';

      // Create source file
      fs.writeFileSync(sourcePath, sourceContent);
      expect(fs.existsSync(sourcePath)).to.be.true;

      // Read source and write to destination (simulate copy)
      const content = fs.readFileSync(sourcePath, 'utf8');
      fs.writeFileSync(destPath, content);
      expect(fs.existsSync(destPath)).to.be.true;

      // Verify destination content
      const destContent = fs.readFileSync(destPath, 'utf8');
      expect(destContent).to.equal(sourceContent);

      // Cleanup
      fs.unlinkSync(sourcePath);
      fs.unlinkSync(destPath);
    });
  });

  describe('Integration with Other Modules', () => {
    it('should work with JSON operations', () => {
      const testPath = '/test-data.json';
      const testData = {
        name: 'test',
        value: 42,
        nested: {
          array: [1, 2, 3],
          boolean: true,
        },
      };

      // Write JSON data
      fs.writeFileSync(testPath, JSON.stringify(testData, null, 2));
      expect(fs.existsSync(testPath)).to.be.true;

      // Read and parse JSON
      const jsonContent = fs.readFileSync(testPath, 'utf8');
      const parsedData = JSON.parse(jsonContent);

      expect(parsedData).to.deep.equal(testData);
      expect(parsedData.name).to.equal('test');
      expect(parsedData.value).to.equal(42);

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should work with Buffer operations', () => {
      const testPath = '/buffer-test.bin';
      const originalData = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);

      // Write buffer data
      fs.writeFileSync(testPath, originalData);
      expect(fs.existsSync(testPath)).to.be.true;

      // Read as buffer
      const readBuffer = fs.readFileSync(testPath);
      expect(Buffer.isBuffer(readBuffer)).to.be.true;
      expect(readBuffer).to.deep.equal(originalData);

      // Test buffer operations
      expect(readBuffer.length).to.equal(5);
      expect(readBuffer[0]).to.equal(0x01);
      expect(readBuffer[4]).to.equal(0x05);

      // Cleanup
      fs.unlinkSync(testPath);
    });
  });

  describe('Advanced File Operations', () => {
    it('should handle mkdtempSync for temporary directories', () => {
      const template = '/tmp-test-XXXXXX';

      // Create temporary directory
      const tempDir = fs.mkdtempSync(template);
      expect(fs.existsSync(tempDir)).to.be.true;
      expect(fs.statSync(tempDir).isDirectory()).to.be.true;

      // Create file in temp directory
      const testFile = `${tempDir}/test-file.txt`;
      fs.writeFileSync(testFile, 'test content');
      expect(fs.existsSync(testFile)).to.be.true;

      // Cleanup
      fs.unlinkSync(testFile);
      fs.rmdirSync(tempDir);
    });

    it('should handle createWriteStream for streaming writes', () => {
      const testPath = '/stream-test.txt';
      const testContent = 'This is streamed content\nWith multiple lines\n';

      // Create write stream
      const writeStream = fs.createWriteStream(testPath);
      writeStream.write(testContent);
      writeStream.end();

      // Wait for stream to finish
      return new Promise<void>((resolve) => {
        writeStream.on('finish', () => {
          // Verify file was written
          expect(fs.existsSync(testPath)).to.be.true;
          const content = fs.readFileSync(testPath, 'utf8');
          expect(content).to.equal(testContent);

          // Cleanup
          fs.unlinkSync(testPath);
          resolve();
        });
      });
    });

    it('should handle promises.rm with recursive and force options', async () => {
      const testDir = '/test-rm-dir';
      const testFile = `${testDir}/test-file.txt`;

      // Create directory and file
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(testFile, 'test content');
      expect(fs.existsSync(testDir)).to.be.true;
      expect(fs.existsSync(testFile)).to.be.true;

      // Remove directory recursively
      await fs.promises.rm(testDir, { recursive: true, force: true });
      expect(fs.existsSync(testDir)).to.be.false;
      expect(fs.existsSync(testFile)).to.be.false;
    });

    it('should handle file mode operations', async () => {
      const testPath = '/mode-test.txt';
      const testContent = 'test content with mode';

      // Write file with specific mode (like keyChainImpl.ts usage)
      await fs.promises.writeFile(testPath, testContent, { mode: '600' });
      expect(fs.existsSync(testPath)).to.be.true;

      // Read file content
      const content = await fs.promises.readFile(testPath, 'utf8');
      expect(content).to.equal(testContent);

      // Test with encoding as string
      const testPath2 = '/mode-test2.txt';
      await fs.promises.writeFile(testPath2, testContent, 'utf8');
      expect(fs.existsSync(testPath2)).to.be.true;

      // Test with encoding in options
      const testPath3 = '/mode-test3.txt';
      await fs.promises.writeFile(testPath3, testContent, { encoding: 'utf8', mode: '644' });
      expect(fs.existsSync(testPath3)).to.be.true;

      // Cleanup
      fs.unlinkSync(testPath);
      fs.unlinkSync(testPath2);
      fs.unlinkSync(testPath3);
    });
  });

  describe('Constants and Types', () => {
    it('should have fs.constants available', () => {
      expect(fs.constants).to.exist;
      expect(typeof fs.constants.R_OK).to.equal('number');
      expect(typeof fs.constants.W_OK).to.equal('number');
      expect(typeof fs.constants.X_OK).to.equal('number');
    });

    it('should handle access with permission constants', async () => {
      const testPath = '/access-test.txt';
      const testContent = 'test content';

      // Create file
      fs.writeFileSync(testPath, testContent);

      // Test access with different permissions
      await fs.promises.access(testPath, fs.constants.R_OK);
      await fs.promises.access(testPath, fs.constants.R_OK | fs.constants.W_OK);

      // Cleanup
      fs.unlinkSync(testPath);
    });

    it('should return proper Stats types', () => {
      const testPath = '/stats-test.txt';
      const testContent = 'test content for stats';

      // Create file
      fs.writeFileSync(testPath, testContent);

      // Test regular Stats
      const stats = fs.statSync(testPath);
      expect(typeof stats.size).to.equal('number');
      expect(typeof stats.mtimeMs).to.equal('number');
      expect(stats.isFile()).to.be.true;

      // Test BigIntStats
      const bigIntStats = fs.statSync(testPath, { bigint: true });
      expect(typeof bigIntStats.size).to.equal('bigint');
      expect(typeof bigIntStats.mtimeNs).to.equal('bigint');
      expect(bigIntStats.isFile()).to.be.true;

      // Cleanup
      fs.unlinkSync(testPath);
    });
  });

  describe('Promises API Specific Usage', () => {
    it('should work with direct promises imports pattern', async () => {
      const testPath = '/promises-test.txt';
      const testContent = 'test content for promises';

      // Test writeFile from promises
      await fs.promises.writeFile(testPath, testContent);
      expect(fs.existsSync(testPath)).to.be.true;

      // Test readFile from promises
      const content = await fs.promises.readFile(testPath, 'utf8');
      expect(content).to.equal(testContent);

      // Cleanup
      await fs.promises.unlink(testPath);
    });

    it('should handle directory creation with promises', async () => {
      const testDir = '/promises-dir-test';
      const testFile = `${testDir}/test-file.txt`;

      // Create directory with promises
      await fs.promises.mkdir(testDir, { recursive: true });
      expect(fs.existsSync(testDir)).to.be.true;

      // Create file in directory
      await fs.promises.writeFile(testFile, 'test content');
      expect(fs.existsSync(testFile)).to.be.true;

      // Cleanup
      await fs.promises.unlink(testFile);
      await fs.promises.rmdir(testDir);
    });
  });

  describe('Path Operations with fs', () => {
    it('should handle statSync with joined paths', () => {
      const testDir = '/path-test-dir';
      const testFile = `${testDir}/test-file.txt`;

      // Create directory and file
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(testFile, 'test content');

      // Test statSync with joined paths (simulating internal.ts usage)
      const stats = fs.statSync(testFile);
      expect(stats.isFile()).to.be.true;
      expect(stats.size).to.be.greaterThan(0);

      // Cleanup
      fs.unlinkSync(testFile);
      fs.rmdirSync(testDir);
    });

    it('should handle readdir with filtering', async () => {
      const testDir = '/filter-test-dir';

      // Create directory and files
      fs.mkdirSync(testDir, { recursive: true });
      fs.writeFileSync(`${testDir}/file1.txt`, 'test1');
      fs.writeFileSync(`${testDir}/file2.json`, 'test2');
      fs.writeFileSync(`${testDir}/file3.txt`, 'test3');

      // Test readdir with filtering (simulating orgAccessor.ts usage)
      const files = await fs.promises.readdir(testDir);
      const txtFiles = files.filter((file: string) => file.endsWith('.txt'));
      const jsonFiles = files.filter((file: string) => file.endsWith('.json'));

      expect(txtFiles).to.have.length(2);
      expect(jsonFiles).to.have.length(1);
      expect(txtFiles).to.include('file1.txt');
      expect(txtFiles).to.include('file3.txt');
      expect(jsonFiles).to.include('file2.json');

      // Cleanup
      fs.unlinkSync(`${testDir}/file1.txt`);
      fs.unlinkSync(`${testDir}/file2.json`);
      fs.unlinkSync(`${testDir}/file3.txt`);
      fs.rmdirSync(testDir);
    });

    it('should handle access with parsed filenames', async () => {
      const testPath = '/access-parsed-test.txt';
      const testContent = 'test content';

      // Create file
      fs.writeFileSync(testPath, testContent);

      // Test access with parsed filename (simulating orgAccessor.ts usage)
      await fs.promises.access(testPath, fs.constants.R_OK);
      await fs.promises.access(testPath, fs.constants.R_OK | fs.constants.W_OK);

      // Cleanup
      fs.unlinkSync(testPath);
    });
  });
});
