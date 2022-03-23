/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { ConfigValue } from '../config/configStore';
import { Messages } from '../messages';

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.load('@salesforce/core', 'config', [
  'invalidBooleanConfigValue',
  'metadataRestDeploy',
  'targetOrg',
  'targetDevHub',
]);

export enum OrgConfigProperties {
  TARGET_ORG = 'target-org',
  TARGET_DEV_HUB = 'target-dev-hub',
  METADATA_REST_DEPLOY = 'metadata-rest-deploy',
}

export const ORG_CONFIG_ALLOWED_PROPERTIES = [
  {
    key: OrgConfigProperties.TARGET_ORG,
    description: messages.getMessage('targetOrg'),
  },
  {
    key: OrgConfigProperties.TARGET_DEV_HUB,
    description: messages.getMessage('targetDevHub'),
  },
  {
    key: OrgConfigProperties.METADATA_REST_DEPLOY,
    description: messages.getMessage('metadataRestDeploy'),
    hidden: true,
    input: {
      validator: (value: ConfigValue) => value != null && ['true', 'false'].includes(value.toString()),
      failedMessage: messages.getMessage('invalidBooleanConfigValue'),
    },
  },
];
