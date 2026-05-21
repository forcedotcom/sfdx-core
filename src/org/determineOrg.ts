/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { Logger } from '../logger/logger';
import { AuthInfo } from './authInfo';
import { Connection } from './connection';
import { Org, OrganizationInformation } from './org';

export async function determineOrg(orgAuthInfo: AuthInfo): Promise<void> {
  const fields = orgAuthInfo.getFields();

  if (fields.orgEdition && fields.namespacePrefix !== undefined) return;

  try {
    const conn = await Connection.create({ authInfo: orgAuthInfo });
    const result = await conn.singleRecordQuery<OrganizationInformation>(
      'SELECT Name, InstanceName, IsSandbox, TrialExpirationDate, NamespacePrefix, OrganizationType FROM Organization'
    );

    if (fields.orgEdition) {
      await orgAuthInfo.save({
        [Org.Fields.NAMESPACE_PREFIX]: result.NamespacePrefix,
      });
    } else {
      await orgAuthInfo.save({
        [Org.Fields.NAME]: result.Name,
        [Org.Fields.INSTANCE_NAME]: result.InstanceName,
        [Org.Fields.NAMESPACE_PREFIX]: result.NamespacePrefix,
        [Org.Fields.IS_SANDBOX]: result.IsSandbox && !result.TrialExpirationDate,
        [Org.Fields.IS_SCRATCH]: result.IsSandbox && Boolean(result.TrialExpirationDate),
        [Org.Fields.TRIAL_EXPIRATION_DATE]: result.TrialExpirationDate,
        [Org.Fields.ORG_EDITION]: result.OrganizationType,
      });
    }
  } catch (err) {
    const logger = await Logger.child('AuthInfo', { tag: 'determineOrg' });
    logger.debug('determineOrg failed', err);
  }
}
