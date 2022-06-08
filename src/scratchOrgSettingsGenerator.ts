/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as util from 'util';
import { isEmpty, env, upperFirst, Duration } from '@salesforce/kit';
import { ensureObject, getObject, JsonMap /* , Optional  */ } from '@salesforce/ts-types';
import * as js2xmlparser from 'js2xmlparser';
import { Org } from './org';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
// import { JsonAsXml } from './util/jsonXmlTools';
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

// interface ObjectToBusinessProcessPicklist {
//   [key: string]: {
//     fullName: string;
//     default?: boolean;
//   };
// }

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

/** This is the contents of the package.xml that we will use when we deploy settings to a scratch org. */

const packageFileContents = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
%s
    <version>%s</version>
</Package>`;

/** This is the contents for a single section for a particular metadata type in the package.xml.  */
const packageFileTypeSection = `    <types>
        %s
        <name>%s</name>
    </types>
`;

/**
 * Helper class for dealing with the settings that are defined in a scratch definition file.  This class knows how to extract the
 * settings from the definition, how to expand them into a MD directory and how to generate a package.xml.
 */
export default class SettingsGenerator {
  private settingData?: Record<string, unknown>;
  private objectSettingsData?: { [objectName: string]: ObjectSetting };
  private logger: Logger;
  private writer: ZipWriter;
  private allRecTypes: string[] = [];
  private allBps: string[] = [];
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
      this.writeObjectSettingsIfNeeded(objectsDir, this.allRecTypes, this.allBps),
    ]);
  }

  /**
   * Deploys the settings to the org.
   */
  public async deploySettingsViaFolder(scratchOrg: Org, apiVersion: string): Promise<void> {
    const username = scratchOrg.getUsername();
    const logger = await Logger.child('deploySettingsViaFolder');
    // this.createPackageXml(apiVersion);
    await this.writePackageFile(this.allRecTypes, this.allBps, this.packageFilePath, apiVersion);
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

  // private async writeObjectSettingsIfNeededXX(objectsDir: string) {
  //   if (!this.objectSettingsData || !Object.keys(this.objectSettingsData).length) {
  //     return;
  //   }
  //   for (const objectName of Object.keys(this.objectSettingsData)) {
  //     const value = this.objectSettingsData[objectName];
  //     // writes the object file in source format
  //     const objectDir = path.join(objectsDir, upperFirst(objectName));
  //     const customObjectDir = path.join(objectDir, `${upperFirst(objectName)}.object`);
  //     const customObjectXml = JsonAsXml({
  //       json: this.createObjectFileContent(value),
  //       type: 'CustomObject',
  //     });
  //     this.writer.addToZip(customObjectXml, customObjectDir);

  //     if (value.defaultRecordType) {
  //       const recordTypesDir = path.join(objectDir, 'recordTypes', `${upperFirst(value.defaultRecordType)}.recordType`);
  //       const recordTypesFileContent = this.createRecordTypeFileContent(objectName, value);
  //       const recordTypesXml = JsonAsXml({
  //         json: recordTypesFileContent,
  //         type: 'RecordType',
  //       });
  //       this.writer.addToZip(recordTypesXml, recordTypesDir);
  //       // for things that required a businessProcess
  //       if (recordTypesFileContent.businessProcess) {
  //         const businessProcessesDir = path.join(
  //           objectDir,
  //           'businessProcesses',
  //           `${recordTypesFileContent.businessProcess}.businessProcess`
  //         );
  //         const businessProcessesXml = JsonAsXml({
  //           json: this.createBusinessProcessFileContent(objectName, recordTypesFileContent.businessProcess),
  //           type: 'BusinessProcess',
  //         });
  //         this.writer.addToZip(businessProcessesXml, businessProcessesDir);
  //       }
  //     }
  //   }
  // }

  private async writeObjectSettingsIfNeeded(objectsDir: string, allRecTypes: string[], allBps: string[]) {
    if (this.objectSettingsData) {
      // await fs.mkdirp(objectsDir);
      for (const item of Object.keys(this.objectSettingsData)) {
        // const value: object = getObject(this.objectSettingsData, item);
        const value: ObjectSetting = this.objectSettingsData[item];
        const fileContent = this.createObjectFileContent(upperFirst(item), value, allRecTypes, allBps);
        // await fs.writeFile(path.join(objectsDir, this.cap(item) + '.object'), fileContent);
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

  private async writePackageFile(allRecTypes: string[], allBps: string[], packageFilePath: string, apiVersion: string) {
    let packageContentInternals = '';
    let settingsMemberReferences = '';
    if (this.settingData) {
      Object.keys(this.settingData).forEach((item) => {
        const typeName = upperFirst(item).replace('Settings', '');
        settingsMemberReferences += '\n        <members>' + typeName + '</members>';
      });
      packageContentInternals += util.format(packageFileTypeSection, settingsMemberReferences, 'Settings');
    }
    let objectMemberReferences = '';
    if (this.objectSettingsData) {
      Object.keys(this.objectSettingsData).forEach((item) => {
        objectMemberReferences += '\n        <members>' + upperFirst(item) + '</members>';
      });
      packageContentInternals += util.format(packageFileTypeSection, objectMemberReferences, 'CustomObject');
      packageContentInternals += this.getTypeReferences(allRecTypes, 'RecordType');
      packageContentInternals += this.getTypeReferences(allBps, 'BusinessProcess');
    }
    this.writer.addToZip(util.format(packageFileContents, packageContentInternals, apiVersion), packageFilePath);
  }

  private getTypeReferences(componentNames: string[], componentType: string) {
    return componentNames && componentNames.length > 0
      ? util.format(
          packageFileTypeSection,
          componentNames.map((item) => '\n    <members>' + item + '</members>').join(''),
          componentType
        )
      : '';
  }

  private createObjectFileContent(
    name: string,
    json: Record<string, unknown>,
    allRecTypes: string[],
    allBps: string[]
  ) {
    // name already capped
    let res = `<?xml version="1.0" encoding="UTF-8"?>
