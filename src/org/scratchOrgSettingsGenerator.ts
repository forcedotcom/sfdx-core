/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { isEmpty, env, upperFirst, Duration } from '@salesforce/kit';
import { ensureObject, getObject, JsonMap } from '@salesforce/ts-types';
import * as js2xmlparser from 'js2xmlparser';
import { Logger } from '../logger';
import { SfError } from '../sfError';
import { ZipWriter } from '../util/zipWriter';
import { StatusResult } from '../status/types';
import { PollingClient } from '../status/pollingClient';
import { ScratchOrgInfo, ObjectSetting } from './scratchOrgTypes';
import { Org } from './org';

export enum RequestStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Succeeded = 'Succeeded',
  SucceededPartial = 'SucceededPartial',
  Failed = 'Failed',
  Canceling = 'Canceling',
  Canceled = 'Canceled',
}

const breakPolling = ['Succeeded', 'SucceededPartial', 'Failed', 'Canceled'];

export interface SettingType {
  members: string[];
  name: 'CustomObject' | 'RecordType' | 'BusinessProcess' | 'Settings';
}

export interface PackageFile {
  '@': {
    xmlns: string;
  };
  types: SettingType[];
  version: string;
}

export const createObjectFileContent = ({
  allRecordTypes = [],
  allbusinessProcesses = [],
  apiVersion,
  settingData,
  objectSettingsData,
}: {
  allRecordTypes?: string[];
  allbusinessProcesses?: string[];
  apiVersion: string;
  settingData?: Record<string, unknown>;
  objectSettingsData?: { [objectName: string]: ObjectSetting };
}): PackageFile => {
  const output = {
    '@': {
      xmlns: 'http://soap.sforce.com/2006/04/metadata',
    },
    types: [] as SettingType[],
  };
  if (settingData) {
    const strings = Object.keys(settingData).map((item) => upperFirst(item).replace('Settings', ''));
    output.types.push({ members: strings, name: 'Settings' });
  }
  if (objectSettingsData) {
    const strings = Object.keys(objectSettingsData).map((item) => upperFirst(item));
    output.types.push({ members: strings, name: 'CustomObject' });

    if (allRecordTypes.length > 0) {
      output.types.push({ members: allRecordTypes, name: 'RecordType' });
    }

    if (allbusinessProcesses.length > 0) {
      output.types.push({ members: allbusinessProcesses, name: 'BusinessProcess' });
    }
  }
  return { ...output, ...{ version: apiVersion } };
};

const calculateBusinessProcess = (objectName: string, defaultRecordType: string) => {
  let businessProcessName = null;
  let businessProcessPicklistVal = null;
  // These four objects require any record type to specify a "business process"--
  // a restricted set of items from a standard picklist on the object.
  if (['Case', 'Lead', 'Opportunity', 'Solution'].includes(objectName)) {
    businessProcessName = upperFirst(defaultRecordType) + 'Process';
    switch (objectName) {
      case 'Case':
        businessProcessPicklistVal = 'New';
        break;
      case 'Lead':
        businessProcessPicklistVal = 'New - Not Contacted';
        break;
      case 'Opportunity':
        businessProcessPicklistVal = 'Prospecting';
        break;
      case 'Solution':
        businessProcessPicklistVal = 'Draft';
    }
  }
  return [businessProcessName, businessProcessPicklistVal];
};

export const createRecordTypeAndBusinessProcessFileContent = (
  objectName: string,
  json: Record<string, unknown>,
  allRecordTypes: string[],
  allbusinessProcesses: string[]
) => {
  let output = {
    '@': {
      xmlns: 'http://soap.sforce.com/2006/04/metadata',
    },
  } as JsonMap;
  const name = upperFirst(objectName);
  const sharingModel = json.sharingModel;
  if (sharingModel) {
    output = {
      ...output,
      sharingModel: upperFirst(sharingModel as string),
    };
  }

  const defaultRecordType = json.defaultRecordType;
  if (typeof defaultRecordType === 'string') {
    // We need to keep track of these globally for when we generate the package XML.
    allRecordTypes.push(`${name}.${upperFirst(defaultRecordType)}`);
    const [businessProcessName, businessProcessPicklistVal] = calculateBusinessProcess(name, defaultRecordType);
    // Create the record type
    const recordTypes = {
      fullName: upperFirst(defaultRecordType),
      label: upperFirst(defaultRecordType),
      active: true,
    };

    output = {
      ...output,
      recordTypes: {
        ...recordTypes,
      },
    };

    if (businessProcessName) {
      // We need to keep track of these globally for the package.xml
      const values: { fullName: string | null; default?: boolean } = {
        fullName: businessProcessPicklistVal,
      };

      if (name !== 'Opportunity') {
        values.default = true;
      }

      allbusinessProcesses.push(`${name}.${businessProcessName}`);
      output = {
        ...output,
        recordTypes: {
          ...recordTypes,
          businessProcess: businessProcessName,
        },
        businessProcesses: {
          fullName: businessProcessName,
          isActive: true,
          values,
        },
      };
    }
  }
  return output;
};

/**
 * Helper class for dealing with the settings that are defined in a scratch definition file.  This class knows how to extract the
 * settings from the definition, how to expand them into a MD directory and how to generate a package.xml.
 */
