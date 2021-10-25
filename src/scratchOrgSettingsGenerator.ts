/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
import * as os from 'os';
import * as path from 'path';
import { promises as fs } from 'fs';

// @salesforce
import { isEmpty, env, upperFirst } from '@salesforce/kit';
import { ComponentSet, ComponentStatus, FileResponse } from '@salesforce/source-deploy-retrieve';
import { get, getObject, JsonMap, ensureString, ensureObject, Nullable, Optional } from '@salesforce/ts-types';

// Thirdparty
import * as js2xmlparser from 'js2xmlparser';

// Local
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { writeJSONasXML } from './util/jsonXmlTools';
import { ScratchOrgInfo } from './scratchOrgInfoApi';

interface ObjectSetting extends JsonMap {
  sharingModel?: string;
  defaultRecordType?: string;
}

export interface ScratchDefinition extends ScratchOrgInfo {
  settings: Optional<Record<string, unknown>>;
  objectSettings: Optional<Record<string, unknown>>;
  orgPreferences: Optional<{
    enabled: string[];
    disabled: string[];
  }>;
}

interface ObjectToBusinessProcessPicklist {
  [key: string]: {
    fullName: string;
    default?: boolean;
  };
}

interface BusinessProcessFileContent extends JsonMap {
  fullName: string;
  isActive: boolean;
  values: [
    {
      fullName: string;
      default?: boolean;
    }
  ];
}

/**
 * Helper class for dealing with the settings that are defined in a scratch definition file.  This class knows how to extract the
 * settings from the definition, how to expand them into a MD directory and how to generate a package.xml.
 */
export default class SettingsGenerator {
  private settingData: Nullable<Record<string, unknown>>;
  private objectSettingsData: Nullable<{ [objectName: string]: ObjectSetting }>;
  private logger: Logger;

  public constructor() {
    this.logger = Logger.childFromRoot('SettingsGenerator');
  }

  /** extract the settings from the scratch def file, if they are present. */
  public async extract(scratchDef: ScratchDefinition): Promise<void> {
    this.logger.debug('extracting settings from scratch definition file');
    this.settingData = getObject(scratchDef, 'settings');
    this.objectSettingsData = getObject(scratchDef, 'objectSettings');
    this.logger.debug('settings are', this.settingData);
  }

  /** True if we are currently tracking setting or object setting data. */
  public hasSettings(): boolean {
    return !(isEmpty(this.settingData) && isEmpty(this.objectSettingsData));
  }

