/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { NamedError } from '@salesforce/kit';
import { hasString, isString, JsonMap } from '@salesforce/ts-types';

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
 * throw new SfdxError(message.getMessage('myError'), 'MyErrorName');
 * ```
 */
export class SfdxError extends NamedError {
  /**
   * The message string. Error.message
   */
  public message!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public name: any;

  /**
   * Action messages. Hints to the users regarding what can be done to fix related issues.
   */
  public actions?: string[];

  /**
   * SfdxCommand can return this process exit code.
   */
  public exitCode: number;

  /**
   * The related command name for this error.
   */
  public commandName?: string;

  // Additional data helpful for consumers of this error.  E.g., API call result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public data: any;

  /**
   * Some errors support `error.code` instead of `error.name`. This keeps backwards compatability.
   */
  private _code?: string;

  /**
   * Create an SfdxError.
   *
   * @param message The error message.
   * @param name The error name. Defaults to 'SfdxError'.
   * @param actions The action message(s).
   * @param exitCode The exit code which will be used by SfdxCommand.
   * @param cause The underlying error that caused this error to be raised.
   */
  public constructor(message: string, name?: string, actions?: string[], exitCode?: number, cause?: Error) {
    super(name || 'SfdxError', message, cause);
    this.actions = actions;
    this.exitCode = exitCode || 1;
  }

  /**
   * Convert an Error to an SfdxError.
   *
   * @param err The error to convert.
   */
  public static wrap(err: Error | string): SfdxError {
    if (isString(err)) {
      return new SfdxError(err);
    }

    if (err instanceof SfdxError) {
      return err;
    }

    const sfdxError = new SfdxError(err.message, err.name);

    if (sfdxError.stack) {
      sfdxError.stack = sfdxError.stack.replace(`${err.name}: ${err.message}`, 'Outer stack:');
      sfdxError.stack = `${err.stack}\n${sfdxError.stack}`;
    } else {
      sfdxError.stack = err.stack;
    }

    // If the original error has a code, use that instead of name.
    if (hasString(err, 'code')) {
      sfdxError.code = err.code;
    }
    return sfdxError;
  }

  public get code() {
    return this._code || this.name;
  }

  public set code(code: string) {
    this._code = code;
  }

  /**
   * Sets the name of the command. For convenience `this` object is returned.
   *
   * @param commandName The command name.
   */
  public setCommandName(commandName: string): SfdxError {
    this.commandName = commandName;
    return this;
  }

  /**
   * An additional payload for the error. For convenience `this` object is returned.
   *
   * @param data The payload data.
   */
  public setData(data: unknown): SfdxError {
    this.data = data;
    return this;
  }

  /**
   * Convert an {@link SfdxError} state to an object. Returns a plain object representing the state of this error.
   */
  public toObject(): JsonMap {
    const obj: JsonMap = {
      name: this.name,
      message: this.message || this.name,
      exitCode: this.exitCode,
      actions: this.actions,
    };

    if (this.commandName) {
      obj.commandName = this.commandName;
    }

    if (this.data) {
      obj.data = this.data;
    }

    return obj;
  }
}
