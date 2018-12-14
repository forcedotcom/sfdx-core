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

  constructor(options?: Partial<NodeJS.ErrnoException>);
  constructor(message: string, options?: Partial<NodeJS.ErrnoException>);
  constructor(messageOrOptions?: string | Partial<NodeJS.ErrnoException>, options?: Partial<NodeJS.ErrnoException>) {
    if (isString(messageOrOptions)) {
      super(messageOrOptions);
    } else {
      super();
      options = messageOrOptions;
    }
    Object.assign(this, options || {});
  }
}
