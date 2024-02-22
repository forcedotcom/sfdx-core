/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import * as chai from 'chai';
import chaiString from 'chai-string';
import { DirectoryWriter } from '../../../src/util/directoryWriter';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { expect } = chai;
chai.use(chaiString);

function validateFileContents(filePath: string, expectedContents: string): void {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  expect(fileContents).to.equal(expectedContents);
}

const filename = 'path/to/my-file.txt';

describe('DirectoryWriter', () => {
  let directoryWriter: DirectoryWriter;
  let directoryPath: string;
  beforeEach(() => {
    directoryWriter = new DirectoryWriter();
    directoryPath = directoryWriter.getDestinationPath() ?? '';
  });
  it('addToStore - string', async () => {
    const contents = 'my-contents';
    expect(directoryPath).to.startWith(os.tmpdir());
    await directoryWriter.addToStore(contents, filename);
    await directoryWriter.finalize();
    expect(fs.existsSync(path.join(directoryPath, filename))).to.be.true;
    validateFileContents(path.join(directoryPath, filename), contents);
  });
  it('addToStore - Buffer', async () => {
    const contents = Buffer.from('my-contents');
    await directoryWriter.addToStore(contents, filename);
    await directoryWriter.finalize();
    expect(fs.existsSync(path.join(directoryPath, filename))).to.be.true;
    validateFileContents(path.join(directoryPath, filename), contents.toString());
  });
  it('addToStore - Readable', async () => {
    const contents = Readable.from('my-contents');
    await directoryWriter.addToStore(contents, filename);
    await directoryWriter.finalize();
    expect(fs.existsSync(path.join(directoryPath, filename))).to.be.true;
    const fileContents = fs.readFileSync(path.join(directoryPath, filename), 'utf8');
    expect(fileContents).to.equal('my-contents');
  });
});
