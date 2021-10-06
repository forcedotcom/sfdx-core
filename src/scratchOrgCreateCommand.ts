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
import { AsyncCreatable, parseJson } from '@salesforce/kit';
import { ensureBoolean, Optional } from '@salesforce/ts-types';

// Local
import { Org } from './org';
import { Logger } from './logger';
import { sfdc } from './util/sfdc';
import { AuthInfo } from './authInfo';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { Connection } from './connection';
import { SfdxProject } from './sfdxProject';
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
// ommited
// import { RemoteSourceTrackingService } from './source/remoteSourceTrackingService';

// export interface ScratchOrgCreateCommandOptions {
//   hubOrg: Org;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   flags: OutputFlags<any>;
//   varargs: Record<string, unknown>;
//   configAggregator: ConfigAggregator;
//   clientSecret: string;
// }

Messages.importMessagesDirectory(__dirname);
const messages: Messages = Messages.loadMessages('@salesforce/core', 'scratchOrgCreateCommand');

// A validator function to ensure any options parameters entered by the user adhere
// to a allowlist of valid option settings. Because org:create allows options to be
// input either key=value pairs or within the definition file, this validator is
// executed within the ctor and also after parsing/normalization of the definition file.
const optionsValidator = (key: string, scratchOrgInfoPayload: Record<string, unknown>): void => {
  if (key.toLowerCase() === 'durationdays') {
    throw new SfdxError('unrecognizedScratchOrgOption', 'durationDays');
  }

  if (key.toLowerCase() === 'snapshot') {
    const foundInvalidFields = ScratchOrgCreateCommand.SNAPSHOT_UNSUPPORTED_OPTIONS.filter(
      (invalidField) => invalidField in scratchOrgInfoPayload
    );

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
export class ScratchOrgCreateCommand extends AsyncCreatable<ScratchOrgCreateCommand.Options> {
  public static readonly SNAPSHOT_UNSUPPORTED_OPTIONS = [
    'features',
    'orgPreferences',
    'edition',
    'sourceOrg',
    'settingsPath',
    'releaseVersion',
    'language',
  ];

  public authInfo?: AuthInfo;
  public warnings: string[] = [];
  public username: Optional<string>;
  private scratchOrg!: Org;
  private scratchOrgInfoId!: string;
  private scratchOrgInfo!: ScratchOrgInfo;
  private logger!: Logger;
  private settingsGenerator: SettingsGenerator;

  public constructor(private options: ScratchOrgCreateCommand.Options) {
    super(options);
    this.settingsGenerator = new SettingsGenerator();
  }

  /**
   * executes the command. this is a protocol style function intended to be represented by other commands.
   *
   * @param cliContext - the cli context
   * @param stdinValues - param values obtained from stdin
   * @returns {Promise}
   */
  protected async init(): Promise<void> {
    this.logger = await Logger.child('scratchOrgCreateCommand');
    this.logger.debug('scratchOrgCreateCommand: execute');

    const scratchOrgInfo = await this.getScratchOrgInfo();
    this.scratchOrgInfo = scratchOrgInfo.scratchOrgInfo;
    this.warnings = scratchOrgInfo.warnings;

    // gets the scratch org settings (will use in both signup paths AND to deploy the settings)
    await this.settingsGenerator.extract(this.scratchOrgInfo as ScratchDefinition);
    this.logger.debug(`the scratch org def file has settings: ${this.settingsGenerator.hasSettings()}`);

    // creates the scratch org info in the devhub
    const scratchOrgInfoRequestResult = await requestScratchOrgCreation(
      this.options.hubOrg,
      this.scratchOrgInfo as ScratchDefinition,
      this.settingsGenerator
    );

    if (scratchOrgInfoRequestResult.success === true) {
      this.scratchOrgInfoId = scratchOrgInfoRequestResult.id;
      this.logger.debug(`scratch org has recordId ${this.scratchOrgInfoId}`);
    }
    const scratchOrgInfoResult = await pollForScratchOrgInfo(
      this.options.hubOrg,
      this.scratchOrgInfoId,
      this.options.flags.wait
    );

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
      hubOrg: this.options.hubOrg,
      clientSecret: this.options.clientSecret,
      setAsDefault: ensureBoolean(this.options.flags.setdefaultusername),
      alias: this.options.flags.setalias,
      signupTargetLoginUrlConfig,
      retry: this.options.flags.retry || 0,
    });
    // we'll need this scratch org connection later;
    this.scratchOrg = await Org.create({ connection: await Connection.create({ authInfo: scratchOrgAuthInfo }) });
    this.username = this.scratchOrg.getUsername();

    this.authInfo = await deploySettingsAndResolveUrl(
      scratchOrgAuthInfo,
      this.options.flags.apiversion ??
        (this.options.configAggregator.getPropertyValue('apiVersion') as string) ??
        (await this.scratchOrg.retrieveMaxApiVersion()),
      this.settingsGenerator
    );
    this.logger.trace('Settings deployed to org');
    /** updating the revision num to zero during org:creation if source members are created during org:create.This only happens for some specific scratch org definition file.*/
    await this.updateRevisionCounterToZero();
  }

  // Returns a valid signup json object
  private async getScratchOrgInfo(): Promise<{ scratchOrgInfo: ScratchOrgInfo; warnings: string[] }> {
    const warnings: string[] = [];
    // Varargs input overrides definitionjson (-j option; hidden/deprecated)
    const definitionJson = this.options.flags.definitionjson ? JSON.parse(this.options.flags.definitionjson) : {};
    const orgConfigInput = { ...definitionJson, ...(this.options.varargs ?? {}) };

    let scratchOrgInfoPayload = orgConfigInput;

    // the -f option
    if (this.options.flags.definitionfile) {
      try {
        const fileData = await fs.readFile(this.options.flags.definitionfile, 'utf8');
        const defFileContents = parseJson(fileData) as Record<string, unknown>;
        // definitionjson and varargs override file input
        scratchOrgInfoPayload = { ...defFileContents, ...orgConfigInput };
      } catch (err) {
        const error = err as Error;
        if (error.name === 'SyntaxError') {
          throw new SfdxError(`An error occurred parsing ${this.options.flags.definitionfile}`);
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
    if (this.options.flags.clientid) {
      scratchOrgInfoPayload.connectedAppConsumerKey = this.options.flags.clientid;
    }

    // the -d option
    scratchOrgInfoPayload.durationDays = this.options.flags.durationdays;

    // Ignore ancestor ids only when 'nonamespace' or 'noancestors' options are specified
    const ignoreAncestorIds = this.options.flags.nonamespace || this.options.flags.noancestors || false;

    // Throw warnings for deprecated scratch org features.
    const scratchOrgFeatureDeprecation = new ScratchOrgFeatureDeprecation();
    scratchOrgFeatureDeprecation.getFeatureWarnings(scratchOrgInfoPayload.features).forEach((warning) => {
      warnings.push(warning);
    });

    const scratchOrgInfo = await generateScratchOrgInfo({
      hubOrg: this.options.hubOrg,
      scratchOrgInfoPayload,
      nonamespace: this.options.flags.nonamespace,
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

export namespace ScratchOrgCreateCommand {
  /**
   * Constructor options for ScratchOrgCreateCommand.
   */
  export interface Options {
    hubOrg: Org;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    flags: OutputFlags<any>;
    varargs: Record<string, unknown>;
    configAggregator: ConfigAggregator;
    clientSecret: string;
  }
}
