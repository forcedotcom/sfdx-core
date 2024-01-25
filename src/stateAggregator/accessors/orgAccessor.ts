/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Nullable, entriesOf } from '@salesforce/ts-types';
import { AsyncOptionalCreatable, isEmpty } from '@salesforce/kit';
import { AuthInfoConfig } from '../../config/authInfoConfig';
import { Global } from '../../global';
import { AuthFields } from '../../org/authInfo';
import { ConfigFile } from '../../config/configFile';
import { ConfigContents } from '../../config/configStackTypes';
import { Logger } from '../../logger/logger';
import { Messages } from '../../messages';
import { Lifecycle } from '../../lifecycleEvents';

function chunk<T>(array: T[], chunkSize: number): T[][] {
  const final = [];
  for (let i = 0, len = array.length; i < len; i += chunkSize) final.push(array.slice(i, i + chunkSize));
  return final;
}

export abstract class BaseOrgAccessor<T extends ConfigFile, P extends ConfigContents> extends AsyncOptionalCreatable {
  private configs: Map<string, Nullable<T>> = new Map();
  /** map of Org files by username  */
  private contents: Map<string, P> = new Map();
  private logger!: Logger;

  /**
   * Read the auth file for the given username. Once the file has been read, it can be re-accessed with the `get` method.
   *
   * @param username username to read
   * @param decrypt if true, decrypt encrypted values
   * @param throwOnNotFound throw if file is not found for username
   */
  public async read(username: string, decrypt = false, throwOnNotFound = true): Promise<Nullable<P>> {
    try {
      const config = await this.initAuthFile(username, throwOnNotFound);
      this.configs.set(username, config);
      return this.get(username, decrypt);
    } catch (err) {
      if (err instanceof Error && err.name === 'JsonParseError') {
        throw err;
      }
      return null;
    }
  }

  /**
   * Read all the auth files under the global state directory
   *
   * @param decrypt if true, decrypt encrypted values
   */
  public async readAll(decrypt = false): Promise<P[]> {
    const fileChunks = chunk(await this.getAllFiles(), 50);
    for (const fileChunk of fileChunks) {
      const promises = fileChunk.map(async (f) => {
        const username = this.parseUsername(f);
        try {
          const config = await this.initAuthFile(username);
          this.configs.set(username, config);
        } catch (e) {
          await Lifecycle.getInstance().emitWarning(`The auth file for ${username} is invalid.`);
        }
      });
      // eslint-disable-next-line no-await-in-loop
      await Promise.all(promises);
    }
    return this.getAll(decrypt);
  }

  public get(username: string, decrypt?: boolean, throwOnNotFound?: true): P;

  /**
   * Return the contents of the username's auth file from cache.
   * The `read` or `readAll` methods must be called first in order to populate the cache.
   * If throwOnNotFound is not true, an empty object {} is returned if the org is not found.
   *
   * @param username username to get
   * @param decrypt if true, decrypt encrypted values
   * @param throwOnNotFound if true, throw if the auth file does not already exist in the cache
   */
  public get(username: string, decrypt = false, throwOnNotFound = false): Nullable<P> {
    const config = this.configs.get(username);
    if (throwOnNotFound && config?.keys().length === 0) {
      Messages.importMessagesDirectory(__dirname);
      const messages = Messages.loadMessages('@salesforce/core', 'core');
      throw messages.createError('namedOrgNotFound', [username]);
    }
    if (config) {
      this.contents.set(username, config.getContents(decrypt) as P);
    }

    return this.contents.get(username);
  }

  /**
   * Return the contents of all the auth files from cache. The `read` or `readAll` methods must be called first in order to populate the cache.
   *
   * @param decrypt if true, decrypt encrypted values
   * @returns
   */
  public getAll(decrypt = false): P[] {
    return [...this.configs.keys()].map((username) => this.get(username, decrypt)).filter((org) => !isEmpty(org));
  }

