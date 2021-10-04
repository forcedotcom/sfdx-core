/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
import { promises as fs } from 'fs';

// third
import { OutputFlags } from '@oclif/parser';

// @salesforce
import { Duration, parseJson } from '@salesforce/kit';
import { ensureString, ensureBoolean, Optional } from '@salesforce/ts-types';

// Local
import { Org } from './org';
import { Logger } from './logger';
import { sfdc } from './util/sfdc';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { Connection } from './connection';
import { SfdxProject } from './sfdxProject';
import { OrgCreateResult } from './orgHooks';
import { Lifecycle } from './lifecycleEvents';
import { ConfigAggregator } from './config/configAggregator';
import {
  authorizeScratchOrg,
  requestScratchOrgCreation,
  pollForScratchOrgInfo,
  deploySettingsAndResolveUrl,
  ScratchOrgInfo,
} from './scratchOrgInfoApi';
import SettingsGenerator, { ScratchDefinition } from './scratchOrgSettingsGenerator';
import { generateScratchOrgInfo } from './scratchOrgInfoGenerator';
import { ScratchOrgFeatureDeprecation } from './scratchOrgFeatureDeprecation';
import { RemoteSourceTrackingService } from './source/remoteSourceTrackingService';

Messages.importMessagesDirectory(__dirname);
const messages: Messages = Messages.loadMessages('@salesforce/core', 'scratchOrgCreateCommand');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Flags extends OutputFlags<any> {
  setalias?: string;
  setdefaultusername?: boolean;
  apiversion?: string;
  definitionfile?: string;
  definitionjson?: string;
  wait?: Duration;
  clientid?: string;
  durationdays?: number;
  nonamespace?: boolean;
  noancestors?: boolean;
  retry?: number;
}
// A validator function to ensure any options parameters entered by the user adhere
// to a allowlist of valid option settings. Because org:create allows options to be
// input either key=value pairs or within the definition file, this validator is
// executed within the ctor and also after parsing/normalization of the definition file.
const optionsValidator = (key: string, scratchOrgInfoPayload: Record<string, unknown>): void => {
  if (key.toLowerCase() === 'durationdays') {
    throw new SfdxError('unrecognizedScratchOrgOption', 'durationDays');
  }

  if (key.toLowerCase() === 'snapshot') {
    const foundInvalidFields: string[] = [];
    ScratchOrgCreateCommand.SNAPSHOT_UNSUPPORTED_OPTIONS.forEach((invalidField) => {
      if (invalidField in scratchOrgInfoPayload) {
        foundInvalidFields.push(invalidField);
      }
    });

    if (foundInvalidFields.length > 0) {
      throw new SfdxError(
        messages.getMessage('unsupportedSnapshotOrgCreateOptions', [foundInvalidFields.join(', ')]),
        'orgSnapshot'
      );
    }
  }
};

/**
 * constructs a create command helper
 *
 * @param force - the force api
 * @constructor
 */
export class ScratchOrgCreateCommand {
  public static readonly SNAPSHOT_UNSUPPORTED_OPTIONS = [
    'features',
    'orgPreferences',
    'edition',
    'sourceOrg',
    'settingsPath',
    'releaseVersion',
    'language',
  ];

  private hubOrg: Org;
  private scratchOrg!: Org;
  private scratchOrgInfoId!: string;
  private scratchOrgInfo!: ScratchOrgInfo;
  private varargs: Record<string, unknown>;
  private flags: Flags;
  private logger!: Logger;
  private configAggregator: ConfigAggregator;
  private settingsGenerator: SettingsGenerator;

  public constructor(hubOrg: Org, flags: Flags, varargs: Record<string, unknown>, configAggregator: ConfigAggregator) {
    this.hubOrg = hubOrg;
    this.flags = flags;
    this.varargs = varargs;
    this.configAggregator = configAggregator;
    this.settingsGenerator = new SettingsGenerator();
  }

