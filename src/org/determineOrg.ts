/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
