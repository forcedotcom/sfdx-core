import { AnyJson, JsonMap } from '@salesforce/ts-types';
import { Logger } from '../logger';
/**
 * Loads a JSON schema and performs validations against JSON objects.
 */
export declare class SchemaValidator {
  private schemaPath;
  private readonly schemasDir;
  private readonly logger;
  private schema?;
  /**
   * Creates a new `SchemaValidator` instance given a logger and path to a schema file.
   *
   * @param logger An {@link Logger} instance on which to base this class's logger.
   * @param schemaPath The path from which the schema with which to validate should be loaded.
   */
  constructor(logger: Logger, schemaPath: string);
  /**
   * Loads a JSON schema from the `schemaPath` parameter provided at instantiation.
   */
  load(): Promise<JsonMap>;
  /**
   * Performs validation of JSON data against the schema located at the `schemaPath` value provided
   * at instantiation.
   *
   * **Throws** *{@link SfdxError}{ name: 'ValidationSchemaFieldErrors' }* If there are known validations errors.
   * **Throws** *{@link SfdxError}{ name: 'ValidationSchemaUnknown' }* If there are unknown validations errors.
   * @param json A JSON value to validate against this instance's target schema.
   * @returns The validated JSON data.
   */
  validate(json: AnyJson): Promise<AnyJson>;
  /**
   * Loads local, external schemas from URIs relative to the local schema file.  Does not support loading from
   * remote URIs. Returns a map of external schema local URIs to loaded schema JSON objects.
   *
   * @param schema The main schema to validate against.
   */
  private loadExternalSchemas;
  /**
   * Load another schema relative to the primary schema when referenced.  Only supports local schema URIs.
   *
   * @param uri The first segment of the $ref schema.
   */
  private loadExternalSchema;
  /**
   * Get a string representation of the schema validation errors.
   *
   * @param errors An array of JsenValidateError objects.
   * @param schema The validation schema.
   */
  private getErrorsText;
}
