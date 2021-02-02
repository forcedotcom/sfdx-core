/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { getJsonValuesByName } from '@salesforce/kit';
import { asJsonArray, asJsonMap, get, getJsonArray, isJsonMap, isString } from '@salesforce/ts-types';
import * as validator from 'jsen';
import * as path from 'path';
import { SfdxError } from '../sfdxError';
import { fs } from '../util/fs';
/**
 * Loads a JSON schema and performs validations against JSON objects.
 */
export class SchemaValidator {
  /**
   * Creates a new `SchemaValidator` instance given a logger and path to a schema file.
   *
   * @param logger An {@link Logger} instance on which to base this class's logger.
   * @param schemaPath The path from which the schema with which to validate should be loaded.
   */
  constructor(logger, schemaPath) {
    this.schemaPath = schemaPath;
    this.logger = logger.child('SchemaValidator');
    this.schemasDir = path.dirname(this.schemaPath);
  }
  /**
   * Loads a JSON schema from the `schemaPath` parameter provided at instantiation.
   */
  async load() {
    if (!this.schema) {
      this.schema = await fs.readJsonMap(this.schemaPath);
      this.logger.debug(`Schema loaded for ${this.schemaPath}`);
    }
    return this.schema;
  }
  /**
   * Performs validation of JSON data against the schema located at the `schemaPath` value provided
   * at instantiation.
   *
   * **Throws** *{@link SfdxError}{ name: 'ValidationSchemaFieldErrors' }* If there are known validations errors.
   * **Throws** *{@link SfdxError}{ name: 'ValidationSchemaUnknown' }* If there are unknown validations errors.
   * @param json A JSON value to validate against this instance's target schema.
   * @returns The validated JSON data.
   */
  async validate(json) {
    const schema = await this.load();
    const externalSchemas = await this.loadExternalSchemas(schema);
    // TODO: We should default to throw an error when a property is specified
    // that is not in the schema, but the only option to do this right now is
    // to specify "removeAdditional: false" in every object.
    const validate = validator(schema, {
      greedy: true,
      schemas: externalSchemas
    });
    if (!validate(json)) {
      if (validate.errors) {
        const errors = this.getErrorsText(validate.errors, schema);
        throw new SfdxError(`Validation errors:\n${errors}`, 'ValidationSchemaFieldErrors');
      } else {
        throw new SfdxError('Unknown schema validation error', 'ValidationSchemaUnknown');
      }
    }
    return validate.build(json);
  }
  /**
   * Loads local, external schemas from URIs relative to the local schema file.  Does not support loading from
   * remote URIs. Returns a map of external schema local URIs to loaded schema JSON objects.
   *
   * @param schema The main schema to validate against.
   */
  async loadExternalSchemas(schema) {
    const externalSchemas = {};
    const promises = getJsonValuesByName(schema, '$ref')
      .map(ref => ref && ref.match(/([\w\.]+)#/))
      .map(match => match && match[1])
      .filter(uri => !!uri)
      .map(uri => this.loadExternalSchema(uri));
    (await Promise.all(promises)).forEach(externalSchema => {
      if (isString(externalSchema.id)) {
        externalSchemas[externalSchema.id] = externalSchema;
      } else {
        throw new SfdxError(
          `Unexpected external schema id type: ${typeof externalSchema.id}`,
          'ValidationSchemaTypeError'
        );
      }
    });
    return externalSchemas;
  }
  /**
   * Load another schema relative to the primary schema when referenced.  Only supports local schema URIs.
   *
   * @param uri The first segment of the $ref schema.
   */
  async loadExternalSchema(uri) {
    const schemaPath = path.join(this.schemasDir, `${uri}.json`);
    try {
      return await fs.readJsonMap(schemaPath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new SfdxError(`Schema not found: ${schemaPath}`, 'ValidationSchemaNotFound');
      }
      throw err;
    }
  }
  /**
   * Get a string representation of the schema validation errors.
   *
   * @param errors An array of JsenValidateError objects.
   * @param schema The validation schema.
   */
  getErrorsText(errors, schema) {
    return errors
      .map(error => {
        const property = error.path.match(/^([a-zA-Z0-9\.]+)\.([a-zA-Z0-9]+)$/);
        const getPropValue = prop => {
          const reducer = (obj, name) => {
            if (!isJsonMap(obj)) return;
            if (isJsonMap(obj.properties)) return obj.properties[name];
            if (name === '0') return asJsonArray(obj.items);
            return obj[name] || obj[prop];
          };
          return error.path.split('.').reduce(reducer, schema);
        };
        const getEnumValues = () => {
          const enumSchema = asJsonMap(getPropValue('enum'));
          return (enumSchema && getJsonArray(enumSchema, 'enum', []).join(', ')) || '';
        };
        switch (error.keyword) {
          case 'additionalProperties':
            // Missing Typing
            const additionalProperties = get(error, 'additionalProperties');
            return `${error.path} should NOT have additional properties '${additionalProperties}'`;
          case 'required':
            if (property) {
              return `${property[1]} should have required property ${property[2]}`;
            }
            return `should have required property '${error.path}'`;
          case 'oneOf':
            return `${error.path} should match exactly one schema in oneOf`;
          case 'enum':
            return `${error.path} should be equal to one of the allowed values ${getEnumValues()}`;
          case 'type': {
            const _path = error.path === '' ? 'Root of JSON object' : error.path;
            return `${_path} is an invalid type.  Expected type [${getPropValue('type')}]`;
          }
          default:
            return `${error.path} invalid ${error.keyword}`;
        }
      })
      .join('\n');
  }
}
//# sourceMappingURL=validator.js.map
