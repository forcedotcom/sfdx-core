/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Certain Org Features require a translation or should be deprecated.
 * Encapsulates feature mappings and deprecated features.
 */

import { isString } from '@salesforce/ts-types';

// Local
import { Messages } from '../../messages';
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgFeatureDeprecation');
const FEATURE_TYPES = {
  // simpleFeatureMapping holds a set of direct replacement values for features.
  simpleFeatureMapping: {
    SALESWAVE: ['DEVELOPMENTWAVE'],
    SERVICEWAVE: ['DEVELOPMENTWAVE'],
  },
  quantifiedFeatureMapping: {},
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

interface FeatureTypes {
  simpleFeatureMapping: { [key: string]: string[] };
  quantifiedFeatureMapping: Record<string, string | number | boolean | null | undefined>;
  deprecatedFeatures: string[];
}

export class ScratchOrgFeatureDeprecation {
  private featureTypes: FeatureTypes;
  // Allow override for testing.
  public constructor(options: FeatureTypes = FEATURE_TYPES) {
    this.featureTypes = options;
    this.featureTypes.deprecatedFeatures = this.featureTypes.deprecatedFeatures.map((deprecatedFeature) =>
      deprecatedFeature.toUpperCase()
    );
    // Make all of the keys in simpleFeatureMapping upper case.
    const sfm: { [key: string]: string[] } = {};
    Object.keys(this.featureTypes.simpleFeatureMapping).forEach((key) => {
      sfm[key.toUpperCase()] = this.featureTypes.simpleFeatureMapping[key];
    });
    this.featureTypes.simpleFeatureMapping = sfm;
  }

  /**
   * Gets list of feature warnings that should be logged
   *
   * @param features The requested features.
   * @returns List of string feature warnings.
   */
  public getFeatureWarnings(features: string | string[]): string[] {
    /* Get warning messages for deprecated features and feature mappings.*/
    const featureWarningMessages: string[] = [];
    const requestedFeatures = (isString(features) ? features : features.join(';')).toUpperCase();

    /* If a public quantified feature is defined without a quantity, throw a warning.*/
    Object.keys(this.featureTypes.quantifiedFeatureMapping).forEach((key) => {
      if (new RegExp(`${key};|${key},|${key}$`, 'i').test(requestedFeatures)) {
        featureWarningMessages.push(
          messages.getMessage('quantifiedFeatureWithoutQuantityWarning', [
            key,
            this.featureTypes.quantifiedFeatureMapping[key],
          ])
        );
      }
    });
    /* If a simply mapped feature is defined, log a warning.*/
    Object.keys(this.featureTypes.simpleFeatureMapping).forEach((key) => {
      if (new RegExp(`${key};|${key},|${key}$`, 'i').test(requestedFeatures)) {
        const tokens = '[' + this.featureTypes.simpleFeatureMapping[key].map((v) => "'" + v + "'").join(',') + ']';
        featureWarningMessages.push(messages.getMessage('mappedFeatureWarning', [key, tokens]));
      }
    });
    /* If a deprecated feature is identified as deprecated, throw a warning.*/
    this.featureTypes.deprecatedFeatures.forEach((deprecatedFeature) => {
      if (requestedFeatures.includes(deprecatedFeature)) {
        featureWarningMessages.push(messages.getMessage('deprecatedFeatureWarning', [deprecatedFeature]));
      }
    });
    return featureWarningMessages;
  }

  /**
   * Removes all deprecated features for the organization.
   *
   * @param features List of features to filter
   * @returns feature array with proper mapping.
   */
  public filterDeprecatedFeatures(features: string[]): string[] {
    return features.reduce((previousValue: string[], currentValue) => {
      const feature = currentValue.toUpperCase();
      if (this.featureTypes.deprecatedFeatures.includes(feature)) {
        return previousValue;
      } else if (this.featureTypes.simpleFeatureMapping[feature]) {
        /* If a simply mapped feature is specified, then perform the mapping. */
        const simpleFeatureMapping = this.featureTypes.simpleFeatureMapping[feature];
        return [...previousValue, ...simpleFeatureMapping];
      }
      return [...previousValue, currentValue];
    }, []);
  }
}
