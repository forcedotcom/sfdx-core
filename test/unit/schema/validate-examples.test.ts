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
import Ajv, { type ValidateFunction } from 'ajv';
import { expect } from 'chai';

const projectRoot = process.cwd();
const libDir = path.join(projectRoot, 'lib');
const testDir = path.join(projectRoot, 'test', 'unit', 'schema');
const schemas = fs.readdirSync(libDir).filter((filename) => filename.endsWith('schema.json'));

/** test uses AJV to validate that the schema.json files generated produce the expected results.*/
const testFile =
  (filePath: string, validate: ValidateFunction, shouldValidate: boolean): (() => Promise<void>) =>
  async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
    const result = validate(data);

    if (shouldValidate && !result) {
      // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
      console.log(validate.errors);
    }
    expect(result).to.equal(shouldValidate);
  };

schemas.forEach((schema) => {
  const schemaPath = path.join(libDir, schema);
  const examplePath = path.join(testDir, 'examples', schema.replace('.schema.json', ''));
  const examples = fs.readdirSync(examplePath);

  if (examples && examples.length > 0) {
    const ajv = new Ajv();
    const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8')) as object;
    const validate = ajv.compile(schemaContent);

    describe(`${schema} example`, () => {
      for (const example of examples) {
        it(`${example}`, testFile(path.join(examplePath, example), validate, !example.includes('invalid')));
      }
    });
  } else {
    process.stderr.write(`Warning! No examples for ${schema}\n`);
  }
});
