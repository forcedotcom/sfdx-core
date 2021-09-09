/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { HelpSection } from '@oclif/core';
import { ORG_CONFIG_ALLOWED_PROPERTIES, OrgConfigProperties } from '../org/orgConfigProperties';
import { SFDX_ALLOWED_PROPERTIES, SfdxPropertyKeys } from '../config/config';
import { EnvironmentVariable, SUPPORTED_ENV_VARS } from '../config/envVars';

export const toHelpSection = (
  header: string,
  ...vars: Array<OrgConfigProperties | SfdxPropertyKeys | EnvironmentVariable>
): HelpSection => {
  const body = vars
    .map((v) => {
      const orgConfig = ORG_CONFIG_ALLOWED_PROPERTIES.find(({ key }) => {
        return key === v;
      });
      if (orgConfig) {
        return { name: orgConfig.key, description: orgConfig.description };
      }
      const sfdxProperty = SFDX_ALLOWED_PROPERTIES.find(({ key }) => key === v);
      if (sfdxProperty) {
        return { name: sfdxProperty.key.valueOf(), description: sfdxProperty.description };
      }
      const envVar = Object.entries(SUPPORTED_ENV_VARS).find(([k]) => k === v);

      if (envVar) {
        const [eKey, data] = envVar;
        return { name: eKey, description: data.description };
      }
      return undefined;
    })
    .filter((b) => b);
  return { header, body } as HelpSection;
};