  /**
   * executes the command. this is a protocol style function intended to be represented by other commands.
   *
   * @param cliContext - the cli context
   * @param stdinValues - param values obtained from stdin
   * @returns {Promise}
   */
  public async execute(
    clientSecret: string
  ): Promise<{ orgId: Optional<string>; username: Optional<string>; warnings: Optional<string[]> }> {
    this.logger = await Logger.child('scratchOrgCreateCommand');
    this.logger.debug('scratchOrgCreateCommand: execute');

    const scratchOrgInfo = await this.getScratchOrgInfo();
    this.scratchOrgInfo = scratchOrgInfo.scratchOrgInfo;
    const warnings = scratchOrgInfo.warnings;

    // gets the scratch org settings (will use in both signup paths AND to deploy the settings)
    await this.settingsGenerator.extract(this.scratchOrgInfo as ScratchDefinition);
    this.logger.debug(`the scratch org def file has settings: ${this.settingsGenerator.hasSettings()}`);

    // creates the scratch org info in the devhub
    const scratchOrgInfoRequestResult = await requestScratchOrgCreation(
      this.hubOrg,
      this.scratchOrgInfo as ScratchDefinition,
      this.settingsGenerator
    );

    if (scratchOrgInfoRequestResult.success === true) {
      this.scratchOrgInfoId = scratchOrgInfoRequestResult.id;
      this.logger.debug(`scratch org has recordId ${this.scratchOrgInfoId}`);
    }
    const scratchOrgInfoResult = await pollForScratchOrgInfo(this.hubOrg, this.scratchOrgInfoId, this.flags.wait);

    let signupTargetLoginUrlConfig!: string;
    try {
      const project = await SfdxProject.resolve();
      const projectJson = await project.resolveProjectConfig();
      signupTargetLoginUrlConfig = projectJson.signupTargetLoginUrl as string;
    } catch {
      // a project isn't required for org:create
    }

    const scratchOrgAuthInfo = await authorizeScratchOrg({
      scratchOrgInfoComplete: scratchOrgInfoResult,
      hubOrg: this.hubOrg,
      clientSecret,
      setAsDefault: ensureBoolean(this.flags.setdefaultusername),
      alias: this.flags.setalias,
      signupTargetLoginUrlConfig,
      retry: this.flags.retry || 0,
    });
    // we'll need this scratch org connection later;
    this.scratchOrg = await Org.create({ connection: await Connection.create({ authInfo: scratchOrgAuthInfo }) });

    const orgData = await deploySettingsAndResolveUrl(
      scratchOrgAuthInfo,
      this.flags.apiversion ??
        (this.configAggregator.getPropertyValue('apiVersion') as string) ??
        (await this.scratchOrg.retrieveMaxApiVersion()),
      this.settingsGenerator
    );
    this.logger.trace('Settings deployed to org');
    /** updating the revision num to zero during org:creation if source members are created during org:create.This only happens for some specific scratch org definition file.*/
    await this.updateRevisionCounterToZero();
    // initialize the maxRevision.json file.
    try {
      await RemoteSourceTrackingService.getInstance({ username: ensureString(this.scratchOrg.getUsername()) });
    } catch (err) {
      // Do nothing. If org:create is not executed within sfdx project, allow the org to be created without errors.
      this.logger.debug(`Failed to create the maxRevision.json file due to the error : ${err.message}`);
    }

    // emit postorgcreate event for hook
    const postOrgCreateHookInfo: OrgCreateResult = [orgData]
      .map((result) => result?.getFields())
      .map((element) => ({
        accessToken: element?.accessToken,
        clientId: element?.clientId,
        created: element?.created,
        createdOrgInstance: element?.createdOrgInstance,
        devHubUsername: element?.devHubUsername,
        expirationDate: element?.expirationDate,
        instanceUrl: element?.instanceUrl,
        loginUrl: element?.loginUrl,
        orgId: element?.orgId,
        username: element?.username,
      }))[0];
    await Lifecycle.getInstance().emit('postorgcreate', postOrgCreateHookInfo);

    return {
      orgId: orgData?.getFields().orgId,
      username: this.scratchOrg.getUsername(),
      warnings,
    };
  }

  // Returns a valid signup json object
  private async getScratchOrgInfo(): Promise<{ scratchOrgInfo: ScratchOrgInfo; warnings: string[] }> {
    const warnings: string[] = [];
    // Varargs input overrides definitionjson (-j option; hidden/deprecated)
    const definitionJson = this.flags.definitionjson ? JSON.parse(this.flags.definitionjson) : {};
    const orgConfigInput = { ...definitionJson, ...(this.varargs ?? {}) };

    let scratchOrgInfoPayload = orgConfigInput;

    // the -f option
    if (this.flags.definitionfile) {
      try {
        const fileData = await fs.readFile(this.flags.definitionfile, 'utf8');
        const defFileContents = parseJson(fileData) as Record<string, unknown>;
        // definitionjson and varargs override file input
        scratchOrgInfoPayload = { ...defFileContents, ...orgConfigInput };
      } catch (err) {
        const error = err as Error;
        if (error.name === 'SyntaxError') {
          throw new SfdxError(`An error occurred parsing ${this.flags.definitionfile}`);
        }
      }
    }

    // scratchOrgInfoPayload must be heads down camelcase.
    const upperCaseKey = sfdc.findUpperCaseKeys(scratchOrgInfoPayload);
    if (upperCaseKey) {
      throw new SfdxError('InvalidJsonCasing', upperCaseKey);
    }

    // Now run the fully resolved user input against the validator
    Object.keys(scratchOrgInfoPayload).forEach((key) => {
      optionsValidator(key, scratchOrgInfoPayload);
    });

    // the -i option
    if (this.flags.clientid) {
      scratchOrgInfoPayload.connectedAppConsumerKey = this.flags.clientid;
    }

    // the -d option
    scratchOrgInfoPayload.durationDays = this.flags.durationdays;

    // Ignore ancestor ids only when 'nonamespace' or 'noancestors' options are specified
    const ignoreAncestorIds = this.flags.nonamespace || this.flags.noancestors || false;

    // Throw warnings for deprecated scratch org features.
    const scratchOrgFeatureDeprecation = new ScratchOrgFeatureDeprecation();
    scratchOrgFeatureDeprecation.getFeatureWarnings(scratchOrgInfoPayload.features).forEach((warning) => {
      warnings.push(warning);
    });

    const scratchOrgInfo = await generateScratchOrgInfo({
      hubOrg: this.hubOrg,
      scratchOrgInfoPayload,
      nonamespace: this.flags.nonamespace,
      ignoreAncestorIds,
    });

    return {
      scratchOrgInfo,
      warnings,
    };
  }

  private async updateRevisionCounterToZero() {
    const conn = this.scratchOrg.getConnection();
    const queryResult = await conn.tooling.sobject('SourceMember').find({ RevisionCounter: { $gt: 0 } }, ['Id']);
    try {
      await conn.tooling
        .sobject('SourceMember')
        .update(queryResult.map((record) => ({ Id: record.Id, RevisionCounter: 0 })));
    } catch (err) {
      const message = messages.getMessage('SourceStatusResetFailure', [
        this.scratchOrg.getOrgId(),
        this.scratchOrg.getUsername(),
      ]);
      throw new SfdxError(message, 'SourceStatusResetFailure');
    }
  }
}
