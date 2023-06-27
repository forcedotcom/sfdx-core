/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { parseJson } from '@salesforce/kit';
import { isArray, isObject, isString } from '@salesforce/ts-types';
import { accessTokenRegex } from '../exported';

type FilteredKey = string | { name: string; regex: string };
// Ok to log clientid
const FILTERED_KEYS: FilteredKey[] = [
  'sid',
  'Authorization',
  // Any json attribute that contains the words "access" and "token" will have the attribute/value hidden
  { name: 'access_token', regex: 'access[^\'"]*token' },
  // Any json attribute that contains the words "refresh" and "token" will have the attribute/value hidden
  { name: 'refresh_token', regex: 'refresh[^\'"]*token' },
  'clientsecret',
  // Any json attribute that contains the words "sfdx", "auth", and "url" will have the attribute/value hidden
  { name: 'sfdxauthurl', regex: 'sfdx[^\'"]*auth[^\'"]*url' },
];
// SFDX code and plugins should never show tokens or connect app information in the logs

export const HIDDEN = 'HIDDEN';
/**
 *
 * @param args you *probably are passing this an object, but it can handle any type
 * @returns
 */
export const filterSecrets = (...args: unknown[]): unknown =>
  args.map((arg) => {
    if (isArray(arg)) {
      return filterSecrets(...arg);
    }

    if (arg) {
      let mutableArg: string;

      // Normalize all objects into a string. This includes errors.
      if (arg instanceof Buffer) {
        mutableArg = '<Buffer>';
      } else if (isObject(arg)) {
        mutableArg = JSON.stringify(arg);
      } else if (isString(arg)) {
        mutableArg = arg;
      } else {
        mutableArg = '';
      }

      FILTERED_KEYS.forEach((key: FilteredKey) => {
        // Filtered keys can be strings or objects containing regular expression components.
        const expElement = typeof key === 'string' ? key : key.regex;
        const expName = typeof key === 'string' ? key : key.name;

        const hiddenAttrMessage = `"<${expName} - ${HIDDEN}>"`;

        // Match all json attribute values case insensitive: ex. {" Access*^&(*()^* Token " : " 45143075913458901348905 \n\t" ...}
        const regexTokens = new RegExp(`(['"][^'"]*${expElement}[^'"]*['"]\\s*:\\s*)['"][^'"]*['"]`, 'gi');

        mutableArg = mutableArg.replace(regexTokens, `$1${hiddenAttrMessage}`);

        // Match all key value attribute case insensitive: ex. {" key\t"    : ' access_token  ' , " value " : "  dsafgasr431 " ....}
        const keyRegex = new RegExp(
          `(['"]\\s*key\\s*['"]\\s*:)\\s*['"]\\s*${expElement}\\s*['"]\\s*.\\s*['"]\\s*value\\s*['"]\\s*:\\s*['"]\\s*[^'"]*['"]`,
          'gi'
        );
        mutableArg = mutableArg.replace(keyRegex, `$1${hiddenAttrMessage}`);
      });

      mutableArg = mutableArg.replace(accessTokenRegex, `<${HIDDEN}>`);

      // return an object if an object was logged; otherwise return the filtered string.
      return isObject(arg) ? parseJson(mutableArg) : mutableArg;
    } else {
      return arg;
    }
  });
