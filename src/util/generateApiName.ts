/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
