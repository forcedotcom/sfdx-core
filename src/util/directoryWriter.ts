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

import { Readable, pipeline as cbPipeline } from 'node:stream';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { fs } from '../fs/fs';
import { StructuredWriter } from './structuredWriter';

const pipeline = promisify(cbPipeline);

export class DirectoryWriter implements StructuredWriter {
  public constructor(private readonly rootDestination?: string) {
    if (!this.rootDestination) {
      this.rootDestination = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
    } else {
      fs.mkdirSync(this.rootDestination, { recursive: true });
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public get buffer(): Buffer {
    throw new Error('Not implemented');
  }

  public async addToStore(contents: string | Readable | Buffer, targetPath: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const destPath = path.join(this.rootDestination!, targetPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    if (contents instanceof Readable) {
      const writeStream = fs.createWriteStream(destPath);
      await pipeline(contents, writeStream);
    } else if (typeof contents === 'string') {
      fs.writeFileSync(destPath, contents);
    } else if (contents instanceof Buffer) {
      fs.writeFileSync(destPath, contents);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  public finalize(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public getDestinationPath(): string | undefined {
    return this.rootDestination;
  }
}
