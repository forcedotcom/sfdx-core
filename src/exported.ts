/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from './messages';
Messages.importMessagesDirectory(__dirname);

export { OAuth2Config } from 'jsforce';

export { ConfigFile } from './config/configFile';

export { TTLConfig } from './config/ttlConfig';

export { envVars, EnvironmentVariable, SUPPORTED_ENV_VARS, EnvVars } from './config/envVars';

export { BaseConfigStore, ConfigContents, ConfigEntry, ConfigStore, ConfigValue } from './config/configStore';

export { GlobalInfo, SfEntry, SfInfo, SfInfoKeys, SfOrg, SfOrgs, SfToken, SfTokens } from './globalInfo';

export { DeviceOauthService, DeviceCodeResponse, DeviceCodePollingResponse } from './deviceOauthService';

export { OrgUsersConfig } from './config/orgUsersConfig';

export {
  ConfigPropertyMeta,
  ConfigPropertyMetaInput,
  Config,
  SfdxPropertyKeys,
  SFDX_ALLOWED_PROPERTIES,
} from './config/config';

export { ConfigInfo, ConfigAggregator } from './config/configAggregator';

export { AuthFields, AuthInfo, AuthSideEffects, OrgAuthorization } from './org/authInfo';

export { AuthRemover } from './org/authRemover';

export { Connection, SFDX_HTTP_HEADERS } from './org/connection';

export { Mode, Global } from './global';

export { Lifecycle } from './lifecycleEvents';

export { WebOAuthServer } from './webOAuthServer';

export { SfdcUrl } from './util/sfdcUrl';

export { getJwtAudienceUrl } from './util/getJwtAudienceUrl';

export {
  Fields,
  FieldValue,
  LoggerLevel,
  LoggerLevelValue,
  LogLine,
  LoggerOptions,
  LoggerStream,
  Logger,
} from './logger';

export { Messages, StructuredMessage } from './messages';

export {
  Org,
  SandboxProcessObject,
  StatusEvent,
  SandboxEvents,
  SandboxUserAuthResponse,
  SandboxUserAuthRequest,
  SandboxRequest,
  OrgTypes,
  ResultEvent,
  ScratchOrgRequest,
} from './org';

export { OrgConfigProperties, ORG_CONFIG_ALLOWED_PROPERTIES } from './org/orgConfigProperties';

export {
  PackageDir,
  NamedPackageDir,
  PackageDirDependency,
  SfProject,
  SfProjectJson,
  SfdxProject,
  SfdxProjectJson,
} from './sfProject';

export { SchemaPrinter } from './schema/printer';

export { SchemaValidator } from './schema/validator';

export { SfError, SfdxError } from './sfError';

export { PollingClient } from './status/pollingClient';

export { CometClient, CometSubscription, StreamingClient, StatusResult } from './status/streamingClient';

export { MyDomainResolver } from './status/myDomainResolver';

export { DefaultUserFields, REQUIRED_FIELDS, User, UserFields } from './org/user';

export { PermissionSetAssignment, PermissionSetAssignmentFields } from './org/permissionSetAssignment';

export { ScratchOrgCreateOptions, ScratchOrgCreateResult, scratchOrgCreate } from './org/scratchOrgCreate';

export { ScratchOrgInfo } from './org/scratchOrgInfoApi';

// Utility sub-modules
export * from './util/sfdc';
export * from './util/sfdcUrl';
