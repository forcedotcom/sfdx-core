/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
// import * as os from 'os';
import * as path from 'path';

// @salesforce
import { isEmpty, env, upperFirst } from '@salesforce/kit';
import { get, getObject, JsonMap, Nullable, Optional } from '@salesforce/ts-types';
import * as js2xmlparser from 'js2xmlparser';

// Local
import { Org } from './org';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { JsonAsXml } from './util/jsonXmlTools';
import { ZipWriter } from './util/zipWriter';
import { ScratchOrgInfo } from './scratchOrgInfoApi';
import { Lifecycle } from './lifecycleEvents';

export enum RequestStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Succeeded = 'Succeeded',
  SucceededPartial = 'SucceededPartial',
  Failed = 'Failed',
  Canceling = 'Canceling',
  Canceled = 'Canceled',
}

export enum BreakPooling {
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Canceled = 'Canceled',
}

export interface ObjectSetting extends JsonMap {
  sharingModel?: string;
  defaultRecordType?: string;
}

export interface ObjectToBusinessProcessPicklist {
  [key: string]: {
    fullName: string;
    default?: boolean;
  };
}

export interface BusinessProcessFileContent extends JsonMap {
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
  private writer: ZipWriter;

  public constructor() {
    this.logger = Logger.childFromRoot('SettingsGenerator');
    // If SFDX_MDAPI_TEMP_DIR is set, copy settings to that dir for people to inspect.
    const mdapiTmpDir = env.getString('SFDX_MDAPI_TEMP_DIR');
    this.writer = new ZipWriter(mdapiTmpDir);
  }

  /** extract the settings from the scratch def file, if they are present. */
  public async extract(scratchDef: ScratchOrgInfo): Promise<void> {
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
  public async createDeploy(): Promise<void> {
    await Promise.all([this.writeSettingsIfNeeded('settings'), this.writeObjectSettingsIfNeeded('objects')]);
  }

  /**
   * Deploys the settings to the org.
   */
  public async deploySettingsViaFolder(username: Optional<string>, scratchOrg: Org, apiVersion: string): Promise<void> {
    const logger = await Logger.child('deploySettingsViaFolder');
    this.createPackageXml(apiVersion);
    await this.writer.finalize();

    const connection = scratchOrg.getConnection();
    logger.debug(`deployng to apiVersion: ${apiVersion}`);
    connection.setApiVersion(apiVersion);
    const { id } = await connection.deploy(this.writer.buffer, {});

    logger.debug(`deploying settings id ${id}`);

    let result = await connection.metadata.checkDeployStatus(id);
    await Lifecycle.getInstance().emit('deploySettingsViaFolder', {
      status: result.status,
    });

    while (!Object.keys(BreakPooling).includes(result.status)) {
      result = await connection.metadata.checkDeployStatus(id);
      await Lifecycle.getInstance().emit('deploySettingsViaFolder', {
        status: result.status,
      });
    }

    logger.debug(`settings deployment status ${result.status}`);

    if (result.status !== RequestStatus.Succeeded) {
      throw new SfdxError(
        `A scratch org was created with username ${username}, but the settings failed to deploy`,
        'ProblemDeployingSettings'
      );
    }
  }

  private async writeObjectSettingsIfNeeded(objectsDir: string) {
    if (!this.objectSettingsData) {
      return;
    }
    // TODO: parallelize all this FS for perf
    for (const objectName of Object.keys(this.objectSettingsData)) {
      const value = this.objectSettingsData[objectName];
      // writes the object file in source format
      const objectDir = path.join(objectsDir, upperFirst(objectName));
      const customObjectDir = path.join(objectDir, `${upperFirst(objectName)}.object-meta.xml`);
      const customObjectXml = JsonAsXml({
        json: this.createObjectFileContent(value),
        type: 'RecordType',
      });
      this.writer.addToZip(customObjectXml, customObjectDir);

      if (value.defaultRecordType) {
        const recordTypesDir = path.join(
          objectDir,
          'recordTypes',
          `${upperFirst(value.defaultRecordType)}.recordType-meta.xml`
        );
        const recordTypesFileContent = this.createRecordTypeFileContent(objectName, value);
        const recordTypesXml = JsonAsXml({
          json: recordTypesFileContent,
          type: 'RecordType',
        });
        this.writer.addToZip(recordTypesXml, recordTypesDir);
        // for things that required a businessProcess
        if (recordTypesFileContent.businessProcess) {
          const businessProcessesDir = path.join(
            objectDir,
            'businessProcesses',
            `${recordTypesFileContent.businessProcess}.businessProcess-meta.xml`
          );
          const businessProcessesXml = JsonAsXml({
            json: this.createBusinessProcessFileContent(objectName, recordTypesFileContent.businessProcess),
            type: 'BusinessProcess',
          });
          this.writer.addToZip(businessProcessesXml, businessProcessesDir);
        }
      }
    }
  }

  private async writeSettingsIfNeeded(settingsDir: string) {
    if (this.settingData) {
      for (const item of Object.keys(this.settingData)) {
        const value = getObject(this.settingData, item);
        const typeName = upperFirst(item);
        const fname = typeName.replace('Settings', '');
        const fileContent = this.createSettingsFileContent(typeName, value as Record<string, unknown>);
        this.writer.addToZip(fileContent, path.join(settingsDir, fname + '.settings-meta.xml'));
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

  private createPackageXml(apiVersion: string): void {
    const pkg = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
      <members>*</members>
      <name>Settings</name>
    </types>
  <version>${apiVersion}</version>
</Package>`;
    this.writer.addToZip(pkg, path.join('settings', 'package.xml'));
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
  ): { fullName: Optional<string>; label: Optional<string>; active: boolean; businessProcess?: Optional<string> } {
    const defaultRecordType = upperFirst(setting.defaultRecordType);
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
