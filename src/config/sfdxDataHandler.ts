/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { basename, extname } from 'path';
import { set } from '@salesforce/kit';
import { ensureString } from '@salesforce/ts-types';
import { Global } from '../global';
import { fs } from '../util/fs';
import { ConfigFile } from './configFile';
import { SfOrgs, SfOrg, deepCopy, GlobalInfo, SfInfo, SfInfoKeys } from './globalInfoConfig';

function isEqual(object1: Record<string, unknown>, object2: Record<string, unknown>): boolean {
  const keys1 = Object.keys(object1).filter((k) => k !== 'timestamp');
  const keys2 = Object.keys(object2).filter((k) => k !== 'timestamp');

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (object1[key] !== object2[key]) return false;
  }

  return true;
}

interface Handler<T extends SfInfoKeys> {
  sfKey: T;
  merge: (sfData: SfInfo) => Promise<Partial<SfInfo>>;
  migrate: () => Promise<Pick<SfInfo, T>>;
  write: (latest: SfInfo, original: SfInfo) => Promise<void>;
}

interface Changes<T> {
  changed: T;
  deleted: string[];
}

export class SfdxDataHandler {
  public handlers = [new AuthHandler()];
  private original!: SfInfo;

  public async write(latest: SfInfo = GlobalInfo.emptyDataModel): Promise<void> {
    for (const handler of this.handlers) {
      await handler.write(latest, this.original);
      this.setOriginal(latest);
    }
  }

  public async merge(sfData: SfInfo = GlobalInfo.emptyDataModel): Promise<SfInfo> {
    const merged = deepCopy<SfInfo>(sfData);
    for (const handler of this.handlers) {
      Object.assign(merged, await handler.merge(merged));
    }
    this.setOriginal(merged);
    return merged;
  }

  private setOriginal(data: SfInfo): void {
    this.original = deepCopy<SfInfo>(data);
  }
}

abstract class BaseHandler<T extends SfInfoKeys> implements Handler<T> {
  public abstract sfKey: T;

  public async merge(sfData: SfInfo = GlobalInfo.emptyDataModel): Promise<Partial<SfInfo>> {
    const sfdxData = await this.migrate();
    const merged = deepCopy<SfInfo>(sfData);

    // Only merge the key this handler is responsible for.
    const key = this.sfKey;

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
    // Programmatically differentiating between a new key and a deleted key
    // would be nearly impossible. Instead we should ensure that whenever
    // sf deletes a key it also deletes it in sfdx. This way, we can safely
    // assume that we should migrate any keys that exist in in .sfdx
    const unhandledSfdxKeys = sfdxKeys.filter((k) => !sfKeys.includes(k));
    for (const k of unhandledSfdxKeys) {
      set(merged, `${key}["${k}"]`, sfdxData[key][k]);
    }

    // Keys that exist in .sf but not .sfdx are deleted because we assume
    // that this means the key was deleted while using sfdx.
    // We can make this assumption because keys that are created by sf will
    // always be migrated back to sfdx
    const unhandledSfKeys = sfKeys.filter((k) => !sfdxKeys.includes(k));
    for (const k of unhandledSfKeys) {
      delete merged[key][k];
    }

    return merged;
  }

  public abstract migrate(): Promise<Pick<SfInfo, T>>;
  public abstract write(latest: SfInfo, original: SfInfo): Promise<void>;
}

export class AuthHandler extends BaseHandler<SfInfoKeys.ORGS> {
  // The regular expression that filters files stored in $HOME/.sfdx
  private static authFilenameFilterRegEx = /^[^.][^@]*@[^.]+(\.[^.\s]+)+\.json$/;

  public sfKey: typeof SfInfoKeys.ORGS = SfInfoKeys.ORGS;

  public async migrate(): Promise<Pick<SfInfo, SfInfoKeys.ORGS>> {
    const oldAuths = await this.listAllAuthorizations();
    const newAuths = oldAuths.reduce((x, y) => Object.assign(x, { [ensureString(y.username)]: y }), {} as SfOrgs);
    return { [this.sfKey]: newAuths };
  }

  public async write(latest: SfInfo, original: SfInfo): Promise<void> {
    const { changed, deleted } = await this.findChanges(latest, original);
    for (const [username, authData] of Object.entries(changed)) {
      if (authData) {
        const config = await this.createAuthFileConfig(username);
        config.setContentsFromObject(authData);
        await config.write();
      }
    }

    for (const username of deleted) {
      const config = await this.createAuthFileConfig(username);
      await config.unlink();
    }
  }

  public async findChanges(latest: SfInfo, original: SfInfo): Promise<Changes<SfOrgs>> {
    const latestAuths = latest.orgs;
    const originalAuths = original.orgs;
    const changed: SfOrgs = {};
    for (const [username, auth] of Object.entries(latestAuths)) {
      const originalAuth = originalAuths[username] ?? {};
      if (!isEqual(auth, originalAuth)) {
        changed[username] = auth;
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

  public async createAuthFileConfig(username: string): Promise<ConfigFile<ConfigFile.Options>> {
    const config = await ConfigFile.create({
      filename: `${username}.json`,
      isGlobal: true,
      isState: true,
      stateFolder: Global.SFDX_STATE_FOLDER,
      throwOnNotFound: false,
      encryptedKeys: ['accessToken', 'refreshToken', 'password', 'clientSecret'],
    });
    return config;
  }

  public async listAllAuthFiles(): Promise<string[]> {
    const globalFiles = await fs.readdir(Global.SFDX_DIR);
    return globalFiles.filter((file) => file.match(AuthHandler.authFilenameFilterRegEx));
  }

  public async listAllAuthorizations(): Promise<SfOrg[]> {
    const filenames = await this.listAllAuthFiles();
    const auths: SfOrg[] = [];
    for (const filename of filenames) {
      const username = basename(filename, extname(filename));
      const configFile = await this.createAuthFileConfig(username);
      const contents = configFile.getContents() as SfOrg;
      const stat = await configFile.stat();
      const auth = Object.assign(contents, { timestamp: stat.mtime.toISOString() });
      auths.push(auth);
    }
    return auths;
  }
}
