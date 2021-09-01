/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join as pathJoin } from 'path';
import { Dictionary, Optional } from '@salesforce/ts-types';
import { camelCase } from 'change-case';
import { Messages } from '../messages';
import { Global } from '../global';

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.loadMessages('@salesforce/core', 'envVars');
export enum DxWellKnownEnvVars {
  'FORCE_OPEN_URL' = 'FORCE_OPEN_URL',
  'FORCE_SHOW_SPINNER' = 'FORCE_SHOW_SPINNER',
  'FORCE_SPINNER_DELAY' = 'FORCE_SPINNER_DELAY',
  'HTTP_PROXY' = 'HTTP_PROXY',
  'HTTPS_PROXY' = 'HTTPS_PROXY',
  'NODE_EXTRA_CA_CERTS' = 'NODE_EXTRA_CA_CERTS',
  'NODE_TLS_REJECT_UNAUTHORIZED' = 'NODE_TLS_REJECT_UNAUTHORIZED',
  'SFDX_ACCESS_TOKEN' = 'SFDX_ACCESS_TOKEN',
  'SFDX_API_VERSION' = 'SFDX_API_VERSION',
  'SFDX_AUDIENCE_URL' = 'SFDX_AUDIENCE_URL',
  'SFDX_CODE_COVERAGE_REQUIREMENT' = 'SFDX_CODE_COVERAGE_REQUIREMENT',
  'SFDX_CONTENT_TYPE' = 'SFDX_CONTENT_TYPE',
  'SFDX_DEFAULTDEVHUBUSERNAME' = 'SFDX_DEFAULTDEVHUBUSERNAME',
  'SFDX_DEFAULTUSERNAME' = 'SFDX_DEFAULTUSERNAME',
  'SFDX_DISABLE_AUTOUPDATE' = 'SFDX_DISABLE_AUTOUPDATE',
  'SFDX_AUTOUPDATE_DISABLE' = 'SFDX_AUTOUPDATE_DISABLE',
  'SFDX_DISABLE_SOURCE_MEMBER_POLLING' = 'SFDX_DISABLE_SOURCE_MEMBER_POLLING',
  'SFDX_DISABLE_TELEMETRY' = 'SFDX_DISABLE_TELEMETRY',
  'SFDX_DNS_TIMEOUT' = 'SFDX_DNS_TIMEOUT',
  'SFDX_DOMAIN_RETRY' = 'SFDX_DOMAIN_RETRY',
  'SFDX_IMPROVED_CODE_COVERAGE' = 'SFDX_IMPROVED_CODE_COVERAGE',
  'SFDX_INSTANCE_URL' = 'SFDX_INSTANCE_URL',
  'SFDX_JSON_TO_STDOUT' = 'SFDX_JSON_TO_STDOUT',
  'SFDX_LOG_LEVEL' = 'SFDX_LOG_LEVEL',
  'SFDX_MAX_QUERY_LIMIT' = 'SFDX_MAX_QUERY_LIMIT',
  'SFDX_MDAPI_TEMP_DIR' = 'SFDX_MDAPI_TEMP_DIR',
  'SFDX_NPM_REGISTRY' = 'SFDX_NPM_REGISTRY',
  'SFDX_PRECOMPILE_ENABLE' = 'SFDX_PRECOMPILE_ENABLE',
  'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE' = 'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE',
  'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE' = 'SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE',
  'SFDX_REST_DEPLOY' = 'SFDX_REST_DEPLOY',
  'SFDX_SOURCE_MEMBER_POLLING_TIMEOUT' = 'SFDX_SOURCE_MEMBER_POLLING_TIMEOUT',
  'SFDX_USE_GENERIC_UNIX_KEYCHAIN' = 'SFDX_USE_GENERIC_UNIX_KEYCHAIN',
  'SFDX_USE_PROGRESS_BAR' = 'SFDX_USE_PROGRESS_BAR',
  'TARGET_ORG' = 'TARGET_ORG',
  'TARGET_DEV_HUB' = 'TARGET_DEV_HUB',
  'SF_SFDX_INTEROPERABILITY' = 'SF_SFDX_INTEROPERABILITY',
  'SF_ACCESS_TOKEN' = 'SF_ACCESS_TOKEN',
  'SF_API_VERSION' = 'SF_API_VERSION',
  'SF_AUDIENCE_URL' = 'SF_AUDIENCE_URL',
  'SF_CODE_COVERAGE_REQUIREMENT' = 'SF_CODE_COVERAGE_REQUIREMENT',
  'SF_CONTENT_TYPE' = 'SF_CONTENT_TYPE',
  'SF_DEFAULTDEVHUBUSERNAME' = 'SF_DEFAULTDEVHUBUSERNAME',
  'SF_DEFAULTUSERNAME' = 'SF_DEFAULTUSERNAME',
  'SF_DISABLE_AUTOUPDATE' = 'SF_DISABLE_AUTOUPDATE',
  'SF_AUTOUPDATE_DISABLE' = 'SF_AUTOUPDATE_DISABLE',
  'SF_DISABLE_SOURCE_MEMBER_POLLING' = 'SF_DISABLE_SOURCE_MEMBER_POLLING',
  'SF_DISABLE_TELEMETRY' = 'SF_DISABLE_TELEMETRY',
  'SF_DNS_TIMEOUT' = 'SF_DNS_TIMEOUT',
  'SF_DOMAIN_RETRY' = 'SF_DOMAIN_RETRY',
  'SF_IMPROVED_CODE_COVERAGE' = 'SF_IMPROVED_CODE_COVERAGE',
  'SF_INSTANCE_URL' = 'SF_INSTANCE_URL',
  'SF_JSON_TO_STDOUT' = 'SF_JSON_TO_STDOUT',
  'SF_LOG_LEVEL' = 'SF_LOG_LEVEL',
  'SF_MAX_QUERY_LIMIT' = 'SF_MAX_QUERY_LIMIT',
  'SF_MDAPI_TEMP_DIR' = 'SF_MDAPI_TEMP_DIR',
  'SF_NPM_REGISTRY' = 'SF_NPM_REGISTRY',
  'SF_PRECOMPILE_ENABLE' = 'SF_PRECOMPILE_ENABLE',
  'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE' = 'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE',
  'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE' = 'SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE',
  'SF_REST_DEPLOY' = 'SF_REST_DEPLOY',
  'SF_SOURCE_MEMBER_POLLING_TIMEOUT' = 'SF_SOURCE_MEMBER_POLLING_TIMEOUT',
  'SF_USE_GENERIC_UNIX_KEYCHAIN' = 'SF_USE_GENERIC_UNIX_KEYCHAIN',
  'SF_USE_PROGRESS_BAR' = 'SF_USE_PROGRESS_BAR',
}
type EnvMetaData = {
  description: string;
  synonymOf: Optional<string>;
};
type EnvType = {
  [key: string]: EnvMetaData;
};
export const DX_SUPPORTED_ENV_VARS: EnvType = {
  [DxWellKnownEnvVars.FORCE_SHOW_SPINNER]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.FORCE_SHOW_SPINNER)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.FORCE_SPINNER_DELAY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.FORCE_SPINNER_DELAY)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.FORCE_OPEN_URL]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.FORCE_OPEN_URL)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.HTTP_PROXY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.HTTP_PROXY)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.HTTPS_PROXY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.HTTPS_PROXY)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.NODE_EXTRA_CA_CERTS]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.NODE_EXTRA_CA_CERTS)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.NODE_TLS_REJECT_UNAUTHORIZED]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.NODE_TLS_REJECT_UNAUTHORIZED)),
    synonymOf: undefined,
  },
  // sfdx vars
  [DxWellKnownEnvVars.SFDX_ACCESS_TOKEN]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_ACCESS_TOKEN)),
    synonymOf: DxWellKnownEnvVars.SF_ACCESS_TOKEN,
  },
  [DxWellKnownEnvVars.SFDX_API_VERSION]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_API_VERSION)),
    synonymOf: DxWellKnownEnvVars.SF_API_VERSION,
  },
  [DxWellKnownEnvVars.SFDX_AUDIENCE_URL]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_AUDIENCE_URL)),
    synonymOf: DxWellKnownEnvVars.SF_AUDIENCE_URL,
  },
  [DxWellKnownEnvVars.SFDX_CODE_COVERAGE_REQUIREMENT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_CODE_COVERAGE_REQUIREMENT)),
    synonymOf: DxWellKnownEnvVars.SF_CODE_COVERAGE_REQUIREMENT,
  },
  [DxWellKnownEnvVars.SFDX_CONTENT_TYPE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_CONTENT_TYPE)),
    synonymOf: DxWellKnownEnvVars.SF_CONTENT_TYPE,
  },
  [DxWellKnownEnvVars.SFDX_DEFAULTDEVHUBUSERNAME]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_DEFAULTDEVHUBUSERNAME)),
    synonymOf: DxWellKnownEnvVars.SF_DEFAULTDEVHUBUSERNAME,
  },
  [DxWellKnownEnvVars.SFDX_DEFAULTUSERNAME]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_DEFAULTUSERNAME)),
    synonymOf: DxWellKnownEnvVars.SF_DEFAULTUSERNAME,
  },
  [DxWellKnownEnvVars.SFDX_DISABLE_AUTOUPDATE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_DISABLE_AUTOUPDATE)),
    synonymOf: DxWellKnownEnvVars.SF_DISABLE_AUTOUPDATE,
  },
  [DxWellKnownEnvVars.SFDX_AUTOUPDATE_DISABLE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_AUTOUPDATE_DISABLE)),
    synonymOf: DxWellKnownEnvVars.SF_AUTOUPDATE_DISABLE,
  },
  [DxWellKnownEnvVars.SFDX_DISABLE_SOURCE_MEMBER_POLLING]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_DISABLE_SOURCE_MEMBER_POLLING)),
    synonymOf: DxWellKnownEnvVars.SF_DISABLE_SOURCE_MEMBER_POLLING,
  },
  [DxWellKnownEnvVars.SFDX_DISABLE_TELEMETRY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_DISABLE_TELEMETRY)),
    synonymOf: DxWellKnownEnvVars.SF_DISABLE_TELEMETRY,
  },
  [DxWellKnownEnvVars.SFDX_DNS_TIMEOUT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_DNS_TIMEOUT)),
    synonymOf: DxWellKnownEnvVars.SF_DNS_TIMEOUT,
  },
  [DxWellKnownEnvVars.SFDX_DOMAIN_RETRY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_DOMAIN_RETRY)),
    synonymOf: DxWellKnownEnvVars.SF_DOMAIN_RETRY,
  },
  [DxWellKnownEnvVars.SFDX_IMPROVED_CODE_COVERAGE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_IMPROVED_CODE_COVERAGE)),
    synonymOf: DxWellKnownEnvVars.SF_IMPROVED_CODE_COVERAGE,
  },
  [DxWellKnownEnvVars.SFDX_INSTANCE_URL]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_INSTANCE_URL)),
    synonymOf: DxWellKnownEnvVars.SF_INSTANCE_URL,
  },
  [DxWellKnownEnvVars.SFDX_JSON_TO_STDOUT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_JSON_TO_STDOUT)),
    synonymOf: DxWellKnownEnvVars.SF_JSON_TO_STDOUT,
  },
  [DxWellKnownEnvVars.SFDX_LOG_LEVEL]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_LOG_LEVEL)),
    synonymOf: DxWellKnownEnvVars.SF_LOG_LEVEL,
  },
  [DxWellKnownEnvVars.SFDX_MAX_QUERY_LIMIT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_MAX_QUERY_LIMIT)),
    synonymOf: DxWellKnownEnvVars.SF_MAX_QUERY_LIMIT,
  },
  [DxWellKnownEnvVars.SFDX_MDAPI_TEMP_DIR]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_MDAPI_TEMP_DIR)),
    synonymOf: DxWellKnownEnvVars.SF_MDAPI_TEMP_DIR,
  },
  [DxWellKnownEnvVars.SFDX_NPM_REGISTRY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_NPM_REGISTRY)),
    synonymOf: DxWellKnownEnvVars.SF_NPM_REGISTRY,
  },
  [DxWellKnownEnvVars.SFDX_PRECOMPILE_ENABLE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_PRECOMPILE_ENABLE)),
    synonymOf: DxWellKnownEnvVars.SF_PRECOMPILE_ENABLE,
  },
  [DxWellKnownEnvVars.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE)),
    synonymOf: DxWellKnownEnvVars.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE,
  },
  [DxWellKnownEnvVars.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE]: {
    description: messages.getMessage(
      camelCase(DxWellKnownEnvVars.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE)
    ),
    synonymOf: DxWellKnownEnvVars.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE,
  },
  [DxWellKnownEnvVars.SFDX_REST_DEPLOY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_REST_DEPLOY)),
    synonymOf: DxWellKnownEnvVars.SF_REST_DEPLOY,
  },
  [DxWellKnownEnvVars.SFDX_SOURCE_MEMBER_POLLING_TIMEOUT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_SOURCE_MEMBER_POLLING_TIMEOUT)),
    synonymOf: DxWellKnownEnvVars.SF_SOURCE_MEMBER_POLLING_TIMEOUT,
  },
  [DxWellKnownEnvVars.SFDX_USE_GENERIC_UNIX_KEYCHAIN]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_USE_GENERIC_UNIX_KEYCHAIN)),
    synonymOf: DxWellKnownEnvVars.SF_USE_GENERIC_UNIX_KEYCHAIN,
  },
  [DxWellKnownEnvVars.SFDX_USE_PROGRESS_BAR]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SFDX_USE_PROGRESS_BAR)),
    synonymOf: DxWellKnownEnvVars.SF_USE_PROGRESS_BAR,
  },
  [DxWellKnownEnvVars.TARGET_ORG]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.TARGET_ORG)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.TARGET_DEV_HUB]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.TARGET_DEV_HUB)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_SFDX_INTEROPERABILITY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_SFDX_INTEROPERABILITY)),
    synonymOf: undefined,
  },
  // sf vars
  [DxWellKnownEnvVars.SF_ACCESS_TOKEN]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_ACCESS_TOKEN)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_API_VERSION]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_API_VERSION)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_AUDIENCE_URL]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_AUDIENCE_URL)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_CODE_COVERAGE_REQUIREMENT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_CODE_COVERAGE_REQUIREMENT)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_CONTENT_TYPE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_CONTENT_TYPE)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_DEFAULTDEVHUBUSERNAME]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_DEFAULTDEVHUBUSERNAME)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_DEFAULTUSERNAME]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_DEFAULTUSERNAME)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_DISABLE_AUTOUPDATE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_DISABLE_AUTOUPDATE)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_AUTOUPDATE_DISABLE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_AUTOUPDATE_DISABLE)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_DISABLE_SOURCE_MEMBER_POLLING]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_DISABLE_SOURCE_MEMBER_POLLING)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_DISABLE_TELEMETRY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_DISABLE_TELEMETRY)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_DNS_TIMEOUT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_DNS_TIMEOUT)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_DOMAIN_RETRY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_DOMAIN_RETRY)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_IMPROVED_CODE_COVERAGE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_IMPROVED_CODE_COVERAGE)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_INSTANCE_URL]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_INSTANCE_URL)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_JSON_TO_STDOUT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_JSON_TO_STDOUT)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_LOG_LEVEL]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_LOG_LEVEL)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_MAX_QUERY_LIMIT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_MAX_QUERY_LIMIT)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_MDAPI_TEMP_DIR]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_MDAPI_TEMP_DIR)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_NPM_REGISTRY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_NPM_REGISTRY)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_PRECOMPILE_ENABLE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_PRECOMPILE_ENABLE)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE]: {
    description: messages.getMessage(
      camelCase(DxWellKnownEnvVars.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE)
    ),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_REST_DEPLOY]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_REST_DEPLOY)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_SOURCE_MEMBER_POLLING_TIMEOUT]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_SOURCE_MEMBER_POLLING_TIMEOUT)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_USE_GENERIC_UNIX_KEYCHAIN]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_USE_GENERIC_UNIX_KEYCHAIN)),
    synonymOf: undefined,
  },
  [DxWellKnownEnvVars.SF_USE_PROGRESS_BAR]: {
    description: messages.getMessage(camelCase(DxWellKnownEnvVars.SF_USE_PROGRESS_BAR)),
    synonymOf: undefined,
  },
};

export const envVarsResolve = (): Dictionary<string> => {
  const dict = {} as Dictionary<string>;
  Object.entries(process.env).forEach(([key, value]) => {
    // save all env vars to dictionary
    dict[key] = value;
    // cross populate value to synonym if synonym is null or undefined
    if (DX_SUPPORTED_ENV_VARS[key]) {
      if (DX_SUPPORTED_ENV_VARS[key].synonymOf) {
        const synonym = DX_SUPPORTED_ENV_VARS[key].synonymOf;
        // set synonym only if it is not set in in current env
        if (synonym && Global.SFDX_INTEROPERABILITY) {
          dict[synonym] = process.env[key];
          process.env[synonym] = dict[synonym];
        }
      }
    }
  });
  return dict;
};
