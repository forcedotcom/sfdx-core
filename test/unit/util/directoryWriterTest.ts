/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import * as chai from 'chai';
import * as chaiString from 'chai-string';
import * as sinon from 'sinon';
import * as ZipArchiver from 'archiver';
import { ZipWriter } from '../../../src/util/zipWriter';
import { shouldThrow } from '../../../src/testSetup';
import { DirectoryWriter } from '../../../lib/util/directoryWriter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expect } = chai;
chai.use(chaiString);

class WritableFileStream extends fs.WriteStream {}
class ReadableFileStream extends fs.ReadStream {}

function expectFileContents(filePath: string, expectedContents: string): void {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  expect(fileContents).to.equal(expectedContents);
}

describe('DirectoryWriter', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();

  beforeEach(() => {});

  afterEach(() => {
    sandbox.restore();
  });

  it('addToStore - string', async () => {
    const contents = 'my-contents';
    const filename = 'path/to/my-file.xml';
    const directoryWriter = new DirectoryWriter();
    const directoryPath = directoryWriter.getDestinationPath();
    expect(directoryPath).to.startWith(os.tmpdir());
    directoryWriter.addToStore(contents, filename);
    await directoryWriter.finalize();
    expect(fs.existsSync(path.join(directoryPath, filename))).to.be.true;
    expectFileContents(path.join(directoryPath, filename), contents);
  });
  it('addToStore - Buffer', async () => {
    const contents = new Buffer('my-contents');
    const filename = 'path/to/my-file.xml';
    const directoryWriter = new DirectoryWriter();
    const directoryPath = directoryWriter.getDestinationPath();
    expect(directoryPath).to.startWith(os.tmpdir());
    directoryWriter.addToStore(contents, filename);
    await directoryWriter.finalize();
    expect(fs.existsSync(path.join(directoryPath, filename))).to.be.true;
    expectFileContents(path.join(directoryPath, filename), contents.toString());
  });
  it('addToStore - Readable', async () => {
    const contents = Readable.from('my-contents', { objectMode: false });
    const filename = 'path/to/my-file.xml';
    const directoryWriter = new DirectoryWriter();
    const directoryPath = directoryWriter.getDestinationPath();
    expect(directoryPath).to.startWith(os.tmpdir());
    directoryWriter.addToStore(contents, filename);
    await directoryWriter.finalize();
    expect(fs.existsSync(path.join(directoryPath, filename))).to.be.true;
    expectFileContents(path.join(directoryPath, filename), 'my-contents');
  });
});

describe('ZipWriter write to buffer', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();
  beforeEach(() => {
    const zip = ZipArchiver.create('json');
    sandbox.stub(ZipArchiver, 'create').returns(zip);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('addToZip and finalize and write to buffer', async () => {
    const contents = 'my-contents';
    const filename = 'path/to/my-file.xml';
    const zipWriter = new ZipWriter();
    zipWriter.addToStore(contents, filename);
    await zipWriter.finalize();
    const result = JSON.parse(zipWriter.buffer.toString()).pop();
    expect(result)
      .to.be.a('object')
      .and.to.have.keys([
        'name',
        'type',
        'date',
        'mode',
        'prefix',
        'sourcePath',
        'stats',
        'sourceType',
        'crc32',
        'size',
      ]);
    expect(result.name).to.be.equal(filename);
  });
});

describe('ZipWriter write to file and throws', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();
  const rootDestination = path.join(os.tmpdir(), 'my-zip.zip');
  const bufferString = 'DEADBEEF';
  // const rootDestination = path.join('/Users', 'bmaggi', 'tmp', 'my-zip.zip');
  let writeStreamStub: sinon.SinonStubbedInstance<WritableFileStream>;
  let readStreamStub: sinon.SinonStubbedInstance<ReadableFileStream>;
  let createWriteStreamStub: sinon.SinonStub;
  let createReadStreamStub: sinon.SinonStub;
  beforeEach(() => {
    writeStreamStub = sinon.createStubInstance(WritableFileStream);
    readStreamStub = sinon.createStubInstance(ReadableFileStream);
    createWriteStreamStub = sandbox.stub(fs, 'createWriteStream').withArgs(rootDestination).returns(writeStreamStub);
    createReadStreamStub = sandbox.stub(fs, 'createReadStream').withArgs(rootDestination).returns(readStreamStub);
    readStreamStub.on.callsFake((event: string, listener: (...args: any[]) => void): ReadableFileStream => {
      if (event === 'data') {
        setImmediate(() => listener(Buffer.from(bufferString, 'utf8')));
      }
      return readStreamStub;
    });
    readStreamStub.once.callsFake((event: string, listener: (...args: any[]) => void): ReadableFileStream => {
      if (event === 'end') {
        setImmediate(() => listener());
      }
      return readStreamStub;
    });
    const createMock = {
      append: sinon.spy(),
      finalize: sinon.stub().resolves(),
    } as unknown as ZipArchiver.Archiver;
    sandbox.stub(ZipArchiver, 'create').returns(createMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('addToZip and finalize and write to buffer', async () => {
    const contents = 'my-contents';
    const filename = 'my-file.xml';
    const zipWriter = new ZipWriter(rootDestination);
    zipWriter.addToStore(contents, filename);
    await zipWriter.finalize();
    expect(createWriteStreamStub.firstCall.firstArg).to.equal(rootDestination);
    expect(createReadStreamStub.firstCall.firstArg).to.equal(rootDestination);
  });
});

describe('ZipWriter write to file', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();
  const rootDestination = path.join(os.tmpdir(), 'my-zip.zip');
  const bufferString = 'DEADBEEF';
  let writeStreamStub: sinon.SinonStubbedInstance<WritableFileStream>;
  let readStreamStub: sinon.SinonStubbedInstance<ReadableFileStream>;
  let createWriteStreamStub: sinon.SinonStub;
  let createReadStreamStub: sinon.SinonStub;
  beforeEach(() => {
    writeStreamStub = sinon.createStubInstance(WritableFileStream);
    readStreamStub = sinon.createStubInstance(ReadableFileStream);
    createWriteStreamStub = sandbox.stub(fs, 'createWriteStream').withArgs(rootDestination).returns(writeStreamStub);
    createReadStreamStub = sandbox.stub(fs, 'createReadStream').withArgs(rootDestination).returns(readStreamStub);
    readStreamStub.on.callsFake((event: string, listener: (...args: any[]) => void): ReadableFileStream => {
      if (event === 'data') {
        setImmediate(() => listener(Buffer.from(bufferString, 'utf8')));
      }
      return readStreamStub;
    });
    readStreamStub.once.callsFake((event: string, listener: (...args: any[]) => void): ReadableFileStream => {
      if (event === 'error') {
        setImmediate(() => listener(new Error('FileReadError')));
      }
      return readStreamStub;
    });
    const createMock = {
      append: sinon.spy(),
      finalize: sinon.stub().resolves(),
    } as unknown as ZipArchiver.Archiver;
    sandbox.stub(ZipArchiver, 'create').returns(createMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('addToZip and finalize and write to buffer and throws', async () => {
    const contents = 'my-contents';
    const filename = 'my-file.xml';
    const zipWriter = new ZipWriter(rootDestination);
    zipWriter.addToStore(contents, filename);
    try {
      await shouldThrow(zipWriter.finalize());
    } catch (error) {
      expect(error).to.exist;
    }
    expect(createWriteStreamStub.firstCall.firstArg).to.equal(rootDestination);
    expect(createReadStreamStub.firstCall.firstArg).to.equal(rootDestination);
  });
});
