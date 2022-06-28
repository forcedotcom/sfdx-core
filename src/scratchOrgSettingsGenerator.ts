/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { isEmpty, env, upperFirst, Duration } from '@salesforce/kit';
import { ensureObject, getObject, JsonMap, JsonArray } from '@salesforce/ts-types';
import * as js2xmlparser from 'js2xmlparser';
import { Org } from './org';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { ZipWriter } from './util/zipWriter';
import { ScratchOrgInfo } from './scratchOrgInfoApi';
import { StatusResult } from './status/client';
import { PollingClient } from './status/pollingClient';

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

export interface ObjectSetting extends JsonMap {
  sharingModel?: string;
  defaultRecordType?: string;
}

export const writePackageFile = (
  allRecordTypes: string[],
  allbusinessProcesses: string[],
  apiVersion: string,
  settingData?: Record<string, unknown>,
  objectSettingsData?: { [objectName: string]: ObjectSetting }
): Record<string, unknown> => {
  let output = {
    '@': {
      xmlns: 'http://soap.sforce.com/2006/04/metadata',
    },
    types: [] as JsonArray,
  };
  if (settingData) {
    const settingsMemberReferences = Object.keys(settingData).reduce((acc, item) => {
      const typeName = upperFirst(item).replace('Settings', '');
      return {
        ...acc,
        ...{ members: [...(acc.members ?? []), typeName] },
      };
    }, Object.create(null));
    output = { ...output, ...{ types: [...output.types, { ...settingsMemberReferences, name: 'Settings' }] } };
  }
  if (objectSettingsData) {
    const objectMemberReferences = Object.keys(objectSettingsData).reduce((acc, item) => {
      return {
        ...acc,
        ...{ members: [...(acc.members ?? []), upperFirst(item)] },
      };
    }, Object.create(null));
    output = { ...output, ...{ types: [output.types, { ...objectMemberReferences, name: 'CustomObject' }] } };

    if (allRecordTypes.length > 0) {
      output = {
        ...output,
        ...{
          types: [
            output.types,
            {
              ...allRecordTypes.reduce((acc, allRecordType) => {
                return {
                  ...acc,
                  ...{ members: [...(acc.members ?? []), allRecordType] },
                };
              }, Object.create(null)),
              name: 'RecordType',
            },
          ],
        },
      };
    }

    if (allbusinessProcesses.length > 0) {
      output = {
        ...output,
        ...{
          types: [
            output.types,
            {
              ...allbusinessProcesses.reduce((acc, allRecordType) => {
                return {
                  ...acc,
                  ...{ members: [...(acc.members ?? []), allRecordType] },
                };
              }, Object.create(null)),
              name: 'BusinessProcess',
            },
          ],
        },
      };
    }
  }
  return (output = { ...output, ...{ version: apiVersion } });
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
  public async extract(scratchDef: ScratchOrgInfo): Promise<void> {
    this.logger.debug('extracting settings from scratch definition file');
    this.settingData = scratchDef.settings;
    this.objectSettingsData = scratchDef.objectSettings;
    this.logger.debug('settings are', this.settingData);
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
    // this.createPackageXml(apiVersion);
    // await this.writePackageFile(this.allRecordTypes, this.allbusinessProcesses, this.packageFilePath, apiVersion);
    const packageObjectProps = writePackageFile(
      this.allRecordTypes,
      this.allbusinessProcesses,
      apiVersion,
      this.settingData,
      this.objectSettingsData
    );
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
      const error = new SfdxError(
        `A scratch org was created with username ${username}, but the settings failed to deploy due to: \n${failures}`,
        'ProblemDeployingSettings'
      );
      error.setData(result);
      throw error;
    }
  }

  private async writeObjectSettingsIfNeeded(
    objectsDir: string,
    allRecordTypes: string[],
    allbusinessProcesses: string[]
  ) {
    if (this.objectSettingsData) {
      for (const item of Object.keys(this.objectSettingsData)) {
        const value: ObjectSetting = this.objectSettingsData[item];
        const fileContent = this.createObjectFileContent(upperFirst(item), value, allRecordTypes, allbusinessProcesses);
        this.writer.addToZip(fileContent, path.join(objectsDir, upperFirst(item) + '.object'));
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

  /*
  private async writePackageFile(
    allRecordTypes: string[],
    allbusinessProcesses: string[],
    packageFilePath: string,
    apiVersion: string
  ) {
    let output = {
      '@': {
        xmlns: 'http://soap.sforce.com/2006/04/metadata',
      },
      types: [] as JsonArray,
    };
    if (this.settingData) {
      const settingsMemberReferences = Object.keys(this.settingData).reduce((acc, item) => {
        const typeName = upperFirst(item).replace('Settings', '');
        return {
          ...acc,
          ...{ members: [...(acc.members ?? []), typeName] },
        };
      }, Object.create(null));
      output = { ...output, ...{ types: [...output.types, { ...settingsMemberReferences, name: 'Settings' }] } };
    }
    if (this.objectSettingsData) {
      const objectMemberReferences = Object.keys(this.objectSettingsData).reduce((acc, item) => {
        return {
          ...acc,
          ...{ members: [...(acc.members ?? []), upperFirst(item)] },
        };
      }, Object.create(null));
      output = { ...output, ...{ types: [output.types, { ...objectMemberReferences, name: 'CustomObject' }] } };

      if (allRecordTypes.length > 0) {
        output = {
          ...output,
          ...{
            types: [
              output.types,
              {
                ...allRecordTypes.reduce((acc, allRecordType) => {
                  return {
                    ...acc,
                    ...{ members: [...(acc.members ?? []), allRecordType] },
                  };
                }, Object.create(null)),
                name: 'RecordType',
              },
            ],
          },
        };
      }

      if (allbusinessProcesses.length > 0) {
        output = {
          ...output,
          ...{
            types: [
              output.types,
              {
                ...allbusinessProcesses.reduce((acc, allRecordType) => {
                  return {
                    ...acc,
                    ...{ members: [...(acc.members ?? []), allRecordType] },
                  };
                }, Object.create(null)),
                name: 'BusinessProcess',
              },
            ],
          },
        };
      }
    }
    output = { ...output, ...{ version: apiVersion } };
    const xml = js2xmlparser.parse('Package', output);
    this.writer.addToZip(xml, packageFilePath);
  }
  */

  private createObjectFileContent(
    name: string,
    json: Record<string, unknown>,
    allRecordTypes: string[],
    allbusinessProcesses: string[]
  ) {
    let output = {
      '@': {
        xmlns: 'http://soap.sforce.com/2006/04/metadata',
      },
    } as JsonMap;
    const sharingModel = json['sharingModel'];
    if (sharingModel) {
      output = {
        ...output,
        sharingModel: upperFirst(sharingModel as string),
      };
    }

    const defaultRecordType = json['defaultRecordType'];
    if (typeof defaultRecordType === 'string') {
      // We need to keep track of these globally for when we generate the package XML.
      allRecordTypes.push(name + '.' + upperFirst(defaultRecordType as string));
      let businessProcessesName = null;
      let businessProcessesPicklistVal = null;
      // These four objects require any record type to specify a "business process"--
      // a restricted set of items from a standard picklist on the object.
      if (['Case', 'Lead', 'Opportunity', 'Solution'].includes(name)) {
        businessProcessesName = upperFirst(defaultRecordType as string) + 'Process';
        switch (name) {
          case 'Case':
            businessProcessesPicklistVal = 'New';
            break;
          case 'Lead':
            businessProcessesPicklistVal = 'New - Not Contacted';
            break;
          case 'Opportunity':
            businessProcessesPicklistVal = 'Prospecting';
            break;
          case 'Solution':
            businessProcessesPicklistVal = 'Draft';
        }
      }
      // Create the record type
      const recordTypes = {
        fullName: upperFirst(defaultRecordType as string),
        label: upperFirst(defaultRecordType as string),
        active: true,
      };

      output = {
        ...output,
        recordTypes: {
          ...recordTypes,
        },
      };

      if (businessProcessesName) {
        // We need to keep track of these globally for the package.xml
        allbusinessProcesses.push(name + '.' + businessProcessesName);
        output = {
          ...output,
          recordTypes: {
            ...recordTypes,
            businessProcess: businessProcessesName,
          },
        };
      }

      // If required, create the business processes they refer to
      if (businessProcessesName) {
        output = {
          ...output,
          businessProcesses: {
            fullName: businessProcessesName,
            isActive: true,
            values: {
              fullName: {
                businessProcessesPicklistVal,
                default: true,
              },
            },
          },
        };
      }
    }
    return js2xmlparser.parse('CustomObject', output);
  }
}
