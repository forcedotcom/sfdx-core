/*
 * Copyright 2025, Salesforce, Inc.
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
