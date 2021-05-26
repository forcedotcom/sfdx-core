/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'os';
import { mapKeys, upperFirst } from '@salesforce/kit';
import { getString, hasArray, Optional } from '@salesforce/ts-types';
import { QueryResult } from 'jsforce';
import { Logger } from '../logger';
import { Messages } from '../messages';
import { SfdxError } from '../sfdxError';
import { Org } from './org';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('@salesforce/core', 'permissionSetAssignment', [
  'errorsEncounteredCreatingAssignment',
  'orgRequired',
  'userIdRequired',
  'permSetRequired',
  'assignCommandPermissionSetNotFoundForNSError',
  'assignCommandPermissionSetNotFoundError',
  'notSuccessfulButNoErrorsReported',
]);

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
  private logger: Logger;
  private org: Org;

  private constructor(org: Org, logger: Logger) {
    this.logger = logger;
    this.org = org;
  }
  /**
   * Creates a new instance of PermissionSetAssignment.
   *
   * @param org The target org for the assignment.
   */
  public static async init(org: Org): Promise<PermissionSetAssignment> {
    if (!org) {
      throw messages.createError('orgRequired');
    }

    return new PermissionSetAssignment(org, await Logger.child('PermissionSetAssignment'));
  }

  /**
   * Assigns a user to one or more permission sets.
   *
   * @param id A user id
   * @param permSetString An array of permission set names.
   */
  public async create(id: string, permSetString: string): Promise<PermissionSetAssignmentFields> {
    if (!id) {
      throw messages.createError('userIdRequired');
    }

    if (!permSetString) {
      throw messages.createError('permSetRequired');
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
        throw messages.createError('assignCommandPermissionSetNotFoundForNSError', [permSetName, nsPrefix]);
      } else {
        throw messages.createError('assignCommandPermissionSetNotFoundError', [permSetName]);
      }
    }

    const assignment: PermissionSetAssignmentFields = {
      assigneeId: id,
      permissionSetId,
    };

    const createResponse = await this.org
      .getConnection()
      .sobject('PermissionSetAssignment')
      .create(mapKeys(assignment, (value: unknown, key: string) => upperFirst(key)));

    if (hasArray(createResponse, 'errors') && createResponse.errors.length > 0) {
      let message = messages.getMessage('errorsEncounteredCreatingAssignment');

      const errors = createResponse.errors;
      if (errors && errors.length > 0) {
        message = `${message}:${EOL}`;
        errors.forEach((_message) => {
          message = `${message}${_message}${EOL}`;
        });
        throw new SfdxError(message, 'errorsEncounteredCreatingAssignment');
      } else {
        throw messages.createError('notSuccessfulButNoErrorsReported');
      }
    } else {
      return assignment;
    }
  }

  /**
   * Parses a permission set name based on if it has a namespace or not.
   *
   * @param permSetString The permission set string.
   */
  private parsePermissionSetString(
    permSetString: string
  ): { nsPrefix: Optional<string>; permSetName: Optional<string> } {
    const nsPrefixMatch = RegExp(/(\w+(?=__))(__)(.*)/).exec(permSetString);

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