  /**
   * Returns true if the username has been cached.
   *
   * @param username
   */
  public has(username: string): boolean {
    return this.contents.has(username);
  }

  /**
   * Returns true if there is an auth file for the given username. The `read` or `readAll` methods must be called first in order to populate the cache.
   *
   * @param username
   */
  public async exists(username: string): Promise<boolean> {
    const config = this.configs.get(username);
    return config ? config.exists() : false;
  }

  /**
   * Return the file stats for a given userame's auth file.
   *
   * @param username
   */
  public async stat(username: string): Promise<Nullable<fs.Stats>> {
    const config = this.configs.get(username);
    return config ? config.stat() : null;
  }

  /**
   * Returns true if there is an auth file for the given username
   *
   * @param username
   */
  public async hasFile(username: string): Promise<boolean> {
    try {
      await fs.promises.access(this.parseFilename(username));
      return true;
    } catch {
      this.logger.debug(`No auth file found for ${username}`);
      return false;
    }
  }

  /**
   * Return all auth files under the global state directory.
   */
  public async list(): Promise<string[]> {
    return this.getAllFiles();
  }

  /**
   * Set the contents for a given username.
   *
   * @param username
   * @param org
   */
  public set(username: string, org: P): void {
    const config = this.configs.get(username);
    if (config) {
      entriesOf(org).map(([key, value]) => config.set(key, value));
      if (!config.has('username')) {
        config.set('username', username);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      org.username ??= username;
      this.contents.set(username, org);
    }
  }

  /**
   * Update the contents for a given username.
   *
   * @param username
   * @param org
   */
  public update(username: string, org: Partial<P>): void {
    const existing = this.get(username) || {};
    const merged = Object.assign({}, existing, org) as P;
    return this.set(username, merged);
  }

  /**
   * Delete the auth file for a given username.
   *
   * @param username
   */
  public async remove(username: string): Promise<void> {
    await this.configs.get(username)?.unlink();
    this.configs.delete(username);
    this.contents.delete(username);
  }

  /**
   * Write the contents of the auth file for a given username.
   *
   * @param username
   */
  public async write(username: string): Promise<Nullable<P>> {
    const config = this.configs.get(username);
    if (config) {
      return (await config.write()) as P;
    } else {
      const contents = this.contents.get(username) ?? {};
      await this.read(username, false, false);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const readConfig = this.configs.get(username)!;
      readConfig.setContentsFromObject(contents);
      return (await readConfig.write()) as P;
    }
  }

  protected async init(): Promise<void> {
    this.logger = await Logger.child(this.constructor.name);
  }

  private async getAllFiles(): Promise<string[]> {
    const regex = this.getFileRegex();
    try {
      return (await fs.promises.readdir(Global.DIR)).filter((file) => regex.test(file));
    } catch {
      return [];
    }
  }

  private parseUsername(filename: string): string {
    return filename.replace(this.getFileExtension(), '');
  }

  private parseFilename(username: string): string {
    return path.join(Global.DIR, `${username}${this.getFileExtension()}`);
  }

  protected abstract initAuthFile(username: string, throwOnNotFound?: boolean): Promise<T>;
  protected abstract getFileRegex(): RegExp;
  protected abstract getFileExtension(): string;
}

export class OrgAccessor extends BaseOrgAccessor<AuthInfoConfig, AuthFields> {
  // eslint-disable-next-line class-methods-use-this
  protected async initAuthFile(username: string, throwOnNotFound = false): Promise<AuthInfoConfig> {
    return AuthInfoConfig.create({
      ...AuthInfoConfig.getOptions(username),
      throwOnNotFound,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  protected getFileRegex(): RegExp {
    // The regular expression that filters files stored in $HOME/.sfdx
    return /^[^.][^@]*@[^.]+(\.[^.\s]+)+\.json$/;
  }

  // eslint-disable-next-line class-methods-use-this
  protected getFileExtension(): string {
    return '.json';
  }
}
