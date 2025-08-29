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
import { Readable } from 'node:stream';
import { expect } from 'chai';
import { DirectoryWriter } from '../../../src/util/directoryWriter';

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
    expect(directoryPath.startsWith(os.tmpdir())).to.be.true;
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
