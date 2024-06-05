/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { findSuggestion } from '../../../src/util/findSuggestion';

describe('findSuggestion Unit Tests', () => {
  it('will find one suggestion', () => {
    const res = findSuggestion('needl', ['haystack', 'needle']);
    expect(res).to.equal('needle');
  });

  it('will return empty string when no haystack', () => {
    const res = findSuggestion('needl', []);
    expect(res).to.equal('');
  });

  it('will return last closest result', () => {
    // j-k-l-m-n
    // 'needl' should be right between 'needk' and 'needm' - but we found 'needm' last, which overwrites 'needk'
    const res = findSuggestion('needl', ['needk', 'needm']);
    expect(res).to.equal('needm');
  });

  it('will find closest result', () => {
    const res = findSuggestion('a', ['z', 'x', 'y']);
    expect(res).to.equal('y');
  });
});
