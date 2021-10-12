/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { OAuth2Config } from 'jsforce';
import { SfdcUrl } from './sfdcUrl';

export async function getJwtAudienceUrl(options: OAuth2Config & { createdOrgInstance?: string }): Promise<string> {
  if (options.loginUrl) {
    const url = new SfdcUrl(options.loginUrl);
    return await url.getJwtAudienceUrl(options.createdOrgInstance);
  }
  return SfdcUrl.PRODUCTION;
}
