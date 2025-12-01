/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { simpleFeaturesList } from '../../../src/schema/project-scratch-def/simpleFeaturesList';

describe('simpleFeaturesList', () => {
  it('should not contain any features with <value> (those belong in patternFeaturesList)', () => {
    const misclassified = simpleFeaturesList.filter((f) => f.includes('<value>'));
    expect(misclassified, `Misclassified pattern features found: ${misclassified.join(', ')}`).to.be.empty;
  });
});
