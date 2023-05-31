/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { writeFileSync, readFileSync } from 'node:fs';
import { lock, unlock, lockSync, unlockSync } from 'proper-lockfile';

import { AsyncOptionalCreatable, ensureArray } from '@salesforce/kit';

import { Nullable } from '@salesforce/ts-types';
import { Global } from '../../global';
import { AuthFields } from '../../org/authInfo';
import { ConfigContents } from '../../config/configStore';
import { SfError } from '../../sfError';
import { SfToken } from './tokenAccessor';

export type Aliasable = string | (Partial<AuthFields> & Partial<SfToken>);
export const DEFAULT_GROUP = 'orgs';
export const FILENAME = 'alias.json';

const lockOptions = { stale: 10_000 };
const lockRetryOptions = {
  ...lockOptions,
  retries: { retries: 10, maxTimeout: 1000, factor: 2 },
};
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
   * @deprecated use setAndSave
   * @param alias the alias you want to set
   * @param entity the aliasable entity that's being aliased
   */
  public set(alias: string, entity: Aliasable): void {
    // get a very fresh copy to merge with to avoid conflicts
    this.readFileToAliasStoreSync();
    this.aliasStore.set(alias, getNameOf(entity));
    this.saveAliasStoreToFileSync();
  }

  /**
   * Set an alias for the given aliasable entity.  Writes to the file
   *
   * @param alias the alias you want to set
   * @param entity the aliasable entity that's being aliased
   */
  public async setAndSave(alias: string, entity: Aliasable): Promise<void> {
    // get a very fresh copy to merge with to avoid conflicts, then lock
    await this.readFileToAliasStore(true);
    this.aliasStore.set(alias, getNameOf(entity));
    return this.saveAliasStoreToFile();
  }

  /**
   * Unset the given alias.  Writes to the file
   *
   * @deprecated use unsetAndSave
   *
   */
  public unset(alias: string): void {
    this.readFileToAliasStoreSync();
    this.aliasStore.delete(alias);
    this.saveAliasStoreToFileSync();
  }

  /**
   * Unset the given alias(es).  Writes to the file
   *
   */
  public async unsetAndSave(alias: string): Promise<void> {
    await this.readFileToAliasStore(true);
    this.aliasStore.delete(alias);
    return this.saveAliasStoreToFile();
  }

  /**
   * Unsets all the aliases for the given entity.
   *
   * @deprecated use unsetValuesAndSave
   *
   * @param entity the aliasable entity for which you want to unset all aliases
   */
  public unsetAll(entity: Aliasable): void {
    this.readFileToAliasStoreSync();
    const aliases = this.getAll(entity);
    aliases.forEach((a) => this.aliasStore.delete(a));
    this.saveAliasStoreToFileSync();
  }

  /**
   * Unset all the aliases for the given array of entity.
   *
   * @param entity the aliasable entity for which you want to unset all aliases
   */
  public async unsetValuesAndSave(aliasees: Aliasable[]): Promise<void> {
    await this.readFileToAliasStore(true);
    ensureArray(aliasees)
      .flatMap((a) => this.getAll(a))
      .map((a) => this.aliasStore.delete(a));
    return this.saveAliasStoreToFile();
  }

  /**
   * @deprecated the set/unset methods now write to the file when called.  Use (un)setAndSave instead of calling (un)set and then calling write()
   */
  public async write(): Promise<ConfigContents> {
    return Promise.resolve(this.getAll());
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
    try {
      if (useLock) {
        await lock(this.fileLocation, lockRetryOptions);
      }
      this.aliasStore = fileContentsRawToAliasStore(await readFile(this.fileLocation, 'utf-8'));
    } catch (e) {
      if (e instanceof Error && 'code' in e && e.code === 'ENOENT') {
        this.aliasStore = new Map<string, string>();
        await mkdir(dirname(this.fileLocation), { recursive: true });
        await this.saveAliasStoreToFile();
        return;
      }
      if (useLock) await unlock(this.fileLocation);
      throw e;
    }
  }

  private async saveAliasStoreToFile(): Promise<void> {
    await writeFile(this.fileLocation, aliasStoreToRawFileContents(this.aliasStore));
    try {
      await unlock(this.fileLocation);
    } catch {
      // ignore the error.  If it wasn't locked, that's what we wanted
    }
  }

  /**
   * @deprecated use the async version of this method instead
   * provided for the legacy sync set/unset methods. */
  private readFileToAliasStoreSync(): void {
    // the file is guaranteed to exist because this init method ensures it
    // put a lock in place.  This method is only used by legacy set/unset methods.
    lockSync(this.fileLocation, lockOptions);
    this.aliasStore = fileContentsRawToAliasStore(readFileSync(this.fileLocation, 'utf-8'));
  }

  /**
   * @deprecated use the async version of this method instead
   * provided for the legacy sync set/unset methods */
  private saveAliasStoreToFileSync(): void {
    writeFileSync(this.fileLocation, aliasStoreToRawFileContents(this.aliasStore));
    unlockSync(this.fileLocation);
  }
}

/**
 * Returns the username of given aliasable entity
 */
const getNameOf = (entity: Aliasable): string => {
  if (typeof entity === 'string') return entity;
  const aliaseeName = entity.username ?? entity.user;
  if (!aliaseeName) {
    throw new SfError(`Invalid aliasee, it must contain a user or username property: ${JSON.stringify(entity)}`);
  }
  return aliaseeName;
};

const fileContentsRawToAliasStore = (contents: string): Map<string, string> => {
  const fileContents = JSON.parse(contents) as {
    [group: string]: { [alias: string]: string };
    [DEFAULT_GROUP]: { [alias: string]: string };
  };

  return new Map(Object.entries(fileContents[DEFAULT_GROUP]));
};

const aliasStoreToRawFileContents = (aliasStore: Map<string, string>): string =>
  JSON.stringify({ [DEFAULT_GROUP]: Object.fromEntries(Array.from(aliasStore.entries())) });

// exported for testSetup mocking
export const getFileLocation = (): string => join(homedir(), Global.SFDX_STATE_FOLDER, FILENAME);
