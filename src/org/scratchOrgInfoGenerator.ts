/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { promises as fs } from 'fs';
import { parseJson } from '@salesforce/kit';
import { ensureString } from '@salesforce/ts-types';
import { sfdc } from '../util/sfdc';
import { SfProjectJson } from '../sfProject';
import { WebOAuthServer } from '../webOAuthServer';
import { Messages } from '../messages';
import { SfError } from '../sfError';
import { Org } from './org';
import { ScratchOrgInfo } from './scratchOrgTypes';
import { ScratchOrgFeatureDeprecation } from './scratchOrgFeatureDeprecation';

const defaultConnectedAppInfo = {
  clientId: 'PlatformCLI',
  legacyClientId: 'SalesforceDevelopmentExperience',
  legacyClientSecret: '1384510088588713504',
};
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoGenerator');

type PartialScratchOrgInfo = Pick<
  ScratchOrgInfo,
  | 'ConnectedAppConsumerKey'
  | 'AuthCode'
  | 'Snapshot'
  | 'Status'
  | 'LoginUrl'
  | 'SignupEmail'
  | 'SignupUsername'
  | 'SignupInstance'
  | 'Username'
>;

export interface ScratchOrgInfoPayload extends PartialScratchOrgInfo {
  orgName: string;
  package2AncestorIds: string;
  features: string | string[];
  connectedAppConsumerKey: string;
  namespace: string;
  connectedAppCallbackUrl: string;
}

const SNAPSHOT_UNSUPPORTED_OPTIONS = [
  'features',
  'orgPreferences',
  'edition',
  'sourceOrg',
  'settingsPath',
  'releaseVersion',
  'language',
];

// A validator function to ensure any options parameters entered by the user adhere
// to a allowlist of valid option settings. Because org:create allows options to be
// input either key=value pairs or within the definition file, this validator is
// executed within the ctor and also after parsing/normalization of the definition file.
const optionsValidator = (key: string, scratchOrgInfoPayload: Record<string, unknown>): void => {
  if (key.toLowerCase() === 'durationdays') {
    throw new SfError('unrecognizedScratchOrgOption', 'durationDays');
  }

  if (key.toLowerCase() === 'snapshot') {
    const foundInvalidFields = SNAPSHOT_UNSUPPORTED_OPTIONS.filter(
      (invalidField) => invalidField in scratchOrgInfoPayload
    );

    if (foundInvalidFields.length > 0) {
      throw new SfError(
        messages.getMessage('unsupportedSnapshotOrgCreateOptions', [foundInvalidFields.join(', ')]),
        'orgSnapshot'
      );
    }
  }
};

/**
 * Generates the package2AncestorIds scratch org property
 *
 * @param scratchOrgInfo - the scratchOrgInfo passed in by the user
 * @param projectJson - sfProjectJson
 * @param hubOrg - the hub org, in case we need to do queries
 */
