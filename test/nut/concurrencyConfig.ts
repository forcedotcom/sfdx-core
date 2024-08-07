/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { tmpdir } from 'node:os';
import { ConfigFile } from '../../src';

export const FILENAME = 'concurrency.json';

export class TestConfig extends ConfigFile<ConfigFile.Options> {
  public static getOptions(
    filename: string,
    isGlobal: boolean,
    isState?: boolean,
    filePath?: string
  ): ConfigFile.Options {
    return {
      rootFolder: tmpdir(),
      filename,
      isGlobal,
      isState,
      filePath,
    };
  }

  public static getFileName() {
    return FILENAME;
  }
}
