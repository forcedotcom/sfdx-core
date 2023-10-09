/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { randomBytes } from 'crypto';
import * as util from 'util';

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
