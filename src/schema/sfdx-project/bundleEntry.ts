/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
