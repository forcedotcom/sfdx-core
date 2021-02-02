import { JsonMap, Optional } from '@salesforce/ts-types';
export declare const sfdc: {
  /**
   * Returns `true` if a provided URL contains a Salesforce owned domain.
   *
   * @param urlString The URL to inspect.
   */
  isSalesforceDomain: (urlString: string) => boolean;
  /**
   * Converts an 18 character Salesforce ID to 15 characters.
   *
   * @param id The id to convert.
   */
  trimTo15: (id?: string | undefined) => string | undefined;
  /**
   * Tests whether an API version matches the format `i.0`.
   *
   * @param value The API version as a string.
   */
  validateApiVersion: (value: string) => boolean;
  /**
   * Tests whether an email matches the format `me@my.org`
   *
   * @param value The email as a string.
   */
  validateEmail: (value: string) => boolean;
  /**
   * Tests whether a Salesforce ID is in the correct format, a 15- or 18-character length string with only letters and numbers
   * @param value The ID as a string.
   */
  validateSalesforceId: (value: string) => boolean;
  /**
   * Tests whether a path is in the correct format; the value doesn't include the characters "[", "]", "?", "<", ">", "?", "|"
   * @param value The path as a string.
   */
  validatePathDoesNotContainInvalidChars: (value: string) => boolean;
  /**
   * Returns the first key within the object that has an upper case first letter.
   *
   * @param data The object in which to check key casing.
   * @param sectionBlocklist properties in the object to exclude from the search. e.g. a blocklist of `["a"]` and data of `{ "a": { "B" : "b"}}` would ignore `B` because it is in the object value under `a`.
   */
  findUpperCaseKeys: (data?: Optional<JsonMap>, sectionBlocklist?: string[]) => string | undefined;
};
