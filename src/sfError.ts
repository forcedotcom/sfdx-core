/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson, hasString, isString } from '@salesforce/ts-types';

export type SfErrorOptions<T extends ErrorDataProperties = ErrorDataProperties> = {
  message: string;
  exitCode?: number;
  name?: string;
  data?: T;
  /** pass an Error.  For convenience in catch blocks, code will check that it is, in fact, an Error */
  cause?: unknown;
  context?: string;
  actions?: string[];
};

type ErrorDataProperties = AnyJson;

type SfErrorToObjectResult = {
  name: string;
  message: string;
  exitCode: number;
  actions?: string[];
  context?: string;
  data?: ErrorDataProperties;
};

/**
 * A generalized sfdx error which also contains an action. The action is used in the
 * CLI to help guide users past the error.
 *
 * To throw an error in a synchronous function you must either pass the error message and actions
 * directly to the constructor, e.g.
 *
 * ```
 * // To load a message bundle (Note that __dirname should contain a messages folder)
 * Messages.importMessagesDirectory(__dirname);
 * const messages = Messages.load('myPackageName', 'myBundleName');
 *
 * // To throw a non-bundle based error:
 * throw new SfError(message.getMessage('myError'), 'MyErrorName');
 * ```
 */
export class SfError<T extends ErrorDataProperties = ErrorDataProperties> extends Error {
  public readonly name: string;
  /**
   * Action messages. Hints to the users regarding what can be done to fix related issues.
   */
  public actions?: string[];

  /**
   * SfdxCommand can return this process exit code.
   */
  public exitCode: number;

  /**
   * The related context for this error.
   */
  public context?: string;

  // Additional data helpful for consumers of this error.  E.g., API call result
  public data?: T;

  /**
   * Some errors support `error.code` instead of `error.name`. This keeps backwards compatability.
   */
  #code?: string;

  /**
   * Create an SfError.
   *
   * @param message The error message.
   * @param name The error name. Defaults to 'SfError'.
   * @param actions The action message(s).
   * @param exitCodeOrCause The exit code which will be used by SfdxCommand or he underlying error that caused this error to be raised.
   * @param cause The underlying error that caused this error to be raised.
   */
  public constructor(
    message: string,
    name = 'SfError',
    actions?: string[],
    exitCodeOrCause?: number | Error,
    cause?: unknown
  ) {
    if (typeof cause !== 'undefined' && !(cause instanceof Error)) {
      throw new TypeError(`The cause, if provided, must be an instance of Error. Received: ${typeof cause}`);
    }
    super(message);
    this.name = name;
    this.cause = exitCodeOrCause instanceof Error ? exitCodeOrCause : cause;
    if (actions?.length) {
      this.actions = actions;
    }
    if (typeof exitCodeOrCause === 'number') {
      this.exitCode = exitCodeOrCause;
    } else {
      this.exitCode = 1;
    }
  }

  public get code(): string {
    return this.#code ?? this.name;
  }

  public set code(code: string) {
    this.#code = code;
  }

  /** like the constructor, but takes an typed object and let you also set context and data properties */
  public static create<T extends ErrorDataProperties = ErrorDataProperties>(inputs: SfErrorOptions<T>): SfError<T> {
    const error = new SfError<T>(inputs.message, inputs.name, inputs.actions, inputs.exitCode, inputs.cause);
    if (inputs.data) {
      error.data = inputs.data;
    }
    if (inputs.context) {
      error.context = inputs.context;
    }
    return error;
  }
  /**
   * Convert an Error to an SfError.
   *
   * @param err The error to convert.
   */
  public static wrap<T extends ErrorDataProperties = ErrorDataProperties>(err: unknown): SfError<T> {
    if (isString(err)) {
      return new SfError<T>(err);
    }

    if (err instanceof SfError) {
      return err as SfError<T>;
    }

    const sfError =
      fromBasicError<T>(err) ??
      fromErrorLikeObject<T>(err) ??
      // something was thrown that wasn't error, error-like object or string.  Convert it to an Error that preserves the information as the cause and wrap that.
      SfError.wrap<T>(
        new Error(`SfError.wrap received type ${typeof err} but expects type Error or string`, { cause: err })
      );

    // If the original error has a code, use that instead of name.
    if (hasString(err, 'code')) {
      sfError.code = err.code;
    }

    return sfError;
  }

  /**
   * Sets the context of the error. For convenience `this` object is returned.
   *
   * @param context The command name.
   */
  public setContext(context: string): SfError {
    this.context = context;
    return this;
  }

  /**
   * An additional payload for the error. For convenience `this` object is returned.
   *
   * @param data The payload data.
   */
  public setData(data: T): SfError {
    this.data = data;
    return this;
  }

  /**
   * Convert an {@link SfError} state to an object. Returns a plain object representing the state of this error.
   */
  public toObject(): SfErrorToObjectResult {
    return {
      name: this.name,
      message: this.message ?? this.name,
      exitCode: this.exitCode,
      ...(this.actions?.length ? { actions: this.actions } : {}),
      ...(this.context ? { context: this.context } : {}),
      ...(this.data ? { data: this.data } : {}),
    };
  }
}

const fromBasicError = <T extends ErrorDataProperties>(err: unknown): SfError<T> | undefined =>
  err instanceof Error ? SfError.create<T>({ message: err.message, name: err.name, cause: err }) : undefined;

/* an object that is the result of spreading an Error or SfError  */
const fromErrorLikeObject = <T extends ErrorDataProperties>(err: unknown): SfError<T> | undefined => {
  try {
    return SfError.create<T>(err as Error);
  } catch {
    return undefined;
  }
};
