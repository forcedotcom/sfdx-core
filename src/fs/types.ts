/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type * as nodeFs from 'node:fs';
import type { IFs as MemFs } from 'memfs';

// Get the types for both node:fs and memfs
type NodeFs = typeof nodeFs;

// Find keys that exist in both types
type CommonKeys<T, U> = keyof T & keyof U;

// Create intersection type - be more specific for compatible methods
type IntersectionType<T, U> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in CommonKeys<T, U>]: T[K] extends (...args: any[]) => any
    ? T[K] extends U[K]
      ? T[K] // If signatures are compatible, use the more specific type
      : U[K] extends T[K]
      ? U[K] // If memfs signature is more specific, use that
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any // Only use any for genuinely incompatible signatures
    : T[K] extends U[K]
    ? T[K]
    : U[K] extends T[K]
    ? U[K]
    : T[K]; // Default to node:fs for non-functions
};

// Base intersection type
type BaseVirtualFs = IntersectionType<NodeFs, MemFs>;

// VirtualFs with specific overrides for methods we know the behavior of
export type VirtualFs = Omit<
  BaseVirtualFs,
  'writeFileSync' | 'readFileSync' | 'statSync' | 'promises' | 'mkdtempSync' | 'createWriteStream' | 'mkdirSync'
> & {
  // Override promises object with specific types for methods we override
  promises: Omit<BaseVirtualFs['promises'], 'writeFile' | 'readFile'> & {
    writeFile: (
      file: string,
      data: string | Buffer,
      options?: BufferEncoding | { encoding?: BufferEncoding; mode?: string | number }
    ) => Promise<void>;
    readFile: {
      (path: string): Promise<Buffer>;
      (path: string, encoding: BufferEncoding): Promise<string>;
    };
  };

  // Override sync methods with specific types
  readFileSync: {
    (path: string): Buffer;
    (path: string, encoding: BufferEncoding): string;
  };
  writeFileSync: (file: string, data: string | Buffer, encoding?: BufferEncoding) => void;
  /** there are some differences between node:fs and memfs for statSync around bigint stats.  Be careful if using those */
  statSync: typeof nodeFs.statSync;
  mkdtempSync: typeof nodeFs.mkdtempSync;
  createWriteStream: typeof nodeFs.createWriteStream;
  mkdirSync: typeof nodeFs.mkdirSync;
};
