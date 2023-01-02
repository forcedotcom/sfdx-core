/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { URL } from 'url';
import { Env, Duration } from '@salesforce/kit';
import { MyDomainResolver } from '../status/myDomainResolver';
import { isInternalUrl } from './sfdc';

export default async function checkLightningDomain(url: string): Promise<boolean> {
  const domain = `https://${/https?:\/\/([^.]*)/.exec(url)?.slice(1, 2).pop()}.lightning.force.com`;
  const quantity = new Env().getNumber('SFDX_DOMAIN_RETRY', 240) ?? 0;
  const timeout = new Duration(quantity, Duration.Unit.SECONDS);

  if (isInternalUrl(url) || timeout.seconds === 0) {
    return true;
  }

  const resolver = await MyDomainResolver.create({
    url: new URL(domain),
    timeout,
    frequency: new Duration(1, Duration.Unit.SECONDS),
  });

  await resolver.resolve();
  return true;
}
