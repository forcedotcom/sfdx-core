/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Nullable } from '@salesforce/ts-types';
import { AuthInfo } from './authInfo';
import { Aliases } from './config/aliases';
import { AuthInfoConfig } from './config/authInfoConfig';
import { Config } from './config/config';
import { ConfigAggregator } from './config/configAggregator';
import { Logger } from './logger';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'auth');

export type AuthConfigs = Map<string, AuthInfoConfig>;

/**
 * Handles the removing of authorizations, which includes deleting the auth file
 * in the global .sfdx folder, deleting any configs that are associated with the username/alias,
 * and deleting any aliases associated with the username
 *
 * ```
 * const remover = await AuthRemover.create();
 * await remover.removeAuth('example@mycompany.com');
 * ```
 *
 * ```
 * const remover = await AuthRemover.create();
 * await remover.removeAllAuths();
 * ```
 *
 * ```
 * const remover = await AuthRemover.create();
 * const authConfigs = await remover.findAuthConfigs(
 *  example@mycompany.com
 * );
 * const usernames = [...authConfigs.keys()];
 * for (const username of usernames) {
 *   await remover.removeAuth(username);
 * }
 * ```
 */
export class AuthRemover extends AsyncOptionalCreatable {
  public authConfigs: AuthConfigs = new Map();
  private globalConfig: Nullable<Config>;
  private localConfig: Nullable<Config>;
  private logger!: Logger;
  private aliases!: Aliases;

  /**
   * Removes the authentication and any configs or aliases associated with it
   *
   * @param usernameOrAlias the username or alias that you want to remove
   */
  public async removeAuth(usernameOrAlias: string) {
    const username = await this.resolveUsername(usernameOrAlias);
    this.logger.debug(`Removing authorization for user ${username}`);
    AuthInfo.clearCache(username);
    await this.unsetConfigValues(username);
    await this.unsetAliases(username);
    await this.unlinkConfigFile(username);
  }

  /**
   * Removes all authentication files and any configs or aliases associated with them
   */
  public async removeAllAuths() {
    const authConfigs = await this.findAllAuthConfigs();
    const usernames = [...authConfigs.keys()];
    for (const username of usernames) {
      await this.removeAuth(username);
    }
  }

  /**
   * Finds authorization files for username/alias in the global .sfdx folder
   * **Throws** *{@link SfdxError}{ name: 'NoOrgFound' }* if no username, alias, or defaultusername
   *
   * @param usernameOrAlias username or alias of the auth you want to find, defaults to the configured defaultusername
   * @returns {Promise<AuthConfigs>}
   */
  public async findAuthConfigs(usernameOrAlias?: string): Promise<AuthConfigs> {
    const authFiles = await AuthInfo.listAllAuthFiles();
    let filenames: string[] = [];
    if (usernameOrAlias) {
      const authFileName = `${await this.resolveUsername(usernameOrAlias)}.json`;
      filenames = authFiles.filter((f) => f === authFileName);
      if (filenames.length === 0) {
        filenames = await this.filterAuthFilesForDefaultUsername(authFiles);
      }
    } else {
      filenames = await this.filterAuthFilesForDefaultUsername(authFiles);
    }
    await this.initAuthInfoConfigs(filenames);
    return this.authConfigs;
  }

  /**
   * Finds all authorization files in the global .sfdx folder
   *
   * @returns {Promise<AuthConfigs>}
   */
  public async findAllAuthConfigs(): Promise<AuthConfigs> {
    const authFiles = await AuthInfo.listAllAuthFiles();
    await this.initAuthInfoConfigs(authFiles);
    return this.authConfigs;
  }

  protected async init() {
    this.logger = await Logger.child(this.constructor.name);
    this.globalConfig = await this.getConfig(true);
    this.localConfig = await this.getConfig(false);
    this.aliases = await Aliases.create(Aliases.getDefaultOptions());
  }

  /**
   * Returns the username for a given alias if the alias exists.
   *
   * @param usernameOrAlias username or alias
   * @returns {Promise<string>}
   */
  private async resolveUsername(usernameOrAlias: string): Promise<string> {
    const aliasedValue = this.aliases.get(usernameOrAlias);
    return (aliasedValue || usernameOrAlias) as string;
  }

