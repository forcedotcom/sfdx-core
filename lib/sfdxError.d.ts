import { NamedError } from '@salesforce/kit';
import { JsonMap, Optional } from '@salesforce/ts-types';
import { Messages, Tokens } from './messages';
/**
 * A class to manage all the keys and tokens for a message bundle to use with SfdxError.
 *
 * ```
 * SfdxError.create(new SfdxErrorConfig('MyPackage', 'apex', 'runTest').addAction('apexErrorAction1', [className]));
 * ```
 */
export declare class SfdxErrorConfig {
  /**
   * The name of the package
   */
  readonly packageName: string;
  /**
   * The name of the bundle
   */
  readonly bundleName: string;
  /**
   * The error key
   */
  errorKey: string;
  private errorTokens;
  private messages?;
  private actions;
  /**
   * Create a new SfdxErrorConfig.
   * @param packageName The name of the package.
   * @param bundleName The message bundle.
   * @param errorKey The error message key.
   * @param errorTokens The tokens to use when getting the error message.
   * @param actionKey The action message key.
   * @param actionTokens The tokens to use when getting the action message(s).
   */
  constructor(
    packageName: string,
    bundleName: string,
    errorKey: string,
    errorTokens?: Tokens,
    actionKey?: string,
    actionTokens?: Tokens
  );
  /**
   * Set the error key.
   * @param key The key to set.
   * @returns {SfdxErrorConfig} For convenience `this` object is returned.
   */
  setErrorKey(key: string): SfdxErrorConfig;
  /**
   * Set the error tokens.
   * @param tokens The tokens to set. For convenience `this` object is returned.
   */
  setErrorTokens(tokens: Tokens): SfdxErrorConfig;
  /**
   * Add an error action to assist the user with a resolution. For convenience `this` object is returned.
   * @param actionKey The action key in the message bundle.
   * @param actionTokens The action tokens for the string.
   */
  addAction(actionKey: string, actionTokens?: Tokens): SfdxErrorConfig;
  /**
   * Load the messages using `Messages.loadMessages`. Returns the loaded messages.
   */
  load(): Messages;
  /**
   * Get the error message using messages.getMessage.
   * **Throws** If `errorMessages.load` was not called first.
   */
  getError(): string;
  /**
   * Get the action messages using messages.getMessage.
   * **@throws** If `errorMessages.load` was not called first.
   */
  getActions(): Optional<string[]>;
  /**
   * Remove all actions from this error config. Useful when reusing SfdxErrorConfig for other error messages within
   * the same bundle. For convenience `this` object is returned.
   */
  removeActions(): SfdxErrorConfig;
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
export declare class SfdxError extends NamedError {
  /**
   * Create a new `SfdxError`.
   * @param packageName The message package name used to create the `SfdxError`.
   * @param bundleName The message bundle name used to create the `SfdxError`.
   * @param key The key within the bundle for the message.
   * @param tokens The values to use for message tokenization.
   */
  static create(packageName: string, bundleName: string, key: string, tokens?: Tokens): SfdxError;
  /**
   * Create a new SfdxError.
   * @param errorConfig The `SfdxErrorConfig` object used to create the SfdxError.
   */
  static create(errorConfig: SfdxErrorConfig): SfdxError;
  /**
   * Convert an Error to an SfdxError.
   * @param err The error to convert.
   */
  static wrap(err: Error | string): SfdxError;
  /**
   * The message string. Error.message
   */
  message: string;
  /**
   * Action messages. Hints to the users regarding what can be done to fix related issues.
   */
  actions?: string[];
  /**
   * SfdxCommand can return this process exit code.
   */
  exitCode: number;
  /**
   * The related command name for this error.
   */
  commandName?: string;
  data: any;
  /**
   * Some errors support `error.code` instead of `error.name`. This keeps backwards compatability.
   */
  private _code?;
  /**
   * Create an SfdxError.
   * @param message The error message.
   * @param name The error name. Defaults to 'SfdxError'.
   * @param actions The action message(s).
   * @param exitCode The exit code which will be used by SfdxCommand.
   * @param cause The underlying error that caused this error to be raised.
   */
  constructor(message: string, name?: string, actions?: string[], exitCode?: number, cause?: Error);
  code: string;
  /**
   * Sets the name of the command. For convenience `this` object is returned.
   * @param commandName The command name.
   */
  setCommandName(commandName: string): SfdxError;
  /**
   * An additional payload for the error. For convenience `this` object is returned.
   * @param data The payload data.
   */
  setData(data: unknown): SfdxError;
  /**
   * Convert an {@link SfdxError} state to an object. Returns a plain object representing the state of this error.
   */
  toObject(): JsonMap;
}
