/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { AsyncCreatable, lowerFirst, mapKeys, omit, parseJsonMap, upperFirst } from '@salesforce/kit';
import {
  asJsonArray,
  asNumber,
  ensure,
  ensureJsonMap,
  ensureString,
  getString,
  isJsonMap,
  Many
} from '@salesforce/ts-types';
import { QueryResult, RequestInfo } from 'jsforce';
import { DescribeSObjectResult } from 'jsforce/describe-result';
import { EOL } from 'os';
import { AuthFields, AuthInfo } from './authInfo';
import { Connection } from './connection';
import { Logger } from './logger';
import { Messages } from './messages';
import { Org } from './org';
import { PermissionSetAssignment } from './permissionSetAssignment';
import { SecureBuffer } from './secureBuffer';
import { SfdxError } from './sfdxError';
import { validateSalesforceId } from './util/sfdc';

const PASSWORD_LENGTH = 10;
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '1234567890';
const SYMBOLS = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '[', ']', '|', '-'];
const ALL = [LOWER, UPPER, NUMBERS, SYMBOLS.join('')];

const rand = (len: Many<string>) => Math.floor(Math.random() * len.length);

const scimEndpoint = '/services/scim/v1/Users';
const scimHeaders = { 'auto-approve-user': 'true' };

/**
 * A Map of Required Salesforce User fields.
 */
export const REQUIRED_FIELDS = {
  id: 'id',
  username: 'username',
  lastName: 'lastName',
  alias: 'alias',
  timeZoneSidKey: 'timeZoneSidKey',
  localeSidKey: 'localeSidKey',
  emailEncodingKey: 'emailEncodingKey',
  profileId: 'profileId',
  languageLocaleKey: 'languageLocaleKey',
  email: 'email'
};

/**
 * Required fields type needed to represent a Salesforce User object.
 *
 * **See** https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/sforce_api_objects_user.htm
 */
export type UserFields = { -readonly [K in keyof typeof REQUIRED_FIELDS]: string };

/**
 * Helper method to lookup UserFields
 * @param username The username
 */
async function _retrieveUserFields(this: { logger: Logger }, username: string): Promise<UserFields> {
  const connection: Connection = await Connection.create({
    authInfo: await AuthInfo.create({ username })
  });

  const fromFields = Object.keys(REQUIRED_FIELDS).map(upperFirst);
  const requiredFieldsFromAdminQuery = `SELECT ${fromFields} FROM User WHERE Username='${username}'`;
  const result: QueryResult<string[]> = await connection.query<string[]>(requiredFieldsFromAdminQuery);

  this.logger.debug('Successfully retrieved the admin user for this org.');

  if (result.totalSize === 1) {
    const results = mapKeys(result.records[0], (value: unknown, key: string) => lowerFirst(key));

    const fields: UserFields = {
      id: ensure(getString(results, REQUIRED_FIELDS.id)),
      username,
      alias: ensure(getString(results, REQUIRED_FIELDS.alias)),
      email: ensure(getString(results, REQUIRED_FIELDS.email)),
      emailEncodingKey: ensure(getString(results, REQUIRED_FIELDS.emailEncodingKey)),
      languageLocaleKey: ensure(getString(results, REQUIRED_FIELDS.languageLocaleKey)),
      localeSidKey: ensure(getString(results, REQUIRED_FIELDS.localeSidKey)),
      profileId: ensure(getString(results, REQUIRED_FIELDS.profileId)),
      lastName: ensure(getString(results, REQUIRED_FIELDS.lastName)),
      timeZoneSidKey: ensure(getString(results, REQUIRED_FIELDS.timeZoneSidKey))
    };

    return fields;
  } else {
    throw SfdxError.create('@salesforce/core', 'user', 'userQueryFailed', [username]);
  }
}

/**
 * Gets the profile id associated with a profile name.
 * @param name The name of the profile.
 * @param connection The connection for the query.
 */
async function _retrieveProfileId(name: string, connection: Connection): Promise<string> {
  if (!validateSalesforceId(name)) {
    const profileQuery = `SELECT Id FROM Profile WHERE name='${name}'`;
    const result = await connection.query<{ Id: string }>(profileQuery);
    if (result.records.length > 0) {
      return result.records[0].Id;
    }
  }
  return name;
}

/**
 * Provides a default set of fields values that can be used to create a user. This is handy for
 * software development purposes.
 *
 * ```
 * const options: DefaultUserFieldsOptions = {
 *     templateUser: org.getUsername() || ''
 * };
 * const fields = (await DefaultUserFields.create(options)).getFields();
 * ```
 */
export class DefaultUserFields extends AsyncCreatable<User.Options> {
  private logger!: Logger;
  private userFields!: UserFields;

  private options: User.Options;

  /**
   * @hidden
   * @param options
   */
  public constructor(options: User.Options) {
    super(options);
    this.options = options || { templateUser: '' };
  }

  /**
   * Get userfields
   */
  public getFields(): UserFields {
    return this.userFields;
  }

