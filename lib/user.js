'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('./index-aea73a28.js');
var index$1 = require('./index-ffe6ca9f.js');
var os = require('os');
var authInfo = require('./authInfo.js');
var connection = require('./connection-44f077f0.js');
var logger = require('./logger.js');
var messages = require('./messages.js');
var permissionSetAssignment = require('./permissionSetAssignment.js');
var secureBuffer = require('./secureBuffer.js');
var sfdxError = require('./sfdxError.js');
var util_sfdc = require('./util/sfdc.js');
require('./_commonjsHelpers-49936489.js');
require('crypto');
require('dns');
require('./driver-39f7bd00.js');
require('net');
require('url');
require('util');
require('punycode');
require('tls');
require('http');
require('https');
require('events');
require('assert');
require('domain');
require('buffer');
require('stream');
require('./index-e6d82ffe.js');
require('tty');
require('path');
require('./config/authInfoConfig.js');
require('./config/configFile.js');
require('fs');
require('./global.js');
require('./util/fs.js');
require('constants');
require('./util/internal.js');
require('./config/configStore.js');
require('./config/configAggregator.js');
require('./config/config.js');
require('./crypto.js');
require('./keyChain.js');
require('./keyChainImpl.js');
require('child_process');
require('./config/keychainConfig.js');
require('querystring');
require('zlib');
require('string_decoder');
require('timers');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const PASSWORD_LENGTH = 10;
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMBERS = '1234567890';
const SYMBOLS = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '[', ']', '|', '-'];
const ALL = [LOWER, UPPER, NUMBERS, SYMBOLS.join('')];
const rand = len => Math.floor(Math.random() * len.length);
const scimEndpoint = '/services/scim/v1/Users';
const scimHeaders = { 'auto-approve-user': 'true' };
/**
 * A Map of Required Salesforce User fields.
 */
const REQUIRED_FIELDS = {
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
 * Helper method to lookup UserFields.
 * @param username The username.
 */
async function _retrieveUserFields(username) {
  const connection$1 = await connection.Connection.create({
    authInfo: await authInfo.AuthInfo.create({ username })
  });
  const fromFields = Object.keys(REQUIRED_FIELDS).map(index.lib.upperFirst);
  const requiredFieldsFromAdminQuery = `SELECT ${fromFields} FROM User WHERE Username='${username}'`;
  const result = await connection$1.query(requiredFieldsFromAdminQuery);
  this.logger.debug('Successfully retrieved the admin user for this org.');
  if (result.totalSize === 1) {
    const results = index.lib.mapKeys(result.records[0], (value, key) => index.lib.lowerFirst(key));
    const fields = {
      id: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.id)),
      username,
      alias: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.alias)),
      email: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.email)),
      emailEncodingKey: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.emailEncodingKey)),
      languageLocaleKey: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.languageLocaleKey)),
      localeSidKey: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.localeSidKey)),
      profileId: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.profileId)),
      lastName: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.lastName)),
      timeZoneSidKey: index$1.lib.ensure(index$1.lib.getString(results, REQUIRED_FIELDS.timeZoneSidKey))
    };
    return fields;
  } else {
    throw sfdxError.SfdxError.create('@salesforce/core', 'user', 'userQueryFailed', [username]);
  }
}
/**
 * Gets the profile id associated with a profile name.
 * @param name The name of the profile.
 * @param connection The connection for the query.
 */
