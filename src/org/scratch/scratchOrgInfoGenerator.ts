/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { promises as fs } from 'node:fs';
import { parseJson } from '@salesforce/kit';
import { isString } from '@salesforce/ts-types';
import { SfProjectJson, isPackaged } from '../../sfProject';
import { WebOAuthServer } from '../../webOAuthServer';
import { Messages } from '../../messages';
import { SfError } from '../../sfError';
import { Org } from '../org';
import { DEFAULT_CONNECTED_APP_INFO } from '../authInfo';
import { queryAncestorFromHighest, packageHasAncestorVersion, queryIdFromAncestorVersion } from './ancestorQueries';
import { ScratchOrgInfo } from './scratchOrgTypes';
import { ScratchOrgFeatureDeprecation } from './scratchOrgFeatureDeprecation';

Messages.importMessagesDirectory(__dirname);
export const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoGenerator');

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

export type ScratchOrgInfoPayload = {
  orgName: string;
  package2AncestorIds: string;
  features: string | string[];
  connectedAppConsumerKey: string;
  namespace?: string;
  connectedAppCallbackUrl: string;
  durationDays: number;
} & PartialScratchOrgInfo;

const SNAPSHOT_UNSUPPORTED_OPTIONS = [
  'features',
  'orgPreferences',
  'edition',
  'sourceOrg',
  'settingsPath',
  'releaseVersion',
];

// A validator function to ensure any options parameters entered by the user adhere
// to a allowlist of valid option settings. Because org:create allows options to be
// input either key=value pairs or within the definition file, this validator is
// executed within the ctor and also after parsing/normalization of the definition file.
const optionsValidator = (key: string, scratchOrgInfoPayload: ScratchOrgInfoPayload): void => {
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
    .filter(isPackaged)
    // check that the package has any ancestor types (id or version)
    .filter((packageDir) => packageDir.ancestorId ?? packageDir.ancestorVersion);
  if (packagesWithAncestors.length === 0) {
    return '';
  }
  const packageAliases = projectJson.get('packageAliases') as Record<string, string>;
  const conn = hubOrg.getConnection();

  const ancestorIds = (
    await Promise.all(
      packagesWithAncestors.map(async (packageDir) => {
        // ancestorID can be 05i, or 04t, alias; OR "ancestorVersion": "4.6.0.1"
        // according to docs, 05i is not ok: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev2gp_config_file.htm

        // package can be an ID, but not according to docs
        const packageId = packageAliases[packageDir.package] ?? packageDir.package;

        // Handle HIGHEST and NONE in ancestor(Version|Id).
        // Precedence chain: NONE -> HIGHEST -> ancestorVersion & ancestoryId
        if (packageDir.ancestorVersion === 'NONE' || packageDir.ancestorId === 'NONE') {
          return undefined;
        }
        if (packageDir.ancestorVersion === 'HIGHEST' || packageDir.ancestorId === 'HIGHEST') {
          return queryAncestorFromHighest({ packageId, packageDir, conn });
        }

        if (packageHasAncestorVersion(packageDir)) {
          return queryIdFromAncestorVersion({ packageId, packageDir, conn });
        }

        if (packageDir.ancestorId?.startsWith('05i')) {
          // if it's already a 05i return it, otherwise query for it
          return packageDir.ancestorId;
        }
        if (packageDir.ancestorId?.startsWith('04t')) {
          // query for the Id
          return (
            await conn.singleRecordQuery<{ Id: string }>(
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
    )
  ).filter(isString); // strip out undefined due to NONE

  return Array.from(new Set(ancestorIds)).join(';');
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

  const { namespace: originalNamespace, ...payload } = scratchOrgInfoPayload;

  const namespace = originalNamespace ?? sfProject?.get('namespace');

  return {
    ...payload,
    orgName: scratchOrgInfoPayload.orgName ?? 'Company',
    // we already have the info, and want to get rid of configApi, so this doesn't use that
    connectedAppCallbackUrl: `http://localhost:${await WebOAuthServer.determineOauthPort()}/OauthRedirect`,
    ...(!nonamespace && namespace ? { namespace } : {}),
    // Use the Hub org's client ID value, if one wasn't provided to us, or the default
    connectedAppConsumerKey:
      scratchOrgInfoPayload.connectedAppConsumerKey ??
      hubOrg.getConnection().getAuthInfoFields().clientId ??
      DEFAULT_CONNECTED_APP_INFO.clientId,
    package2AncestorIds:
      !ignoreAncestorIds && sfProject?.hasPackages()
        ? await getAncestorIds(scratchOrgInfoPayload, sfProject, hubOrg)
        : '',
  };
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

  // orgConfig input overrides definitionjson (-j option; hidden/deprecated) overrides definitionfile (-f option)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const scratchOrgInfoPayload: ScratchOrgInfoPayload = {
    ...(options.definitionfile ? await parseDefinitionFile(options.definitionfile) : {}),
    ...(options.definitionjson ? JSON.parse(options.definitionjson) : {}),
    ...(options.orgConfig ?? {}),
  };

  // scratchOrgInfoPayload must be heads down camelcase.
  Object.keys(scratchOrgInfoPayload).forEach((key) => {
    if (key[0].toUpperCase() === key[0]) {
      throw new SfError('InvalidJsonCasing', key);
    }
  });

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
    ignoreAncestorIds: options.nonamespace ?? options.noancestors ?? false,
    warnings,
  };
};

const parseDefinitionFile = async (definitionFile: string): Promise<Record<string, unknown>> => {
  try {
    const fileData = await fs.readFile(definitionFile, 'utf8');
    const defFileContents = parseJson(fileData) as Record<string, unknown>;
    return defFileContents;
  } catch (err) {
    const error = err as Error;
    if (error.name === 'JsonParseError') {
      throw new SfError(`An error occurred parsing ${definitionFile}`);
    }
    throw SfError.wrap(error);
  }
};
