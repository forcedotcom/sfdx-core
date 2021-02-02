'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index$1 = require('./index-aea73a28.js');
var index = require('./index-ffe6ca9f.js');
var os = require('os');
var logger = require('./logger.js');
var messages = require('./messages.js');
var sfdxError = require('./sfdxError.js');
require('./_commonjsHelpers-49936489.js');
require('fs');
require('util');
require('assert');
require('events');
require('stream');
require('./index-e6d82ffe.js');
require('tty');
require('path');
require('./global.js');
require('./util/fs.js');
require('crypto');
require('constants');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * A class for assigning a Salesforce User to one or more permission sets.
 */
class PermissionSetAssignment {
  /**
   * Creates a new instance of PermissionSetAssignment.
   * @param org The target org for the assignment.
   */
  static async init(org) {
    if (!org) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'orgRequired');
    }
    return new PermissionSetAssignment(org, await logger.Logger.child('PermissionSetAssignment'));
  }
  constructor(org, logger) {
    this.logger = logger;
    this.org = org;
  }
  /**
   * Assigns a user to one or more permission sets.
   * @param id A user id
   * @param permSetString An array of permission set names.
   */
  async create(id, permSetString) {
    if (!id) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'userIdRequired');
    }
    if (!permSetString) {
      throw sfdxError.SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'permSetRequired');
    }
    const { nsPrefix, permSetName } = this.parsePermissionSetString(permSetString);
    let query = `SELECT Id FROM PermissionSet WHERE Name='${permSetName}'`;
    if (nsPrefix) {
      query += ` AND NamespacePrefix='${nsPrefix}'`;
    }
    const result = await this.org.getConnection().query(query);
    const permissionSetId = index.lib.getString(result, 'records[0].Id');
    if (!permissionSetId) {
      if (nsPrefix) {
        throw sfdxError.SfdxError.create(
          '@salesforce/core',
          'permissionSetAssignment',
          'assignCommandPermissionSetNotFoundForNSError',
          [permSetName, nsPrefix]
        );
      } else {
        throw sfdxError.SfdxError.create(
          '@salesforce/core',
          'permissionSetAssignment',
          'assignCommandPermissionSetNotFoundError',
          [permSetName]
        );
      }
    }
    const assignment = {
      assigneeId: id,
      permissionSetId
    };
    let createResponse;
    createResponse = await this.org
      .getConnection()
      .sobject('PermissionSetAssignment')
      .create(index$1.lib.mapKeys(assignment, (value, key) => index$1.lib.upperFirst(key)));
    if (index.lib.hasArray(createResponse, 'errors')) {
      const messages$1 = messages.Messages.loadMessages('@salesforce/core', 'permissionSetAssignment');
      let message = messages$1.getMessage('errorsEncounteredCreatingAssignment');
      const errors = createResponse.errors;
      if (errors && errors.length > 0) {
        message = `${message}:${os.EOL}`;
        errors.forEach(_message => {
          message = `${message}${_message}${os.EOL}`;
        });
        throw new sfdxError.SfdxError(message, 'errorsEncounteredCreatingAssignment');
      } else {
        throw sfdxError.SfdxError.create(
          '@salesforce/core',
          'permissionSetAssignment',
          'notSuccessfulButNoErrorsReported'
        );
      }
    } else {
      return assignment;
    }
  }
  /**
   * Parses a permission set name based on if it has a namespace or not.
   * @param permSetString The permission set string.
   */
  parsePermissionSetString(permSetString) {
    const nsPrefixMatch = permSetString.match(/(\w+(?=__))(__)(.*)/);
    let nsPrefix;
    let permSetName;
    if (nsPrefixMatch) {
      try {
        nsPrefix = nsPrefixMatch[1];
        permSetName = nsPrefixMatch[3];
        this.logger.debug(`Using namespacePrefix ${nsPrefix} for permission set ${permSetName}`);
      } catch (e) {
        // Don't fail if we parse wrong.
        this.logger.debug(e);
      }
    } else {
      permSetName = permSetString;
    }
    return { nsPrefix, permSetName };
  }
}

exports.PermissionSetAssignment = PermissionSetAssignment;
//# sourceMappingURL=permissionSetAssignment.js.map
