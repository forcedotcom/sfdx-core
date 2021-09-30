/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
import * as os from 'os';
import * as util from 'util';
import * as path from 'path';
import { promises as fs } from 'fs';

// Thirdparty

// import { UX } from '@salesforce/command';
// import * as jsToXml from 'js2xmlparser';
import { Messages, SfdxError, Logger } from '@salesforce/core';
// import { has } from 'lodash';
import { get, getObject, JsonMap, ensureString, Nullable } from '@salesforce/ts-types';
import { set, isEmpty, env } from '@salesforce/kit';
import { ComponentSet, ComponentStatus } from '@salesforce/source-deploy-retrieve';
import getApiVersion from './config/getApiVersion';
// import { Config } from '../../lib/core/configApi';
// import { writeJSONasXML } from '../core/jsonXmlTools';
import { writeJSONasXML } from './util/jsonXmlTools';
import OrgPrefRegistry = require('./orgPrefRegistry');
// const js2xmlparser = require('js2xmlparser');

Messages.importMessagesDirectory(__dirname);
const orgSettingsMessages: Messages = Messages.loadMessages('salesforce-alm', 'org_settings');

interface ObjectSetting extends JsonMap {
  sharingModel?: string;
  defaultRecordType?: string;
}

/**
 * Helper class for dealing with the settings that are defined in a scratch definition file.  This class knows how to extract the
 * settings from the definition, how to expand them into a MD directory and how to generate a package.xml.
 */
export default class SettingsGenerator {
  private settingData: Nullable<Record<string, unknown>>;
  private objectSettingsData: Nullable<{ [objectName: string]: ObjectSetting }>;
  private currentApiVersion = ensureString(getApiVersion());
  private logger: Logger;

  public constructor() {
    this.logger = Logger.childFromRoot('SettingsGenerator');
  }

  /** extract the settings from the scratch def file, if they are present. */
  public async extract(scratchDef: Record<string, unknown>, apiVersion?: number): Promise<void> {
    this.logger.debug('extracting settings from scratch definition file');
    if (!apiVersion) {
      apiVersion = parseFloat(this.currentApiVersion);
    }
    if (apiVersion >= 47.0 && this.orgPreferenceSettingsMigrationRequired(scratchDef)) {
      await this.extractAndMigrateSettings(scratchDef);
    } else {
      this.settingData = getObject(scratchDef, 'settings');
      this.objectSettingsData = getObject(scratchDef, 'objectSettings');
    }

    this.logger.debug('settings are', this.settingData);
    // TODO, this is where we will validate the settings.
    // See W-5068155
    // if (this.hasSettings()) {  }
  }

  /** True if we are currently tracking setting or object setting data. */
  public hasSettings() {
    return !(isEmpty(this.settingData) && isEmpty(this.objectSettingsData));
  }

  /** Check to see if the scratchDef contains orgPreferenceSettings
   *  orgPreferenceSettings are no longer supported after api version 46.0
   */
  public orgPreferenceSettingsMigrationRequired(scratchDef) {
    return !(
      util.isNullOrUndefined(scratchDef) ||
      util.isNullOrUndefined(scratchDef.settings) ||
      util.isNullOrUndefined(scratchDef.settings.orgPreferenceSettings)
    );
  }

  /** This will copy all of the settings in the scratchOrgInfo orgPreferences mapping into the settings structure.
   *  It will also spit out a warning about the pending deprecation og the orgPreferences structure.
   *  This returns a failure message in the promise upon critical error for api versions after 46.0.
   *  For api versions less than 47.0 it will return a warning.
   */
  public async migrate(scratchDef, apiVersion?): Promise<void> {
    // Make sure we have old style preferences
    if (!scratchDef.orgPreferences) {
      return;
    }

    if (util.isNullOrUndefined(apiVersion)) {
      apiVersion = this.currentApiVersion;
    }

    // First, let's map the old style tooling preferences into MD-API preferences
    this.settingData = {};

    const ux = await UX.create();

    function lhccmdt(mdt) {
      // lowercase head camel case metadata type
      return util.isNullOrUndefined(mdt) ? mdt : mdt.substring(0, 1).toLowerCase() + mdt.substring(1);
    }

    function storePrefs(data, pref, prefVal) {
      const orgPrefApi = lhccmdt(OrgPrefRegistry.whichApi(pref, apiVersion));
      if (util.isNullOrUndefined(orgPrefApi)) {
        ux.warn(`Unsupported org preference: ${pref}, ignored`);
        return;
      }

      const mdApiName = lhccmdt(OrgPrefRegistry.forMdApi(pref, apiVersion));

      if (!has(data, orgPrefApi)) {
        set(data, orgPrefApi, {});
      }
      const apiOrgPrefs: object = getObject(data, orgPrefApi);
      set(apiOrgPrefs, mdApiName, prefVal);
    }

    if (scratchDef.orgPreferences.enabled) {
      scratchDef.orgPreferences.enabled.forEach((pref) => {
        storePrefs(this.settingData, pref, true);
      });
    }
    if (scratchDef.orgPreferences.disabled) {
      scratchDef.orgPreferences.disabled.forEach((pref) => {
        storePrefs(this.settingData, pref, false);
      });
    }
    // It would be nice if cli.ux.styledJSON could return a colorized JSON string instead of logging to stdout.
    const message = orgSettingsMessages.getMessage(
      apiVersion >= 47.0 ? 'deprecatedPrefFormat' : 'deprecatedPrefFormatLegacy',
      [
        JSON.stringify({ orgPreferences: scratchDef.orgPreferences }, null, 4),
        JSON.stringify({ settings: this.settingData }, null, 4),
      ]
    );
    if (apiVersion >= 47.0) {
      throw new Error(message);
    } else {
      ux.warn(message);
    }
    // No longer need these
    delete scratchDef.orgPreferences;
  }

