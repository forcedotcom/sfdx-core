/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from './messages';
Messages.importMessagesDirectory(__dirname);

export { OAuth2Options } from 'jsforce';

export { Aliases, AliasGroup } from './config/aliases';

export { AuthInfoConfig } from './config/authInfoConfig';

export { ConfigFile } from './config/configFile';

export { ConfigGroup } from './config/configGroup';

export { BaseConfigStore, ConfigContents, ConfigEntry, ConfigStore, ConfigValue } from './config/configStore';

export { DeviceOauthService, DeviceCodeResponse, DeviceCodePollingResponse } from './deviceOauthService';

export { OrgUsersConfig } from './config/orgUsersConfig';

export { ConfigPropertyMeta, ConfigPropertyMetaInput, Config } from './config/config';

export { ConfigInfo, ConfigAggregator } from './config/configAggregator';

export { Authorization, AuthFields, AuthInfo, OAuth2WithVerifier } from './authInfo';

export { AuthConfigs, AuthRemover } from './authRemover';

export { Connection, SFDX_HTTP_HEADERS } from './connection';

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

export { Messages } from './messages';

export { Org } from './org';

export { PackageDir, NamedPackageDir, PackageDirDependency, SfdxProject, SfdxProjectJson } from './sfdxProject';

export { SchemaPrinter } from './schema/printer';

export { SchemaValidator } from './schema/validator';

export { SfdxError, SfdxErrorConfig } from './sfdxError';

export { StatusResult } from './status/client';

export { PollingClient } from './status/pollingClient';

export { CometClient, CometSubscription, StreamingClient } from './status/streamingClient';

export { MyDomainResolver } from './status/myDomainResolver';

export { DefaultUserFields, REQUIRED_FIELDS, User, UserFields } from './user';

export { PermissionSetAssignment, PermissionSetAssignmentFields } from './permissionSetAssignment';

// Utility sub-modules
export * from './util/fs';
export * from './util/sfdc';
