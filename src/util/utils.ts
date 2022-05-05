/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AnyJson } from '@salesforce/ts-types';

export function deepCopy<T extends AnyJson>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function getRootKey(key: string, baseKeys: string[] = []): string {
  const matchesWithQuotedEntries = key.match(/("\S+?")/g);
  let newKey = key.replace(/\[|\]/g, '.').replace(/^\./, '').replace(/\.$/, '').replace(/"/g, '').split('..');
  newKey = newKey
    .map((x) =>
      x.includes('.') && matchesWithQuotedEntries?.find((y) => x === y.replace(/"/g, '')) ? [x] : x.split('.')
    )
    .flat()
    .map((x) => `["${x}"]`);
  return baseKeys.find((baseKey) => newKey[0].includes(baseKey)) ? newKey.slice(0, 2).join('') : newKey[0];
}

export function xxxxxx(key: string, baseKeys: string[] = []): string[] {
  const matchesWithQuotedEntries = key.match(/("\S+?")/g);
  const newKey = key.replace(/\[|\]/g, '.').replace(/^\./, '').replace(/\.$/, '').replace(/"/g, '').split('..');
  return newKey
    .map((x) =>
      x.includes('.') && matchesWithQuotedEntries?.find((y) => x === y.replace(/"/g, '')) ? [x] : x.split('.')
    )
    .flat()
    .map((x) => `["${x}"]`);
}
