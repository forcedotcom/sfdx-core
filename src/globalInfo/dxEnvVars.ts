/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join as pathJoin } from 'path';
import { Dictionary, Nullable } from '@salesforce/ts-types';
import { camelCase, snakeCase } from 'change-case';
import { env, Env } from '@salesforce/kit';
import { Messages } from '../messages';
import { Global } from '../global';

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.loadMessages('@salesforce/core', 'envVars');
export enum EnvironmentVariable {
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
  'SF_TARGET_ORG' = 'SF_TARGET_ORG',
  'SF_TARGET_DEV_HUB' = 'SF_TARGET_DEV_HUB',
  'SF_ACCESS_TOKEN' = 'SF_ACCESS_TOKEN',
  'SF_API_VERSION' = 'SF_API_VERSION',
  'SF_AUDIENCE_URL' = 'SF_AUDIENCE_URL',
  'SF_CODE_COVERAGE_REQUIREMENT' = 'SF_CODE_COVERAGE_REQUIREMENT',
  'SF_CONTENT_TYPE' = 'SF_CONTENT_TYPE',
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
  synonymOf: Nullable<string>;
};
type EnvType = {
  [key in EnvironmentVariable]: EnvMetaData;
};

const getMessage = (environmentVariable: EnvironmentVariable): string =>
  messages.getMessage(camelCase(environmentVariable));

