/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export enum OrgConfigProperties {
  TARGET_ORG = 'target-org',
  TARGET_DEV_HUB = 'target-dev-hub',
}

export const ORG_CONFIG_ALLOWED_PROPERTIES = [
  {
    key: OrgConfigProperties.TARGET_ORG,
    description: 'The target to be used for any command communicating with an org.',
  },
  {
    key: OrgConfigProperties.TARGET_DEV_HUB,
    description: 'The target to be used for any command communicating with a dev hub org.',
  },
];
