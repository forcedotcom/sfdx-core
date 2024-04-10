/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { EOL } from 'node:os';
import { mapKeys, upperFirst } from '@salesforce/kit';
import type { Optional } from '@salesforce/ts-types';
import type { QueryResult, Record } from '@jsforce/jsforce-node';
import { Logger } from '../logger/logger';
import { Messages } from '../messages';
import { SfError } from '../sfError';
import { Org } from './org';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'permissionSetAssignment');

/**
 * Map of fields name for a permission set assignment
 */
export type PermissionSetAssignmentFields = {
  assigneeId: string;
  permissionSetId: string;
};

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

    const result: QueryResult<Record> = await this.org.getConnection().query<Record>(query);

    const permissionSetId = result?.records[0]?.Id;

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

    if (createResponse.success === false) {
      if (!createResponse.errors?.length) {
        throw messages.createError('notSuccessfulButNoErrorsReported');
      }
      const message = [messages.getMessage('errorsEncounteredCreatingAssignment')]
        .concat(
          (createResponse.errors ?? []).map((error) => {
            // note: the types for jsforce SaveError don't have "string[]" error,
            // but there was a UT for that at https://github.com/forcedotcom/sfdx-core/blob/7412d103703cfe2df2211546fcf2e6d93a689bc0/test/unit/org/permissionSetAssignmentTest.ts#L146
            // which could either be hallucination or a real response we've seen, so I'm preserving that behavior.
            if (typeof error === 'string') return error;
            return error.fields ? `${error.message} on fields ${error.fields.join(',')}` : error.message;
          })
        )
        .join(EOL);
      throw new SfError(message, 'errorsEncounteredCreatingAssignment');
    } else {
      return assignment;
    }
  }

  /**
   * Parses a permission set name based on if it has a namespace or not.
   *
   * @param permSetString The permission set string.
   */
  private parsePermissionSetString(permSetString: string): {
    nsPrefix: Optional<string>;
    permSetName: Optional<string>;
  } {
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
