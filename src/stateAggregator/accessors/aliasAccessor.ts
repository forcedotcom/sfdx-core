/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

import { AsyncOptionalCreatable, ensureArray } from '@salesforce/kit';
import { Nullable } from '@salesforce/ts-types';
import { fs } from '../../fs/fs';
import { Global } from '../../global';
import { AuthFields } from '../../org/authInfo';
import { ConfigContents } from '../../config/configStackTypes';
import { SfError } from '../../sfError';
import { lockInit } from '../../util/fileLocking';

export type Aliasable = string | Partial<AuthFields>;
export const DEFAULT_GROUP = 'orgs';
export const FILENAME = 'alias.json';

export class AliasAccessor extends AsyncOptionalCreatable {
  // set in init method
  private fileLocation!: string;
  /** orgs is the default group */
  private aliasStore!: Map<string, string>;

  /**
   * Returns all the aliases for all the values
   */
  public getAll(): ConfigContents<string>;
  /**
   * Returns all the aliases for a given entity
   *
   * @param entity the aliasable entity that you want to get the aliases of
   */
  public getAll(entity: Aliasable): string[];
  public getAll(entity?: Aliasable): string[] | ConfigContents<string> {
    // This will only return aliases under "orgs". This will need to be modified
    // if/when we want to support more aliases groups.

    if (entity) {
      const nameFromEntity = getNameOf(entity);
      return Array.from(this.aliasStore.entries())
        .filter(([, value]) => nameFromEntity === value)
        .map(([alias]) => alias);
    } else {
      return Object.fromEntries(this.aliasStore.entries());
    }
  }

  /**
   * Returns the first alias found for a given entity
   *
   * @param entity the aliasable entity that you want to get the alias of
   */
  public get(entity: Aliasable): Nullable<string> {
    return this.getAll(entity)[0] ?? null;
  }

  /**
   * Returns the value that corresponds to the given alias if it exists
   *
   * @param alias the alias that corresponds to a value
   */
  public getValue(alias: string): Nullable<string> {
    return this.aliasStore.get(alias) ?? null;
  }

  /**
   * Returns the username that corresponds to the given alias if it exists
   *
   * @param alias the alias that corresponds to a username
   */
  public getUsername(alias: string): Nullable<string> {
    return this.aliasStore.get(alias) ?? null;
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
   * If the provided string is an alias, return it.
   * If the provided string is not an alias, return the username of the provided alias
   *
   * This method is helpful when you don't know if the string you have is a username
   * or an alias.
   *
   * @param usernameOrAlias a string that might be a username or might be an alias
   */
  public resolveAlias(usernameOrAlias: string): string | undefined {
    if (this.aliasStore.has(usernameOrAlias)) return usernameOrAlias;
    return Array.from(this.aliasStore.entries()).find(([, value]) => value === usernameOrAlias)?.[0];
  }

  /**
   * Set an alias for the given aliasable entity.  Writes to the file
   *
   * @param alias the alias you want to set
   * @param entity the aliasable entity that's being aliased
   */
  public async setAndSave(alias: string, entity: Aliasable): Promise<void> {
    // get a very fresh copy to merge with to avoid conflicts, then lock
    const lockResponse = await lockInit(this.fileLocation);
    await this.readFileToAliasStore();
    this.aliasStore.set(alias, getNameOf(entity));
    return lockResponse.writeAndUnlock(aliasStoreToRawFileContents(this.aliasStore));
  }

  /**
   * Unset the given alias(es).  Writes to the file
   *
   */
  public async unsetAndSave(alias: string): Promise<void> {
    const lockResponse = await lockInit(this.fileLocation);
    await this.readFileToAliasStore(false);
    this.aliasStore.delete(alias);
    return lockResponse.writeAndUnlock(aliasStoreToRawFileContents(this.aliasStore));
  }

  /**
   * Unset all the aliases for the given array of entity.
   *
   * @param entity the aliasable entity for which you want to unset all aliases
   */
  public async unsetValuesAndSave(aliasees: Aliasable[]): Promise<void> {
    const lockResponse = await lockInit(this.fileLocation);
    await this.readFileToAliasStore(false);
    ensureArray(aliasees)
      .flatMap((a) => this.getAll(a))
      .map((a) => this.aliasStore.delete(a));
    return lockResponse.writeAndUnlock(aliasStoreToRawFileContents(this.aliasStore));
  }

  /**
   * Returns true if the provided alias exists
   *
   * @param alias the alias you want to check
   */
  public has(alias: string): boolean {
    return this.aliasStore.has(alias);
  }

  protected async init(): Promise<void> {
    this.fileLocation = getFileLocation();
    await this.readFileToAliasStore();
  }

  /**
   * go to the fileSystem and read the file, storing a copy in the class's store
   * if the file doesn't exist, create it empty
   */
  private async readFileToAliasStore(useLock = false): Promise<void> {
    const lockResponse = useLock ? await lockInit(this.fileLocation) : undefined;
    try {
      this.aliasStore = fileContentsRawToAliasStore(await fs.promises.readFile(this.fileLocation, 'utf-8'));
      if (lockResponse) return await lockResponse.unlock();
    } catch (e) {
      if (e instanceof Error && 'code' in e && typeof e.code === 'string' && ['ENOENT', 'ENOTDIR'].includes(e.code)) {
        await fs.promises.mkdir(dirname(this.fileLocation), { recursive: true });
        this.aliasStore = new Map<string, string>();
        await fs.promises.writeFile(this.fileLocation, aliasStoreToRawFileContents(this.aliasStore));
        return lockResponse ? await lockResponse.unlock() : undefined;
      }
      if (lockResponse) {
        await lockResponse.unlock();
      }
      throw e;
    }
  }
}

/**
 * Returns the username of given aliasable entity
 */
const getNameOf = (entity: Aliasable): string => {
  if (typeof entity === 'string') return entity;
  const { username } = entity;
  if (!username) {
    throw new SfError(`Invalid aliasee, it must contain a user or username property: ${JSON.stringify(entity)}`);
  }
  return username;
};

const fileContentsRawToAliasStore = (contents: string): Map<string, string> => {
  const fileContents = JSON.parse(contents) as {
    [group: string]: { [alias: string]: string };
    [DEFAULT_GROUP]: { [alias: string]: string };
  };

  // handle when alias file exists but is missing the org property
  return new Map(Object.entries(fileContents[DEFAULT_GROUP] ?? {}));
};

const aliasStoreToRawFileContents = (aliasStore: Map<string, string>): string =>
  JSON.stringify({ [DEFAULT_GROUP]: Object.fromEntries(Array.from(aliasStore.entries())) });

// exported for testSetup mocking
export const getFileLocation = (): string => join(homedir(), Global.SFDX_STATE_FOLDER, FILENAME);
