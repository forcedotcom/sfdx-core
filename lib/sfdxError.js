/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { NamedError } from '@salesforce/kit';
import { ensure, hasString, isString } from '@salesforce/ts-types';
import { Messages } from './messages';
/**
 * A class to manage all the keys and tokens for a message bundle to use with SfdxError.
 *
 * ```
 * SfdxError.create(new SfdxErrorConfig('MyPackage', 'apex', 'runTest').addAction('apexErrorAction1', [className]));
 * ```
 */
export class SfdxErrorConfig {
  /**
   * Create a new SfdxErrorConfig.
   * @param packageName The name of the package.
   * @param bundleName The message bundle.
   * @param errorKey The error message key.
   * @param errorTokens The tokens to use when getting the error message.
   * @param actionKey The action message key.
   * @param actionTokens The tokens to use when getting the action message(s).
   */
  constructor(packageName, bundleName, errorKey, errorTokens = [], actionKey, actionTokens) {
    this.actions = new Map();
    this.packageName = packageName;
    this.bundleName = bundleName;
    this.errorKey = errorKey;
    this.errorTokens = errorTokens;
    if (actionKey) this.addAction(actionKey, actionTokens);
  }
  /**
   * Set the error key.
   * @param key The key to set.
   * @returns {SfdxErrorConfig} For convenience `this` object is returned.
   */
  setErrorKey(key) {
    this.errorKey = key;
    return this;
  }
  /**
   * Set the error tokens.
   * @param tokens The tokens to set. For convenience `this` object is returned.
   */
  setErrorTokens(tokens) {
    this.errorTokens = tokens;
    return this;
  }
  /**
   * Add an error action to assist the user with a resolution. For convenience `this` object is returned.
   * @param actionKey The action key in the message bundle.
   * @param actionTokens The action tokens for the string.
   */
  addAction(actionKey, actionTokens = []) {
    this.actions.set(actionKey, actionTokens);
    return this;
  }
  /**
   * Load the messages using `Messages.loadMessages`. Returns the loaded messages.
   */
  load() {
    this.messages = Messages.loadMessages(this.packageName, this.bundleName);
    return this.messages;
  }
  /**
   * Get the error message using messages.getMessage.
   * **Throws** If `errorMessages.load` was not called first.
   */
  getError() {
    if (!this.messages) {
      throw new SfdxError('SfdxErrorConfig not loaded.');
    }
    return this.messages.getMessage(this.errorKey, this.errorTokens);
  }
  /**
   * Get the action messages using messages.getMessage.
   * **@throws** If `errorMessages.load` was not called first.
   */
  getActions() {
    if (!this.messages) {
      throw new SfdxError('SfdxErrorConfig not loaded.');
    }
    if (this.actions.size === 0) return;
    const actions = [];
    this.actions.forEach((tokens, key) => {
      const messages = this.messages;
      if (messages) {
        actions.push(messages.getMessage(key, tokens));
      }
    });
    return actions;
  }
  /**
   * Remove all actions from this error config. Useful when reusing SfdxErrorConfig for other error messages within
   * the same bundle. For convenience `this` object is returned.
   */
  removeActions() {
    this.actions = new Map();
    return this;
  }
}
/**
 * A generalized sfdx error which also contains an action. The action is used in the
 * CLI to help guide users past the error.
 *
 * To throw an error in a synchronous function you must either pass the error message and actions
 * directly to the constructor, e.g.
 *
 * ```
 * // To load a message bundle:
 * Messages.importMessagesDirectory(__dirname);
 * this.messages = Messages.loadMessages('myPackageName', 'myBundleName');
 * // Note that __dirname should contain a messages folder.
 *
 * // To throw an error associated with the message from the bundle:
 * throw SfdxError.create('myPackageName', 'myBundleName', 'MyErrorMessageKey', [messageToken1]);
 *
 * // To throw a non-bundle based error:
 * throw new SfdxError(myErrMsg, 'MyErrorName');
 * ```
 */
export class SfdxError extends NamedError {
  // The create implementation function.
  static create(nameOrConfig, bundleName, key, tokens) {
    let errorConfig;
    if (isString(nameOrConfig)) {
      errorConfig = new SfdxErrorConfig(nameOrConfig, ensure(bundleName), ensure(key), tokens);
    } else {
      errorConfig = nameOrConfig;
    }
    errorConfig.load();
    return new SfdxError(errorConfig.getError(), errorConfig.errorKey, errorConfig.getActions());
  }
  /**
   * Convert an Error to an SfdxError.
   * @param err The error to convert.
   */
  static wrap(err) {
    if (isString(err)) {
      return new SfdxError(err);
    }
    const sfdxError = new SfdxError(err.message, err.name);
    if (sfdxError.stack) {
      sfdxError.stack = sfdxError.stack.replace(`${err.name}: ${err.message}`, 'Outer stack:');
      sfdxError.stack = `${err.stack}\n${sfdxError.stack}`;
    }
    // If the original error has a code, use that instead of name.
    if (hasString(err, 'code')) {
      sfdxError.code = err.code;
    }
    return sfdxError;
  }
  /**
   * Create an SfdxError.
   * @param message The error message.
   * @param name The error name. Defaults to 'SfdxError'.
   * @param actions The action message(s).
   * @param exitCode The exit code which will be used by SfdxCommand.
   * @param cause The underlying error that caused this error to be raised.
   */
  constructor(message, name, actions, exitCode, cause) {
    super(name || 'SfdxError', message, cause);
    this.actions = actions;
    this.exitCode = exitCode || 1;
  }
  get code() {
    return this._code || this.name;
  }
  set code(code) {
    this._code = code;
  }
  /**
   * Sets the name of the command. For convenience `this` object is returned.
   * @param commandName The command name.
   */
  setCommandName(commandName) {
    this.commandName = commandName;
    return this;
  }
  /**
   * An additional payload for the error. For convenience `this` object is returned.
   * @param data The payload data.
   */
  setData(data) {
    this.data = data;
    return this;
  }
  /**
   * Convert an {@link SfdxError} state to an object. Returns a plain object representing the state of this error.
   */
  toObject() {
    const obj = {
      name: this.name,
      message: this.message || this.name,
      exitCode: this.exitCode,
      actions: this.actions
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
//# sourceMappingURL=sfdxError.js.map
