/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from './messages';
Messages.importMessagesDirectory(__dirname);

export {
    Aliases,
    AliasGroup
} from './config/aliases';

export {
    AuthInfoConfig
} from './config/authInfoConfig';

export {
    ConfigFile,
    ConfigOptions
} from './config/configFile';

export {
    ConfigGroup,
    ConfigGroupOptions
} from './config/configGroup';

export {
    BaseConfigStore,
    ConfigContents,
    ConfigEntry,
    ConfigStore,
    ConfigValue
} from './config/configStore';

export {
    OrgUsersConfig
} from './config/orgUsersConfig';

export {
    ConfigPropertyMeta,
    ConfigPropertyMetaInput,
    ORG_DEFAULT,
    Config
} from './config/config';

export {
    ConfigInfo,
    LOCATIONS,
    ConfigAggregator
} from './config/configAggregator';

export {
    AuthFields,
    AuthInfo,
    SFDC_URLS
} from './authInfo';

export {
    Connection,
    SFDX_HTTP_HEADERS
} from './connection';

export {
    Mode,
    Global
} from './global';

export {
    Fields,
    FieldValue,
    LoggerLevel,
    LoggerLevelValue,
    LoggerOptions,
    LoggerStream,
    Logger
} from './logger';

export {
    Messages
} from './messages';

export {
    Org,
    OrgFields
} from './org';

export {
    SfdxProject,
    SfdxProjectJson
} from './sfdxProject';

export {
    SchemaPrinter
} from './schemaPrinter';

export {
    SchemaValidator
} from './schemaValidator';

export {
    SfdxError,
    SfdxErrorConfig
} from './sfdxError';

export {
    AnyDictionary,
    AnyJson,
    Dictionary,
    JsonArray,
    JsonMap,
    Many
} from '@salesforce/ts-json';

export {
    StatusResult
} from './status/client';

export {
    PollingOptions,
    DefaultPollingOptions,
    PollingClient
} from './status/pollingClient';

export {
    CometClient,
    CometSubscription,
    DefaultStreamingOptions,
    StreamingClient,
    StreamingConnectionState,
    StreamingTimeoutError,
    StreamingOptions
} from './status/streamingClient';

export {
    Time,
    TIME_UNIT
} from './util/time';

export {
    DefaultUserFields,
    REQUIRED_FIELDS,
    User,
    UserFields
} from './user';

// Utility sub-modules
import * as fs from './util/fs';
export { fs };
import * as sfdc from './util/sfdc';
export { sfdc };
