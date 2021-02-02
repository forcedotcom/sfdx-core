import { AsyncCreatable } from '@salesforce/kit';
import { AuthInfo } from './authInfo';
import { Org } from './org';
import { SecureBuffer } from './secureBuffer';
/**
 * A Map of Required Salesforce User fields.
 */
export declare const REQUIRED_FIELDS: {
  id: string;
  username: string;
  lastName: string;
  alias: string;
  timeZoneSidKey: string;
  localeSidKey: string;
  emailEncodingKey: string;
  profileId: string;
  languageLocaleKey: string;
  email: string;
};
/**
 * Required fields type needed to represent a Salesforce User object.
 *
 * **See** https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_objects_user.htm
 */
export declare type UserFields = {
  -readonly [K in keyof typeof REQUIRED_FIELDS]: string;
};
/**
 * Provides a default set of fields values that can be used to create a user. This is handy for
 * software development purposes.
 *
 * ```
 * const connection: Connection = await Connection.create({
 *   authInfo: await AuthInfo.create({ username: 'user@example.com' })
 * });
 * const org: Org = await Org.create({ connection });
 * const options: DefaultUserFields.Options = {
 *   templateUser: org.getUsername()
 * };
 * const fields = (await DefaultUserFields.create(options)).getFields();
 * ```
 */
export declare class DefaultUserFields extends AsyncCreatable<DefaultUserFields.Options> {
  private logger;
  private userFields;
  private options;
  /**
   * @ignore
   */
  constructor(options: DefaultUserFields.Options);
  /**
   * Get user fields.
   */
  getFields(): UserFields;
  /**
   * Initialize asynchronous components.
   */
  protected init(): Promise<void>;
}
export declare namespace DefaultUserFields {
  /**
   * Used to initialize default values for fields based on a templateUser user. This user will be part of the
   * Standard User profile.
   */
  interface Options {
    templateUser: string;
    newUserName?: string;
  }
}
/**
 * A class for creating a User, generating a password for a user, and assigning a user to one or more permission sets.
 * See methods for examples.
 */
export declare class User extends AsyncCreatable<User.Options> {
  /**
   * Generate default password for a user. Returns An encrypted buffer containing a utf8 encoded password.
   */
  static generatePasswordUtf8(): SecureBuffer<void>;
  private org;
  private logger;
  /**
   * @ignore
   */
  constructor(options: User.Options);
  /**
   * Initialize a new instance of a user and return it.
   */
  init(): Promise<void>;
  /**
   * Assigns a password to a user. For a user to have the ability to assign their own password, the org needs the
   * following org preference: SelfSetPasswordInApi.
   * @param info The AuthInfo object for user to assign the password to.
   * @param password [throwWhenRemoveFails = User.generatePasswordUtf8()] A SecureBuffer containing the new password.
   */
  assignPassword(info: AuthInfo, password?: SecureBuffer<void>): Promise<{}>;
  /**
   * Methods to assign one or more permission set names to a user.
   * @param id The Salesforce id of the user to assign the permission set to.
   * @param permsetNames An array of permission set names.
   *
   * ```
   * const username = 'user@example.com';
   * const connection: Connection = await Connection.create({
   *   authInfo: await AuthInfo.create({ username })
   * });
   * const org = await Org.create({ connection });
   * const user: User = await User.create({ org });
   * const fields: UserFields = await user.retrieve(username);
   * await user.assignPermissionSets(fields.id, ['sfdx', 'approver']);
   * ```
   */
  assignPermissionSets(id: string, permsetNames: string[]): Promise<void>;
  /**
   * Method for creating a new User.
   *
   * By default scratch orgs only allow creating 2 additional users. Work with Salesforce Customer Service to increase
   * user limits.
   *
   * The Org Preferences required to increase the number of users are:
   * Standard User Licenses
   * Salesforce CRM Content User
   *
   * @param fields The required fields for creating a user.
   *
   * ```
   * const connection: Connection = await Connection.create({
   *   authInfo: await AuthInfo.create({ username: 'user@example.com' })
   * });
   * const org = await Org.create({ connection });
   *
   * const defaultUserFields = await DefaultUserFields.create({ templateUser: 'devhub_user@example.com' });
   * const user: User = await User.create({ org });
   * const info: AuthInfo = await user.createUser(defaultUserFields.getFields());
   * ```
   */
  createUser(fields: UserFields): Promise<AuthInfo>;
  /**
   * Method to retrieve the UserFields for a user.
   * @param username The username of the user.
   *
   * ```
   * const username = 'boris@thecat.com';
   * const connection: Connection = await Connection.create({
   *   authInfo: await AuthInfo.create({ username })
   * });
   * const org = await Org.create({ connection });
   * const user: User = await User.create({ org });
   * const fields: UserFields = await user.retrieve(username);
   * ```
   */
  retrieve(username: string): Promise<UserFields>;
  /**
   * Helper method that verifies the server's User object is available and if so allows persisting the Auth information.
   * @param newUserAuthInfo The AuthInfo for the new user.
   */
  private describeUserAndSave;
  /**
   * Helper that makes a REST request to create the user, and update additional required fields.
   * @param fields The configuration the new user should have.
   */
  private createUserInternal;
  /**
   * Update the remaining required fields for the user.
   * @param fields The fields for the user.
   */
  private updateRequiredUserFields;
}
export declare namespace User {
  /**
   * Used to initialize default values for fields based on a templateUser user. This user will be part of the
   * Standard User profile.
   */
  interface Options {
    org: Org;
  }
}
