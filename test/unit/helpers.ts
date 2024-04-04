/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isString } from '@salesforce/ts-types';
import { expect } from 'chai';
import { omit } from '@salesforce/kit';
import { AuthFields } from '../../src';
/**
 * A test implementation of NodeJS.ErrnoException for mocking fs errors.
 */
export class ErrnoException extends Error implements NodeJS.ErrnoException {
  public errno?: number;
  public code?: string;
  public path?: string;
  public syscall?: string;
  public stack?: string;

  public constructor(options?: Partial<NodeJS.ErrnoException>);
  public constructor(message: string, options?: Partial<NodeJS.ErrnoException>);
  public constructor(
    messageOrOptions?: string | Partial<NodeJS.ErrnoException>,
    options?: Partial<NodeJS.ErrnoException>
  ) {
    if (isString(messageOrOptions)) {
      super(messageOrOptions);
      Object.assign(this, options ?? {});
    } else {
      super();
      Object.assign(this, messageOrOptions ?? {});
    }
  }
}

export const expectPartialDeepMatch = (
  actual: AuthFields,
  expected: AuthFields,
  ignore = ['refreshToken', 'accessToken']
): Chai.Assertion => expect(omit<AuthFields>(actual, ignore)).to.deep.equal(omit<AuthFields>(expected, ignore));
