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