<Object xmlns="http://soap.sforce.com/2006/04/metadata">
`;
    const sharingModel = json['sharingModel'];
    if (sharingModel) {
      res += '    <sharingModel>' + upperFirst(sharingModel as string) + '</sharingModel>\n';
    }

    const defaultRecordType = json['defaultRecordType'];
    if (defaultRecordType) {
      // We need to keep track of these globally for when we generate the package XML.
      allRecTypes.push(name + '.' + upperFirst(defaultRecordType as string));
      let bpName = null;
      let bpPicklistVal = null;
      // These four objects require any record type to specify a "business process"--
      // a restricted set of items from a standard picklist on the object.
      if (['Case', 'Lead', 'Opportunity', 'Solution'].includes(name)) {
        bpName = upperFirst(defaultRecordType as string) + 'Process';
        switch (name) {
          case 'Case':
            bpPicklistVal = 'New';
            break;
          case 'Lead':
            bpPicklistVal = 'New - Not Contacted';
            break;
          case 'Opportunity':
            bpPicklistVal = 'Prospecting';
            break;
          case 'Solution':
            bpPicklistVal = 'Draft';
        }
      }
      // Create the record type

      res +=
        `    <recordTypes>
        <fullName>` +
        upperFirst(defaultRecordType as string) +
        `</fullName>
        <label>` +
        upperFirst(defaultRecordType as string) +
        `</label>
        <active>true</active>
`;
      if (bpName) {
        // We need to keep track of these globally for the package.xml
        allBps.push(name + '.' + bpName);
        res += '        <businessProcess>' + bpName + '</businessProcess>\n';
      }
      res += '    </recordTypes>\n';
      // If required, create the business processes they refer to
      if (bpName) {
        res += `    <businessProcesses>
        <fullName>
          ${bpName}
          </fullName>
        <isActive>true</isActive>
        <values>
            <fullName>
          ${bpPicklistVal}
          </fullName>
            <default>true</default>
        </values>
    </businessProcesses>
`;
      }
    }
    res += '</Object>';
    return res;
  }

  //   private createPackageXml(apiVersion: string): void {
  //     const pkg = `<?xml version="1.0" encoding="UTF-8"?>
  // <Package xmlns="http://soap.sforce.com/2006/04/metadata">
  //     <types>
  //         <members>*</members>
  //         <name>Settings</name>
  //     </types>
  //     <types>
  //         <members>*</members>
  //         <name>CustomObject</name>
  //     </types>
  //     <version>${apiVersion}</version>
  // </Package>`;
  //     this.writer.addToZip(pkg, path.join(this.shapeDirName, 'package.xml'));
  //   }

  // private createObjectFileContentXXX(json: Record<string, unknown>) {
  //   const output: ObjectSetting = {};
  //   if (json.sharingModel) {
  //     output.sharingModel = upperFirst(json.sharingModel as string);
  //   }
  //   return output;
  // }

  // private createRecordTypeFileContent(
  //   objectName: string,
  //   setting: ObjectSetting
  // ): { fullName: Optional<string>; label: Optional<string>; active: boolean; businessProcess?: Optional<string> } {
  //   const defaultRecordType = upperFirst(setting.defaultRecordType);
  //   const output = {
  //     fullName: defaultRecordType,
  //     label: defaultRecordType,
  //     active: true,
  //   };
  //   // all the edge cases
  //   if (['Case', 'Lead', 'Opportunity', 'Solution'].includes(upperFirst(objectName))) {
  //     return { ...output, businessProcess: `${defaultRecordType}Process` };
  //   }
  //   return output;
  // }

  // private createBusinessProcessFileContent(
  //   objectName: string,
  //   businessProcessName: string
  // ): BusinessProcessFileContent {
  //   const objectToBusinessProcessPicklist: ObjectToBusinessProcessPicklist = {
  //     Opportunity: { fullName: 'Prospecting' },
  //     Case: { fullName: 'New', default: true },
  //     Lead: { fullName: 'New - Not Contacted', default: true },
  //     Solution: { fullName: 'Draft', default: true },
  //   };

  //   return {
  //     fullName: businessProcessName,
  //     isActive: true,
  //     values: [objectToBusinessProcessPicklist[upperFirst(objectName)]],
  //   };
  // }
}
