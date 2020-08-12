/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import { shouldThrow, testSetup } from '../../../src/testSetup';
import { fs } from '../../../src/util/fs';

// Setup the test environment.
const $$ = testSetup();

describe('util/fs', () => {
  describe('remove', () => {
    it('should throw an error on falsy', async () => {
      try {
        await shouldThrow(fs.remove(undefined));
      } catch (e) {
        expect(e).to.have.property('name', 'PathIsNullOrUndefined');
      }
    });

    it('should remove a folder with no files', async () => {
      const folderToDelete = pathJoin(osTmpdir(), 'foo');
      await fs.mkdirp(folderToDelete);
      await fs.remove(folderToDelete);

      try {
        await shouldThrow(fs.access(folderToDelete));
      } catch (e) {
        expect(e).to.have.property('code', 'ENOENT');
      }
    });

    it('should remove a folder with one file', async () => {
      const folderToDelete = pathJoin(osTmpdir(), 'foo');
      const fileToDelete = pathJoin(folderToDelete, 'test.json');

      await fs.mkdirp(folderToDelete);
      await fs.writeJson(fileToDelete, {});
      await fs.remove(folderToDelete);

      for (const path of [folderToDelete, fileToDelete]) {
        try {
          await shouldThrow(fs.access(path));
        } catch (e) {
          expect(e).to.have.property('code', 'ENOENT');
        }
      }
    });

    it('should remove nested sub dirs', async () => {
      const folderToDelete = pathJoin(osTmpdir(), 'alpha');
      const sub1 = pathJoin(folderToDelete, 'bravo');
      const sub2 = pathJoin(folderToDelete, 'charlie');
      const nestedSub1 = pathJoin(sub1, 'echo');
      const file1 = pathJoin(nestedSub1, 'foo.txt');
      const file2 = pathJoin(sub2, 'foo.txt');

      await fs.mkdirp(sub2);
      await fs.mkdirp(nestedSub1);

      await fs.writeJson(file1, {});
      await fs.writeJson(file2, {});

      await fs.remove(folderToDelete);

      for (const path of [file1, file2, nestedSub1, sub2, sub1]) {
        try {
          await shouldThrow(fs.access(path));
        } catch (e) {
          expect(e).to.have.property('code', 'ENOENT');
        }
      }
    });
  });

  describe('traverseForFile', () => {
    let statFileStub;
    let statError;

    beforeEach(() => {
      statFileStub = $$.SANDBOX.stub(fs, 'stat');
      statError = new Error('test');
      statError['code'] = 'ENOENT';
    });

    it('should find a file in the starting dir', async () => {
      const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
      expect(path).to.equal('/foo/bar/baz');
    });

    it('should find a file in a parent dir', async () => {
      statFileStub.withArgs('/foo/bar/baz/fizz').returns(Promise.reject(statError));
      const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
      expect(path).to.equal('/foo/bar');
    });

    it('should find a file in the root dir', async () => {
      statFileStub.withArgs('/foo/bar/baz/fizz').returns(Promise.reject(statError));
      statFileStub.withArgs('/foo/bar/fizz').returns(Promise.reject(statError));
      statFileStub.withArgs('/foo/fizz').returns(Promise.reject(statError));
      const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
      expect(path).to.equal('/');
    });

    it('should return undefined if not found', async () => {
      statFileStub.returns(Promise.reject(statError));
      const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
      expect(path).to.be.undefined;
    });
  });

  describe('traverseForFileSync', () => {
    let statFileStub;
    let statError;

    beforeEach(() => {
      statFileStub = $$.SANDBOX.stub(fs, 'statSync');
      statError = new Error('test');
      statError['code'] = 'ENOENT';
    });

    it('should find a file in the starting dir', () => {
      const path = fs.traverseForFileSync('/foo/bar/baz', 'fizz');
      expect(path).to.equal('/foo/bar/baz');
    });

    it('should find a file in a parent dir', () => {
      statFileStub.withArgs('/foo/bar/baz/fizz').throws(statError);
      const path = fs.traverseForFileSync('/foo/bar/baz', 'fizz');
      expect(path).to.equal('/foo/bar');
    });

    it('should find a file in the root dir', () => {
      statFileStub.withArgs('/foo/bar/baz/fizz').throws(statError);
      statFileStub.withArgs('/foo/bar/fizz').throws(statError);
      statFileStub.withArgs('/foo/fizz').throws(statError);
      const path = fs.traverseForFileSync('/foo/bar/baz', 'fizz');
      expect(path).to.equal('/');
    });

    it('should return undefined if not found', () => {
      statFileStub.throws(statError);
      const path = fs.traverseForFileSync('/foo/bar/baz', 'fizz');
      expect(path).to.be.undefined;
    });
  });

  describe('readJson', () => {
    let readFileStub;

    beforeEach(() => {
      readFileStub = $$.SANDBOX.stub(fs, 'readFile');
    });

    it('should throw a ParseError for empty JSON file', async () => {
      readFileStub.returns(Promise.resolve(''));

      try {
        await shouldThrow(fs.readJson('emptyFile'));
      } catch (error) {
        expect(error.message).to.contain('Unexpected end of JSON input');
      }
    });

    it('should throw a ParseError for invalid multiline JSON file', async () => {
      readFileStub.returns(
        Promise.resolve(`{
                "key": 12345,
                "value": true,
            }`)
      );
      try {
        await shouldThrow(fs.readJson('invalidJSON'));
      } catch (err) {
        expect(err.message).to.contain('Parse error in file invalidJSON on line 4');
      }
    });

    it('should throw a ParseError for invalid multiline JSON file 2', async () => {
      readFileStub.returns(Promise.resolve('{\n"a":}'));
      try {
        await shouldThrow(fs.readJson('invalidJSON2'));
      } catch (err) {
        expect(err.message).to.contain('Parse error in file invalidJSON2 on line 2');
      }
    });

    it('should throw a ParseError for invalid single line JSON file', async () => {
      readFileStub.returns(Promise.resolve('{ "key": 12345, "value": [1,2,3], }'));
      try {
        await shouldThrow(fs.readJson('invalidJSON_no_newline'));
      } catch (err) {
        expect(err.message).to.contain('Parse error in file invalidJSON_no_newline on line 1');
      }
    });

    it('should return a JSON object', async () => {
      const validJSON = { key: 12345, value: true };
      const validJSONStr = JSON.stringify(validJSON);
      readFileStub.returns(Promise.resolve(validJSONStr));
      const rv = await fs.readJson('validJSONStr');
      expect(rv).to.eql(validJSON);
    });
  });

  describe('readJsonMap', () => {
    let readFileStub;

    beforeEach(() => {
      readFileStub = $$.SANDBOX.stub(fs, 'readFile');
    });

    it('should throw an error for non-object JSON content', async () => {
      readFileStub.returns(Promise.resolve('[]'));

      try {
        await shouldThrow(fs.readJsonMap('arrayFile'));
      } catch (error) {
        expect(error.message).to.contain('Expected parsed JSON data to be an object');
      }
    });

    it('should return a JSON object', async () => {
      const validJSON = { key: 12345, value: true };
      const validJSONStr = JSON.stringify(validJSON);
      readFileStub.returns(Promise.resolve(validJSONStr));
      const rv = await fs.readJsonMap('validJSONStr');
      expect(rv).to.eql(validJSON);
    });
  });

  describe('writeJson', () => {
    it('should call writeFile with correct args', async () => {
      $$.SANDBOX.stub(fs, 'writeFile').returns(Promise.resolve(null));
      const testFilePath = 'utilTest_testFilePath';
      const testJSON = { username: 'utilTest_username' };
      const stringifiedTestJSON = JSON.stringify(testJSON, null, 4);
      await fs.writeJson(testFilePath, testJSON);
      expect(fs.writeFile['called']).to.be.true;
      expect(fs.writeFile['firstCall'].args[0]).to.equal(testFilePath);
      expect(fs.writeFile['firstCall'].args[1]).to.deep.equal(stringifiedTestJSON);
      expect(fs.writeFile['firstCall'].args[2]).to.deep.equal({
        encoding: 'utf8',
        mode: '600'
      });
    });
  });

  describe('fileExists', () => {
    it('should return true if the file exists', async () => {
      $$.SANDBOX.stub(fs, 'access').returns(Promise.resolve(true));
      const exists = await fs.fileExists('foo/bar.json');
      expect(exists).to.be.true;
    });

    it('should return false if the file does not exist', async () => {
      const exists = await fs.fileExists('foo/bar.json');
      expect(exists).to.be.false;
    });
  });

  describe('fileExistsSync', () => {
    it('should return true if the file exists', async () => {
      $$.SANDBOX.stub(fs, 'fileExistsSync').returns(true);
      const exists = await fs.fileExistsSync('foo/bar.json');
      expect(exists).to.be.true;
    });

    it('should return false if the file does not exist', async () => {
      const exists = await fs.fileExists('foo/bar.json');
      expect(exists).to.be.false;
    });
  });

  describe('areFilesEqual', () => {
    afterEach(() => {
      $$.SANDBOX.restore();
    });

    it('should return false if the files stat.size are different', async () => {
      $$.SANDBOX.stub(fs, 'readFile')
        .onCall(0)
        .resolves({})
        .onCall(1)
        .resolves({});
      $$.SANDBOX.stub(fs, 'stat')
        .onCall(0)
        .resolves({
          size: 1
        })
        .onCall(1)
        .resolves({
          size: 2
        });

      const results = await fs.areFilesEqual('foo/bar.json', 'foo/bar2.json');
      expect(results).to.be.false;
    });

    it('should return true if the file hashes are the same', async () => {
      $$.SANDBOX.stub(fs, 'readFile')
        .onCall(0)
        .resolves(
          `{
            "key": 12345,
            "value": true,
        }`
        )
        .onCall(1)
        .resolves(
          `{
            "key": 12345,
            "value": true,
        }`
        );
      $$.SANDBOX.stub(fs, 'stat')
        .onCall(0)
        .resolves({})
        .onCall(1)
        .resolves({});

      const results = await fs.areFilesEqual('foo/bar.json', 'foo/bar2.json');
      expect(results).to.be.true;
    });

    it('should return false if the file hashes are different', async () => {
      $$.SANDBOX.stub(fs, 'readFile')
        .onCall(0)
        .resolves(
          `{
              "key": 12345,
              "value": true,
          }`
        )
        .onCall(1)
        .resolves(
          `{
              "key": 12345,
              "value": false,
          }`
        );

      $$.SANDBOX.stub(fs, 'stat')
        .onCall(0)
        .resolves({})
        .onCall(1)
        .resolves({});
      const results = await fs.areFilesEqual('foo/bar.json', 'foo/bsar2.json');
      expect(results).to.be.false;
    });

    it('should return error when fs.readFile throws error', async () => {
      $$.SANDBOX.stub(fs, 'stat')
        .onCall(0)
        .resolves({
          size: 1
        })
        .onCall(1)
        .resolves({
          size: 2
        });
      try {
        await fs.areFilesEqual('foo', 'bar');
      } catch (e) {
        expect(e.name).to.equal('DirMissingOrNoAccess');
      }
    });

    it('should return error when fs.stat throws error', async () => {
      try {
        await fs.areFilesEqual('foo', 'bar');
      } catch (e) {
        expect(e.name).to.equal('DirMissingOrNoAccess');
      }
    });
  });

  describe('actOn', () => {
    afterEach(() => {
      $$.SANDBOX.restore();
    });

    it('should run custom functions against contents of a directory', async () => {
      const actedOnArray = [];
      $$.SANDBOX.stub(fs, 'readdir').resolves(['test1.json', 'test2.json']);
      $$.SANDBOX.stub(fs, 'stat').resolves({
        isDirectory: () => false,
        isFile: () => true
      });
      const pathToFolder = pathJoin(osTmpdir(), 'foo');

      await fs.actOn(pathToFolder, async file => {
        actedOnArray.push(file), 'file';
      });
      const example = [pathJoin(pathToFolder, 'test1.json'), pathJoin(pathToFolder, 'test2.json')];

      expect(actedOnArray).to.eql(example);
    });
  });
});
