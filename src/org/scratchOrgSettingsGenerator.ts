/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { isEmpty, env, upperFirst, Duration } from '@salesforce/kit';
import { ensureObject, JsonMap } from '@salesforce/ts-types';
import * as js2xmlparser from 'js2xmlparser';
import { rootLogger } from '../logger/logger';
import { SfError } from '../sfError';
import { StructuredWriter } from '../util/structuredWriter';
import { StatusResult } from '../status/types';
import { PollingClient } from '../status/pollingClient';
import { ZipWriter } from '../util/zipWriter';
import { DirectoryWriter } from '../util/directoryWriter';
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
  allBusinessProcesses = [],
  apiVersion,
  settingData,
  objectSettingsData,
}: {
  allRecordTypes?: string[];
  allBusinessProcesses?: string[];
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

    if (allBusinessProcesses.length > 0) {
      output.types.push({ members: allBusinessProcesses, name: 'BusinessProcess' });
    }
  }
  return { ...output, ...{ version: apiVersion } };
};

const calculateBusinessProcess = (objectName: string, defaultRecordType: string): Array<string | null> => {
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
  allBusinessProcesses: string[]
): JsonMap => {
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

      allBusinessProcesses.push(`${name}.${businessProcessName}`);
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
  private logger: typeof rootLogger;
  private writer: StructuredWriter;
  private allRecordTypes: string[] = [];
  private allBusinessProcesses: string[] = [];
  private readonly shapeDirName: string;
  private readonly packageFilePath: string;

  public constructor(options?: { mdApiTmpDir?: string; shapeDirName?: string; asDirectory?: boolean }) {
    this.logger = rootLogger.child({ name: 'SettingsGenerator' });
    // If SFDX_MDAPI_TEMP_DIR is set, copy settings to that dir for people to inspect.
    const mdApiTmpDir = options?.mdApiTmpDir ?? env.getString('SFDX_MDAPI_TEMP_DIR');
    this.shapeDirName = options?.shapeDirName ?? `shape_${Date.now()}`;
    this.packageFilePath = path.join(this.shapeDirName, 'package.xml');
    let storePath;
    if (!options?.asDirectory) {
      storePath = mdApiTmpDir ? path.join(mdApiTmpDir, `${this.shapeDirName}.zip`) : undefined;
      this.writer = new ZipWriter(storePath);
    } else {
      storePath = mdApiTmpDir ? path.join(mdApiTmpDir, this.shapeDirName) : undefined;
      this.writer = new DirectoryWriter(storePath);
    }
  }

  /** extract the settings from the scratch def file, if they are present. */
  // eslint-disable-next-line @typescript-eslint/require-await
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
      this.writeObjectSettingsIfNeeded(objectsDir, this.allRecordTypes, this.allBusinessProcesses),
    ]);
  }

  /**
   * Deploys the settings to the org.
   */
  public async deploySettingsViaFolder(
    scratchOrg: Org,
    apiVersion: string,
    timeout: Duration = Duration.minutes(10)
  ): Promise<void> {
    const username = scratchOrg.getUsername();
    const logger = rootLogger.child({ name: 'deploySettingsViaFolder' });

    await this.createDeployPackageContents(apiVersion);

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
      timeout,
      frequency: Duration.seconds(1),
      timeoutErrorName: 'DeployingSettingsTimeoutError',
    };

    const client = await PollingClient.create(pollingOptions);
    const status = await client.subscribe<string>();

    type FailureMessage = {
      problemType: string;
      fullName: string;
      problem: string;
    };
    if (status !== RequestStatus.Succeeded) {
      const componentFailures = ensureObject<{
        componentFailures: FailureMessage | FailureMessage[];
      }>(result.details).componentFailures;
      const failures = (Array.isArray(componentFailures) ? componentFailures : [componentFailures])
        .map((failure) => `[${failure.problemType}] ${failure.fullName} : ${failure.problem} `)
        .join('\n');
      const error = new SfError(
        `A scratch org was created with username ${username}, but the settings failed to deploy due to: \n${failures}`,
        'ProblemDeployingSettings'
      );
      error.setData(result);
      throw error;
    }
  }

  public async createDeployPackageContents(apiVersion: string): Promise<void> {
    const packageObjectProps = createObjectFileContent({
      allRecordTypes: this.allRecordTypes,
      allBusinessProcesses: this.allBusinessProcesses,
      apiVersion,
      settingData: this.settingData,
      objectSettingsData: this.objectSettingsData,
    });
    const xml = js2xmlparser.parse('Package', packageObjectProps);
    await this.writer.addToStore(xml, this.packageFilePath);
    await this.writer.finalize();
  }

  public getShapeDirName(): string {
    return this.shapeDirName;
  }

  /**
   * Returns the destination where the writer placed the settings content.
   *
   */
  public getDestinationPath(): string | undefined {
    return this.writer.getDestinationPath();
  }

  private async writeObjectSettingsIfNeeded(
    objectsDir: string,
    allRecordTypes: string[],
    allbusinessProcesses: string[]
  ): Promise<void> {
    if (this.objectSettingsData) {
      await Promise.all(
        Object.entries(this.objectSettingsData).map(([item, value]) => {
          const fileContent = createRecordTypeAndBusinessProcessFileContent(
            item,
            value,
            allRecordTypes,
            allbusinessProcesses
          );
          const xml = js2xmlparser.parse('CustomObject', fileContent);
          return this.writer.addToStore(xml, path.join(objectsDir, upperFirst(item) + '.object'));
        })
      );
    }
  }

  private async writeSettingsIfNeeded(settingsDir: string): Promise<void> {
    if (this.settingData) {
      await Promise.all(
        Object.entries(this.settingData).map(([item, value]) => {
          const typeName = upperFirst(item);
          const fname = typeName.replace('Settings', '');
          const fileContent = js2xmlparser.parse(typeName, value);
          return this.writer.addToStore(fileContent, path.join(settingsDir, fname + '.settings'));
        })
      );
    }
  }
}
