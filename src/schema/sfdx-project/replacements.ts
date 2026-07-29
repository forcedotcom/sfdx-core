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