export const getAncestorIds = async (
  scratchOrgInfo: ScratchOrgInfoPayload,
  projectJson: SfProjectJson,
  hubOrg: Org
): Promise<string> => {
  if (Reflect.has(scratchOrgInfo, 'package2AncestorIds')) {
    throw new SfError(messages.getMessage('Package2AncestorsIdsKeyNotSupportedError'), 'DeprecationError');
  }
  const packagesWithAncestors = (await projectJson.getPackageDirectories())
    // check that the package has any ancestor types (id or version)
    .filter((packageDir) => packageDir.ancestorId || packageDir.ancestorVersion);
  if (packagesWithAncestors.length === 0) {
    return '';
  }
  const ancestorIds = await Promise.all(
    packagesWithAncestors.map(async (packageDir) => {
      // ancestorID can be 05i, or 04t, alias; OR "ancestorVersion": "4.6.0.1"
      // according to docs, 05i is not ok: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev2gp_config_file.htm

      // package can be an ID, but not according to docs
      const packageAliases = projectJson.get('packageAliases') as Record<string, unknown>;
      const packageId = packageAliases[ensureString(packageDir.package)] ?? packageDir.package;

      // Handle HIGHEST and NONE in ancestor(Version|Id).
      // Precedence chain: NONE -> HIGHEST -> ancestorVersion & ancestoryId
      if (packageDir.ancestorVersion === 'NONE' || packageDir.ancestorId === 'NONE') {
        return '';
      } else if (packageDir.ancestorVersion === 'HIGHEST' || packageDir.ancestorId === 'HIGHEST') {
        const query =
          'SELECT Id FROM Package2Version ' +
          `WHERE Package2Id = '${packageId}' AND IsReleased = True AND IsDeprecated = False AND PatchVersion = 0 ` +
          'ORDER BY MajorVersion Desc, MinorVersion Desc, PatchVersion Desc, BuildNumber Desc LIMIT 1';
        try {
          return (await hubOrg.getConnection().singleRecordQuery<{ Id: string }>(query, { tooling: true })).Id;
        } catch (err) {
          if (packageDir.ancestorVersion === 'HIGHEST') {
            throw new SfError(
              messages.getMessage('NoMatchingAncestorError', [packageDir.ancestorVersion, packageDir.package]),
              'NoMatchingAncestorError',
              [messages.getMessage('AncestorNotReleasedError', [packageDir.ancestorVersion])]
            );
          } else {
            throw new SfError(
              messages.getMessage('NoMatchingAncestorIdError', [packageDir.ancestorId, packageDir.package]),
              'NoMatchingAncestorIdError',
              [messages.getMessage('AncestorNotReleasedError', [packageDir.ancestorId])]
            );
          }
        }
      }

      if (packageDir.ancestorVersion) {
        if (!/^[0-9]+.[0-9]+.[0-9]+(.[0-9]+)?$/.test(packageDir.ancestorVersion)) {
          throw messages.createError('InvalidAncestorVersionFormatError', [packageDir.ancestorVersion]);
        }

        const [major, minor, patch] = packageDir.ancestorVersion.split('.');
        let releasedAncestor;
        try {
          releasedAncestor = await hubOrg
            .getConnection()
            .singleRecordQuery<{ Id: string; IsReleased: boolean }>(
              `SELECT Id, IsReleased FROM Package2Version WHERE Package2Id = '${packageId}' AND MajorVersion = ${major} AND MinorVersion = ${minor} AND PatchVersion = ${patch} and IsReleased = true`,
              { tooling: true }
            );
        } catch (err) {
          throw new SfError(
            messages.getMessage('NoMatchingAncestorError', [packageDir.ancestorVersion, packageDir.package]),
            'NoMatchingAncestorError',
            [messages.getMessage('AncestorNotReleasedError', [packageDir.ancestorVersion])]
          );
        }
        if (packageDir.ancestorId && packageDir.ancestorId !== releasedAncestor.Id) {
          throw messages.createError('AncestorIdVersionMismatchError', [
            packageDir.ancestorVersion,
            packageDir.ancestorId,
          ]);
        }

        return releasedAncestor.Id;
      }

      if (packageDir?.ancestorId?.startsWith('05i')) {
        // if it's already a 05i return it, otherwise query for it
        return packageDir.ancestorId;
      }
      if (packageDir?.ancestorId?.startsWith('04t')) {
        // query for the Id
        return (
          await hubOrg
            .getConnection()
            .singleRecordQuery<{ Id: string }>(
              `SELECT Id FROM Package2Version WHERE SubscriberPackageVersionId = '${packageDir.ancestorId}'`,
              { tooling: true }
            )
        ).Id;
      }
      // ancestorID can be an alias; get it from projectJson
      if (packageDir.ancestorId && packageAliases?.[packageDir.ancestorId]) {
        return packageAliases[packageDir.ancestorId];
      }
      throw new SfError(`Invalid ancestorId ${packageDir.ancestorId}`, 'InvalidAncestorId');
    })
  );

  // strip out '' due to NONE
  return Array.from(new Set(ancestorIds.filter((id) => id !== ''))).join(';');
};

/**
 * Takes in a scratchOrgInfo and fills in the missing fields
 *
 * @param hubOrg the environment hub org
 * @param scratchOrgInfoPayload - the scratchOrgInfo passed in by the user
 * @param nonamespace create the scratch org with no namespace
 * @param ignoreAncestorIds true if the sfdx-project.json ancestorId keys should be ignored
 */
