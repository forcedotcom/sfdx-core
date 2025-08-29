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

/**
 * Certain Org Features require a translation or should be deprecated.
 * Encapsulates feature mappings and deprecated features.
 */

import { isString } from '@salesforce/ts-types';

// Local
import { Messages } from '../messages';
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
    'CMTRecordManagedDeletion',
    'EditInSubtab',
    'OldNewRecordFlowConsole',
    'OldNewRecordFlowStd',
    'DesktopLayoutStandardOff',
    'SplitViewOnStandardOff',
    'PopOutUtilities',
  ],
};

type FeatureTypes = {
  simpleFeatureMapping: { [key: string]: string[] };
  quantifiedFeatureMapping: Record<string, string | number | boolean | null | undefined>;
  deprecatedFeatures: string[];
};

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
