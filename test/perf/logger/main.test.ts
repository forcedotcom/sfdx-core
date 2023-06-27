/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Suite } from 'benchmark';
import { Logger } from '../../../src/exported';

const suite = new Suite();

const logger = new Logger('Benchmarks');

// add tests
suite
  .add('Child logger creation', () => {
    // eslint-disable-next-line @typescript-eslint/prefer-includes
    Logger.childFromRoot('benchmarkChild');
  })
  .add('Logging a string on root logger', () => {
    logger.debug('this is a string');
  })
  .add('Logging an object on root logger', () => {
    logger.debug({ foo: 1, bar: 2, baz: 3 });
  })
  .add('Logging an object with a message on root logger', () => {
    logger.debug({ foo: 1, bar: 2, baz: 3 }, 'this is a message');
  })
  .add('Logging an object with a redacted prop on root logger', () => {
    logger.debug({ foo: 1, bar: 2, accessToken: '00D' });
  })
  .add('Logging a nested 3-level object on root logger', () => {
    logger.debug({ foo: 1, bar: 2, baz: { foo: 1, bar: 2, baz: { foo: 1, bar: 2, baz: 3 } } });
  })
  // add listeners
  .on('cycle', (event: any) => {
    // eslint-disable-next-line no-console, @typescript-eslint/no-unsafe-member-access
    console.log(String(event.target));
  })
  // .on('complete', function () {
  //   const fastest = this.filter('fastest').map('name');

  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/restrict-plus-operands
  //   console.log('Fastest is ' + fastest);
  // })
  // run async
  .run({ async: true });