  /** Create temporary deploy directory used to upload the scratch org shape.
   * This will create the dir, all of the .setting files and minimal object files needed for objectSettings
   */
  public async createDeployDir(): Promise<string> {
    // Base dir for deployment is always the os.tmpdir().
    const shapeDirName = `shape_${Date.now()}`;
    const destRoot = path.join(os.tmpdir(), shapeDirName);
    const settingsDir = path.join(destRoot, 'settings');
    const objectsDir = path.join(destRoot, 'objects');

    try {
      await fs.mkdir(settingsDir, { recursive: true });
      await fs.mkdir(objectsDir, { recursive: true });
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
  public async deploySettingsViaFolder(username: string, sourceFolder: string): Promise<FileResponse[]> {
    this.logger.debug(`deploying settings from ${sourceFolder}`);

    const componentSet = ComponentSet.fromSource(sourceFolder);
    const deploy = await componentSet.deploy({ usernameOrConnection: username });

    // Wait for polling to finish and get the DeployResult object
    const result = await deploy.pollStatus();
    // display errors if any
    const errors = result.getFileResponses().filter((fileResponse) => fileResponse.state === ComponentStatus.Failed);

    if (result.response.status === 'Failed') {
      throw new SfdxError(
        `A scratch org was created with username ${username}, but the settings failed to deploy`,
        'ProblemDeployingSettings',
        errors.map((e) => `${e.fullName}: ${e.filePath} | ${e.state === ComponentStatus.Failed ? e.error : ''}`)
      );
    }
    return errors;
  }

  private async writeObjectSettingsIfNeeded(objectsDir: string) {
    if (!this.objectSettingsData) {
      return;
    }
    await fs.mkdir(objectsDir, { recursive: true });
    // TODO: parallelize all this FS for perf
    for (const objectName of Object.keys(this.objectSettingsData)) {
      const value = this.objectSettingsData[objectName];
      // writes the object file in source format
      const objectDir = path.join(objectsDir, upperFirst(objectName));
      await fs.mkdir(objectDir, { recursive: true });
      await writeJSONasXML({
        path: path.join(objectDir, `${upperFirst(objectName)}.object-meta.xml`),
        type: 'CustomObject',
        json: this.createObjectFileContent(value),
      });
      if (value.defaultRecordType) {
        const recordTypesDir = path.join(objectDir, 'recordTypes');
        await fs.mkdir(recordTypesDir, { recursive: true });
        const RTFileContent = this.createRecordTypeFileContent(objectName, value);
        await writeJSONasXML({
          path: path.join(recordTypesDir, `${upperFirst(value.defaultRecordType)}.recordType-meta.xml`),
          type: 'RecordType',
          json: RTFileContent,
        });
        // for things that required a businessProcess
        if (RTFileContent.businessProcess) {
          await fs.mkdir(path.join(objectDir, 'businessProcesses'), { recursive: true });
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
      await fs.mkdir(settingsDir, { recursive: true });
      for (const item of Object.keys(this.settingData)) {
        const value = ensureObject(getObject(this.settingData, item));
        const typeName = upperFirst(item);
        const fname = typeName.replace('Settings', '');
        const fileContent = this.createSettingsFileContent(typeName, value as Record<string, unknown>);
        await fs.writeFile(path.join(settingsDir, fname + '.settings-meta.xml'), fileContent);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private createSettingsFileContent(name: string, json: Record<string, unknown>) {
    if (name === 'OrgPreferenceSettings') {
      // this is a stupid format
      let res =
        '<?xml version="1.0" encoding="UTF-8"?>\n<OrgPreferenceSettings xmlns="http://soap.sforce.com/2006/04/metadata">';
      res += Object.keys(json)
        .map(
          (pref) =>
            `<preferences>
              <settingName>${upperFirst(pref)}</settingName>
              <settingValue>${get(json, pref)}</settingValue>
            </preferences>`
        )
        .join('\n');
      res += '\n</OrgPreferenceSettings>';
      return res;
    } else {
      return js2xmlparser.parse(name, json);
    }
  }

  private createObjectFileContent(json: Record<string, unknown>) {
    const output: ObjectSetting = {};
    if (json.sharingModel) {
      output.sharingModel = upperFirst(json.sharingModel as string);
    }
    return output;
  }

  private createRecordTypeFileContent(
    objectName: string,
    setting: ObjectSetting
  ): { fullName: string; label: string; active: boolean; businessProcess?: string } {
    const defaultRecordType = ensureString(upperFirst(setting.defaultRecordType));
    const output = {
      fullName: defaultRecordType,
      label: defaultRecordType,
      active: true,
    };
    // all the edge cases
    if (['Case', 'Lead', 'Opportunity', 'Solution'].includes(upperFirst(objectName))) {
      return { ...output, businessProcess: `${defaultRecordType}Process` };
    }
    return output;
  }

  private createBusinessProcessFileContent(
    objectName: string,
    businessProcessName: string
  ): BusinessProcessFileContent {
    const objectToBusinessProcessPicklist: ObjectToBusinessProcessPicklist = {
      Opportunity: { fullName: 'Prospecting' },
      Case: { fullName: 'New', default: true },
      Lead: { fullName: 'New - Not Contacted', default: true },
      Solution: { fullName: 'Draft', default: true },
    };

    return {
      fullName: businessProcessName,
      isActive: true,
      values: [objectToBusinessProcessPicklist[upperFirst(objectName)]],
    };
  }
}
