/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AnyJson, isJsonMap, JsonMap } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import { SchemaValidator } from '../../../src/schema/validator';
import { testSetup } from '../../../src/testSetup';

const $$ = testSetup();

const SCHEMA_DIR = path.join(__dirname, '..', '..', '..', 'test', 'unit', 'fixtures', 'schemas');

/**
 * Validate a piece of data against a schema using a SchemaValidator instance.
 * The loadSchema method is stubbed out to return the schema.
 *
 * @param {JsonMap} schema The schema to validate with.
 * @param {AnyJson} json The JSON value to validate.
 * @return {Promise<void>}
 */
const validate = (schema: JsonMap, json: AnyJson): Promise<AnyJson> => {
  const validator = new SchemaValidator($$.TEST_LOGGER, `${SCHEMA_DIR}/test.json`);
  sinon.stub(validator, 'loadSync').callsFake(() => schema);
  return validator.validate(json);
};

describe('schemaValidator', () => {
  describe('errors', () => {
    const checkError = async (schema, data, errorName, errorMsg) => {
      try {
        await validate(schema, data);
        assert.fail('Data is invalid but schema validated successfully');
      } catch (err) {
        expect(err.message).to.contain(errorMsg);
        expect(err.name, err.message).to.equal(errorName);
      }
    };

    it('should show additional property', async () => {
      const schema = {
        type: 'object',
        additionalProperties: false,
        properties: {}
      };
      const data = { notValid: true };
      await checkError(schema, data, 'ValidationSchemaFieldErrors', 'notValid');
    });

    it('should show enum values', async () => {
      const schema = {
        type: 'object',
        properties: {
          myEnum: {
            enum: ['a', 'b', 'c']
          }
        }
      };
      const data = { myEnum: 'invalid' };
      await checkError(schema, data, 'ValidationSchemaFieldErrors', 'a, b, c');
    });

    it('should show type value', async () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {}
        }
      };
      const data = { myEnum: 'invalid' };
      await checkError(
        schema,
        data,
        'ValidationSchemaFieldErrors',
        'Root of JSON object is an invalid type.  Expected type [array]'
      );
    });

    // NOTE: The "should not have `not found` errors" test will fail
    // if any schema in the schemas directory has an invalid schema reference.
    // If this test is changed, meaning we handle external schema validation
    // differently, that test should also be updated to make sure there
    // isn't a developer error of invalid schema references in those files.
    it('should reject unknown schema', async () => {
      const schema = {
        $ref: 'unknown#/unknown'
      };
      await checkError(schema, {}, 'ValidationSchemaNotFound', 'not found');
    });
  });

  it('loads external schemas without .json', async () => {
    const schema = {
      type: 'object',
      properties: {
        ref: {
          $ref: 'scratchOrgDefinitionSchema#'
        }
      }
    };
    const data = {
      ref: {
        Email: 'myEmail'
      }
    };
    const validatedData = await validate(schema, data);
    if (!isJsonMap(validatedData) || !isJsonMap(validatedData.ref)) {
      throw new Error('Unexpected validated JSON data');
    }
    expect(validatedData.ref.Email).to.equal('myEmail');
  });

  // TODO JSEN does not seem to support referencing after an external schema name
  it.skip('loads external schemas without .json with references', async () => {
    const schema = {
      type: 'object',
      properties: {
        ref: {
          $ref: 'scratchOrgDefinitionSchema#definitions/name'
        }
      }
    };
    const data = {
      ref: {
        Email: 'myEmail'
      }
    };
    const validatedData = await validate(schema, data);
    if (!isJsonMap(validatedData) || !isJsonMap(validatedData.ref)) {
      throw new Error('Unexpected validated JSON data');
    }
    expect(validatedData.ref.Email).to.equal('myEmail');
  });

  describe('schemas', () => {
    it('should not have `not found` errors', () => {
      fs.readdirSync(SCHEMA_DIR).forEach(schemaName => {
        const schemaPath = path.join(SCHEMA_DIR, schemaName);
        const validator = new SchemaValidator($$.TEST_LOGGER, schemaPath);

        // If the schemas reference an invalid external error, then validation will fail.
        return validator.validate({}).catch(err => {
          // We are passing in empty data, so it is OK if we get an actual data field validation error.
          if (err.name !== 'ValidationSchemaFieldErrors') {
            throw err;
          }
        });
      });
    });
  });
});
