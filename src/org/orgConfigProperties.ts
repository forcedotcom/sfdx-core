/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { isString } from '@salesforce/ts-types';
import { Aliases } from '../config/aliases';
import { ConfigAggregator } from '../config/configAggregator';
import { GlobalInfo } from '../config/globalInfoConfig';

export enum OrgConfigProperties {
  TARGET_ORG = 'target-org',
  TARGET_DEV_HUB = 'target-dev-hub',
}

function exist(aliasOrUsername: string) {
  try {
    const username = Aliases.get(aliasOrUsername) || aliasOrUsername;
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const globalInfo = GlobalInfo.instance || new GlobalInfo();
    globalInfo.readSync();
    return globalInfo.hasOrg(username);
  } catch (error) {
    return false;
  }
}

ConfigAggregator.getInstance().addAllowedProperties([
  {
    key: OrgConfigProperties.TARGET_ORG,
    description: 'The target to be used for any command communicating with an org.',
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value) => value == null || (isString(value) && exist(value)),
      failedMessage: 'org not authenticated',
    },
  },
  {
    key: OrgConfigProperties.TARGET_DEV_HUB,
    description: 'The target to be used for any command communicating with a dev hub org.',
    input: {
      // If a value is provided validate it otherwise no value is unset.
      validator: (value) => value == null || (isString(value) && exist(value)),
      failedMessage: 'org not authenticated',
    },
  },
]);
