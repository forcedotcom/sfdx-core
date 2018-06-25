/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Messages } from './lib/messages';
Messages.importMessagesDirectory(__dirname);

export {
    Aliases,
    AliasGroup
} from './lib/config/aliases';

export {
    AuthInfoConfig
} from './lib/config/authInfoConfig';

export {
    ConfigFile,
    ConfigOptions
} from './lib/config/configFile';

export {
    ConfigGroup,
    ConfigGroupOptions
} from './lib/config/configGroup';

export {
    BaseConfigStore,
    ConfigContents,
    ConfigEntry,
    ConfigStore,
    ConfigValue
} from './lib/config/configStore';

export {
    OrgUsersConfig
} from './lib/config/orgUsersConfig';

export {
    ConfigPropertyMeta,
    ConfigPropertyMetaInput,
    ORG_DEFAULT,
    Config
} from './lib/config/config';

export {
    ConfigInfo,
    LOCATIONS,
    ConfigAggregator
} from './lib/config/configAggregator';

export {
    AuthFields,
    AuthInfo,
    SFDC_URLS
} from './lib/authInfo';

export {
    Connection,
    SFDX_HTTP_HEADERS
} from './lib/connection';

export {
    Mode,
    Global
} from './lib/global';

export {
    Fields,
    FieldValue,
    LoggerLevel,
    LoggerLevelValue,
    LoggerOptions,
    LoggerStream,
    Logger
} from './lib/logger';

export {
    Messages
} from './lib/messages';

export {
    Org,
    OrgFields
} from './lib/org';

export {
    Project,
    SfdxProjectJson
} from './lib/project';

export {
    SchemaPrinter
} from './lib/schemaPrinter';

export {
    SchemaValidator
} from './lib/schemaValidator';

export {
    SfdxError,
    SfdxErrorConfig
} from './lib/sfdxError';

export {
    AnyDictionary,
    AnyJson,
    Dictionary,
    JsonArray,
    JsonMap
} from './lib/types';

export {
    TableOptions,
    UX
} from './lib/ux';

// Utility sub-modules
import * as fs from './lib/util/fs';
import * as json from './lib/util/json';
import * as sfdc from './lib/util/sfdc';
export {
    fs,
    json,
    sfdc
};
