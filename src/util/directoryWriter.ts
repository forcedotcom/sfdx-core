/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Readable, pipeline as cbPipeline } from 'stream';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { promisify } from 'util';
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