export const generateScratchOrgInfo = async ({
  hubOrg,
  scratchOrgInfoPayload,
  nonamespace,
  ignoreAncestorIds,
}: {
  hubOrg: Org;
  scratchOrgInfoPayload: ScratchOrgInfoPayload;
  nonamespace?: boolean;
  ignoreAncestorIds?: boolean;
}): Promise<ScratchOrgInfoPayload> => {
  let sfProject!: SfProjectJson;
  try {
    sfProject = await SfProjectJson.create({});
  } catch (e) {
    // project is not required
  }
  scratchOrgInfoPayload.orgName = scratchOrgInfoPayload.orgName ?? 'Company';

  scratchOrgInfoPayload.package2AncestorIds =
    !ignoreAncestorIds && sfProject?.hasPackages()
      ? await getAncestorIds(scratchOrgInfoPayload, sfProject, hubOrg)
      : '';

  // Use the Hub org's client ID value, if one wasn't provided to us, or the default
  if (!scratchOrgInfoPayload.connectedAppConsumerKey) {
    scratchOrgInfoPayload.connectedAppConsumerKey =
      hubOrg.getConnection().getAuthInfoFields().clientId ?? defaultConnectedAppInfo.clientId;
  }

  if (!nonamespace && sfProject?.get('namespace')) {
    scratchOrgInfoPayload.namespace = sfProject.get('namespace') as string;
  }

  // we already have the info, and want to get rid of configApi, so this doesn't use that
  scratchOrgInfoPayload.connectedAppCallbackUrl = `http://localhost:${await WebOAuthServer.determineOauthPort()}/OauthRedirect`;
  return scratchOrgInfoPayload;
};

/**
 * Returns a valid signup json
 *
 * definitionjson org definition in JSON format
 * definitionfile path to an org definition file
 * connectedAppConsumerKey The connected app consumer key. May be null for JWT OAuth flow.
 * durationdays duration of the scratch org (in days) (default:1, min:1, max:30)
 * nonamespace create the scratch org with no namespace
 * noancestors do not include second-generation package ancestors in the scratch org
 * orgConfig overrides definitionjson
 *
 * @returns scratchOrgInfoPayload: ScratchOrgInfoPayload;
 ignoreAncestorIds: boolean;
 warnings: string[];
 */
export const getScratchOrgInfoPayload = async (options: {
  durationDays: number;
  definitionjson?: string;
  definitionfile?: string;
  connectedAppConsumerKey?: string;
  nonamespace?: boolean;
  noancestors?: boolean;
  orgConfig?: Record<string, unknown>;
}): Promise<{
  scratchOrgInfoPayload: ScratchOrgInfoPayload;
  ignoreAncestorIds: boolean;
  warnings: string[];
}> => {
  let warnings: string[] = [];
  // orgConfig input overrides definitionjson (-j option; hidden/deprecated)
  const definitionJson = options.definitionjson ? JSON.parse(options.definitionjson) : {};
  const orgConfigInput = { ...definitionJson, ...(options.orgConfig ?? {}) };

  let scratchOrgInfoPayload = orgConfigInput;

  // the -f option
  if (options.definitionfile) {
    try {
      const fileData = await fs.readFile(options.definitionfile, 'utf8');
      const defFileContents = parseJson(fileData) as Record<string, unknown>;
      // definitionjson and orgConfig override file input
      scratchOrgInfoPayload = { ...defFileContents, ...orgConfigInput };
    } catch (err) {
      const error = err as Error;
      if (error.name === 'JsonParseError') {
        throw new SfError(`An error occurred parsing ${options.definitionfile}`);
      }
      throw SfError.wrap(error);
    }
  }

  // scratchOrgInfoPayload must be heads down camelcase.
  const upperCaseKey = sfdc.findUpperCaseKeys(scratchOrgInfoPayload);
  if (upperCaseKey) {
    throw new SfError('InvalidJsonCasing', upperCaseKey);
  }

  // Now run the fully resolved user input against the validator
  Object.keys(scratchOrgInfoPayload).forEach((key) => {
    optionsValidator(key, scratchOrgInfoPayload);
  });

  if (options.connectedAppConsumerKey) {
    scratchOrgInfoPayload.connectedAppConsumerKey = options.connectedAppConsumerKey;
  }

  scratchOrgInfoPayload.durationDays = options.durationDays;

  // Throw warnings for deprecated scratch org features.
  const scratchOrgFeatureDeprecation = new ScratchOrgFeatureDeprecation();

  // convert various supported array and string formats to a semi-colon-delimited string
  if (scratchOrgInfoPayload.features) {
    if (typeof scratchOrgInfoPayload.features === 'string') {
      scratchOrgInfoPayload.features = scratchOrgInfoPayload.features.split(/[;,]/);
    }
    warnings = scratchOrgFeatureDeprecation.getFeatureWarnings(scratchOrgInfoPayload.features);
    scratchOrgInfoPayload.features = scratchOrgInfoPayload.features.map((feature: string) => feature.trim());
    scratchOrgInfoPayload.features = scratchOrgFeatureDeprecation
      .filterDeprecatedFeatures(scratchOrgInfoPayload.features)
      .join(';');
  }

  return {
    scratchOrgInfoPayload,
    // Ignore ancestor ids only when 'nonamespace' or 'noancestors' options are specified
    ignoreAncestorIds: options.nonamespace || options.noancestors || false,
    warnings,
  };
};
