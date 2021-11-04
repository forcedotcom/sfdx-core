/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createWriteStream } from 'fs';
import { pipeline as cbPipeline, Readable, Writable } from 'stream';
import { promisify } from 'util';
import { Archiver, create as createArchive } from 'archiver';

export const pipeline = promisify(cbPipeline);

export type WriteInfo = {
  output: string;
  source: Readable;
};

export class ZipWriter extends Writable {
  // compression-/speed+ (0)<---(3)---------->(9) compression+/speed-
  // 3 appears to be a decent balance of compression and speed. It felt like
  // higher values = diminishing returns on compression and made conversion slower
  private zip: Archiver = createArchive('zip', { zlib: { level: 3 } });
  private buffers: Buffer[] = [];

  public constructor(private rootDestination?: string) {
    super({ objectMode: true });
    void pipeline(this.zip, this.getOutputStream());
  }

  public addToZip(contents: string | Readable | Buffer, path: string): void {
    this.zip.append(contents, { name: path });
  }

  public async finalize(): Promise<void> {
    await this.zip.finalize();
  }

  private getOutputStream(): Writable {
    if (this.rootDestination) {
      return createWriteStream(this.rootDestination);
    } else {
      const bufferWritable = new Writable();
      // eslint-disable-next-line no-underscore-dangle
      bufferWritable._write = (chunk: Buffer, encoding: string, cb: () => void): void => {
        this.buffers.push(chunk);
        cb();
      };
      return bufferWritable;
    }
  }

  public get buffer(): Buffer {
    return Buffer.concat(this.buffers);
  }
}