  /** This method converts all orgPreferenceSettings preferences into their respective
   *  org settings objects.
   */
  public async extractAndMigrateSettings(scratchDef): Promise<void> {
    const oldScratchDef = JSON.stringify({ settings: scratchDef.settings }, null, 4);

    // Make sure we have old style preferences
    if (!this.orgPreferenceSettingsMigrationRequired(scratchDef)) {
      this.settingData = getObject(scratchDef, 'settings');
      return;
    }
    // First, let's map the old style tooling preferences into MD-API preferences
    this.settingData = {};

    const ux = await UX.create();
    function storePrefs(data, pref, prefVal): boolean {
      let mdApiName = OrgPrefRegistry.newPrefNameForOrgSettingsMigration(pref);
      if (util.isNullOrUndefined(mdApiName)) {
        mdApiName = pref;
      }
      const orgPrefApi = OrgPrefRegistry.whichApiFromFinalPrefName(mdApiName);
      if (util.isNullOrUndefined(orgPrefApi)) {
        ux.warn(`Unknown org preference: ${pref}, ignored.`);
        return false;
      }

      if (OrgPrefRegistry.isMigrationDeprecated(orgPrefApi)) {
        ux.warn(`The setting "${pref}" is no longer supported as of API version 47.0`);
        return false;
      }

      if (!has(data, orgPrefApi)) {
        set(data, orgPrefApi, {});
      }
      const apiOrgPrefs = getObject(data, orgPrefApi);

      // check to see if the value is already set
      set(apiOrgPrefs, mdApiName, prefVal);

      return orgPrefApi != OrgPrefRegistry.ORG_PREFERENCE_SETTINGS;
    }

    const orgPreferenceSettings = getObject(scratchDef, 'settings.orgPreferenceSettings');
    delete scratchDef.settings.orgPreferenceSettings;
    this.settingData = getObject(scratchDef, 'settings');

    let migrated = false;
    for (const preference in orgPreferenceSettings) {
      if (storePrefs(this.settingData, preference, orgPreferenceSettings[preference])) {
        migrated = true;
      }
    }

    // Since we could have recommended some preferences that are still in OPS, only warn if any actually got moved there
    if (migrated) {
      // It would be nice if cli.ux.styledJSON could return a colorized JSON string instead of logging to stdout.
      const message = orgSettingsMessages.getMessage('migratedPrefFormat', [
        oldScratchDef,
        JSON.stringify({ settings: this.settingData }, null, 4),
      ]);
      ux.warn(message);
    }
  }

  /** Create temporary deploy directory used to upload the scratch org shape.
   * This will create the dir, all of the .setting files and minimal object files needed for objectSettings
   */
  public async createDeployDir() {
    // Base dir for deployment is always the os.tmpdir().
    const shapeDirName = `shape_${Date.now()}`;
    const destRoot = path.join(os.tmpdir(), shapeDirName);
    const settingsDir = path.join(destRoot, 'settings');
    const objectsDir = path.join(destRoot, 'objects');

    try {
      await fs.mkdir(settingsDir);
      await fs.mkdir(objectsDir);
    } catch (e) {
      // If directory creation failed, the root dir probably doesn't exist, so we're fine
      this.logger.debug('caught error:', e);
    }

    await Promise.all([this.writeSettingsIfNeeded(settingsDir), this.writeObjectSettingsIfNeeded(objectsDir)]);

    // If SFDX_MDAPI_TEMP_DIR is set, copy settings to that dir for people to inspect.
    const mdapiTmpDir = env.getString('SFDX_MDAPI_TEMP_DIR');
    if (mdapiTmpDir) {
      const tmpDir = path.join(mdapiTmpDir, shapeDirName);
      this.logger.debug(`Copying settings to: ${tmpDir}`);
      await fs.copyFile(destRoot, tmpDir);
    }

    return destRoot;
  }

