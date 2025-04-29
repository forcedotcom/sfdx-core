/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Logger } from '../logger/logger';

/**
 * Generate an API name from a string. Matches what the UI does.
 *
 * @param name - name to be converted into a valid api name
 * @returns a valid api name
 */
export const generateApiName = (name: string): string => {
  const maxLength = 255;
  let apiName = name;
  apiName = apiName.replace(/[\W_]+/g, '_');
  if (apiName.charAt(0).match(/_/i)) {
    apiName = apiName.slice(1);
  }
  apiName = apiName
    .replace(/(^\d+)/, 'X$1')
    .slice(0, maxLength)
    .replace(/_$/, '');
  Logger.childFromRoot('').debug(`Generated API name: [${apiName}] from name: [${name}]`);
  return apiName;
};
