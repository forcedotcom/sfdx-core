/*
 * Copyright 2026, Salesforce, Inc.
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
import { z } from 'zod';
import { simpleFeaturesList } from './simpleFeaturesList';
import { patternFeaturesList } from './patternFeaturesList';

// Set for O(1) case-insensitive lookup of simple features
const simpleFeaturesLowerSet = new Set(simpleFeaturesList.map((f) => f.toLowerCase()));

// Helper to create a case-insensitive feature pattern with title
// Note: JSON Schema pattern won't include the 'i' flag, but Zod validates case-insensitively
const featurePattern = (name: string): z.ZodString =>
  z
    .string()
    .regex(new RegExp(`^${name}:[0-9]+$`, 'i'))
    .meta({ title: `${name}:<value>` });

// Case-insensitive simple feature validation
// Uses refine for runtime case-insensitivity, meta.enum for JSON Schema output
const simpleFeatureSchema = z
  .string()
  .refine((s) => simpleFeaturesLowerSet.has(s.toLowerCase()))
  .meta({ enum: simpleFeaturesList });

// Combined features schema
// Features are case-insensitive per Salesforce docs:
// https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_def_file_config_values.htm
export const FeaturesSchema = z.array(
  z.union([
    // Feature patterns - parametrized features with numeric values
    z.union(patternFeaturesList.map(featurePattern)),
    // Feature enum - boolean/named features
    simpleFeatureSchema,
  ])
);
