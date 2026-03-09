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

/**
 * Represents an entry in a package bundle, containing version and descriptive information.
 */
export const BundleEntrySchema = z.object({
  name: z.string().meta({ title: 'Bundle Name' }).describe('The name of the bundle.'),
  versionName: z.string().meta({ title: 'Version Name' }).describe('Human readable name for the version.'),
  versionNumber: z
    .string()
    .regex(/^\d+\.\d+$/)
    .meta({ title: 'Version Number' })
    .describe('The version number in the format major.minor (e.g., 1.0).'),
  versionDescription: z
    .string()
    .optional()
    .meta({ title: 'Version Description' })
    .describe('Human readable version information, format not specified.'),
});

export type BundleEntry = z.infer<typeof BundleEntrySchema>;