  /**
   * Intialize asynchronous components.
   */
  protected async init(): Promise<void> {
    this.logger = await Logger.child('DefaultUserFields');
    this.userFields = await _retrieveUserFields.call({ logger: this.logger }, this.options.templateUser);
    this.userFields.profileId = await _retrieveProfileId(
      'Standard User',
      await Connection.create({
        authInfo: await AuthInfo.create({ username: this.options.templateUser })
      })
    );
    this.logger.debug(`Standard User profileId: ${this.userFields.profileId}`);
    if (this.options.newUserName) {
      this.userFields.username = this.options.newUserName;
    } else {
      this.userFields.username = `${Date.now()}_${this.userFields.username}`;
    }
  }
}

/**
 * A class for creating a User, generating a password for a user, and assigning a user to one or more permission sets.
 * See methods for examples.
 */
export class User {
  /**
   * Initialize a new instance of a user and return it.
   * @param org The org associated with the user.
   */
  public static async init(org: Org): Promise<User> {
    if (!org) {
      throw SfdxError.create('@salesforce/core', 'user', 'orgRequired');
    }
    const logger = await Logger.child('User');
    await org.refreshAuth();
    logger.debug('Auth refresh ok');
    return new User(org, logger);
  }

  /**
   * Generate default password for a user. Returns An encrypted buffer containing a utf8 encoded password.
   */
  public static generatePasswordUtf8(): SecureBuffer<void> {
    // Fill an array with random characters from random requirement sets
    const pass = Array(PASSWORD_LENGTH - ALL.length)
      .fill(9)
      .map(() => {
        const _set = ALL[rand(ALL)];
        return _set[rand(_set)];
      });

    const secureBuffer: SecureBuffer<void> = new SecureBuffer<void>();
    secureBuffer.consume(Buffer.from(pass.join(''), 'utf8'));

    return secureBuffer;
  }

  private org: Org;
  private logger: Logger;

  private constructor(org: Org, logger: Logger) {
    this.org = org;
    this.logger = logger;
  }

