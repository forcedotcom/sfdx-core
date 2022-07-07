/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as fs from 'fs';
import Ajv, { DefinedError } from 'ajv';
import { AnyJson, JsonMap } from '@salesforce/ts-types';
import { getJsonValuesByName, parseJsonMap } from '@salesforce/kit';
import { Logger } from '../logger';
import { SfError } from '../sfError';

/**
 * Loads a JSON schema and performs validations against JSON objects.
 */
export class SchemaValidator {
  private readonly schemasDir: string;
  private readonly logger: Logger;

  private schema?: JsonMap;

  /**
   * Creates a new `SchemaValidator` instance given a logger and path to a schema file.
   *
   * @param logger An {@link Logger} instance on which to base this class's logger.
   * @param schemaPath The path to the schema file to load and use for validation.
   */
  public constructor(logger: Logger, private schemaPath: string) {
    this.logger = logger.child('SchemaValidator');
    this.schemasDir = path.dirname(this.schemaPath);
  }

  /**
   * Loads a JSON schema from the `schemaPath` parameter provided at instantiation.
   */
  public async load(): Promise<JsonMap> {
    if (!this.schema) {
      this.schema = parseJsonMap(await fs.promises.readFile(this.schemaPath, 'utf8'));
      this.logger.debug(`Schema loaded for ${this.schemaPath}`);
    }
    return this.schema;
  }

  /**
   * Loads a JSON schema from the `schemaPath` parameter provided at instantiation.
   */
  public loadSync(): JsonMap {
    if (!this.schema) {
      this.schema = parseJsonMap(fs.readFileSync(this.schemaPath, 'utf8'));
      this.logger.debug(`Schema loaded for ${this.schemaPath}`);
    }
    return this.schema;
  }

  /**
   * Performs validation of JSON data against the schema located at the `schemaPath` value provided
   * at instantiation.
   *
   * **Throws** *{@link SfError}{ name: 'ValidationSchemaFieldError' }* If there are known validations errors.
   * **Throws** *{@link SfError}{ name: 'ValidationSchemaUnknownError' }* If there are unknown validations errors.
   *
   * @param json A JSON value to validate against this instance's target schema.
   * @returns The validated JSON data.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async validate(json: AnyJson): Promise<AnyJson> {
    return this.validateSync(json);
  }

  /**
   * Performs validation of JSON data against the schema located at the `schemaPath` value provided
   * at instantiation.
   *
   * **Throws** *{@link SfError}{ name: 'ValidationSchemaFieldError' }* If there are known validations errors.
   * **Throws** *{@link SfError}{ name: 'ValidationSchemaUnknownError' }* If there are unknown validations errors.
   *
   * @param json A JSON value to validate against this instance's target schema.
   * @returns The validated JSON data.
   */
  public validateSync(json: AnyJson): AnyJson {
    const schema = this.loadSync();
    const externalSchemas = this.loadExternalSchemas(schema);

    const ajv = new Ajv({
      allErrors: true,
      schemas: externalSchemas,
      useDefaults: true,
      // TODO: We may someday want to enable strictSchema. This is disabled for now
      // because the CLI team does not "own" the @salesforce/schemas repository.
      // Invalid schema would cause errors wherever SchemaValidator is used.
      strictSchema: false,
      // If we end up getting an npm-shrinkwrap working in the future we could turn this back off.
      // https://github.com/forcedotcom/cli/issues/1493
      validateSchema: false,
    });

    // JSEN to AJV migration note - regarding the following "TODO":
    // I don't think that AJV has a way to throw an error if an additional property exists in the data
    // It does however have a top level option for `removeAdditional` https://ajv.js.org/options.html#removeadditional
    // Regardless, this would be a breaking changes and I do not think it should be implemented.

    // TODO: We should default to throw an error when a property is specified
    // that is not in the schema, but the only option to do this right now is
    // to specify "removeAdditional: false" in every object.
    const validate = ajv.compile(schema);

    // AJV will modify the original json object. We need to make a clone of the
    // json to keep this backwards compatible with JSEN functionality
    const jsonClone: AnyJson = JSON.parse(JSON.stringify(json));

    const valid = validate(jsonClone);

    if (!valid) {
      if (validate.errors) {
        const errors = this.getErrorsText(validate.errors as DefinedError[]);
        throw new SfError(`Validation errors:\n${errors}`, 'ValidationSchemaFieldError');
      } else {
        throw new SfError('Unknown schema validation error', 'ValidationSchemaUnknownError');
      }
    }

    // We return the cloned JSON because it will have defaults included
    // This is configured with the 'useDefaults' option above.
    return jsonClone;
  }
  /**
   * Loads local, external schemas from URIs in the same directory as the local schema file.
   * Does not support loading from remote URIs.
   * Returns a map of external schema local URIs to loaded schema JSON objects.
   *
   * @param schema The main schema to look up references ($ref) in.
   * @returns An array of found referenced schemas.
   */
  private loadExternalSchemas(schema: JsonMap): JsonMap[] {
    return getJsonValuesByName<string>(schema, '$ref')
      .map((ref) => ref && RegExp(/([\w\.]+)#/).exec(ref)) // eslint-disable-line no-useless-escape
      .map((match) => match && match[1])
      .filter((uri): uri is string => !!uri)
      .map((uri) => this.loadExternalSchema(uri));
  }

  /**
   * Load another schema relative to the primary schema when referenced.  Only supports local schema URIs.
   *
   * @param uri The first segment of the $ref schema.
   */
  private loadExternalSchema(uri: string): JsonMap {
    const schemaPath = path.join(this.schemasDir, `${uri}.json`);
    try {
      return parseJsonMap(fs.readFileSync(schemaPath, 'utf8'));
    } catch (err) {
      if ((err as SfError).code === 'ENOENT') {
        throw new SfError(`Schema not found: ${schemaPath}`, 'ValidationSchemaNotFound');
      }
      throw err;
    }
  }

  /**
   * Get a string representation of the schema validation errors.
   * Adds additional (human friendly) information to certain errors.
   *
   * @param errors An array of AJV (DefinedError) objects.
   */
  private getErrorsText(errors: DefinedError[]): string {
    return errors
      .map((error) => {
        const msg = `${error.schemaPath}: ${error.message}`;

        switch (error.keyword) {
          case 'additionalProperties':
            return `${msg} '${error.params.additionalProperty}'`;
          case 'enum':
            return `${msg} '${error.params.allowedValues.join(', ')}'`;
          default:
            return msg;
        }
      })
      .join('\n');
  }
}
