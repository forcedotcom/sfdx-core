/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as stream from 'stream';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as ZipArchiver from 'archiver';
import { ZipWriter } from '../../../src/util/zipWriter';
import { shouldThrow } from '../../../src/testSetup';

class WritableFileStream extends fs.WriteStream {}
class ReadableFileStream extends fs.ReadStream {}

describe('ZipWriter', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();
  const appendStub = sandbox
    .stub()
    .callsFake(
      (
        source: string | stream.Readable | Buffer,
        data?: ZipArchiver.EntryData | ZipArchiver.ZipEntryData | undefined
      ) => {
        expect(source).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(data).to.be.a('object').and.to.have.property('name');
      }
    );
  const createMock = {
    append: appendStub,
  } as unknown as ZipArchiver.Archiver;

  beforeEach(() => {
    sandbox.stub(ZipArchiver, 'create').returns(createMock);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('addToStore', async () => {
    const contents = 'my-contents';
    const filename = 'path/to/my-file.xml';
    const zipWriter = new ZipWriter();
    await zipWriter.addToStore(contents, filename);
    expect(appendStub.callCount).to.equal(1);
    expect(appendStub.firstCall.args[0]).to.equal(contents);
    expect(appendStub.firstCall.args[1]).to.deep.equal({
      name: filename,
    });
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
    await zipWriter.addToStore(contents, filename);
    await zipWriter.finalize();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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
    // @ts-ignore
    readStreamStub.on.callsFake((event: string, listener: (...args: any[]) => void): ReadableFileStream => {
      if (event === 'data') {
        setImmediate(() => listener(Buffer.from(bufferString, 'utf8')));
      }
      return readStreamStub;
    });
    // @ts-ignore
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
    await zipWriter.addToStore(contents, filename);
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
    // @ts-ignore
    readStreamStub.on.callsFake((event: string, listener: (...args: any[]) => void): ReadableFileStream => {
      if (event === 'data') {
        setImmediate(() => listener(Buffer.from(bufferString, 'utf8')));
      }
      return readStreamStub;
    });
    // @ts-ignore
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
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await zipWriter.addToStore(contents, filename);
    try {
      await shouldThrow(zipWriter.finalize());
    } catch (error) {
      expect(error).to.exist;
    }
    expect(createWriteStreamStub.firstCall.firstArg).to.equal(rootDestination);
    expect(createReadStreamStub.firstCall.firstArg).to.equal(rootDestination);
  });
});
