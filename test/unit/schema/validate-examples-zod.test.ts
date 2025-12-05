/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
