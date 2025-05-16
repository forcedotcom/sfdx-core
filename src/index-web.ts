/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * based on the bundle for vscode dekstop, this is the web bundle for the browser
 * this is deliberately a subset of all that index.ts exports.  It keeps the bundle smaller.
 * stuff not in here may still be included in the bundle, but it's not exported unless we know we have a use for it in a web-based extension.
 */

// an ugly bit of browser polyfill.  Not sure why the esbuild polyfill doesn't do this
// @ts-expect-error doing browse stuff
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
window.global = window;

/* exported for QA/testing in the browser. Do not use */
export * as fs from 'node:fs';

export { envVars, EnvironmentVariable, SUPPORTED_ENV_VARS, EnvVars } from './config/envVars';

export { StateAggregator } from './stateAggregator/stateAggregator';

export { ConfigInfo, ConfigAggregator } from './config/configAggregator';

export { AuthFields, AuthInfo, AuthSideEffects, OrgAuthorization } from './org/authInfo';

export { Connection, SFDX_HTTP_HEADERS } from './org/connection';

export { Mode, Global } from './global';

export { Lifecycle } from './lifecycleEvents';

export { SfdcUrl } from './util/sfdcUrl';

export { Fields, FieldValue, LoggerLevel, LoggerLevelValue, LogLine, LoggerOptions, Logger } from './logger/logger';

export { Messages, StructuredMessage } from './messages';

export { OrgConfigProperties, ORG_CONFIG_ALLOWED_PROPERTIES } from './org/orgConfigProperties';

export { NamedPackageDir, SfProject, SfProjectJson } from './sfProject';

export { SfError } from './sfError';

export { PollingClient } from './status/pollingClient';
