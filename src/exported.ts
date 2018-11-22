/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Messages } from './messages';
Messages.importMessagesDirectory(__dirname);

export { Aliases, AliasGroup } from './config/aliases';

export { AuthInfoConfig } from './config/authInfoConfig';

export { ConfigFile } from './config/configFile';

export { ConfigGroup } from './config/configGroup';

export { BaseConfigStore, ConfigContents, ConfigEntry, ConfigStore, ConfigValue } from './config/configStore';

export { OrgUsersConfig } from './config/orgUsersConfig';

export { ConfigPropertyMeta, ConfigPropertyMetaInput, ORG_DEFAULT, Config } from './config/config';

export { ConfigInfo, Location, ConfigAggregator } from './config/configAggregator';

export { AuthFields, AuthInfo, SfdcUrl } from './authInfo';

export { Connection, SFDX_HTTP_HEADERS } from './connection';

export { Mode, Global } from './global';

export {
  Fields,
  FieldValue,
  LoggerLevel,
  LoggerLevelValue,
  LogLine,
  LoggerOptions,
  LoggerStream,
  Logger
} from './logger';

export { Messages } from './messages';

export { Org, OrgFields } from './org';

export { SfdxProject, SfdxProjectJson } from './sfdxProject';

export { SchemaPrinter } from './schema/printer';

export { SchemaValidator } from './schema/validator';

export { SfdxError, SfdxErrorConfig } from './sfdxError';

export { StatusResult } from './status/client';

export { PollingClient } from './status/pollingClient';

export { CometClient, CometSubscription, StreamingClient } from './status/streamingClient';

export { MyDomainResolver } from './status/myDomainResolver';

export { DefaultUserFields, REQUIRED_FIELDS, User, UserFields } from './user';

// Utility sub-modules
import * as fs from './util/fs';
export { fs };
import * as sfdc from './util/sfdc';
export { sfdc };
