/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { mapKeys, upperFirst } from '@salesforce/kit';
import { getString, Optional } from '@salesforce/ts-types';
import { ErrorResult, QueryResult, RecordResult, SuccessResult } from 'jsforce';
import { EOL } from 'os';
import { Logger } from './logger';
import { Messages } from './messages';
import { Org } from './org';
import { SfdxError } from './sfdxError';

/**
 * Map of fields name for a permission set assignment
 */
export interface PermissionSetAssignmentFields {
  assigneeId: string;
  permissionSetId: string;
}

/**
 * A class for assigning a Salesforce User to one or more permission sets.
 */
export class PermissionSetAssignment {
  /**
   * Creates a new instance of PermissionSetAssignment.
   * @param org The target org for the assignment.
   */
  public static async init(org: Org): Promise<PermissionSetAssignment> {
    if (!org) {
      throw SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'orgRequired');
    }

    return new PermissionSetAssignment(org, await Logger.child('PermissionSetAssignment'));
  }

  private logger: Logger;
  private org: Org;

  private constructor(org: Org, logger: Logger) {
    this.logger = logger;
    this.org = org;
  }

  /**
   * Assigns a user to one or more permission sets.
   * @param id A user id
   * @param permSetString An array of permission set names.
   */
  public async create(id: string, permSetString: string): Promise<PermissionSetAssignmentFields> {
    if (!id) {
      throw SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'userIdRequired');
    }

    if (!permSetString) {
      throw SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'permSetRequired');
    }

    const { nsPrefix, permSetName } = this.parsePermissionSetString(permSetString);

    let query = `SELECT Id FROM PermissionSet WHERE Name='${permSetName}'`;

    if (nsPrefix) {
      query += ` AND NamespacePrefix='${nsPrefix}'`;
    }

    const result: QueryResult<string> = await this.org.getConnection().query<string>(query);

    const permissionSetId = getString(result, 'records[0].Id');

    if (!permissionSetId) {
      if (nsPrefix) {
        throw SfdxError.create(
          '@salesforce/core',
          'permissionSetAssignment',
          'assignCommandPermissionSetNotFoundForNSError',
          [permSetName, nsPrefix]
        );
      } else {
        throw SfdxError.create(
          '@salesforce/core',
          'permissionSetAssignment',
          'assignCommandPermissionSetNotFoundError',
          [permSetName]
        );
      }
    }

    const assignment: PermissionSetAssignmentFields = {
      assigneeId: id,
      permissionSetId
    };

    let createResponse: SuccessResult | ErrorResult | RecordResult[];

    createResponse = await this.org
      .getConnection()
      .sobject('PermissionSetAssignment')
      .create(mapKeys(assignment, (value: unknown, key: string) => upperFirst(key)));

    if ((createResponse as RecordResult[]).length) {
      throw SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'unexpectedType');
    } else {
      if ((createResponse as SuccessResult).success) {
        return assignment;
      } else {
        const messages: Messages = Messages.loadMessages('@salesforce/core', 'permissionSetAssignment');
        let message = messages.getMessage('errorsEncounteredCreatingAssignment');

        const errors = (createResponse as ErrorResult).errors;
        if (errors && errors.length > 0) {
          message = `${message}:${EOL}`;
          errors.forEach(_message => {
            message = `${message}${_message}${EOL}`;
          });
          throw new SfdxError(message, 'errorsEncounteredCreatingAssignment');
        } else {
          throw SfdxError.create('@salesforce/core', 'permissionSetAssignment', 'notSuccessfulButNoErrorsReported');
        }
      }
    }
  }

  /**
   * Parses a permission set name based on if it has a namespace or not.
   * @param permSetString The permission set string.
   */
  private parsePermissionSetString(
    permSetString: string
  ): { nsPrefix: Optional<string>; permSetName: Optional<string> } {
    const nsPrefixMatch = permSetString.match(/(\w+(?=__))(__)(.*)/);

    let nsPrefix: Optional<string>;
    let permSetName: Optional<string>;
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