  /**
   * Instantiates config class
   *
   * @param isGlobal
   * @returns {Promise<Nullable<Config>>}
   */
  private async getConfig(isGlobal: boolean): Promise<Nullable<Config>> {
    let config: Nullable<Config>;
    try {
      config = await Config.create({ isGlobal });
    } catch {
      config = null;
    }
    return config;
  }

  /**
   * Filters the provided authorization file names for ones that belong to the
   * the configured defaultusername
   * **Throws** *{@link SfdxError}{ name: 'NoOrgFound' }* if no defaultusername is not configured
   *
   * @param authFiles array of authorization file names
   * @returns {Promise<string[]>}
   */
  private async filterAuthFilesForDefaultUsername(authFiles: string[]): Promise<string[]> {
    let filenames: string[] = [];
    const configAggregator = await ConfigAggregator.create();
    const defaultUsername = configAggregator.getInfo(Config.DEFAULT_USERNAME).value;
    if (!defaultUsername) {
      const message = messages.getMessage('defaultOrgNotFound', ['defaultusername']);
      const action = messages.getMessage('defaultOrgNotFoundActions');
      throw new SfdxError(message, 'NoOrgFound', [action]);
    } else {
      const authFileName = `${await this.resolveUsername(defaultUsername as string)}.json`;
      filenames = authFiles.filter((f) => f === authFileName);
    }
    return filenames;
  }

  /**
   * Instantiates the AuthInfoConfig class for each auth file
   *
   * @param filenames array of authorizaiton file names
   * @returns {Promise<AuthConfigs>}
   */
  private async initAuthInfoConfigs(filenames: string[]): Promise<AuthConfigs> {
    for (const filename of filenames) {
      try {
        const username = path.basename(filename, '.json');
        const config = await AuthInfoConfig.create({
          ...AuthInfoConfig.getOptions(username),
          throwOnNotFound: true,
        });
        this.authConfigs.set(username, config);
      } catch {
        this.logger.debug(`Problem reading file: ${filename} skipping`);
      }
    }
    return this.authConfigs;
  }

  /**
   * Returns aliases for provided username
   *
   * @param username username that's been aliased
   * @returns {Promise<string[]>}
   */
  private getAliases(username: string): string[] {
    return this.aliases.getKeysByValue(username) || [];
  }

  /**
   * Unsets any configured values (both global and local) for provided username
   *
   * @param username username that you want to remove from config files
   */
  private async unsetConfigValues(username: string) {
    const aliases = this.getAliases(username);
    this.logger.debug(`Clearing config keys for username ${username} and aliases: ${aliases}`);
    for (const config of [this.globalConfig, this.localConfig]) {
      if (config) {
        const keysWithUsername = config.getKeysByValue(username) || [];
        const keysWithAlias = aliases
          .map((alias) => config.getKeysByValue(alias))
          .filter((k) => !!k)
          .reduce((x, y) => x.concat(y), []);
        const allKeys = keysWithUsername.concat(keysWithAlias);
        this.logger.debug(`Found these config keys to remove: ${allKeys}`);
        allKeys.forEach((key) => config.unset(key));
        await config.write();
      }
    }
  }

  /**
   * Unsets any aliases for provided username
   *
   * @param username username that you want to remove from aliases
   */
  private async unsetAliases(username: string) {
    this.logger.debug(`Clearing aliases for username: ${username}`);
    const existingAliases = this.aliases.getKeysByValue(username);
    this.logger.debug(`Found these aliases to remove: ${existingAliases}`);
    existingAliases.forEach((alias) => this.aliases.unset(alias));
    await this.aliases.write();
  }

  /**
   * Deletes the authtorizaton file for provided username
   *
   * @param username username that you want to delete
   */
  private async unlinkConfigFile(username: string) {
    const configFile = this.authConfigs.has(username)
      ? this.authConfigs.get(username)
      : (await this.findAuthConfigs(username)).get(username);

    if (configFile && (await configFile.exists())) {
      this.logger.debug(`Deleting auth file for username ${username}`);
      await configFile.unlink();
    }
  }
}
