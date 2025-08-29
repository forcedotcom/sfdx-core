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
