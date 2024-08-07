/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import { expect } from 'chai'; // Add this line to import the expect function
import { TestConfig } from './concurrencyConfig';

const sharedLocation = join('sfdx-core-ut', 'test', 'configFile');

/** ex: `yarn ts-node test/nut/concurrencyReadWrite.ts 1` */
(async function (i: number = parseInt(process.argv[2], 10)) {
  const config = new TestConfig(TestConfig.getOptions('test', true, true, sharedLocation));
  config.set('x', i);
  await config.write();
  const readConfig = await config.read(true, true);
  expect(readConfig.x).to.be.a('number');
})().catch((err) => {
  throw err;
});
