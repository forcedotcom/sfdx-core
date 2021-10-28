/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// Node
import { promises as fs } from 'fs';

// @salesforce
import { parseJson } from '@salesforce/kit';
import { ensureString } from '@salesforce/ts-types';

// Local
import { Org } from './org';
import { sfdc } from './util/sfdc';
import { SfdxProjectJson } from './sfdxProject';
import { WebOAuthServer } from './webOAuthServer';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { ScratchOrgInfo } from './scratchOrgInfoApi';
import { ScratchOrgFeatureDeprecation } from './scratchOrgFeatureDeprecation';

const defaultConnectedAppInfo = {
  clientId: 'PlatformCLI',
  legacyClientId: 'SalesforceDevelopmentExperience',
  legacyClientSecret: '1384510088588713504',
};
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoGenerator');

export interface ScratchOrgInfoPayload extends ScratchOrgInfo {
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
    throw new SfdxError('unrecognizedScratchOrgOption', 'durationDays');
  }

  if (key.toLowerCase() === 'snapshot') {
    const foundInvalidFields = SNAPSHOT_UNSUPPORTED_OPTIONS.filter(
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
 * Generates the package2AncestorIds scratch org property
 * Rewrite of similar code in pkgUtils, but without dependency on old toolbelt core
 *
 * @param scratchOrgInfo - the scratchOrgInfo passed in by the user
 * @param projectJson - sfdxProjectJson
 * @param hubOrg - the hub org, in case we need to do queries
 */
export const getAncestorIds = async (
  scratchOrgInfo: ScratchOrgInfoPayload,
  projectJson: SfdxProjectJson,
  hubOrg: Org
): Promise<string> => {
  if (Object.prototype.hasOwnProperty.call(scratchOrgInfo, 'package2AncestorIds')) {
    throw new Error(messages.getMessage('errorpackage2AncestorIdsKeyNotSupported'));
  }
  const packagesWithAncestors = (await projectJson.getPackageDirectories())
    // check that the package has any ancestor types (id or version)
    .filter((packageDir) => packageDir.ancestorId || packageDir.ancestorVersion);
  if (packagesWithAncestors.length === 0) {
    return '';
  }
  const ancestorIds = await Promise.all(
    packagesWithAncestors.map(async (packageDir) => {
      // ancestorID can be 05i, or 04t, alias; OR "ancestorVersion": "4.6.0.1" according to toolbelt code
      // according to docs, 05i is not ok: https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev2gp_config_file.htm
      if (packageDir.ancestorVersion) {
        if (
          !/^[0-9]+.[0-9]+.[0-9]+.[0-9]+$/.test(packageDir.ancestorVersion) &&
          !/^[0-9]+.[0-9]+.[0-9]+$/.test(packageDir.ancestorVersion)
        ) {
          throw new Error(messages.getMessage('errorInvalidAncestorVersionFormat', [packageDir.ancestorVersion]));
        }
        // package can be an ID in original toolbelt code, but not according to docs
        const packageAliases = projectJson.get('packageAliases') as Record<string, unknown>;
        const packageId = packageAliases[ensureString(packageDir.package)] ?? packageDir.package;
        const splits = packageDir.ancestorVersion.split('.');
        let releasedAncestor;
        try {
          releasedAncestor = await hubOrg
            .getConnection()
            .singleRecordQuery<{ Id: string; IsReleased: boolean }>(
              `SELECT Id, IsReleased FROM Package2Version WHERE Package2Id = '${packageId}' AND MajorVersion = ${splits[0]} AND MinorVersion = ${splits[1]} AND PatchVersion = ${splits[2]} and IsReleased = true`,
              { tooling: true }
            );
        } catch (err) {
          throw new SfdxError(
            messages.getMessage('errorNoMatchingAncestor', [packageDir.ancestorVersion, packageDir.package]),
            'errorNoMatchingAncestor',
            [messages.getMessage('errorAncestorNotReleased', [packageDir.ancestorVersion])]
          );
        }
        if (packageDir.ancestorId && packageDir.ancestorId !== releasedAncestor.Id) {
          throw new Error(
            messages.getMessage('errorAncestorIdVersionMismatch', [packageDir.ancestorVersion, packageDir.ancestorId])
          );
        }

        return releasedAncestor.Id;
      }

      if (packageDir.ancestorId) {
        if (packageDir.ancestorId.startsWith('05i')) {
          return packageDir.ancestorId;
        }
        if (packageDir.ancestorId.startsWith('04t')) {
          return (
            await hubOrg
              .getConnection()
              .singleRecordQuery<{ Id: string }>(
                `SELECT Id FROM Package2Version WHERE SubscriberPackageVersionId = '${packageDir.ancestorId}'`,
                { tooling: true }
              )
          ).Id;
        }
        const packageAliases = projectJson.get('packageAliases') as Record<string, unknown>;
        if (packageAliases?.[packageDir.ancestorId]) {
          return packageAliases?.[packageDir.ancestorId];
        }
        throw new Error(`Invalid ancestorId ${packageDir.ancestorId}`);
      }
    })
  );

  return Array.from(new Set(ancestorIds)).join(';');
};

/**
 * Takes in a scratchOrgInfo and fills in the missing fields
 *
 * @param hubOrg
 * @param scratchOrgInfoPayload - the scratchOrgInfo passed in by the user
 * @param nonamespace - true if the org should have no namespace
 * @param ignoreAncestorIds - true if the sfdx-project.json ancestorId keys should be ignored
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
  let sfdxProject!: SfdxProjectJson;
  try {
    sfdxProject = await SfdxProjectJson.create({});
  } catch (e) {
    // project is not required
  }
  scratchOrgInfoPayload.orgName = scratchOrgInfoPayload.orgName ?? 'Company';

  scratchOrgInfoPayload.package2AncestorIds =
    !ignoreAncestorIds && sfdxProject?.hasPackages()
      ? await getAncestorIds(scratchOrgInfoPayload, sfdxProject, hubOrg)
      : '';

  // Use the Hub org's client ID value, if one wasn't provided to us, or the default
  if (!scratchOrgInfoPayload.connectedAppConsumerKey) {
    scratchOrgInfoPayload.connectedAppConsumerKey =
      hubOrg.getConnection().getAuthInfoFields().clientId ?? defaultConnectedAppInfo.clientId;
  }

  if (!nonamespace && sfdxProject?.get('namespace')) {
    scratchOrgInfoPayload.namespace = sfdxProject.get('namespace') as string;
  }

  // we already have the info, and want to get rid of configApi, so this doesn't use that
  scratchOrgInfoPayload.connectedAppCallbackUrl = `http://localhost:${await WebOAuthServer.determineOauthPort()}/OauthRedirect`;
  return scratchOrgInfoPayload;
};

/**
 * Returns a valid signup json
 *
 * @param definitionjson
 * @param definitionfile
 * @param connectedAppConsumerKey
 * @param durationdays
 * @param nonamespace
 * @param noancestors
 * @param orgConfig
 * @returns scratchOrgInfoPayload: ScratchOrgInfoPayload;
            ignoreAncestorIds: boolean;
            warnings: string[]; 
 */
export const getScratchOrgInfoPayload = async (options: {
  definitionjson: string;
  definitionfile: string;
  connectedAppConsumerKey: string;
  durationDays: number;
  nonamespace: boolean;
  noancestors: boolean;
  orgConfig: Record<string, unknown>;
}): Promise<{
  scratchOrgInfoPayload: ScratchOrgInfoPayload;
  ignoreAncestorIds: boolean;
  warnings: string[];
}> => {
  const warnings: string[] = [];
  // Varargs input overrides definitionjson (-j option; hidden/deprecated)
  const definitionJson = options.definitionjson ? JSON.parse(options.definitionjson) : {};
  const orgConfigInput = { ...definitionJson, ...(options.orgConfig ?? {}) };

  let scratchOrgInfoPayload = orgConfigInput;

  // the -f option
  if (options.definitionfile) {
    try {
      const fileData = await fs.readFile(options.definitionfile, 'utf8');
      const defFileContents = parseJson(fileData) as Record<string, unknown>;
      // definitionjson and varargs override file input
      scratchOrgInfoPayload = { ...defFileContents, ...orgConfigInput };
    } catch (err) {
      const error = err as Error;
      if (error.name === 'SyntaxError') {
        throw new SfdxError(`An error occurred parsing ${options.definitionfile}`);
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

  if (options.connectedAppConsumerKey) {
    scratchOrgInfoPayload.connectedAppConsumerKey = options.connectedAppConsumerKey;
  }

  scratchOrgInfoPayload.durationDays = options.durationDays;

  // Throw warnings for deprecated scratch org features.
  const scratchOrgFeatureDeprecation = new ScratchOrgFeatureDeprecation();
  scratchOrgFeatureDeprecation.getFeatureWarnings(scratchOrgInfoPayload.features).forEach((warning) => {
    warnings.push(warning);
  });

  // convert various supported array and string formats to a semi-colon-delimited string
  if (scratchOrgInfoPayload.features) {
    if (typeof scratchOrgInfoPayload.features === 'string') {
      const delimiter = scratchOrgInfoPayload.features.includes(';') ? ';' : ',';
      scratchOrgInfoPayload.features = scratchOrgInfoPayload.features.split(delimiter);
    }
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
