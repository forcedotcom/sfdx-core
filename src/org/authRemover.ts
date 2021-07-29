/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Nullable } from '@salesforce/ts-types';
import { Config, SfdxPropertyKeys } from '../config/config';
import { ConfigAggregator } from '../config/configAggregator';
import { Logger } from '../logger';
import { Messages } from '../messages';
import { SfOrg, GlobalInfo, SfOrgs } from '../globalInfo';
import { OrgConfigProperties } from './orgConfigProperties';

Messages.importMessagesDirectory(__dirname);
const coreMessages = Messages.load('@salesforce/core', 'core', ['namedOrgNotFound']);
const messages = Messages.load('@salesforce/core', 'auth', ['defaultUsernameNotSet']);

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
 * const auth = await remover.findAuth(
 *  example@mycompany.com
 * );
 * await remover.removeAuth(auth.username);
 * ```
 */
export class AuthRemover extends AsyncOptionalCreatable {
  private globalConfig: Nullable<Config>;
  private localConfig: Nullable<Config>;
  private globalInfo!: GlobalInfo;
  private logger!: Logger;

  /**
   * Removes the authentication and any configs or aliases associated with it
   *
   * @param usernameOrAlias the username or alias that you want to remove
   */
  public async removeAuth(usernameOrAlias: string) {
    const username = await this.resolveUsername(usernameOrAlias);
    this.logger.debug(`Removing authorization for user ${username}`);
    await this.unsetConfigValues(username);
    await this.unsetAliases(username);
    this.globalInfo.orgs.unset(username);
    await this.globalInfo.write();
  }

  /**
   * Removes all authentication files and any configs or aliases associated with them
   */
  public async removeAllAuths() {
    const auths = this.findAllAuths();
    const usernames = Object.keys(auths);
    for (const username of usernames) {
      await this.removeAuth(username);
    }
  }

  /**
   * Finds authorization files for username/alias in the global .sfdx folder
   * **Throws** *{@link SfdxError}{ name: 'DefaultUsernameNotSetError' }* if no defaultusername
   * **Throws** *{@link SfdxError}{ name: 'NamedOrgNotFoundError' }* if specified user is not found
   *
   * @param usernameOrAlias username or alias of the auth you want to find, defaults to the configured defaultusername
   * @returns {Promise<SfOrg>}
   */
  public async findAuth(usernameOrAlias?: string): Promise<SfOrg> {
    const username = usernameOrAlias ? await this.resolveUsername(usernameOrAlias) : await this.getDefaultUsername();
    const auth = this.globalInfo.orgs.get(username);
    if (!auth) {
      throw coreMessages.createError('namedOrgNotFound');
    }
    return auth;
  }

  /**
   * Finds all authorization files in the global .sfdx folder
   *
   * @returns {SfOrgs}
   */
  public findAllAuths(): SfOrgs {
    return this.globalInfo.orgs.getAll();
  }

  protected async init() {
    this.logger = await Logger.child(this.constructor.name);
    this.globalConfig = await this.getConfig(true);
    this.localConfig = await this.getConfig(false);
    this.globalInfo = await GlobalInfo.getInstance();
  }

  /**
   * Returns the username for a given alias if the alias exists.
   *
   * @param usernameOrAlias username or alias
   * @returns {Promise<string>}
   */
  private async resolveUsername(usernameOrAlias: string): Promise<string> {
    return this.globalInfo.aliases.resolveUsername(usernameOrAlias);
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
   * @returns {Promise<string>}
   */
  private async getDefaultUsername(): Promise<string> {
    const configAggregator = await ConfigAggregator.create();
    const defaultUsername =
      configAggregator.getInfo(OrgConfigProperties.TARGET_ORG).value ||
      configAggregator.getInfo(SfdxPropertyKeys.DEFAULT_USERNAME).value;
    if (!defaultUsername) {
      throw messages.createError('defaultUsernameNotSet');
    }
    return defaultUsername as string;
  }

  /**
   * Returns aliases for provided username
   *
   * @param username username that's been aliased
   * @returns {Promise<string[]>}
   */
  private getAliases(username: string): string[] {
    return this.globalInfo.aliases.getAll(username);
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
    const existingAliases = this.globalInfo.aliases.getAll(username);
    if (existingAliases.length === 0) return;

    this.logger.debug(`Found these aliases to remove: ${existingAliases}`);
    existingAliases.forEach((alias) => this.globalInfo.aliases.unset(alias));
    await this.globalInfo.write();
  }
}
