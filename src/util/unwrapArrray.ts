/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
export const unwrapArrray = (args: unknown): unknown => {
  if (Array.isArray(args) && args.length === 1) {
    return Array.isArray(args[0]) ? unwrapArrray(args[0]) : args[0];
  }
  return args;
};
