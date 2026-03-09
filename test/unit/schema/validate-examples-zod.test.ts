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
import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect } from 'chai';
import { z } from 'zod';
import { ProjectJsonSchema, ScratchOrgDefSchema } from '../../../src/index';

/** validate that the zod types produce the expected results */
const testFile =
  (filePath: string, zodSchema: z.ZodType, shouldValidate: boolean): (() => void) =>
  () => {
    const data: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const result = zodSchema.safeParse(data);

    if (shouldValidate && !result.success) {
      // eslint-disable-next-line no-console
      console.log(result.error.issues);
    }
    expect(result.success).to.equal(shouldValidate);
  };

const zodSchemas: Record<string, z.ZodType> = {
  'sfdx-project': ProjectJsonSchema,
  'project-scratch-def': ScratchOrgDefSchema,
};

Object.entries(zodSchemas).forEach(([schemaName, zodSchema]) => {
  const examplePath = path.join(__dirname, 'examples', schemaName);
  const examples = fs.readdirSync(examplePath);

  if (examples && examples.length > 0) {
    describe(`${schemaName} (Zod validation)`, () => {
      for (const example of examples) {
        it(`${example}`, testFile(path.join(examplePath, example), zodSchema, !example.includes('invalid')));
      }
    });
  }
});
