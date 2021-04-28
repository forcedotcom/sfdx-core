/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { basename, extname } from 'path';
import { isEmpty, set } from '@salesforce/kit';
import { ensureString } from '@salesforce/ts-types';
import { Authorization } from '../authInfo';
import { Global } from '../global';
import { SfdxError, SfdxErrorConfig } from '../sfdxError';
import { fs } from '../util/fs';
import { ConfigFile } from './configFile';
import { Authorizations, GlobalInfo, SfData, SfDataKeys } from './globalInfoConfig';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const deepcopy = require('deepcopy');

function isEqual(object1: Record<string, unknown>, object2: Record<string, unknown>): boolean {
  const keys1 = Object.keys(object1).filter((k) => k !== 'timestamp');
  const keys2 = Object.keys(object2).filter((k) => k !== 'timestamp');

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (object1[key] !== object2[key]) return false;
  }

  return true;
}

interface Handler<T extends SfDataKeys> {
  sfKey: T;
  migrate: () => Promise<Pick<SfData, T>>;
  write: (latest: SfData, original: SfData) => Promise<void>;
}

interface Changes<T> {
  changed: T;
  deleted: string[];
}

export class SfdxDataHandler {
  private original!: SfData;

  private handlers = [new AuthHandler()];

  public async write(latest: SfData): Promise<void> {
    for (const handler of this.handlers) {
      await handler.write(latest, this.original);
    }
  }

  public async merge(sfData: SfData): Promise<SfData> {
    const sfdxData = await this.load();
    const merged = deepcopy(sfData) as SfData;
    const keys = Object.keys(sfData) as SfDataKeys[];
    for (const key of keys) {
      const sfKeys = Object.keys(sfData[key] ?? {});
      const sfdxKeys = Object.keys(sfdxData[key] ?? {});
      const commonKeys = sfKeys.filter((k) => sfdxKeys.includes(k));
      for (const k of commonKeys) {
        const [newer, older] = [sfData[key][k], sfdxData[key][k]].sort((a, b) => {
          return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1;
        });
        set(merged, `${key}["${k}"]`, Object.assign({}, older, newer));
      }

      // Keys that exist in .sfdx but not .sf are added becase we assume
      // that this means the key was created using sfdx.
      // However, this is not always a valid assumption because it could
      // also mean that the key was deleted using sf, in which case we
      // do not want to migrate the sfdx key to sf.
      // Programmatically differentiating between a new key and deleted key
      // would be nearly impossible. Instead we should ensure that whenever
      // sf deletes a key it also deletes it in sfdx. This way, we can safely
      // assume that we should migrate any keys that exist in in .sfdx
      const unhandledSfdxKeys = sfdxKeys.filter((k) => !sfKeys.includes(k));
      for (const k of unhandledSfdxKeys) {
        set(merged, `${key}["${k}"]`, sfdxData[key][k]);
      }

      // Keys that exist in .sf but not .sfdx are deleted because we assume
      // that this means the key was deleted while using sfdx.
      const unhandledSfKeys = sfKeys.filter((k) => !sfdxKeys.includes(k));
      for (const k of unhandledSfKeys) {
        delete merged[key][k];
      }
    }
    this.setOriginal(merged);
    return merged;
  }

  private async load(): Promise<SfData> {
    return this.handlers.reduce(
      async (data, handler) => Object.assign({}, data, await handler.migrate()),
      Promise.resolve(GlobalInfo.EMPTY_DATA_MODEL)
    );
  }

  private setOriginal(data: SfData): void {
    this.original = deepcopy(data);
  }
}

export class AuthHandler implements Handler<SfDataKeys.AUTHORIZATIONS> {
  // The regular expression that filters files stored in $HOME/.sfdx
  private static authFilenameFilterRegEx = /^[^.][^@]*@[^.]+(\.[^.\s]+)+\.json$/;

  public sfKey: typeof SfDataKeys.AUTHORIZATIONS = SfDataKeys.AUTHORIZATIONS;

  public async migrate(): Promise<Pick<SfData, SfDataKeys.AUTHORIZATIONS>> {
    const auths = await this.listAllAuthorizations();
    const environments = auths.reduce(
      (x, y) => Object.assign(x, { [ensureString(y.username)]: y }),
      {} as Authorizations
    );
    return { [this.sfKey]: environments };
  }

  public async write(latest: SfData, original: SfData): Promise<void> {
    const { changed, deleted } = await this.findChanges(latest, original);
    for (const [username, authData] of Object.entries(changed)) {
      const config = await this.createAuthFileConfig(username);
      config.setContentsFromObject(authData);
      await config.write();
    }

    for (const username of deleted) {
      const config = await this.createAuthFileConfig(username);
      await config.unlink();
    }
  }

  public async findChanges(latest: SfData, original: SfData): Promise<Changes<Authorizations>> {
    const latestAuths = latest.authorizations;
    const originalAuths = original.authorizations;
    const changed: Authorizations = {};
    for (const [username, env] of Object.entries(latestAuths)) {
      const originalEnv = originalAuths[username] ?? {};
      if (!isEqual(env, originalEnv)) {
        changed[username] = env;
      }
    }
    const deleted: string[] = [];
    for (const username of Object.keys(originalAuths)) {
      if (!latestAuths[username]) {
        deleted.push(username);
      }
    }

    return { changed, deleted };
  }

  private async createAuthFileConfig(username: string): Promise<ConfigFile<ConfigFile.Options>> {
    const config = await ConfigFile.create({
      filename: `${username}.json`,
      isGlobal: true,
      isState: true,
      stateFolder: Global.SFDX_STATE_FOLDER,
      throwOnNotFound: false,
    });
    return config;
  }

  private async listAllAuthFiles(): Promise<string[]> {
    const globalFiles = await fs.readdir(Global.SFDX_DIR);
    const authFiles = globalFiles.filter((file) => file.match(AuthHandler.authFilenameFilterRegEx));

    // Want to throw a clean error if no files are found.
    if (isEmpty(authFiles)) {
      const errConfig: SfdxErrorConfig = new SfdxErrorConfig('@salesforce/core', 'core', 'NoAuthInfoFound');
      throw SfdxError.create(errConfig);
    }

    // At least one auth file is in the global dir.
    return authFiles;
  }

  private async listAllAuthorizations(): Promise<Authorization[]> {
    const filenames = await this.listAllAuthFiles();

    const auths: Authorization[] = [];
    for (const filename of filenames) {
      const username = basename(filename, extname(filename));
      const configFile = await this.createAuthFileConfig(username);
      const contents = configFile.getContents() as Authorization;
      const stat = await configFile.stat();
      const auth = Object.assign(contents, { timestamp: stat.mtime.toISOString() });
      auths.push(auth);
    }
    return auths;
  }
}
