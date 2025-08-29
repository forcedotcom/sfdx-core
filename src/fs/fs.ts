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

import * as nodeFs from 'node:fs';
// yes, we're going to import it even though it might not be used.
// the alternatives were all worse without top-level await (iife, runtime errors from something trying to use it before it's initialized)
import * as memfs from 'memfs';
import type { VirtualFs } from './types';

export let fs: VirtualFs;

const isWeb = (): boolean => process.env.FORCE_MEMFS === 'true' || 'window' in globalThis || 'self' in globalThis;

export const getVirtualFs = (memfsVolume?: memfs.Volume): VirtualFs => {
  if (isWeb()) {
    const memfsInstance = memfs.createFsFromVolume(memfsVolume ?? new memfs.Volume());

    // Start with memfs instance and only override problematic methods
    const webFs = {
      ...memfsInstance,

      // Override only the methods that have incompatible signatures
      promises: {
        ...memfsInstance.promises,
        writeFile: async (
          file: string,
          data: string | Buffer,
          options?: BufferEncoding | { encoding?: BufferEncoding; mode?: string | number }
        ): Promise<void> => {
          const finalOptions = typeof options === 'string' ? { encoding: options } : options;
          await memfsInstance.promises.writeFile(file, data, finalOptions);
        },
        readFile: async (path: string, encoding?: BufferEncoding): Promise<string | Buffer> => {
          const result = await memfsInstance.promises.readFile(path, encoding);
          return encoding === 'utf8' ? String(result) : Buffer.from(result);
        },
      },

      readFileSync: (path: string, encoding?: BufferEncoding): string | Buffer => {
        const result = memfsInstance.readFileSync(path, encoding);
        return encoding === 'utf8' ? String(result) : Buffer.from(result);
      },

      writeFileSync: (file: string, data: string | Buffer, encoding?: BufferEncoding): void => {
        memfsInstance.writeFileSync(file, data, { encoding });
      },
    } as unknown as VirtualFs;

    return webFs;
  }

  return nodeFs as unknown as VirtualFs;
};

export const setFs = (providedFs: VirtualFs): void => {
  fs = providedFs;
};

export const resetFs = (): void => {
  fs = getVirtualFs();
};

// Initialize fs at module load time
fs = getVirtualFs();
