/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { WebOAuthServer } from '../../src/webOAuthServer';
import { JwtOAuth2Config } from '../../src/org/authInfo';

describe('web Oauth server', () => {
  const oauthConfig: JwtOAuth2Config = {
    loginUrl: 'https://login.salesforce.com',
  };

  let oauthServer: WebOAuthServer;

  before(async () => {
    oauthServer = await WebOAuthServer.create({ oauthConfig });
    await oauthServer.start();
    await oauthServer.authorizeAndSave();
  });

  after(() => {
    oauthServer.close();
  });

  it('handle preflight request', async () => {
    const accessControlHeaders = new Headers({
      'access-control-request-private-network': 'true',
      'access-control-request-method': 'GET',
    });

    const res = await fetch('http://localhost:1717', {
      method: 'OPTIONS',
      headers: accessControlHeaders,
    });

    expect(res.status).to.equal(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).to.equal('GET');
    expect(res.headers.get('Access-Control-Request-Headers')).to.equal('GET');
  });
});