  /**
   * Assigns a password to a user. For a user to have the ability to assign their own password, the org needs the
   * following org preference: SelfSetPasswordInApi
   * @param info The AuthInfo object for user to assign the password to.
   * @param password [throwWhenRemoveFails = User.generatePasswordUtf8()] A SecureBuffer containing the new password.
   */
  public async assignPassword(info: AuthInfo, password: SecureBuffer<void> = User.generatePasswordUtf8()) {
    this.logger.debug(
      `Attempting to set password for userId: ${info.getFields().userId} username: ${info.getFields().username}`
    );

    const userConnection = await Connection.create({ authInfo: info });

    return new Promise((resolve, reject) => {
      password.value(async (buffer: Buffer) => {
        try {
          // @ts-ignore TODO: expose `soap` on Connection however appropriate
          const soap = userConnection.soap;
          await soap.setPassword(info.getFields().userId, buffer.toString('utf8'));
          this.logger.debug(`Set password for userId: ${info.getFields().userId}`);
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  /**
   * Methods to assign one or more permission set names to a user.
   * @param id The Salesforce id of the user to assign the permission set to.
   * @param permsetNames An array of permission set names.
   *
   * ```
   * const org = await Org.create(await Connection.create(await AuthInfo.create('standardUser')));
   * const user: User = await User.init(org)
   * const fields: UserFields = await user.retrieve();
   * await user.assignPermissionSets(fields.id, ['sfdx', 'approver']);
   * ```
   */
  public async assignPermissionSets(id: string, permsetNames: string[]): Promise<void> {
    if (!id) {
      throw SfdxError.create('@salesforce/core', 'user', 'missingId');
    }

    if (!permsetNames) {
      throw SfdxError.create('@salesforce/core', 'user', 'permsetNamesAreRequired');
    }

    const assignments: PermissionSetAssignment = await PermissionSetAssignment.init(this.org);

    for (const permsetName of permsetNames) {
      await assignments.create(id, permsetName);
    }
  }

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
   * const org = await Org.create(await Connection.create(await AuthInfo.create('fooUser')));
   * const fields: UserFields = await DefaultUserFields.init(org);
   * const user: User = await User.init(org);
   * const info: AuthInfo = await user.create(fields);
   * ```
   */
  public async create(fields: UserFields): Promise<AuthInfo> {
    // Create a user and get a refresh token
    const refreshTokenSecret: {
      buffer: SecureBuffer<string>;
      userId: string;
    } = await this.createUserInternal(fields);

    // Create the initial auth info
    const adminUserAuthFields: AuthFields = this.org.getConnection().getAuthInfoFields();

    // Setup oauth options for the new user
    const oauthOptions = {
      loginUrl: adminUserAuthFields.loginUrl,
      refreshToken: refreshTokenSecret.buffer.value((buffer: Buffer): string => buffer.toString('utf8')),
      clientId: adminUserAuthFields.clientId,
      clientSecret: adminUserAuthFields.clientSecret,
      privateKey: adminUserAuthFields.privateKey
    };

    // Create an auth info object for the new user
    const newUserAuthInfo: AuthInfo = await AuthInfo.create({
      username: fields.username,
      oauth2Options: oauthOptions
    });

    // Update the auth info object with created user id.
    const newUserAuthFields: AuthFields = newUserAuthInfo.getFields();
    newUserAuthFields.userId = refreshTokenSecret.userId;

    // Make sure we can connect and if so save the auth info.
    await this.describeUserAndSave(newUserAuthInfo);

    // Let the org know there is a new user. See $HOME/.sfdx/[orgid].json for the mapping.
    await this.org.addUsername(newUserAuthInfo);

    return newUserAuthInfo;
  }

  /**
   * Method to retrieve the UserFields for a user.
   * @param username The username of the user
   *
   * ```
   * const org = await Org.create(await Connection.create(await AuthInfo.create('fooUser')));
   * const user: User = await User.init(org);
   * const fields: UserFields = await user.retrieve('boris@thecat.com')
   * ```
   */
  public async retrieve(username: string): Promise<UserFields> {
    return await _retrieveUserFields.call(this, username);
  }

  /**
   * Helper method that verifies the server's User object is available and if so allows persisting the Auth information.
   * @param newUserAuthInfo The AuthInfo for the new user.
   */
  private async describeUserAndSave(newUserAuthInfo: AuthInfo): Promise<AuthInfo> {
    const connection = await Connection.create({ authInfo: newUserAuthInfo });

    this.logger.debug(`Created connection for user: ${newUserAuthInfo.getUsername()}`);

    const userDescribe: DescribeSObjectResult = await connection.describe('User');

    if (userDescribe && userDescribe.fields) {
      await newUserAuthInfo.save();
      return newUserAuthInfo;
    } else {
      throw SfdxError.create('@salesforce/core', 'user', 'problemsDescribingTheUserObject');
    }
  }

  /**
   * Helper that makes a REST request to create the user, and update additional required fields.
   * @param fields The configuration the new user should have.
   */
  private async createUserInternal(fields: UserFields): Promise<{ buffer: SecureBuffer<string>; userId: string }> {
    if (!fields) {
      throw SfdxError.create('@salesforce/core', 'user', 'missingFields');
    }

    const body = JSON.stringify({
      username: fields.username,
      emails: [fields.email],
      name: {
        familyName: fields.lastName
      },
      nickName: fields.username.substring(0, 40), // nickName has a max length of 40
      entitlements: [
        {
          value: fields.profileId
        }
      ]
    });

    this.logger.debug(`user create request body: ${body}`);

    const scimUrl = this.org.getConnection().normalizeUrl(scimEndpoint);
    this.logger.debug(`scimUrl: ${scimUrl}`);

    const info: RequestInfo = {
      method: 'POST',
      url: scimUrl,
      headers: scimHeaders,
      body
    };

    const response = await this.org.getConnection().requestRaw(info);
    const responseBody = parseJsonMap(ensureString(response['body']));
    const statusCode = asNumber(response.statusCode);

    this.logger.debug(`user create response.statusCode: ${response.statusCode}`);
    if (!(statusCode === 201 || statusCode === 200)) {
      const messages = Messages.loadMessages('@salesforce/core', 'user');
      let message = messages.getMessage('invalidHttpResponseCreatingUser', [statusCode]);

      if (responseBody) {
        const errors = asJsonArray(responseBody.Errors);
        if (errors && errors.length > 0) {
          message = `${message} causes:${EOL}`;
          errors.forEach(singleMessage => {
            if (!isJsonMap(singleMessage)) return;
            message = `${message}${EOL}${singleMessage.description}`;
          });
        }
      }
      this.logger.debug(message);
      throw new SfdxError(message, 'UserCreateHttpError');
    }

    fields.id = ensureString(responseBody.id);
    await this.updateRequiredUserFields(fields);

    const buffer = new SecureBuffer<string>();
    const headers = ensureJsonMap(response.headers);
    const autoApproveUser = ensureString(headers['auto-approve-user']);
    buffer.consume(Buffer.from(autoApproveUser));
    return {
      buffer,
      userId: fields.id
    };
  }

  /**
   * Update the remaining required fields for the user.
   * @param fields The fields for the user.
   */
  private async updateRequiredUserFields(fields: UserFields) {
    const leftOverRequiredFields = omit(fields, [
      REQUIRED_FIELDS.username,
      REQUIRED_FIELDS.email,
      REQUIRED_FIELDS.lastName,
      REQUIRED_FIELDS.profileId
    ]);
    const object = mapKeys(leftOverRequiredFields, (value: unknown, key: string) => upperFirst(key));
    await this.org
      .getConnection()
      .sobject('User')
      .update(object);
    this.logger.debug(`Successfully Updated additional properties for user: ${fields.username}`);
  }
}

export namespace User {
  /**
   * Used to initialize default values for fields based on a templateUser user. This user will be part of the
   * Standard User profile.
   */
  export interface Options {
    templateUser: string;
    newUserName?: string;
  }
}
