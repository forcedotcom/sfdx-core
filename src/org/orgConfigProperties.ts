/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { isString } from '@salesforce/ts-types';
import { ConfigValue } from '../config/configStore';
import { Messages } from '../messages';
import { SfdcUrl } from '../util/sfdcUrl';
import { sfdc } from '../util/sfdc';

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.load('@salesforce/core', 'config', [
  'invalidApiVersion',
  'invalidBooleanConfigValue',
  'invalidInstanceUrl',
  'invalidIsvDebuggerSid',
  'invalidIsvDebuggerUrl',
  'invalidNumberConfigValue',
  'org-api-version',
  'org-instance-url',
  'org-isv-debugger-sid',
  'org-isv-debugger-url',
  'org-max-query-limit',
  'target-dev-hub',
  'target-org',
]);

export enum OrgConfigProperties {
  /**
   * Username associate with the default org.
   */
  TARGET_ORG = 'target-org',
  /**
   * Username associated with the default dev hub org.
   */
  TARGET_DEV_HUB = 'target-dev-hub',
  /**
   * The api version
   */
  ORG_API_VERSION = 'org-api-version',
  /**
   * Custom templates repo or local location.
   */
  ORG_CUSTOM_METADATA_TEMPLATES = 'org-custom-metadata-templates',
  /**
   * Allows users to override the 10,000 result query limit.
   */
  ORG_MAX_QUERY_LIMIT = 'org-max-query-limit',
  /**
   * The instance url of the org.
   */
  ORG_INSTANCE_URL = 'org-instance-url',
  /**
   * The sid for the debugger configuration.
   */
  ORG_ISV_DEBUGGER_SID = 'org-isv-debugger-sid',
  /**
   * The url for the debugger configuration.
   */
  ORG_ISV_DEBUGGER_URL = 'org-isv-debugger-url',
}

export const ORG_CONFIG_ALLOWED_PROPERTIES = [
  {
    key: OrgConfigProperties.TARGET_ORG,
    description: messages.getMessage(OrgConfigProperties.TARGET_ORG),
  },
  {
    key: OrgConfigProperties.TARGET_DEV_HUB,
    description: messages.getMessage(OrgConfigProperties.TARGET_DEV_HUB),
  },
  {
    key: OrgConfigProperties.ORG_INSTANCE_URL,
    description: messages.getMessage(OrgConfigProperties.ORG_INSTANCE_URL),
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => {
        if (value == null) return true;
        // validate if the value is a string and is a valid url and is either a salesforce domain
        // or an internal url.
        return (
          isString(value) &&
          SfdcUrl.isValidUrl(value) &&
          (new SfdcUrl(value).isSalesforceDomain() || new SfdcUrl(value).isInternalUrl())
        );
      },
      failedMessage: messages.getMessage('invalidInstanceUrl'),
    },
  },
  {
    key: OrgConfigProperties.ORG_API_VERSION,
    description: messages.getMessage(OrgConfigProperties.ORG_API_VERSION),
    hidden: true,
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => value == null || (isString(value) && sfdc.validateApiVersion(value)),
      failedMessage: messages.getMessage('invalidApiVersion'),
    },
  },
  {
    key: OrgConfigProperties.ORG_ISV_DEBUGGER_SID,
    description: messages.getMessage(OrgConfigProperties.ORG_ISV_DEBUGGER_SID),
    encrypted: true,
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => value == null || isString(value),
      failedMessage: messages.getMessage('invalidIsvDebuggerSid'),
    },
  },
  {
    key: OrgConfigProperties.ORG_ISV_DEBUGGER_URL,
    description: messages.getMessage(OrgConfigProperties.ORG_ISV_DEBUGGER_URL),
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value: ConfigValue) => value == null || isString(value),
      failedMessage: messages.getMessage('invalidIsvDebuggerUrl'),
    },
  },
  {
    key: OrgConfigProperties.ORG_MAX_QUERY_LIMIT,
    description: messages.getMessage(OrgConfigProperties.ORG_MAX_QUERY_LIMIT),
    input: {
      // the bit shift will remove the negative bit, and any decimal numbers
      // then the parseFloat will handle converting it to a number from a string
      validator: (value: ConfigValue) =>
        (value as number) >>> 0 === parseFloat(value as string) && (value as number) > 0,
      failedMessage: messages.getMessage('invalidNumberConfigValue'),
    },
  },
];
