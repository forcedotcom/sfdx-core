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
import { Suite } from 'benchmark';
import { Logger } from '../../../src';
import { cleanup } from '../../../src/logger/cleanup';

const suite = new Suite();

const logger = new Logger('Benchmarks');

// add tests
suite
  .add('Child logger creation', () => {
    Logger.childFromRoot('benchmarkChild');
  })
  .add('Logging a string on root logger', () => {
    logger.warn('this is a string');
  })
  .add('Logging an object on root logger', () => {
    logger.warn({ foo: 1, bar: 2, baz: 3 });
  })
  .add('Logging an object with a message on root logger', () => {
    logger.warn({ foo: 1, bar: 2, baz: 3 }, 'this is a message');
  })
  .add('Logging an object with a redacted prop on root logger', () => {
    logger.warn({ foo: 1, bar: 2, accessToken: '00D' });
  })
  .add('Logging a nested 3-level object on root logger', () => {
    logger.warn({ foo: 1, bar: 2, baz: { foo: 1, bar: 2, baz: { foo: 1, bar: 2, baz: 3 } } });
  })
  // add listeners
  .on('cycle', (event: any) => {
    // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
    console.log(String(event.target));
  })
  .on('complete', async () => {
    // will clear sf log files, since this generates a LOT of them!
    await cleanup(0, true);
  })
  .run({ async: true });
