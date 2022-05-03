/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { basename, extname, join } from 'path';
import * as fs from 'fs';
import { parseJson, set } from '@salesforce/kit';
import { ensureString, isPlainObject } from '@salesforce/ts-types';
import { Global } from '../global';
import { ConfigFile } from '../config/configFile';
import { deepCopy } from '../util/utils';
import { SandboxOrgConfig } from '../config/sandboxOrgConfig';
import { GlobalInfo } from './globalInfoConfig';
import { SfInfo, SfInfoKeys, SfOrg, SfOrgs, SfSandbox, SfSandboxes } from './types';

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
  /* A handler's migrate function should take data from sfdx config files
   * and return it reshaped into the new sf config format
   */
  migrate: () => Promise<Pick<SfInfo, T>>;
  write: (latest: SfInfo, original: SfInfo) => Promise<void>;
}

interface Changes<T> {
  changed: T;
  deleted: string[];
}

export class SfdxDataHandler {
  public handlers = [new AuthHandler(), new AliasesHandler(), new SandboxesHandler()];
  private original!: SfInfo;

  public async write(latest: SfInfo = GlobalInfo.emptyDataModel): Promise<void> {
    await Promise.all(this.handlers.map((handler) => handler.write(latest, this.original)));
    this.setOriginal(latest);
  }

  public async merge(sfData: SfInfo = GlobalInfo.emptyDataModel): Promise<SfInfo> {
    let merged = deepCopy<SfInfo>(sfData);
    for (const handler of this.handlers) {
      merged = Object.assign(merged, await handler.merge(merged));
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
        if (isPlainObject(a) && isPlainObject(b)) return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1;
        return 0;
      });
      set(merged, `${key}["${k}"]`, Object.assign({}, older, newer));
    }

    // Keys that exist in .sfdx but not .sf are added because we assume
    // that this means the key was created using sfdx.
    // However, this is not always a valid assumption because it could
    // also mean that the key was deleted using sf, in which case we
    // do not want to migrate the sfdx key to sf.
    // Programmatically differentiating between a new key and a deleted key
    // would be nearly impossible. Instead, we should ensure that whenever
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
    await Promise.all(
      Object.entries(changed)
        .filter(([, authData]) => authData)
        .map(async ([username, authData]) => {
          const config = await this.createAuthFileConfig(username);
          config.setContentsFromObject(authData);
          return config.write();
        })
    );

    await Promise.all(
      deleted.map(async (username) => {
        const config = await this.createAuthFileConfig(username);
        return config.unlink();
      })
    );
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
    const deleted: string[] = Object.keys(originalAuths).filter((username) => !latestAuths[username]);

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
    const globalFiles = await fs.promises.readdir(Global.SFDX_DIR);
    return globalFiles.filter((file) => file.match(AuthHandler.authFilenameFilterRegEx));
  }

  public async listAllAuthorizations(): Promise<SfOrg[]> {
    const filenames = await this.listAllAuthFiles();
    return Promise.all(
      filenames
        .map((f) => basename(f, extname(f)))
        .map(async (username) => {
          const configFile = await this.createAuthFileConfig(username);
          const contents = configFile.getContents() as SfOrg;
          const stat = await configFile.stat();
          return { ...contents, timestamp: stat.mtime.toISOString() };
        })
    );
  }
}

export class AliasesHandler extends BaseHandler<SfInfoKeys.ALIASES> {
  private static SFDX_ALIASES_FILENAME = 'alias.json';

  public sfKey: typeof SfInfoKeys.ALIASES = SfInfoKeys.ALIASES;

  public async migrate(): Promise<Pick<SfInfo, SfInfoKeys.ALIASES>> {
    const aliasesFilePath = join(Global.SFDX_DIR, AliasesHandler.SFDX_ALIASES_FILENAME);
    try {
      const x = await fs.promises.readFile(aliasesFilePath, 'utf8');
      const sfdxAliases = (parseJson(x) as Record<'orgs', Record<string, string>>).orgs;
      return { [this.sfKey]: { ...sfdxAliases } };
    } catch (e) {
      return { [this.sfKey]: {} };
    }
  }

  // AliasesHandler implements its own merge method because the structure of aliases is flat instead of nested by SfInfoKey types.
  public async merge(sfData: SfInfo = GlobalInfo.emptyDataModel): Promise<Partial<SfInfo>> {
    const sfdxAliases: Record<string, string> = (await this.migrate())[SfInfoKeys.ALIASES];
    const merged = deepCopy<SfInfo>(sfData);

    /* Overwrite `sf` aliases with `sfdx` aliases
     *  `sf` will always modify `sfdx` files but `sfdx` won't modify `sf` files
     *  because of this we can assume that any changes in `sfdx` files that aren't
     *  in `sf` are the latest data
     *
     *  This breaks down if a user of `sf` manually modifies the `~/.sf/sf.json` file
     *  but we don't support that use case out-of-the-box (yet?)
     *
     *  Note: See also the explanation on the merge method in the BaseHandler class
     */
    Object.keys(sfdxAliases).forEach((alias) => {
      merged[SfInfoKeys.ALIASES][alias] = sfdxAliases[alias];
    });

    /* Delete any aliases that don't exist in sfdx config files
     *  Aliases that exist in .sf but not .sfdx are deleted because we assume
     *  that this means the alias was deleted while using sfdx. We can make
     *  this assumption because keys that are created by sf will always be
     *  migrated back to sfdx.
     *
     *  Note: See also the explanation on the merge method in the BaseHandler class
     */
    for (const alias in merged[SfInfoKeys.ALIASES]) {
      if (!sfdxAliases[alias]) delete merged[SfInfoKeys.ALIASES][alias];
    }

    return merged;
  }

