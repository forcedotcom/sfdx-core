/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { createWriteStream, createReadStream } from 'fs';
import { pipeline as cbPipeline, Readable, Writable } from 'stream';
import { promisify } from 'util';
import { Archiver, create as createArchive } from 'archiver';
import { StructuredWriter } from './structuredWriter';

const pipeline = promisify(cbPipeline);

export class ZipWriter extends Writable implements StructuredWriter {
  // compression-/speed+ (0)<---(3)---------->(9) compression+/speed-
  // 3 appears to be a decent balance of compression and speed. It felt like
  // higher values = diminishing returns on compression and made conversion slower
  private zip: Archiver = createArchive('zip', { zlib: { level: 3 } });
  private buffers: Buffer[] = [];

  public constructor(private readonly rootDestination?: string) {
    super({ objectMode: true });
    void pipeline(this.zip, this.getOutputStream());
  }

  public get buffer(): Buffer {
    return Buffer.concat(this.buffers);
  }

  public async addToStore(contents: string | Readable | Buffer, path: string): Promise<void> {
    this.zip.append(contents, { name: path });
    return Promise.resolve();
  }

  public async finalize(): Promise<void> {
    await this.zip.finalize();
    await this.getInputBuffer();
  }

  public getDestinationPath(): string | undefined {
    return this.rootDestination;
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

  private async getInputBuffer(): Promise<void> {
    if (this.rootDestination) {
      const inputStream = createReadStream(this.rootDestination);
      return new Promise((resolve, reject) => {
        inputStream.on('data', (chunk: Buffer) => {
          this.buffers.push(chunk);
        });
        inputStream.once('end', () => resolve());
        inputStream.once('error', (error: Error) => reject(error));
      });
    }
  }
}
