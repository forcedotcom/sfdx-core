/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Nullable } from '@salesforce/ts-types';
import { SfdxError } from '../../sfdxError';
import { GlobalInfo } from '../globalInfoConfig';
import { SfAliases, SfOrg, SfInfoKeys, SfToken } from '../types';

export type Aliasable = string | Partial<SfOrg> | Partial<SfToken>;

export class AliasAccessor {
  public constructor(private globalInfo: GlobalInfo) {}

  /**
   * Returns all the aliases for all the usernames
   */
  public getAll(): SfAliases;
  /**
   * Returns all the aliases for a given entity
   *
   * @param entity the aliasable entity that you want to get the aliases of
   */
  public getAll(entity: Aliasable): string[];
  public getAll(entity?: Aliasable): string[] | SfAliases {
    const all = this.globalInfo.get(SfInfoKeys.ALIASES) || {};
    if (entity) {
      const username = this.getNameOf(entity);
      return Object.entries(all)
        .filter((entry) => entry[1] === username)
        .map((entry) => entry[0]);
    } else {
      return all;
    }
  }

  /**
   * Returns the first alias found for a given entity
   *
   * @param entity the aliasable entity that you want to get the alias of
   */
  public get(entity: Aliasable): Nullable<string> {
    return this.getAll(entity).find((alias) => alias) ?? null;
  }

  /**
   * Returns the username that corresponds to the given alias if it exists
   *
   * @param alias the alias that corresponds to a username
   */
  public getUsername(alias: string): Nullable<string> {
    return this.getAll()[alias] ?? null;
  }

  /**
   * If the provided string is an alias, it returns the corresponding username.
   * If the provided string is not an alias, we assume that the provided string
   * is the username and return it.
   *
   * This method is helpful when you don't know if the string you have is a username
   * or an alias.
   *
   * @param usernameOrAlias a string that might be a username or might be an alias
   */
  public resolveUsername(usernameOrAlias: string): string {
    return this.getUsername(usernameOrAlias) ?? usernameOrAlias;
  }

  /**
   * Set an alias for the given aliasable entity
   *
   * @param alias the alias you want to set
   * @param entity the aliasable entity that's being aliased
   */
  public set(alias: string, entity: Aliasable): void {
    const username = this.getNameOf(entity);
    this.globalInfo.set(`${SfInfoKeys.ALIASES}["${alias}"]`, username);
  }

  /**
   * Updates the alias for the given aliasable entity
   *
   * @param alias the alias you want to set
   * @param entity the aliasable entity that's being aliased
   */
  public update(alias: string, entity: Aliasable): void {
    const username = this.getNameOf(entity);
    this.globalInfo.update(`${SfInfoKeys.ALIASES}["${alias}"]`, username);
  }

  public unset(alias: string): void {
    delete this.globalInfo.get(SfInfoKeys.ALIASES)[alias];
  }

  /**
   * This method unsets all the aliases for the given entity.
   *
   * @param entity the aliasable entity for which you want to unset all aliases
   */
  public unsetAll(entity: Aliasable): void {
    const aliases = this.getAll(entity);
    aliases.forEach((alias) => this.unset(alias));
  }

  /**
   * Returns the username of given aliasable entity
   */
  private getNameOf(entity: Aliasable): string {
    if (typeof entity === 'string') return entity;
    const aliaseeName = entity.username ?? entity.user;
    if (!aliaseeName) {
      throw new SfdxError(`Invalid aliasee, it must contain a user or username property: ${JSON.stringify(entity)}`);
    }
    return aliaseeName as string;
  }
}
