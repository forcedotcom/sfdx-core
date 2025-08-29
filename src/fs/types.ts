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
