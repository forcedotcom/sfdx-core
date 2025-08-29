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
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect } from 'chai';
import * as sinon from 'sinon';
import JSZip from 'jszip';
import { ZipWriter } from '../../../src/util/zipWriter';

describe('ZipWriter', () => {
  const sandbox = sinon.createSandbox();
  const contents = 'my-contents';
  const filePath = path.join('path', 'to', 'my-file.xml');

  afterEach(() => {
    sandbox.restore();
  });

  it('addToStore() should add posix file path and content', async () => {
    const jsZipFileStub = sandbox.stub(JSZip.prototype, 'file');
    const posixFilePath = 'path/to/my-file.xml';
    const zipWriter = new ZipWriter();
    await zipWriter.addToStore(contents, filePath);
    expect(jsZipFileStub.callCount).to.equal(1);
    expect(jsZipFileStub.firstCall.args[0]).to.equal(posixFilePath);
    expect(jsZipFileStub.firstCall.args[1]).to.equal(contents);
    expect(zipWriter.getDestinationPath()).to.be.undefined;
  });

  it('finalize() should generate a zipBuffer with expected compression level', async () => {
    const buf = Buffer.from('hi');
    const jsZipGenerateAsyncStub = sandbox.stub(JSZip.prototype, 'generateAsync').resolves(buf);
    const zipWriter = new ZipWriter();
    await zipWriter.finalize();
    expect(zipWriter.buffer).to.equal(buf);
    expect(jsZipGenerateAsyncStub.firstCall.args[0]).to.deep.equal({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 3 },
    });
  });

  it('should throw when buffer() is called before finalize()', async () => {
    try {
      new ZipWriter().buffer;
      expect(false, 'Expected an error to be thrown');
    } catch (e) {
      expect(e).to.be.instanceOf(Error);
      expect((e as Error).message).to.equal('Must finalize the ZipWriter before getting a buffer');
    }
  });

  // NOTE: This is a "NUT style" test versus a unit test since it does some file system operations
  it('should generate a valid zip file', async () => {
    const buf = Buffer.from('hi');
    const rootDestination = path.join(os.tmpdir(), 'zipWriterTest');
    if (fs.existsSync(rootDestination)) {
      fs.rmSync(rootDestination, { recursive: true, force: true });
    }
    const zipFilePath = path.join(rootDestination, 'myZip.zip');
    try {
      fs.mkdirSync(rootDestination, { recursive: true });
      const fileToBeZippedPath = path.join(rootDestination, 'foo.txt');

      const zipWriter = new ZipWriter(rootDestination);
      await zipWriter.addToStore(buf, fileToBeZippedPath);
      await zipWriter.finalize();
      fs.writeFileSync(zipFilePath, zipWriter.buffer);

      expect(zipWriter.getDestinationPath()).to.equal(rootDestination);
      expect(fs.existsSync(zipFilePath)).to.be.true;
      expect(fs.statSync(zipFilePath).size).to.be.greaterThan(0);
    } finally {
      fs.rmSync(rootDestination, { recursive: true, force: true });
    }
  });
});
