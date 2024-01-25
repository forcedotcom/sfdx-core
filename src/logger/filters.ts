/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isArray, isObject, isString } from '@salesforce/ts-types';
import { accessTokenRegex, sfdxAuthUrlRegex } from '../util/sfdc';
export const HIDDEN = 'HIDDEN';

type FilteredKeyDefinition = { name: string; regex?: string };
type FilteredKeyForProcessing = FilteredKeyDefinition & {
  hiddenAttrMessage: string;
  regexTokens: RegExp;
  keyRegex: RegExp;
};

type Replacer<T> = (input: T) => T;

// Match all json attribute values case insensitive: ex. {" Access*^&(*()^* Token " : " 45143075913458901348905 \n\t" ...}
const buildTokens = (expElement: string): RegExp =>
  new RegExp(`(['"][^'"]*${expElement}[^'"]*['"]\\s*:\\s*)['"][^'"]*['"]`, 'gi');

// Match all key value attribute case insensitive: ex. {" key\t"    : ' access_token  ' , " value " : "  dsafgasr431 " ....}
const buildKeyRegex = (expElement: string): RegExp =>
  RegExp(
    `(['"]\\s*key\\s*['"]\\s*:)\\s*['"]\\s*${expElement}\\s*['"]\\s*.\\s*['"]\\s*value\\s*['"]\\s*:\\s*['"]\\s*[^'"]*['"]`,
    'gi'
  );

// This will redact values when the keys match certain patterns
const FILTERED_KEYS: FilteredKeyDefinition[] = [
  { name: 'sid' },
  { name: 'Authorization' },
  // Any json attribute that contains the words "refresh" and "token" will have the attribute/value hidden
  { name: 'refresh_token', regex: 'refresh[^\'"]*token' },
  { name: 'clientsecret' },
];

const FILTERED_KEYS_FOR_PROCESSING: FilteredKeyForProcessing[] = FILTERED_KEYS.map((key) => ({
  ...key,
  regexTokens: buildTokens(key.regex ?? key.name),
  hiddenAttrMessage: `"<${key.name} - ${HIDDEN}>"`,
  keyRegex: buildKeyRegex(key.regex ?? key.name),
}));

const compose = <T>(...fns: Array<Replacer<T>>): Replacer<T> =>
  fns.reduce((prevFn, nextFn) => (value: T) => prevFn(nextFn(value)));

const replacementFunctions = FILTERED_KEYS_FOR_PROCESSING.flatMap(
  (key): Array<Replacer<string>> => [
    // two functions to run across each key
    (input: string): string => input.replace(key.regexTokens, `$1${key.hiddenAttrMessage}`),
    (input: string): string => input.replace(key.keyRegex, `$1${key.hiddenAttrMessage}`),
  ]
).concat([
  // plus any "generalized" functions that are matching contents regardless of keys
  // use these for secrets with known patterns
  (input: string): string =>
    input
      .replace(new RegExp(accessTokenRegex, 'g'), '<REDACTED ACCESS TOKEN>')
      .replace(new RegExp(sfdxAuthUrlRegex, 'g'), '<REDACTED AUTH URL TOKEN>'),
]);

const fullReplacementChain = compose(...replacementFunctions);
/**
 *
 * @param args you *probably are passing this an object, but it can handle any type
 * @returns
 */
export const filterSecrets = (...args: unknown[]): unknown =>
  args.map((arg) => {
    if (!arg) {
      return arg;
    }
    if (isArray(arg)) {
      return filterSecrets(...arg);
    }

    // Normalize all objects into a string. This includes errors.
    if (arg instanceof Buffer) {
      return '<Buffer>';
    }
    if (isObject(arg)) {
      return JSON.parse(fullReplacementChain(JSON.stringify(arg))) as Record<string, unknown>;
    }
    if (isString(arg)) {
      return fullReplacementChain(arg);
    }
    return '';
  });