export const DX_SUPPORTED_ENV_VARS: EnvType = {
  [EnvironmentVariable.FORCE_SHOW_SPINNER]: {
    description: getMessage(EnvironmentVariable.FORCE_SHOW_SPINNER),
    synonymOf: null,
  },
  [EnvironmentVariable.FORCE_SPINNER_DELAY]: {
    description: getMessage(EnvironmentVariable.FORCE_SPINNER_DELAY),
    synonymOf: null,
  },
  [EnvironmentVariable.FORCE_OPEN_URL]: {
    description: getMessage(EnvironmentVariable.FORCE_OPEN_URL),
    synonymOf: null,
  },
  [EnvironmentVariable.HTTP_PROXY]: {
    description: getMessage(EnvironmentVariable.HTTP_PROXY),
    synonymOf: null,
  },
  [EnvironmentVariable.HTTPS_PROXY]: {
    description: getMessage(EnvironmentVariable.HTTPS_PROXY),
    synonymOf: null,
  },
  [EnvironmentVariable.NODE_EXTRA_CA_CERTS]: {
    description: getMessage(EnvironmentVariable.NODE_EXTRA_CA_CERTS),
    synonymOf: null,
  },
  [EnvironmentVariable.NODE_TLS_REJECT_UNAUTHORIZED]: {
    description: getMessage(EnvironmentVariable.NODE_TLS_REJECT_UNAUTHORIZED),
    synonymOf: null,
  },
  // sfdx vars
  [EnvironmentVariable.SFDX_ACCESS_TOKEN]: {
    description: getMessage(EnvironmentVariable.SFDX_ACCESS_TOKEN),
    synonymOf: EnvironmentVariable.SF_ACCESS_TOKEN,
  },
  [EnvironmentVariable.SFDX_API_VERSION]: {
    description: getMessage(EnvironmentVariable.SFDX_API_VERSION),
    synonymOf: EnvironmentVariable.SF_API_VERSION,
  },
  [EnvironmentVariable.SFDX_AUDIENCE_URL]: {
    description: getMessage(EnvironmentVariable.SFDX_AUDIENCE_URL),
    synonymOf: EnvironmentVariable.SF_AUDIENCE_URL,
  },
  [EnvironmentVariable.SFDX_CODE_COVERAGE_REQUIREMENT]: {
    description: getMessage(EnvironmentVariable.SFDX_CODE_COVERAGE_REQUIREMENT),
    synonymOf: EnvironmentVariable.SF_CODE_COVERAGE_REQUIREMENT,
  },
  [EnvironmentVariable.SFDX_CONTENT_TYPE]: {
    description: getMessage(EnvironmentVariable.SFDX_CONTENT_TYPE),
    synonymOf: EnvironmentVariable.SF_CONTENT_TYPE,
  },
  [EnvironmentVariable.SFDX_DEFAULTDEVHUBUSERNAME]: {
    description: getMessage(EnvironmentVariable.SFDX_DEFAULTDEVHUBUSERNAME),
    synonymOf: EnvironmentVariable.SF_TARGET_DEV_HUB,
  },
  [EnvironmentVariable.SFDX_DEFAULTUSERNAME]: {
    description: getMessage(EnvironmentVariable.SFDX_DEFAULTUSERNAME),
    synonymOf: EnvironmentVariable.SF_TARGET_ORG,
  },
  [EnvironmentVariable.SFDX_DISABLE_AUTOUPDATE]: {
    description: getMessage(EnvironmentVariable.SFDX_DISABLE_AUTOUPDATE),
    synonymOf: EnvironmentVariable.SF_DISABLE_AUTOUPDATE,
  },
  [EnvironmentVariable.SFDX_AUTOUPDATE_DISABLE]: {
    description: getMessage(EnvironmentVariable.SFDX_AUTOUPDATE_DISABLE),
    synonymOf: EnvironmentVariable.SF_AUTOUPDATE_DISABLE,
  },
  [EnvironmentVariable.SFDX_DISABLE_SOURCE_MEMBER_POLLING]: {
    description: getMessage(EnvironmentVariable.SFDX_DISABLE_SOURCE_MEMBER_POLLING),
    synonymOf: EnvironmentVariable.SF_DISABLE_SOURCE_MEMBER_POLLING,
  },
  [EnvironmentVariable.SFDX_DISABLE_TELEMETRY]: {
    description: getMessage(EnvironmentVariable.SFDX_DISABLE_TELEMETRY),
    synonymOf: EnvironmentVariable.SF_DISABLE_TELEMETRY,
  },
  [EnvironmentVariable.SFDX_DNS_TIMEOUT]: {
    description: getMessage(EnvironmentVariable.SFDX_DNS_TIMEOUT),
    synonymOf: EnvironmentVariable.SF_DNS_TIMEOUT,
  },
  [EnvironmentVariable.SFDX_DOMAIN_RETRY]: {
    description: getMessage(EnvironmentVariable.SFDX_DOMAIN_RETRY),
    synonymOf: EnvironmentVariable.SF_DOMAIN_RETRY,
  },
  [EnvironmentVariable.SFDX_IMPROVED_CODE_COVERAGE]: {
    description: getMessage(EnvironmentVariable.SFDX_IMPROVED_CODE_COVERAGE),
    synonymOf: EnvironmentVariable.SF_IMPROVED_CODE_COVERAGE,
  },
  [EnvironmentVariable.SFDX_INSTANCE_URL]: {
    description: getMessage(EnvironmentVariable.SFDX_INSTANCE_URL),
    synonymOf: EnvironmentVariable.SF_INSTANCE_URL,
  },
  [EnvironmentVariable.SFDX_JSON_TO_STDOUT]: {
    description: getMessage(EnvironmentVariable.SFDX_JSON_TO_STDOUT),
    synonymOf: EnvironmentVariable.SF_JSON_TO_STDOUT,
  },
  [EnvironmentVariable.SFDX_LOG_LEVEL]: {
    description: getMessage(EnvironmentVariable.SFDX_LOG_LEVEL),
    synonymOf: EnvironmentVariable.SF_LOG_LEVEL,
  },
  [EnvironmentVariable.SFDX_MAX_QUERY_LIMIT]: {
    description: getMessage(EnvironmentVariable.SFDX_MAX_QUERY_LIMIT),
    synonymOf: EnvironmentVariable.SF_MAX_QUERY_LIMIT,
  },
  [EnvironmentVariable.SFDX_MDAPI_TEMP_DIR]: {
    description: getMessage(EnvironmentVariable.SFDX_MDAPI_TEMP_DIR),
    synonymOf: EnvironmentVariable.SF_MDAPI_TEMP_DIR,
  },
  [EnvironmentVariable.SFDX_NPM_REGISTRY]: {
    description: getMessage(EnvironmentVariable.SFDX_NPM_REGISTRY),
    synonymOf: EnvironmentVariable.SF_NPM_REGISTRY,
  },
  [EnvironmentVariable.SFDX_PRECOMPILE_ENABLE]: {
    description: getMessage(EnvironmentVariable.SFDX_PRECOMPILE_ENABLE),
    synonymOf: EnvironmentVariable.SF_PRECOMPILE_ENABLE,
  },
  [EnvironmentVariable.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE]: {
    description: getMessage(EnvironmentVariable.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE),
    synonymOf: EnvironmentVariable.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE,
  },
  [EnvironmentVariable.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE]: {
    description: messages.getMessage(
      camelCase(EnvironmentVariable.SFDX_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE)
    ),
    synonymOf: EnvironmentVariable.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE,
  },
  [EnvironmentVariable.SFDX_REST_DEPLOY]: {
    description: getMessage(EnvironmentVariable.SFDX_REST_DEPLOY),
    synonymOf: EnvironmentVariable.SF_REST_DEPLOY,
  },
  [EnvironmentVariable.SFDX_SOURCE_MEMBER_POLLING_TIMEOUT]: {
    description: getMessage(EnvironmentVariable.SFDX_SOURCE_MEMBER_POLLING_TIMEOUT),
    synonymOf: EnvironmentVariable.SF_SOURCE_MEMBER_POLLING_TIMEOUT,
  },
  [EnvironmentVariable.SFDX_USE_GENERIC_UNIX_KEYCHAIN]: {
    description: getMessage(EnvironmentVariable.SFDX_USE_GENERIC_UNIX_KEYCHAIN),
    synonymOf: EnvironmentVariable.SF_USE_GENERIC_UNIX_KEYCHAIN,
  },
  [EnvironmentVariable.SFDX_USE_PROGRESS_BAR]: {
    description: getMessage(EnvironmentVariable.SFDX_USE_PROGRESS_BAR),
    synonymOf: EnvironmentVariable.SF_USE_PROGRESS_BAR,
  },
  [EnvironmentVariable.SF_TARGET_ORG]: {
    description: getMessage(EnvironmentVariable.SF_TARGET_ORG),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_TARGET_DEV_HUB]: {
    description: getMessage(EnvironmentVariable.SF_TARGET_DEV_HUB),
    synonymOf: null,
  },
  // sf vars
  [EnvironmentVariable.SF_ACCESS_TOKEN]: {
    description: getMessage(EnvironmentVariable.SF_ACCESS_TOKEN),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_API_VERSION]: {
    description: getMessage(EnvironmentVariable.SF_API_VERSION),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_AUDIENCE_URL]: {
    description: getMessage(EnvironmentVariable.SF_AUDIENCE_URL),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_CODE_COVERAGE_REQUIREMENT]: {
    description: getMessage(EnvironmentVariable.SF_CODE_COVERAGE_REQUIREMENT),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_CONTENT_TYPE]: {
    description: getMessage(EnvironmentVariable.SF_CONTENT_TYPE),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_DISABLE_AUTOUPDATE]: {
    description: getMessage(EnvironmentVariable.SF_DISABLE_AUTOUPDATE),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_AUTOUPDATE_DISABLE]: {
    description: getMessage(EnvironmentVariable.SF_AUTOUPDATE_DISABLE),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_DISABLE_SOURCE_MEMBER_POLLING]: {
    description: getMessage(EnvironmentVariable.SF_DISABLE_SOURCE_MEMBER_POLLING),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_DISABLE_TELEMETRY]: {
    description: getMessage(EnvironmentVariable.SF_DISABLE_TELEMETRY),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_DNS_TIMEOUT]: {
    description: getMessage(EnvironmentVariable.SF_DNS_TIMEOUT),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_DOMAIN_RETRY]: {
    description: getMessage(EnvironmentVariable.SF_DOMAIN_RETRY),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_IMPROVED_CODE_COVERAGE]: {
    description: getMessage(EnvironmentVariable.SF_IMPROVED_CODE_COVERAGE),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_INSTANCE_URL]: {
    description: getMessage(EnvironmentVariable.SF_INSTANCE_URL),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_JSON_TO_STDOUT]: {
    description: getMessage(EnvironmentVariable.SF_JSON_TO_STDOUT),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_LOG_LEVEL]: {
    description: getMessage(EnvironmentVariable.SF_LOG_LEVEL),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_MAX_QUERY_LIMIT]: {
    description: getMessage(EnvironmentVariable.SF_MAX_QUERY_LIMIT),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_MDAPI_TEMP_DIR]: {
    description: getMessage(EnvironmentVariable.SF_MDAPI_TEMP_DIR),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_NPM_REGISTRY]: {
    description: getMessage(EnvironmentVariable.SF_NPM_REGISTRY),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_PRECOMPILE_ENABLE]: {
    description: getMessage(EnvironmentVariable.SF_PRECOMPILE_ENABLE),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE]: {
    description: getMessage(EnvironmentVariable.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_CREATE),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE]: {
    description: messages.getMessage(
      camelCase(EnvironmentVariable.SF_PROJECT_AUTOUPDATE_DISABLE_FOR_PACKAGE_VERSION_CREATE)
    ),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_REST_DEPLOY]: {
    description: getMessage(EnvironmentVariable.SF_REST_DEPLOY),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_SOURCE_MEMBER_POLLING_TIMEOUT]: {
    description: getMessage(EnvironmentVariable.SF_SOURCE_MEMBER_POLLING_TIMEOUT),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_USE_GENERIC_UNIX_KEYCHAIN]: {
    description: getMessage(EnvironmentVariable.SF_USE_GENERIC_UNIX_KEYCHAIN),
    synonymOf: null,
  },
  [EnvironmentVariable.SF_USE_PROGRESS_BAR]: {
    description: getMessage(EnvironmentVariable.SF_USE_PROGRESS_BAR),
    synonymOf: null,
  },
};

