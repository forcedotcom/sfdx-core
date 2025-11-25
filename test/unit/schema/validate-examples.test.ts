/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import Ajv, { type ValidateFunction } from 'ajv';
import { expect } from 'chai';

const libDir = path.join(__dirname, '..', '..', '..', 'lib');
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
  const examplePath = path.join(__dirname, 'examples', schema.replace('.schema.json', ''));
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
