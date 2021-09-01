/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin } from 'path';
import { Messages } from '../messages';

Messages.importMessagesDirectory(pathJoin(__dirname));
const messages = Messages.load('@salesforce/core', 'config', ['targetOrg', 'targetDevHub']);

export enum OrgConfigProperties {
  TARGET_ORG = 'target-org',
  TARGET_DEV_HUB = 'target-dev-hub',
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
];
