/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Suite } from 'benchmark';

const suite = new Suite();

// add tests
suite
  .add('RegExp#test', () => {
    // eslint-disable-next-line @typescript-eslint/prefer-includes
    /o/.test('Hello World!');
  })
  .add('String#indexOf', () => {
    'Hello World!'.includes('o');
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