  /**
   * Deploys the settings to the org.
   */
  public async deploySettingsViaFolder(username: string, sourceFolder: string): Promise<void> {
    this.logger.debug(`deploying settings from ${sourceFolder}`);

    const componentSet = ComponentSet.fromSource(sourceFolder);
    const deploy = await componentSet.deploy({ usernameOrConnection: username });

    // Wait for polling to finish and get the DeployResult object
    const result = await deploy.pollStatus();
    // display errors if any
    const errors = result.getFileResponses().filter((fileResponse) => {
      fileResponse.state === ComponentStatus.Failed;
    });

    if (errors.length > 0) {
      ux.styledHeader(`Component Failures [${errors.length}]`);
      ux.table(errors, {
        columns: [
          { key: 'problemType', label: 'Type' },
          { key: 'fullName', label: 'Name' },
          { key: 'error', label: 'Problem' },
        ],
      });
    }
    if (result.response.status === 'Failed') {
      throw new SfdxError(
        `A scratch org was created with username ${username}, but the settings failed to deploy`,
        'ProblemDeployingSettings',
        errors.map((e) => `${e.fullName}: ${e.filePath} | ${e.state === ComponentStatus.Failed ? e.error : ''}`)
      );
    }
  }

  private async writeObjectSettingsIfNeeded(objectsDir: string) {
    if (!this.objectSettingsData) {
      return;
    }
    await fs.mkdir(objectsDir);
    // TODO: parallelize all this FS for perf
    for (const objectName of Object.keys(this.objectSettingsData)) {
      const value = this.objectSettingsData[objectName];
      // writes the object file in source format
      const objectDir = path.join(objectsDir, this.cap(objectName));
      await fs.mkdir(objectDir);
      await writeJSONasXML({
        path: path.join(objectDir, `${this.cap(objectName)}.object-meta.xml`),
        type: 'CustomObject',
        json: this.createObjectFileContent(value),
      });
      if (value.defaultRecordType) {
        const recordTypesDir = path.join(objectDir, 'recordTypes');
        await fs.mkdir(recordTypesDir);
        const RTFileContent = this.createRecordTypeFileContent(objectName, value);
        await writeJSONasXML({
          path: path.join(recordTypesDir, `${this.cap(value.defaultRecordType)}.recordType-meta.xml`),
          type: 'RecordType',
          json: RTFileContent,
        });
        // for things that required a businessProcess
        if (RTFileContent.businessProcess) {
          await fs.mkdir(path.join(objectDir, 'businessProcesses'));
          await writeJSONasXML({
            path: path.join(
              objectDir,
              'businessProcesses',
              `${RTFileContent.businessProcess}.businessProcess-meta.xml`
            ),
            type: 'BusinessProcess',
            json: this.createBusinessProcessFileContent(objectName, RTFileContent.businessProcess),
          });
        }
      }
    }
  }

  private async writeSettingsIfNeeded(settingsDir: string) {
    if (this.settingData) {
      await fs.mkdirp(settingsDir);
      for (const item of Object.keys(this.settingData)) {
        const value: object = getObject(this.settingData, item);
        const typeName = this.cap(item);
        const fname = typeName.replace('Settings', '');
        const fileContent = this._createSettingsFileContent(typeName, value);
        await fs.writeFile(path.join(settingsDir, fname + '.settings-meta.xml'), fileContent);
      }
    }
  }

  public _createSettingsFileContent(name, json) {
    if (name == 'OrgPreferenceSettings') {
      // this is a stupid format
      let res = `<?xml version="1.0" encoding="UTF-8"?>
<OrgPreferenceSettings xmlns="http://soap.sforce.com/2006/04/metadata">
`;
      res += Object.keys(json)
        .map(
          (pref) =>
            `    <preferences>
        <settingName>` +
            this.cap(pref) +
            `</settingName>
        <settingValue>` +
            get(json, pref) +
            `</settingValue>
    </preferences>`
        )
        .join('\n');
      res += '\n</OrgPreferenceSettings>';
      return res;
    } else {
      return js2xmlparser.parse(name, json);
    }
  }

  private createObjectFileContent(json) {
    const output: ObjectSetting = {};
    if (json.sharingModel) {
      output.sharingModel = this.cap(json.sharingModel);
    }
    return output;
  }

  private createRecordTypeFileContent(
    objectName,
    setting: ObjectSetting
  ): { fullName: string; label: string; active: boolean; businessProcess?: string } {
    const output = {
      fullName: this.cap(setting.defaultRecordType),
      label: this.cap(setting.defaultRecordType),
      active: true,
    };
    // all the edge cases
    if (['Case', 'Lead', 'Opportunity', 'Solution'].includes(this.cap(objectName))) {
      return { ...output, businessProcess: `${this.cap(setting.defaultRecordType)}Process` };
    }
    return output;
  }

  private createBusinessProcessFileContent(objectName, businessProcessName) {
    const ObjectToBusinessProcessPicklist = {
      Opportunity: { fullName: 'Prospecting' },
      Case: { fullName: 'New', default: true },
      Lead: { fullName: 'New - Not Contacted', default: true },
      Solution: { fullName: 'Draft', default: true },
    };

    return {
      fullName: businessProcessName,
      isActive: true,
      values: [ObjectToBusinessProcessPicklist[this.cap(objectName)]],
    };
  }

  cap(s: string) {
    return s ? (s.length > 0 ? s.charAt(0).toUpperCase() + s.substring(1) : '') : null;
  }
}