  public async write(latest: SfInfo): Promise<void> {
    const aliasesFilePath = join(Global.SFDX_DIR, AliasesHandler.SFDX_ALIASES_FILENAME);
    await fs.promises.writeFile(aliasesFilePath, JSON.stringify({ orgs: latest[SfInfoKeys.ALIASES] }, null, 2));
  }
}

export class SandboxesHandler extends BaseHandler<SfInfoKeys.SANDBOXES> {
  // The regular expression that filters files stored in $HOME/.sfdx
  private static sandboxFilenameFilterRegEx = /^(00D.*?)\.sandbox\.json$/;
  public sfKey: typeof SfInfoKeys.SANDBOXES = SfInfoKeys.SANDBOXES;

  public async merge(sfData: SfInfo = GlobalInfo.emptyDataModel): Promise<Partial<SfInfo>> {
    const sfdxData = await this.migrate();
    const merged = deepCopy<SfInfo>(sfData);

    // Only merge the key this handler is responsible for.
    const key = this.sfKey;

    const sfKeys = Object.keys(sfData[key] ?? {});
    const sfdxKeys = Object.keys(sfdxData[key] ?? {});

    // sandbox entries for .sf and .sfdx contain static data. Given there
    // can be no mutation during the life of the sandbox, having to merge common keys
    // is unnecessary.

    // Keys that exist in .sfdx but not .sf are added because we assume
    // that this means the key was created using sfdx.
    // However, this is not always a valid assumption because it could
    // also mean that the key was deleted using sf, in which case we
    // do not want to migrate the sfdx key to sf.
    // Programmatically differentiating between a new key and a deleted key
    // would be nearly impossible. Instead, we should ensure that whenever
    // sf deletes a key it also deletes it in sfdx. This way, we can safely
    // assume that we should migrate any keys that exist in .sfdx
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

  public async migrate(): Promise<Pick<SfInfo, SfInfoKeys.SANDBOXES>> {
    const oldSandboxes = await this.listAllSandboxes();
    const newSandboxes = Object.fromEntries(oldSandboxes.map((old) => [old.sandboxOrgId, old]));
    return { [this.sfKey]: newSandboxes };
  }

  public async write(latest: SfInfo, original: SfInfo): Promise<void> {
    const { changed, deleted } = await this.findChanges(latest, original);
    for (const sandboxData of Object.values(changed)) {
      if (sandboxData) {
        const orgId = sandboxData.sandboxOrgId;
        const sandboxConfig = new SandboxOrgConfig(SandboxOrgConfig.getOptions(orgId));
        sandboxConfig.set(SandboxOrgConfig.Fields.PROD_ORG_USERNAME, sandboxData.prodOrgUsername);
        await sandboxConfig.write();
      }
    }

    for (const username of deleted) {
      const originalSandbox = original.sandboxes[username];
      const orgId = originalSandbox.sandboxOrgId;
      const sandboxConfig = new SandboxOrgConfig(SandboxOrgConfig.getOptions(orgId));
      await sandboxConfig.unlink();
    }
  }

  public async listAllSandboxFiles(): Promise<string[]> {
    const globalFiles = await fs.promises.readdir(Global.SFDX_DIR);
    return globalFiles.filter((file) => file.match(SandboxesHandler.sandboxFilenameFilterRegEx));
  }

  public async listAllSandboxes(): Promise<SfSandbox[]> {
    return Promise.all(
      (await this.listAllSandboxFiles()).map(async (filename) => {
        const matches = filename.match(SandboxesHandler.sandboxFilenameFilterRegEx);
        const orgId = matches ? matches[1] : '';
        const sandboxConfig = new SandboxOrgConfig(SandboxOrgConfig.getOptions(orgId));
        const stat = await sandboxConfig.stat();
        const contents = { ...(await sandboxConfig.read(true)), sandboxOrgId: orgId } as SfSandbox;
        const sandbox = Object.assign(contents, { timestamp: stat.mtime.toISOString() });
        return sandbox;
      })
    );
  }

  private async findChanges(latest: SfInfo, original: SfInfo): Promise<Changes<SfSandboxes>> {
    const latestSandboxes = latest.sandboxes;
    const originalSandboxes = original.sandboxes;
    const changed: SfSandboxes = {};
    for (const [sandboxOrgId, sandbox] of Object.entries(latestSandboxes)) {
      const originalSandbox = originalSandboxes[sandboxOrgId] ?? {};
      if (!isEqual(sandbox, originalSandbox)) {
        changed[sandboxOrgId] = sandbox;
      }
    }
    const deleted: string[] = Object.keys(originalSandboxes).filter((sandboxOrgId) => !latestSandboxes[sandboxOrgId]);

    return { changed, deleted };
  }
}
