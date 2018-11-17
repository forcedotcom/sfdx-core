/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { dirname as pathDirname } from 'path';
import * as fs from '../util/fs';
import { ConfigFile } from './configFile';
import { ConfigContents } from './configStore';

/**
 * Represent a key chain config backed by a json file.
 * @private
 */
// istanbul ignore next - getPassword/setPassword is always mocked out
export class KeychainConfig extends ConfigFile<ConfigFile.Options> {
  public static getFileName(): string {
    return 'key.json';
  }

  /**
   * Gets default option for the KeychainConfig
   */
  public static getDefaultOptions(): ConfigFile.Options {
    return ConfigFile.getDefaultOptions(true, KeychainConfig.getFileName());
  }

  /**
   * Retrieves the global config state of the keychain
   * @param options Option override otherwise the default options are used.
   */
  public static async retrieve<T extends ConfigFile<ConfigFile.Options>>(
    options?: ConfigFile.Options
  ): Promise<T> {
    const keychainConfig: ConfigFile<
      ConfigFile.Options
    > = await KeychainConfig.create(
      (options as ConfigFile.Options) || KeychainConfig.getDefaultOptions()
    );
    await keychainConfig.read();
    return keychainConfig as T;
  }

  /**
   * Write the config file with new contents. If no new contents are passed in
   * it will write this.contents that was set from read().
   *
   * @param {ConfigContents} newContents the new contents of the file
   * @returns {Promise<ConfigContents>} the written contents
   */
  public async write(newContents?: ConfigContents): Promise<ConfigContents> {
    if (newContents != null) {
      this.setContents(newContents);
    }

    await fs.mkdirp(pathDirname(this.getPath()));

    await fs.writeFile(
      this.getPath(),
      JSON.stringify(this.getContents(), null, 4),
      { mode: '600' }
    );

    return this.getContents();
  }
}
