/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import * as path from 'path';
import { AnyJson, isJsonMap, JsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { SchemaValidator } from '../../../src/schema/validator';
import { shouldThrow, testSetup } from '../../../src/testSetup';

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        await shouldThrow(validate(schema, data));
      } catch (err) {
        if (!(err instanceof Error)) {
          expect.fail('should have thrown Error');
        }
        expect(err.message).to.contain(errorMsg);
        expect(err.name, err.message).to.equal(errorName);
      }
    };

    // We want all validation errors, not just the first error encountered (default)
    it('should display multiple errors', async () => {
      const schema = {
        type: 'object',
        additionalProperties: false,
        properties: {},
      };

      const data = {
        myNotValid: true,
        myAlsoNotValid: true,
      };

      await checkError(schema, data, 'ValidationSchemaFieldError', 'myNotValid');
      await checkError(schema, data, 'ValidationSchemaFieldError', 'myAlsoNotValid');
    });

    it('shows correct error message for additional property', async () => {
      const schema = {
        type: 'object',
        additionalProperties: false,
        properties: {},
      };

      const data = { thisAdditionalPropWillFail: 'foo' };

      await checkError(
        schema,
        data,
        'ValidationSchemaFieldError',
        "#/additionalProperties: must NOT have additional properties 'thisAdditionalPropWillFail'"
      );
    });

    it('shows correct error message for missing required values', async () => {
      const schema = {
        type: 'object',
        properties: {
          myRequiredProperty: {
            type: 'string',
          },
        },
        required: ['myRequiredProperty'],
      };

      const data = { notPassingRequired: 'foo' };

      await checkError(
        schema,
        data,
        'ValidationSchemaFieldError',
        "#/required: must have required property 'myRequiredProperty'"
      );
    });

    it('shows correct error message for oneOf error', async () => {
      const schema = {
        type: 'object',
        properties: {
          dateOfBirth: {
            type: 'string',
          },
          lastFourOfSocial: {
            type: 'string',
          },
        },
        oneOf: [{ required: ['dateOfBirth'] }, { required: ['lastFourOfSocial'] }],
      };

      const data = { neitherOneOf: 'foo' };

      await checkError(schema, data, 'ValidationSchemaFieldError', '#/oneOf: must match exactly one schema in oneOf');
    });

    it('shows correct error message for invalid enum values', async () => {
      const schema = {
        type: 'object',
        properties: {
          myEnum: {
            enum: ['a', 'b', 'c'],
          },
        },
      };

      const data = { myEnum: 'invalid' };

      await checkError(
        schema,
        data,
        'ValidationSchemaFieldError',
        "#/properties/myEnum/enum: must be equal to one of the allowed values 'a, b, c'"
      );
    });

    it('shows correct error message for invalid top level type value', async () => {
      const schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {},
        },
      };
      const data = { doesntMatter: 'invalid' };
      await checkError(schema, data, 'ValidationSchemaFieldError', '#/type: must be array');
    });

    it('shows correct error message for invalid property type value', async () => {
      const schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
        },
      };
      const data = { foo: 42 };

      await checkError(schema, data, 'ValidationSchemaFieldError', '#/properties/foo/type: must be string');
    });

    // NOTE: The "should not have `not found` errors" test will fail
    // if any schema in the schemas directory has an invalid schema reference.
    // If this test is changed, meaning we handle external schema validation
    // differently, that test should also be updated to make sure there
    // isn't a developer error of invalid schema references in those files.
    it('should reject unknown schema', async () => {
      const schema = {
        $ref: 'unknown#/unknown',
      };
      await checkError(schema, {}, 'ValidationSchemaNotFound', 'Schema not found');
    });
  });

  it('loads external schemas without .json', async () => {
    const schema = {
      type: 'object',
      properties: {
        ref: {
          $ref: 'scratchOrgDefinitionSchema#',
        },
      },
    };
    const data = {
      ref: {
        Email: 'myEmail',
      },
    };
    const validatedData = await validate(schema, data);
    if (!isJsonMap(validatedData) || !isJsonMap(validatedData.ref)) {
      throw new Error('Unexpected validated JSON data');
    }
    expect(validatedData.ref.Email).to.equal('myEmail');
  });

  it('throws error when loading external schema that does not have an $id', async () => {
    const schema = {
      type: 'object',
      properties: {
        ref: {
          $ref: 'schemaWithoutAnId#',
        },
      },
    };
    const data = {
      ref: {
        Company: 'Acme',
      },
    };

    try {
      await validate(schema, data);
    } catch (error) {
      if (!(error instanceof Error)) {
        expect.fail('should have thrown Error');
      }
      expect(error.message).to.include("can't resolve reference schemaWithoutAnId# from id #");
    }

    // expect(validatedData.ref.Email).to.equal('myEmail');
  });

  // TODO JSEN (apparently not AJV either?) does not seem to support referencing after an external schema name
  it.skip('loads external schemas without .json with references', async () => {
    const schema = {
      type: 'object',
      properties: {
        ref: {
          $ref: 'scratchOrgDefinitionSchema#definitions/name',
        },
      },
    };
    const data = {
      ref: {
        Email: 'myEmail',
      },
    };
    const validatedData = await validate(schema, data);
    if (!isJsonMap(validatedData) || !isJsonMap(validatedData.ref)) {
      throw new Error('Unexpected validated JSON data');
    }
    expect(validatedData.ref.Email).to.equal('myEmail');
  });

  describe('schemas', () => {
    it('should not have `not found` errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      fs.readdirSync(SCHEMA_DIR).forEach((schemaName) => {
        const schemaPath = path.join(SCHEMA_DIR, schemaName);
        const validator = new SchemaValidator($$.TEST_LOGGER, schemaPath);

        // If the schemas reference an invalid external error, then validation will fail.
        return validator.validate({}).catch((error) => {
          if (!(error instanceof Error)) {
            expect.fail('should have thrown Error');
          }
          // We are passing in empty data, so it is OK if we get an actual data field validation error.
          if (error.name !== 'ValidationSchemaFieldError') {
            throw error;
          }
        });
      });
    });

    it('response should include default values', async () => {
      const schema = {
        type: 'object',
        additionalProperties: false,
        properties: {
          foo: {
            type: 'string',
            default: 'bar',
          },
          cat: {
            type: 'string',
          },
        },
      };

      const data = { cat: 'meow' };

      const validatedData = await validate(schema, data);
      expect(validatedData).to.deep.equal({
        foo: 'bar',
        cat: 'meow',
      });
    });
  });

  // If you change `validateSchema` to `true` in the AJV options, this will fail
  // because the $schema key is invalid for Draft 7
  // https://github.com/forcedotcom/cli/issues/1493
  it('should not error on invalid schema', async () => {
    const schema = {
      type: 'object',
      properties: {
        ref: {
          $ref: 'invalidSchema#',
        },
      },
    };

    const data = {
      Company: 'Acme',
    };

    const validatedData = await validate(schema, data);
    expect(validatedData).to.deep.equal({
      Company: 'Acme',
    });
  });
});