export class EnvVars extends Env {
  public constructor() {
    super();
    this.resolve();
  }

  public propertyToEnvName(property: string, prefix = 'SFDX_'): string {
    return `${prefix || ''}${snakeCase(property).toUpperCase()}`;
  }

  public setPropertyFromEnv(property: string, prefix = 'SFDX_'): void {
    const envName = this.propertyToEnvName(property, prefix);
    const value = this.getString(envName);
    if (value) {
      this.setString(property, value);
    }
  }

  public asDictionary(): Dictionary<string> {
    return this.entries().reduce((accumulator, [key, value]) => {
      accumulator[key] = value;
      return accumulator;
    }, {} as Dictionary<string>);
  }

  public asMap(): Map<string, string> {
    return this.entries().reduce((accumulator, [key, value]) => {
      accumulator.set(key, value);
      return accumulator;
    }, new Map<string, string>());
  }

  private resolve(): void {
    const overrideInteroperabilityEnvVar = process.env['TEST_OVERRIDE_GLOBAL_SF_SFDX_INTEROPERABILITY'];
    const interoperabilityEnabled =
      (overrideInteroperabilityEnvVar ? env.getBoolean(overrideInteroperabilityEnvVar) : true) &&
      Global.SFDX_INTEROPERABILITY;

    this.entries().forEach(([key, value]) => {
      if (DX_SUPPORTED_ENV_VARS[key as EnvironmentVariable]) {
        // cross populate value to synonym if synonym exists
        if (DX_SUPPORTED_ENV_VARS[key as EnvironmentVariable].synonymOf) {
          const synonym = DX_SUPPORTED_ENV_VARS[key as EnvironmentVariable].synonymOf;
          // set synonym only if it is in the map and running in interoperability mode
          if (synonym && interoperabilityEnabled) {
            this.setString(synonym, value);
          }
        }
      }
    });
  }
}
