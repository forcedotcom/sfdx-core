/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { ScratchOrgFeatureDeprecation } from '../../../src/org/scratchOrgFeatureDeprecation';

describe('scratchOrgFeatureDeprecation', () => {
  const FEATURE_TYPES = {
    simpleFeatureMapping: {
      SALESWAVE: ['DEVELOPMENTWAVE'],
      SERVICEWAVE: ['DEVELOPMENTWAVE'],
    },
    quantifiedFeatureMapping: {
      CUSTOMAPPS: 'AddCustomApps',
      CUSTOMTABS: 'AddCustomTabs',
    },
    deprecatedFeatures: [
      'EXPANDEDSOURCETRACKING',
      'LISTCUSTOMSETTINGCREATION',
      'AppNavCapabilities',
      'EditInSubtab',
      'OldNewRecordFlowConsole',
      'OldNewRecordFlowStd',
      'DesktopLayoutStandardOff',
      'SplitViewOnStandardOff',
      'PopOutUtilities',
    ],
  };
  const scratchOrgFeatureDeprecation = new ScratchOrgFeatureDeprecation(FEATURE_TYPES);

  describe('getFeatureWarnings', () => {
    it('features is a string', () => {
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings('MultiCurrency')).to.be.an('array').that.is.empty;
    });
    it('Should not get any warnings when there are no deprecated features or mapped features.', () => {
      const inputFeatures: string[] = ['CustomApps:7', 'MultiCurrency', 'AddCustomTabs:8'];
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)).to.be.an('array').that.is.empty;
    });
    it('Should get a warning when quantified features are mapped with quantity.', () => {
      const inputFeatures: string[] = ['CustomApps', 'MultiCurrency', 'CustomTabs'];
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)).to.be.an('array');
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures).length).to.equal(2);
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)[0]).to.equal(
        "The feature CUSTOMAPPS will be deprecated in a future release. It's been replaced by AddCustomApps:<value>, which requires you to specify a quantity."
      );
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)[1]).to.equal(
        "The feature CUSTOMTABS will be deprecated in a future release. It's been replaced by AddCustomTabs:<value>, which requires you to specify a quantity."
      );
    });
    it('Should get a warning when simple features are mapped.', () => {
      const inputFeatures: string[] = ['saleswave', 'MultiCurrency'];
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)).to.be.an('array');
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures).length).to.equal(1);
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)[0]).to.equal(
        "The feature SALESWAVE has been deprecated. It has been replaced with ['DEVELOPMENTWAVE'] in this scratch org create request."
      );
    });
    it('Should get a warning for when a feature is deprecated.', () => {
      const inputFeatures: string[] = ['EXPANDEDSOURCETRACKING:7', 'TestFORMSPilotFeatureValue', 'AddCustomTabs:8'];
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)).to.be.an('array');
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures).length).to.equal(1);
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)[0]).to.equal(
        'The feature EXPANDEDSOURCETRACKING has been deprecated. It has been removed from the list of requested features.'
      );
    });
  });

  describe('filterDeprecatedFeatures', () => {
    it('Should remove deprecated features from list.', () => {
      const inputFeatures: string[] = ['CustomApps:7', 'EXPANDEDSOURCETRACKING', 'AddCustomTabs:8'];
      expect(scratchOrgFeatureDeprecation.filterDeprecatedFeatures(inputFeatures)).deep.equal([
        'CustomApps:7',
        'AddCustomTabs:8',
      ]);
    });
    it('Should perform simple feature mapping.', () => {
      const inputFeatures: string[] = ['SALESWAVE', 'sf1', 'EXPANDEDSOURCETRACKING:8'];
      expect(scratchOrgFeatureDeprecation.filterDeprecatedFeatures(inputFeatures)).deep.equal([
        'DEVELOPMENTWAVE',
        'sf1',
        'EXPANDEDSOURCETRACKING:8',
      ]);
    });
  });
});

describe('scratchOrgFeatureDeprecation empty constructor', () => {
  const scratchOrgFeatureDeprecation = new ScratchOrgFeatureDeprecation();

  describe('getFeatureWarnings', () => {
    it('Should not get any warnings when there are no deprecated features or mapped features.', () => {
      const inputFeatures: string[] = ['CustomApps:7', 'MultiCurrency', 'AddCustomTabs:8'];
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)).to.be.an('array').that.is.empty;
    });
    it('Should not get a warning when quantified features are mapped with quantity.', () => {
      const inputFeatures: string[] = ['CustomApps', 'MultiCurrency', 'CustomTabs'];
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)).to.be.an('array');
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures).length).to.equal(0);
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)[0]).to.equal(undefined);
      expect(scratchOrgFeatureDeprecation.getFeatureWarnings(inputFeatures)[1]).to.equal(undefined);
    });
  });
});
