/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { NamedError } from '@salesforce/kit';
import { AnyJson, hasString, isString, JsonMap } from '@salesforce/ts-types';

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
export class SfError<T = unknown> extends NamedError {
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
    name?: string,
    actions?: string[],
    exitCodeOrCause?: number | Error,
    cause?: Error
  ) {
    cause = exitCodeOrCause instanceof Error ? exitCodeOrCause : cause;
    super(name ?? 'SfError', message || name, cause);
    this.actions = actions;
    if (typeof exitCodeOrCause === 'number') {
      this.exitCode = exitCodeOrCause;
    } else {
      this.exitCode = 1;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public get code(): any {
    return this.#code ?? this.name;
  }

  public set code(code: string) {
    this.#code = code;
  }

  /**
   * Convert an Error to an SfError.
   *
   * @param err The error to convert.
   */
  public static wrap(err: Error | string): SfError {
    if (isString(err)) {
      return new SfError(err);
    }

    if (err instanceof SfError) {
      return err;
    }

    const sfError = new SfError(err.message, err.name, undefined, err);

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
  public toObject(): JsonMap {
    const obj: JsonMap = {
      name: this.name,
      message: this.message ?? this.name,
      exitCode: this.exitCode,
      actions: this.actions,
    };

    if (this.context) {
      obj.context = this.context;
    }

    if (this.data) {
      // DANGER: data was previously typed as `unknown` and this assertion was here on the toObject.
      // TODO in next major release: put proper type constraint on SfError.data to something that can serialize
      // while we're making breaking changes, provide a more definite type for toObject
      obj.data = this.data as AnyJson;
    }

    return obj;
  }
}
