/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { OAuth2Config } from '@jsforce/jsforce-node';
import { expect } from 'chai';
import { Env } from '@salesforce/kit';
import { SfdcUrl } from '../../../src/util/sfdcUrl';
import { getJwtAudienceUrl } from '../../../src/util/getJwtAudienceUrl';

describe('getJwtAudienceUrl', () => {
  const env = new Env();

  afterEach(() => {
    env.unset('SFDX_AUDIENCE_URL');
    env.unset('SF_AUDIENCE_URL');
  });

  it('return the correct jwt audience for undefined loginUrl', async () => {
    const options: OAuth2Config = {};
    const url = await getJwtAudienceUrl(options);
    expect(url).to.be.equal(SfdcUrl.PRODUCTION);
  });

  it('should use the correct audience URL for createdOrgInstance beginning with "gs1"', async () => {
    const options: OAuth2Config & { createdOrgInstance?: string } = {
      loginUrl: 'https://foo.bar.baz',
      createdOrgInstance: 'gs1',
    };
    const url = await getJwtAudienceUrl(options);
    expect(url).to.be.equal('https://gs1.salesforce.com');
  });

  it('should return production URL if domain cannot be resolved', async () => {
    const options: OAuth2Config = {
      loginUrl: 'https://foo.bar.baz',
    };
    const url = await getJwtAudienceUrl(options);
    expect(url).to.be.equal('https://login.salesforce.com');
  });

  it('should use the correct audience URL for SFDX_AUDIENCE_URL env var', async () => {
    env.setString('SFDX_AUDIENCE_URL', 'http://authInfoTest-sfdx/audienceUrl/test');
    const url = new SfdcUrl('https://login.salesforce.com');
    const response = await url.getJwtAudienceUrl();
    expect(response).to.be.equal(process.env.SFDX_AUDIENCE_URL);
  });

  it('should use the correct audience URL for SF_AUDIENCE_URL env var', async () => {
    env.setString('SF_AUDIENCE_URL', 'http://authInfoTest-sf/audienceUrl/test');
    const url = new SfdcUrl('https://login.salesforce.com');
    const response = await url.getJwtAudienceUrl();
    expect(response).to.be.equal(process.env.SF_AUDIENCE_URL);
  });
});