export default class SettingsGenerator {
  private settingData?: Record<string, unknown>;
  private objectSettingsData?: { [objectName: string]: ObjectSetting };
  private logger: Logger;
  private writer: ZipWriter;
  private allRecordTypes: string[] = [];
  private allbusinessProcesses: string[] = [];
  private shapeDirName = `shape_${Date.now()}`;
  private packageFilePath = path.join(this.shapeDirName, 'package.xml');

  public constructor() {
    this.logger = Logger.childFromRoot('SettingsGenerator');
    // If SFDX_MDAPI_TEMP_DIR is set, copy settings to that dir for people to inspect.
    const mdapiTmpDir = env.getString('SFDX_MDAPI_TEMP_DIR');
    this.writer = new ZipWriter(mdapiTmpDir);
  }

  /** extract the settings from the scratch def file, if they are present. */
  public async extract(scratchDef: ScratchOrgInfo): Promise<{
    settings: Record<string, unknown> | undefined;
    objectSettings: { [objectName: string]: ObjectSetting } | undefined;
  }> {
    this.logger.debug('extracting settings from scratch definition file');
    this.settingData = scratchDef.settings;
    this.objectSettingsData = scratchDef.objectSettings;
    this.logger.debug('settings are', this.settingData);
    return { settings: this.settingData, objectSettings: this.objectSettingsData };
  }

  /** True if we are currently tracking setting or object setting data. */
  public hasSettings(): boolean {
    return !isEmpty(this.settingData) || !isEmpty(this.objectSettingsData);
  }

  /** Create temporary deploy directory used to upload the scratch org shape.
   * This will create the dir, all of the .setting files and minimal object files needed for objectSettings
   */
  public async createDeploy(): Promise<void> {
    const settingsDir = path.join(this.shapeDirName, 'settings');
    const objectsDir = path.join(this.shapeDirName, 'objects');
    await Promise.all([
      this.writeSettingsIfNeeded(settingsDir),
      this.writeObjectSettingsIfNeeded(objectsDir, this.allRecordTypes, this.allbusinessProcesses),
    ]);
  }

  /**
   * Deploys the settings to the org.
   */
  public async deploySettingsViaFolder(scratchOrg: Org, apiVersion: string): Promise<void> {
    const username = scratchOrg.getUsername();
    const logger = await Logger.child('deploySettingsViaFolder');
    const packageObjectProps = createObjectFileContent({
      allRecordTypes: this.allRecordTypes,
      allbusinessProcesses: this.allbusinessProcesses,
      apiVersion,
      settingData: this.settingData,
      objectSettingsData: this.objectSettingsData,
    });
    const xml = js2xmlparser.parse('Package', packageObjectProps);
    this.writer.addToZip(xml, this.packageFilePath);
    await this.writer.finalize();

    const connection = scratchOrg.getConnection();
    logger.debug(`deploying to apiVersion: ${apiVersion}`);
    connection.setApiVersion(apiVersion);
    const { id } = await connection.deploy(this.writer.buffer, {});

    logger.debug(`deploying settings id ${id}`);

    let result = await connection.metadata.checkDeployStatus(id);

    const pollingOptions: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        try {
          result = await connection.metadata.checkDeployStatus(id, true);
          logger.debug(`Deploy id: ${id} status: ${result.status}`);
          if (breakPolling.includes(result.status)) {
            return {
              completed: true,
              payload: result.status,
            };
          }
          return {
            completed: false,
          };
        } catch (error) {
          logger.debug(`An error occurred trying to check deploy id: ${id}`);
          logger.debug(`Error: ${(error as Error).message}`);
          logger.debug('Re-trying deploy check again....');
          return {
            completed: false,
          };
        }
      },
      timeout: Duration.minutes(10),
      frequency: Duration.seconds(1),
      timeoutErrorName: 'DeployingSettingsTimeoutError',
    };

    const client = await PollingClient.create(pollingOptions);
    const status = await client.subscribe<string>();

    if (status !== RequestStatus.Succeeded) {
      const componentFailures = ensureObject<{
        componentFailures: Record<string, unknown> | Array<Record<string, unknown>>;
      }>(result.details).componentFailures;
      const failures = (Array.isArray(componentFailures) ? componentFailures : [componentFailures])
        .map((failure) => failure.problem)
        .join('\n');
      const error = new SfError(
        `A scratch org was created with username ${username}, but the settings failed to deploy due to: \n${failures}`,
        'ProblemDeployingSettings'
      );
      error.setData(result);
      throw error;
    }
  }

  public getShapeDirName(): string {
    return this.shapeDirName;
  }

  private async writeObjectSettingsIfNeeded(
    objectsDir: string,
    allRecordTypes: string[],
    allbusinessProcesses: string[]
  ) {
    if (this.objectSettingsData) {
      for (const [item, value] of Object.entries(this.objectSettingsData)) {
        const fileContent = createRecordTypeAndBusinessProcessFileContent(
          item,
          value,
          allRecordTypes,
          allbusinessProcesses
        );
        const xml = js2xmlparser.parse('CustomObject', fileContent);
        this.writer.addToZip(xml, path.join(objectsDir, upperFirst(item) + '.object'));
      }
    }
  }

  private async writeSettingsIfNeeded(settingsDir: string) {
    if (this.settingData) {
      for (const item of Object.keys(this.settingData)) {
        const value = getObject(this.settingData, item);
        const typeName = upperFirst(item);
        const fname = typeName.replace('Settings', '');
        const fileContent = js2xmlparser.parse(typeName, value);
        this.writer.addToZip(fileContent, path.join(settingsDir, fname + '.settings'));
      }
    }
  }
}
