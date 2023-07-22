/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { HttpRequest } from 'jsforce';
import { Logger } from '../../logger';
import { Connection } from '../connection';
import { Messages } from '../../messages';
import { WebOAuthServer } from '../../webOAuthServer';
import { SfError } from '../../sfError';
import { SandboxProcessObject, SandboxUserAuthRequest, SandboxUserAuthResponse } from './types';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'org');

/**
 * Query the sandbox for the SandboxProcessObject by sandbox name
 *
 * @param sandboxName The name of the sandbox to query
 * @returns {SandboxProcessObject} The SandboxProcessObject for the sandbox
 */
export const queryLatestSandboxProcessBySandboxName = async (
  conn: Connection,
  sandboxNameIn: string,
  logger: Logger
): Promise<SandboxProcessObject> => {
  const { tooling } = conn;
  logger.debug('QueryLatestSandboxProcessBySandboxName called with SandboxName: %s ', sandboxNameIn);
  const queryStr = `SELECT Id, Status, SandboxName, SandboxInfoId, LicenseType, CreatedDate, CopyProgress, SandboxOrganization, SourceId, Description, EndDate FROM SandboxProcess WHERE SandboxName='${sandboxNameIn}' AND Status != 'D' ORDER BY CreatedDate DESC LIMIT 1`;

  const queryResult = await tooling.query(queryStr);
  logger.debug('Return from calling queryToolingApi: %s ', queryResult);
  if (queryResult?.records?.length === 1) {
    return queryResult.records[0] as SandboxProcessObject;
  } else if (queryResult.records && queryResult.records.length > 1) {
    throw messages.createError('MultiSandboxProcessNotFoundBySandboxName', [sandboxNameIn]);
  } else {
    throw messages.createError('SandboxProcessNotFoundBySandboxName', [sandboxNameIn]);
  }
};

/**
 * query SandboxProcess using supplied where clause
 *
 * @param conn Connection
 * @param where clause to query for
 */
export const querySandboxProcess = async (conn: Connection, where: string): Promise<SandboxProcessObject> => {
  const queryStr = `SELECT Id, Status, SandboxName, SandboxInfoId, LicenseType, CreatedDate, CopyProgress, SandboxOrganization, SourceId, Description, EndDate FROM SandboxProcess WHERE ${where} AND Status != 'D'`;
  return conn.singleRecordQuery(queryStr, {
    tooling: true,
  });
};

export const queryProduction = async (
  conn: Connection,
  field: string,
  value: string
): Promise<{ SandboxInfoId: string }> =>
  conn.singleRecordQuery<{ SandboxInfoId: string }>(
    `SELECT SandboxInfoId FROM SandboxProcess WHERE ${field} ='${value}' AND Status NOT IN ('D', 'E')`,
    { tooling: true }
  );

/**
 * determines if the sandbox has successfully been created
 *
 * @param conn Connection
 * @param sandboxProcessObj sandbox signup progress
 * @private
 */
export const sandboxSignupComplete = async ({
  conn,
  sandboxProcessObj,
}: {
  conn: Connection;
  sandboxProcessObj: SandboxProcessObject;
}): Promise<SandboxUserAuthResponse | undefined> => {
  const logger = Logger.childFromRoot('sandboxSignupComplete');
  logger.debug('sandboxSignupComplete called with SandboxProcessObject', sandboxProcessObj);
  if (!sandboxProcessObj.EndDate) {
    return;
  }

  try {
    // call server side /sandboxAuth API to auth the sandbox org user with the connected app
    const authFields = conn.getAuthInfoFields();
    const callbackUrl = `http://localhost:${await WebOAuthServer.determineOauthPort()}/OauthRedirect`;

    const sandboxReq: SandboxUserAuthRequest = {
      // the sandbox signup has been completed on production, we have production clientId by this point
      clientId: authFields.clientId as string,
      sandboxName: sandboxProcessObj.SandboxName,
      callbackUrl,
    };

    logger.debug('Calling sandboxAuth with SandboxUserAuthRequest', sandboxReq);

    // eslint-disable-next-line no-underscore-dangle
    const url = `${conn.tooling._baseUrl()}/sandboxAuth`;
    const params: HttpRequest = {
      method: 'POST',
      url,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sandboxReq),
    };

    const result = await conn.tooling.request<SandboxUserAuthResponse>(params);

    logger.debug('Result of calling sandboxAuth', result);
    return result;
  } catch (err) {
    const error = err as Error;
    // There are cases where the endDate is set before the sandbox has actually completed.
    // In that case, the sandboxAuth call will throw a specific exception.
    if (error?.name === 'INVALID_STATUS') {
      logger.debug('Error while authenticating the user', error?.toString());
    } else {
      // If it fails for any unexpected reason, just pass that through
      throw SfError.wrap(error);
    }
  }
};

/**
 * query SandboxProcess via SandboxInfoId
 *
 * @param conn Connection
 * @param id SandboxInfoId to query for
 */
export const querySandboxProcessBySandboxInfoId = async (conn: Connection, id: string): Promise<SandboxProcessObject> =>
  querySandboxProcess(conn, `SandboxInfoId='${id}'`);

/**
 * query SandboxProcess via Id
 *
 * @param conn Connection
 * @param id SandboxProcessId to query for
 */
export const querySandboxProcessById = async (conn: Connection, id: string): Promise<SandboxProcessObject> =>
  querySandboxProcess(conn, `Id='${id}'`);

/**
 * query SandboxProcess via sandbox name
 *
 * @param conn Connection
 * @param name SandboxName to query for
 */

export const querySandboxProcessBySandboxName = (conn: Connection, name: string): Promise<SandboxProcessObject> =>
  querySandboxProcess(conn, `SandboxName='${name}'`);
