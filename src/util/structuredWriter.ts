/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Readable } from 'stream';

export interface StructuredWriter {
  addToStore(contents: string | Readable | Buffer, path: string): Promise<void>;
  finalize(): Promise<void>;
  getDestinationPath(): string | 'memory' | undefined;
  get buffer(): Buffer;
}