async function _retrieveProfileId(name, connection) {
  if (!util_sfdc.sfdc.validateSalesforceId(name)) {
    const profileQuery = `SELECT Id FROM Profile WHERE name='${name}'`;
    const result = await connection.query(profileQuery);
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
class DefaultUserFields extends index.lib.AsyncCreatable {
  /**
   * @ignore
   */
  constructor(options) {
    super(options);
    this.options = options || { templateUser: '' };
  }
  /**
   * Get user fields.
   */
  getFields() {
    return this.userFields;
  }
  /**
   * Initialize asynchronous components.
   */
  async init() {
    this.logger = await logger.Logger.child('DefaultUserFields');
    this.userFields = await _retrieveUserFields.call({ logger: this.logger }, this.options.templateUser);
    this.userFields.profileId = await _retrieveProfileId(
      'Standard User',
      await connection.Connection.create({
        authInfo: await authInfo.AuthInfo.create({ username: this.options.templateUser })
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
class User extends index.lib.AsyncCreatable {
  /**
   * Generate default password for a user. Returns An encrypted buffer containing a utf8 encoded password.
   */
  static generatePasswordUtf8() {
    // Fill an array with random characters from random requirement sets
    const pass = Array(PASSWORD_LENGTH - ALL.length)
      .fill(9)
      .map(() => {
        const _set = ALL[rand(ALL)];
        return _set[rand(_set)];
      });
    const secureBuffer$1 = new secureBuffer.SecureBuffer();
    secureBuffer$1.consume(Buffer.from(pass.join(''), 'utf8'));
    return secureBuffer$1;
  }
  /**
   * @ignore
   */
  constructor(options) {
    super(options);
    this.org = options.org;
  }
  /**
   * Initialize a new instance of a user and return it.
   */
  async init() {
    this.logger = await logger.Logger.child('User');
    await this.org.refreshAuth();
    this.logger.debug('Auth refresh ok');
  }
  /**
   * Assigns a password to a user. For a user to have the ability to assign their own password, the org needs the
   * following org preference: SelfSetPasswordInApi.
   * @param info The AuthInfo object for user to assign the password to.
   * @param password [throwWhenRemoveFails = User.generatePasswordUtf8()] A SecureBuffer containing the new password.
   */
  async assignPassword(info, password = User.generatePasswordUtf8()) {
    this.logger.debug(
      `Attempting to set password for userId: ${info.getFields().userId} username: ${info.getFields().username}`
    );
    const userConnection = await connection.Connection.create({ authInfo: info });
    return new Promise((resolve, reject) => {
      password.value(async buffer => {
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
  async assignPermissionSets(id, permsetNames) {
    if (!id) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'user', 'missingId');
    }
    if (!permsetNames) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'user', 'permsetNamesAreRequired');
    }
    const assignments = await permissionSetAssignment.PermissionSetAssignment.init(this.org);
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
  async createUser(fields) {
    // Create a user and get a refresh token
    const refreshTokenSecret = await this.createUserInternal(fields);
    // Create the initial auth info
    const adminUserAuthFields = this.org.getConnection().getAuthInfoFields();
    // Setup oauth options for the new user
    const oauthOptions = {
      loginUrl: adminUserAuthFields.loginUrl,
      refreshToken: refreshTokenSecret.buffer.value(buffer => buffer.toString('utf8')),
      clientId: adminUserAuthFields.clientId,
      clientSecret: adminUserAuthFields.clientSecret,
      privateKey: adminUserAuthFields.privateKey
    };
    // Create an auth info object for the new user
    const newUserAuthInfo = await authInfo.AuthInfo.create({
      username: fields.username,
      oauth2Options: oauthOptions
    });
    // Update the auth info object with created user id.
    const newUserAuthFields = newUserAuthInfo.getFields();
    newUserAuthFields.userId = refreshTokenSecret.userId;
    // Make sure we can connect and if so save the auth info.
    await this.describeUserAndSave(newUserAuthInfo);
    // Let the org know there is a new user. See $HOME/.sfdx/[orgid].json for the mapping.
    await this.org.addUsername(newUserAuthInfo);
    return newUserAuthInfo;
  }
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
  async retrieve(username) {
    return await _retrieveUserFields.call(this, username);
  }
  /**
   * Helper method that verifies the server's User object is available and if so allows persisting the Auth information.
   * @param newUserAuthInfo The AuthInfo for the new user.
   */
  async describeUserAndSave(newUserAuthInfo) {
    const connection$1 = await connection.Connection.create({ authInfo: newUserAuthInfo });
    this.logger.debug(`Created connection for user: ${newUserAuthInfo.getUsername()}`);
    const userDescribe = await connection$1.describe('User');
    if (userDescribe && userDescribe.fields) {
      await newUserAuthInfo.save();
      return newUserAuthInfo;
    } else {
      throw sfdxError.SfdxError.create('@salesforce/core', 'user', 'problemsDescribingTheUserObject');
    }
  }
  /**
   * Helper that makes a REST request to create the user, and update additional required fields.
   * @param fields The configuration the new user should have.
   */
  async createUserInternal(fields) {
    if (!fields) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'user', 'missingFields');
    }
    const body = JSON.stringify({
      username: fields.username,
      emails: [fields.email],
      name: {
        familyName: fields.lastName
      },
      nickName: fields.username.substring(0, 40),
      entitlements: [
        {
          value: fields.profileId
        }
      ]
    });
    this.logger.debug(`user create request body: ${body}`);
    const scimUrl = this.org.getConnection().normalizeUrl(scimEndpoint);
    this.logger.debug(`scimUrl: ${scimUrl}`);
    const info = {
      method: 'POST',
      url: scimUrl,
      headers: scimHeaders,
      body
    };
    const response = await this.org.getConnection().requestRaw(info);
    const responseBody = index.lib.parseJsonMap(index$1.lib.ensureString(response['body']));
    const statusCode = index$1.lib.asNumber(response.statusCode);
    this.logger.debug(`user create response.statusCode: ${response.statusCode}`);
    if (!(statusCode === 201 || statusCode === 200)) {
      const messages$1 = messages.Messages.loadMessages('@salesforce/core', 'user');
      let message = messages$1.getMessage('invalidHttpResponseCreatingUser', [statusCode]);
      if (responseBody) {
        const errors = index$1.lib.asJsonArray(responseBody.Errors);
        if (errors && errors.length > 0) {
          message = `${message} causes:${os.EOL}`;
          errors.forEach(singleMessage => {
            if (!index$1.lib.isJsonMap(singleMessage)) return;
            message = `${message}${os.EOL}${singleMessage.description}`;
          });
        }
      }
      this.logger.debug(message);
      throw new sfdxError.SfdxError(message, 'UserCreateHttpError');
    }
    fields.id = index$1.lib.ensureString(responseBody.id);
    await this.updateRequiredUserFields(fields);
    const buffer = new secureBuffer.SecureBuffer();
    const headers = index$1.lib.ensureJsonMap(response.headers);
    const autoApproveUser = index$1.lib.ensureString(headers['auto-approve-user']);
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
  async updateRequiredUserFields(fields) {
    const leftOverRequiredFields = index.lib.omit(fields, [
      REQUIRED_FIELDS.username,
      REQUIRED_FIELDS.email,
      REQUIRED_FIELDS.lastName,
      REQUIRED_FIELDS.profileId
    ]);
    const object = index.lib.mapKeys(leftOverRequiredFields, (value, key) => index.lib.upperFirst(key));
    await this.org
      .getConnection()
      .sobject('User')
      .update(object);
    this.logger.debug(`Successfully Updated additional properties for user: ${fields.username}`);
  }
}

exports.DefaultUserFields = DefaultUserFields;
exports.REQUIRED_FIELDS = REQUIRED_FIELDS;
exports.User = User;
//# sourceMappingURL=user.js.map
