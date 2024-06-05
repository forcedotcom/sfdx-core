/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import Levenshtein from 'fast-levenshtein';

/**
 * From the haystack, will find the closest value to the needle
 *
 * @param needle - what the user provided - find results similar to this
 * @param haystack - possible results to search against
 */
export const findSuggestion = (needle: string, haystack: string[]): string => {
  // we'll use this array to keep track of which piece of hay is the closest to the users entered value.
  // keys closer to the index 0 will be a closer guess than keys indexed further from 0
  // an entry at 0 would be a direct match, an entry at 1 would be a single character off, etc.
  const index: string[] = [];
  haystack.map((hay) => {
    index[Levenshtein.get(needle, hay)] = hay;
  });

  return index.find((item) => item !== undefined) ?? '';
};
