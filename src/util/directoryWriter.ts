/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { StructuredWriter } from './structuredWriter';

export class DirectoryWriter implements StructuredWriter {
  public constructor(private readonly rootDestination?: string) {
    if (!this.rootDestination) {
      this.rootDestination = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
    }
    fs.mkdirSync(this.rootDestination, { recursive: true });
  }

  public addToStore(contents: string | Readable | Buffer, targetPath: string): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const destPath = path.join(this.rootDestination!, targetPath);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    if (contents instanceof Readable) {
      const writeStream = createWriteStream(destPath);
      contents.pipe(writeStream, { end: true });
      writeStream.on('error', (err) => {
        throw err;
      });
    } else if (typeof contents === 'string') {
      fs.writeFileSync(destPath, contents);
    } else if (contents instanceof Buffer) {
      fs.writeFileSync(destPath, contents);
    }
  }

  public finalize(): Promise<void> {
    return Promise.resolve(undefined);
  }

  public getDestinationPath(): string | undefined {
    return this.rootDestination;
  }

  public get buffer(): Buffer {
    throw new Error('Not implemented');
  }
}
