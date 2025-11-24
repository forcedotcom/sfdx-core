/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { z } from 'zod';

const EnvConditionalSchema = z
  .object({
    env: z.string(),
    value: z.string(),
  })
  .strict();

const BaseReplacementSchema = z.object({
  replaceWhenEnv: z.array(EnvConditionalSchema).optional(),
});

// Create explicit union variants to generate proper JSON Schema with anyOf
// Each variant has strict required fields and additionalProperties: false
export const ReplacementsSchema = z.union([
  // filename + stringToReplace + replaceWithFile
  BaseReplacementSchema.extend({
    filename: z.string(),
    stringToReplace: z.string(),
    replaceWithFile: z.string(),
  }).strict(),
  // filename + stringToReplace + replaceWithEnv
  BaseReplacementSchema.extend({
    filename: z.string(),
    stringToReplace: z.string(),
    replaceWithEnv: z.string(),
    allowUnsetEnvVariable: z.boolean().optional(),
  }).strict(),
  // filename + regexToReplace + replaceWithFile
  BaseReplacementSchema.extend({
    filename: z.string(),
    regexToReplace: z.string(),
    replaceWithFile: z.string(),
  }).strict(),
  // filename + regexToReplace + replaceWithEnv
  BaseReplacementSchema.extend({
    filename: z.string(),
    regexToReplace: z.string(),
    replaceWithEnv: z.string(),
    allowUnsetEnvVariable: z.boolean().optional(),
  }).strict(),
  // glob + stringToReplace + replaceWithFile
  BaseReplacementSchema.extend({
    glob: z.string(),
    stringToReplace: z.string(),
    replaceWithFile: z.string(),
  }).strict(),
  // glob + stringToReplace + replaceWithEnv
  BaseReplacementSchema.extend({
    glob: z.string(),
    stringToReplace: z.string(),
    replaceWithEnv: z.string(),
    allowUnsetEnvVariable: z.boolean().optional(),
  }).strict(),
  // glob + regexToReplace + replaceWithFile
  BaseReplacementSchema.extend({
    glob: z.string(),
    regexToReplace: z.string(),
    replaceWithFile: z.string(),
  }).strict(),
  // glob + regexToReplace + replaceWithEnv
  BaseReplacementSchema.extend({
    glob: z.string(),
    regexToReplace: z.string(),
    replaceWithEnv: z.string(),
    allowUnsetEnvVariable: z.boolean().optional(),
  }).strict(),
]);

export type Replacements = z.infer<typeof ReplacementsSchema>;
