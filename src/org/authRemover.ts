/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { JsonMap } from '@salesforce/ts-types';
import { ConfigAggregator } from '../config/configAggregator';
import { Logger } from '../logger/logger';
import { Messages } from '../messages';
import { StateAggregator } from '../stateAggregator';
import { OrgConfigProperties } from './orgConfigProperties';
import { AuthFields } from '.';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'auth');

/**
 * Handles  the removing of authorizations, which includes deleting the auth file
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
  private config!: ConfigAggregator;
  private stateAggregator!: StateAggregator;
  private logger!: Logger;

  /**
   * Removes the authentication and any configs or aliases associated with it
   *
   * @param usernameOrAlias the username or alias that you want to remove
   */
  public async removeAuth(usernameOrAlias: string): Promise<void> {
    const username = await this.resolveUsername(usernameOrAlias);
    this.logger.debug(`Removing authorization for user ${username}`);
    await this.unsetConfigValues(username);
    await this.unsetAliases(username);
    await this.unsetTokens(username);
    await this.stateAggregator.orgs.remove(username);
  }

  /**
   * Removes all authentication files and any configs or aliases associated with them
   */
  public async removeAllAuths(): Promise<void> {
    const auths = this.findAllAuths();
    const usernames = Object.keys(auths);
    for (const username of usernames) {
      // prevent ConfigFile collision bug
      // eslint-disable-next-line no-await-in-loop
      await this.removeAuth(username);
    }
  }

  /**
   * Finds authorization files for username/alias in the global .sfdx folder
   * **Throws** *{@link SfError}{ name: 'TargetOrgNotSetError' }* if no target-org
   * **Throws** *{@link SfError}{ name: 'NamedOrgNotFoundError' }* if specified user is not found
   *
   * @param usernameOrAlias username or alias of the auth you want to find, defaults to the configured target-org
   * @returns {Promise<SfOrg>}
   */
  public async findAuth(usernameOrAlias?: string): Promise<AuthFields> {
    const username = await this.resolveUsername(usernameOrAlias ?? this.getTargetOrg());
    return this.stateAggregator.orgs.get(username, false, true);
  }

  /**
   * Finds all org authorizations in the global info file (.sf/sf.json)
   *
   * @returns {Record<string, AuthFields>}
   */
  public findAllAuths(): Record<string, AuthFields & JsonMap> {
    const orgs = this.stateAggregator.orgs.getAll();
    return orgs.reduce<Record<string, AuthFields & JsonMap>>(
      (x, y) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ({ ...x, [y.username!]: y }),
      {}
    );
  }

  protected async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
    this.config = await ConfigAggregator.create();
    this.stateAggregator = await StateAggregator.getInstance();
    await this.stateAggregator.orgs.readAll();
  }

  /**
   * Returns the username for a given alias if the alias exists.
   *
   * @param usernameOrAlias username or alias
   * @returns {Promise<string>}
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  private async resolveUsername(usernameOrAlias: string): Promise<string> {
    return this.stateAggregator.aliases.resolveUsername(usernameOrAlias);
  }

  /**
   * @returns {string}
   */
  private getTargetOrg(): string {
    const targetOrg = this.config.getInfo(OrgConfigProperties.TARGET_ORG).value;
    if (!targetOrg) {
      throw messages.createError('targetOrgNotSet');
    }
    return targetOrg as string;
  }

  /**
   * Returns aliases for provided username
   *
   * @param username username that's been aliased
   * @returns {Promise<string[]>}
   */
  private getAliases(username: string): string[] {
    return this.stateAggregator.aliases.getAll(username);
  }

  /**
   * Unsets any configured values (both global and local) for provided username
   *
   * @param username username that you want to remove from config files
   */
  private async unsetConfigValues(username: string): Promise<void> {
    const aliases = this.getAliases(username);

    this.logger.debug(`Clearing config keys for username ${username} and aliases: ${aliases.join(',')}`);
    const configs = [this.config.getGlobalConfig(), this.config.getLocalConfig()];
    for (const config of configs) {
      if (config) {
        const keysWithUsername = config.getKeysByValue(username) || [];
        const keysWithAlias = aliases
          .map((alias) => config.getKeysByValue(alias))
          .filter((k) => !!k)
          .reduce((x, y) => x.concat(y), []);
        const allKeys = keysWithUsername.concat(keysWithAlias);
        this.logger.debug(`Found these config keys to remove: ${allKeys.join(',')}`);
        allKeys.forEach((key) => {
          try {
            config.unset(key);
          } catch {
            this.logger.debug(`Failed to remove ${key}`);
          }
        });
        // prevent ConfigFile collision bug
        // eslint-disable-next-line no-await-in-loop
        await config.write();
      }
    }
  }

  /**
   * Unsets any aliases for provided username
   *
   * @param username username that you want to remove from aliases
   */
  private async unsetAliases(username: string): Promise<void> {
    this.logger.debug(`Clearing aliases for username: ${username}`);
    const existingAliases = this.stateAggregator.aliases.getAll(username);
    if (existingAliases.length === 0) return;

    this.logger.debug(`Found these aliases to remove: ${existingAliases.join(',')}`);
    existingAliases.forEach((alias) => this.stateAggregator.aliases.unset(alias));
    await this.stateAggregator.aliases.write();
  }

  private async unsetTokens(username: string): Promise<void> {
    this.logger.debug(`Clearing tokens for username: ${username}`);
    const tokens = this.stateAggregator.tokens.getAll();
    for (const [key, token] of Object.entries(tokens)) {
      if (token.user === username) {
        this.stateAggregator.tokens.unset(key);
      }
    }
    await this.stateAggregator.tokens.write();
  }
}
