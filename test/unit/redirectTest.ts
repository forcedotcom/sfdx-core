/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection } from '../../src/org/connection';
import { AuthInfo } from '../../src/org/authInfo';

describe('redirect', () => {
  it('should redirect', async () => {
    const conn = await Connection.create({
      authInfo: await AuthInfo.create({ username: 'admin@integrationtesthubna40.org.redirectqa' }),
    });
    const result = await conn.retrieveMaxApiVersion();
    // eslint-disable-next-line no-console
    console.log(result);
  });
});
