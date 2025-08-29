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
import { randomBytes } from 'node:crypto';
import * as util from 'node:util';

/**
 * A function to generate a unique id and return it in the context of a template, if supplied.
 *
 * A template is a string that can contain `${%s}` to be replaced with a unique id.
 * If the template contains the "%s" placeholder, it will be replaced with the unique id otherwise the id will be appended to the template.
 *
 * @param options an object with the following properties:
 * - template: a template string.
 * - length: the length of the unique id as presented in hexadecimal.
 */

export function uniqid(options?: { template?: string; length?: number }): string {
  const uniqueString = randomBytes(Math.ceil((options?.length ?? 32) / 2))
    .toString('hex')
    .slice(0, options?.length ?? 32);
  if (!options?.template) {
    return uniqueString;
  }
  return options.template.includes('%s')
    ? util.format(options.template, uniqueString)
    : `${options.template}${uniqueString}`;
}
