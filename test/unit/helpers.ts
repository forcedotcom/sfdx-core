/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isString } from '@salesforce/ts-types';

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
    } else {
      super();
      options = messageOrOptions;
    }
    Object.assign(this, options || {});
  }
}
