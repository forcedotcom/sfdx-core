/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ErrorResult, QueryResult, RecordResult, SuccessResult } from 'jsforce';
import * as _ from 'lodash';
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
     * Creates a new instance of PermissionSetAssignment
     * @param org {PermissionSetAssignment} new instance of PermissionSetAssignment
     */
    public static async init(org: Org): Promise<PermissionSetAssignment> {
        if (!org) {
            throw SfdxError.create('@salesforce/core',
                'permissionSetAssignment', 'orgRequired');
        }

        return new PermissionSetAssignment(org, await Logger.child('PermissionSetAssignment'));
    }

    private logger: Logger;
    private org: Org;

    /**
     * constructor
     * @param org {Org} The org containing the user and permission set.
     * @param logger {Logger} A Logger instance.
     */
    private constructor(org: Org, logger: Logger) {
        this.logger = logger;
        this.org = org;
    }

    /**
     * Assigns a user to one or more permission sets.
     * @param id {string} A user id
     * @param permSetString {string[]} An array of permission set names.
     */
    public async create(id: string, permSetString: string): Promise<PermissionSetAssignmentFields> {

        if (!id) {
            throw SfdxError.create('@salesforce/core',
                'permissionSetAssignment', 'userIdRequired');
        }

        if (!permSetString) {
            throw SfdxError.create('@salesforce/core',
                'permissionSetAssignment', 'permSetRequired');
        }

        const { nsPrefix, permSetName } = this.parsePermissionSetString(permSetString);

        let query = `SELECT Id FROM PermissionSet WHERE Name='${permSetName}'`;

        if (nsPrefix) {
            query += ` AND NamespacePrefix='${nsPrefix}'`;
        }

        const result: QueryResult<string> = await this.org.getConnection().query<string>(query);

        const permissionSetId: string = _.get(result, 'records[0].Id');

        if (!permissionSetId) {
            if (nsPrefix) {
                throw SfdxError.create('@salesforce/core',
                    'permissionSetAssignment', 'assignCommandPermissionSetNotFoundForNSError',
                    [permSetName, nsPrefix]);
            } else {
                throw SfdxError.create('@salesforce/core',
                    'permissionSetAssignment', 'assignCommandPermissionSetNotFoundError',
                    [permSetName]);
            }
        }

        const assignment: PermissionSetAssignmentFields = {
            assigneeId: id,
            permissionSetId
        };

        let createResponse: SuccessResult | ErrorResult | RecordResult[];

        createResponse = await this.org.getConnection().sobject('PermissionSetAssignment')
            .create(_.mapKeys(assignment, (value, key) => _.upperFirst(key)));

        if ((createResponse as RecordResult[]).length) {
            throw SfdxError.create('@salesforce/core',
                'permissionSetAssignment', 'unexpectedType');
        } else {
            if ((createResponse as SuccessResult).success) {
                return assignment;
            } else {
                const messages: Messages = Messages.loadMessages(
                    '@salesforce/core', 'permissionSetAssignment');
                let message = messages.getMessage('errorsEncounteredCreatingAssignment');

                const errors = (createResponse as ErrorResult).errors;
                if (errors && errors.length > 0) {
                    message = `${message}:${EOL}`;
                    _.each((createResponse as ErrorResult).errors, _message => {
                        message = `${message}${_message}${EOL}`;
                    });
                    throw new SfdxError(message, 'errorsEncounteredCreatingAssignment');
                } else {
                    throw SfdxError.create('@salesforce/core',
                        'permissionSetAssignment', 'notSuccessfulButNoErrorsReported');
                }
            }
        }
    }

    /**
     * Parses a permission set name based on if it has a namespace or not.
     * @param permSetString {string} The permission set string.
     */
    private parsePermissionSetString(permSetString: string): { nsPrefix: string, permSetName: string } {
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
