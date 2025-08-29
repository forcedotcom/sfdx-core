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
