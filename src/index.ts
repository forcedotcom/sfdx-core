/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from './messages';

Messages.importMessagesDirectory(__dirname);

export { OAuth2Config } from '@jsforce/jsforce-node';
export { ConfigFile } from './config/configFile';

export { TTLConfig } from './config/ttlConfig';

export { envVars, EnvironmentVariable, SUPPORTED_ENV_VARS, EnvVars } from './config/envVars';

export { ConfigStore } from './config/configStore';
export { ConfigEntry, ConfigContents, ConfigValue } from './config/configStackTypes';
export { StateAggregator } from './stateAggregator/stateAggregator';

export { DeviceOauthService, DeviceCodeResponse, DeviceCodePollingResponse } from './deviceOauthService';

export { OrgUsersConfig } from './config/orgUsersConfig';

export {
  ConfigPropertyMeta,
  ConfigPropertyMetaInput,
  Config,
  SfdxPropertyKeys,
  SfConfigProperties,
  SFDX_ALLOWED_PROPERTIES,
  SF_ALLOWED_PROPERTIES,
} from './config/config';

export { SandboxRequestCacheEntry, SandboxRequestCache } from './config/sandboxProcessCache';

export { ConfigInfo, ConfigAggregator } from './config/configAggregator';

export { AuthFields, AuthInfo, AuthSideEffects, OrgAuthorization } from './org/authInfo';

export { AuthRemover } from './org/authRemover';

export { Connection, SFDX_HTTP_HEADERS } from './org/connection';

export { Mode, Global } from './global';

export { Lifecycle } from './lifecycleEvents';

export { WebOAuthServer } from './webOAuthServer';

export { SfdcUrl } from './util/sfdcUrl';

export { getJwtAudienceUrl } from './util/getJwtAudienceUrl';

export { generateApiName } from './util/generateApiName';

export { Fields, FieldValue, LoggerLevel, LoggerLevelValue, LogLine, LoggerOptions, Logger } from './logger/logger';

export { Messages, StructuredMessage } from './messages';

export {
  Org,
  SandboxProcessObject,
  StatusEvent,
  SandboxInfo,
  SandboxEvents,
  SandboxUserAuthResponse,
  SandboxUserAuthRequest,
  SandboxRequest,
  ResumeSandboxRequest,
  OrgTypes,
  ResultEvent,
  ScratchOrgRequest,
} from './org/org';

export { OrgConfigProperties, ORG_CONFIG_ALLOWED_PROPERTIES } from './org/orgConfigProperties';

export { NamedPackageDir, SfProject, SfProjectJson } from './sfProject';

export { SchemaValidator } from './schema/validator';

export { SfError } from './sfError';

export { PollingClient } from './status/pollingClient';

export { CometClient, CometSubscription, StreamingClient, StatusResult } from './status/streamingClient';

export { MyDomainResolver } from './status/myDomainResolver';

export { DefaultUserFields, REQUIRED_FIELDS, User, UserFields } from './org/user';

export { PermissionSetAssignment, PermissionSetAssignmentFields } from './org/permissionSetAssignment';
export { lockInit } from './util/fileLocking';
export {
  ScratchOrgCreateOptions,
  ScratchOrgCreateResult,
  scratchOrgCreate,
  scratchOrgResume,
} from './org/scratchOrgCreate';

export { ScratchOrgInfo } from './org/scratchOrgTypes';
export {
  ScratchOrgLifecycleEvent,
  scratchOrgLifecycleEventName,
  scratchOrgLifecycleStages,
} from './org/scratchOrgLifecycleEvents';
export { ScratchOrgCache } from './org/scratchOrgCache';
export { default as ScratchOrgSettingsGenerator } from './org/scratchOrgSettingsGenerator';

// Utility sub-modules
export * from './util/sfdc';

export * from './util/mutex';
