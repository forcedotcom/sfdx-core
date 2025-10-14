/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
        readFile: async (
          path: string,
          options?: BufferEncoding | { encoding?: BufferEncoding }
        ): Promise<string | Buffer> => {
          // Handle both signatures: readFile(path, 'utf8') and readFile(path, { encoding: 'utf8' })
          const encoding = typeof options === 'string' ? options : options?.encoding;
          const result = await memfsInstance.promises.readFile(path, encoding ? { encoding } : undefined);
          return encoding === 'utf8' ? String(result) : Buffer.from(result);
        },
      },

      readFileSync: (
        path: string,
        options?: BufferEncoding | { encoding?: BufferEncoding }
      ): string | Buffer => {
        // Handle both signatures: readFileSync(path, 'utf8') and readFileSync(path, { encoding: 'utf8' })
        const encoding = typeof options === 'string' ? options : options?.encoding;
        const result = memfsInstance.readFileSync(path, encoding ? { encoding } : undefined);
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
