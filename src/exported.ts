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

export { ConfigFile } from './config/configFile';

export { ConfigGroup } from './config/configGroup';

export { BaseConfigStore, ConfigContents, ConfigEntry, ConfigStore, ConfigValue } from './config/configStore';

export { GlobalInfo } from './config/globalInfoConfig';

export { DeviceOauthService, DeviceCodeResponse, DeviceCodePollingResponse } from './deviceOauthService';

export { OrgUsersConfig } from './config/orgUsersConfig';

export { ConfigPropertyMeta, ConfigPropertyMetaInput, Config } from './config/config';

export { ConfigInfo, ConfigAggregator } from './config/configAggregator';

export { Authorization, AuthFields, AuthInfo, OAuth2WithVerifier, SfdcUrl } from './org/authInfo';

export { AuthRemover } from './org/authRemover';

export { Connection, SFDX_HTTP_HEADERS } from './org/connection';

export { Mode, Global } from './global';

export { Lifecycle } from './lifecycleEvents';

export { WebOAuthServer } from './webOAuthServer';

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

export { Org } from './org/org';

export { PackageDir, NamedPackageDir, PackageDirDependency, SfdxProject, SfdxProjectJson } from './sfdxProject';

export { SchemaPrinter } from './schema/printer';

export { SchemaValidator } from './schema/validator';

export { SfdxError } from './sfdxError';

export { StatusResult } from './status/client';

export { PollingClient } from './status/pollingClient';

export { CometClient, CometSubscription, StreamingClient } from './status/streamingClient';

export { MyDomainResolver } from './status/myDomainResolver';

export { DefaultUserFields, REQUIRED_FIELDS, User, UserFields } from './org/user';

export { PermissionSetAssignment, PermissionSetAssignmentFields } from './org/permissionSetAssignment';

// Utility sub-modules
export * from './util/fs';
export * from './util/sfdc';
