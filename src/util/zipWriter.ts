/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Readable, Writable } from 'node:stream';
import JSZip from 'jszip';
import { Logger } from '../logger/logger';
import { SfError } from '../sfError';
import { StructuredWriter } from './structuredWriter';

export class ZipWriter extends Writable implements StructuredWriter {
  private zip = JSZip();
  private zipBuffer?: Buffer;
  private logger: Logger;

  public constructor(private readonly rootDestination?: string) {
    super({ objectMode: true });
    const destination = rootDestination ? `for: ${rootDestination}` : 'in memory';
    this.logger = Logger.childFromRoot(this.constructor.name);
    this.logger.debug(`generating zip ${destination}`);
  }

  public get buffer(): Buffer {
    if (!this.zipBuffer) {
      throw new SfError('Must finalize the ZipWriter before getting a buffer');
    }
    return this.zipBuffer;
  }

  public async addToStore(contents: string | Readable | Buffer, path: string): Promise<void> {
    // Ensure only posix paths are added to zip files
    const posixPath = path.replace(/\\/g, '/');
    this.zip.file(posixPath, contents);
    return Promise.resolve();
  }

  public async finalize(): Promise<void> {
    // compression-/speed+ (0)<---(3)---------->(9) compression+/speed-
    // 3 appears to be a decent balance of compression and speed. It felt like
    // higher values = diminishing returns on compression and made conversion slower
    this.zipBuffer = await this.zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 3 },
    });
    this.logger.debug('Generated zip complete');
  }

  public getDestinationPath(): string | undefined {
    return this.rootDestination;
  }
}
