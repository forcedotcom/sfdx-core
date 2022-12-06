/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import {
  AnyJson,
  asString,
  ensureJsonMap,
  ensureString,
  isArray,
  isJsonMap,
  isObject,
  Optional,
} from '@salesforce/ts-types';
import { NamedError, upperFirst } from '@salesforce/kit';
import { SfError } from './sfError';

export type Tokens = Array<string | boolean | number | null | undefined>;

class Key {
  public constructor(private packageName: string, private bundleName: string) {}

  public toString(): string {
    return `${this.packageName}:${this.bundleName}`;
  }
}

export type StructuredMessage = {
  message: string;
  name: string;
  actions?: string[];
};

/**
 * A loader function to return messages.
 *
 * @param locale The local set by the framework.
 */
export type LoaderFunction<T extends string> = (locale: string) => Messages<T>;

export type StoredMessage = string | string[] | { [s: string]: StoredMessage };
export type StoredMessageMap = Map<string, StoredMessage>;

/**
 * Different message file content parsers. This allows us to have js, json, and md. Maybe we will eventually support yaml, etc.
 */
type FileParser = (filePath: string, fileContents: string) => StoredMessageMap;

const REGEXP_NO_CONTENT = /^\s*$/g;
const REGEXP_NO_CONTENT_SECTION = /^#\s*/gm;
const REGEXP_MD_IS_LIST_ROW = /^[*-]\s+|^ {2}/;
const REGEXP_MD_LIST_ITEM = /^[*-]\s+/gm;

const markdownLoader: FileParser = (filePath: string, fileContents: string): StoredMessageMap => {
  const map = new Map<string, StoredMessage>();
  const hasContent = (lineItem: string): boolean => !REGEXP_NO_CONTENT.exec(lineItem);

  // Filter out sections that don't have content
  const sections = fileContents.split(REGEXP_NO_CONTENT_SECTION).filter(hasContent);

  for (const section of sections) {
    const lines = section.split('\n');
    const firstLine = lines.shift();
    const rest = lines.join('\n').trim();

    if (firstLine && rest.length > 0) {
      const key = firstLine.trim();
      const nonEmptyLines = lines.filter((line) => !!line.trim());
      // If every entry in the value is a list item, then treat this as a list. Indented lines are part of the list.
      if (nonEmptyLines.every((line) => REGEXP_MD_IS_LIST_ROW.exec(line))) {
        const listItems = rest.split(REGEXP_MD_LIST_ITEM).filter(hasContent);
        const values = listItems.map((item) =>
          item
            .split('\n')
            // new lines are ignored in markdown lists
            .filter((line) => !!line.trim())
            // trim off the indentation
            .map((line) => line.trim())
            // put it back together
            .join('\n')
        );
        map.set(key, values);
      } else {
        map.set(key, rest);
      }
    } else {
      // use error instead of SfError because messages.js should have no internal dependencies.
      throw new Error(
        `Invalid markdown message file: ${filePath}\nThe line "# <key>" must be immediately followed by the message on a new line.`
      );
    }
  }

  return map;
};

const jsAndJsonLoader: FileParser = (filePath: string, fileContents: string): StoredMessageMap => {
  let json;

  try {
    json = JSON.parse(fileContents) as unknown;

    if (!isObject(json)) {
      // Bubble up
      throw new Error(`Unexpected token. Found returned content type '${typeof json}'.`);
    }
  } catch (err) {
    // Provide a nicer error message for a common JSON parse error; Unexpected token
    const error = err as Error;
    if (error.message.startsWith('Unexpected token')) {
      const parseError = new Error(`Invalid JSON content in message file: ${filePath}\n${error.message}`);
      parseError.name = error.name;
      throw parseError;
    }
    throw err;
  }

  return new Map<string, StoredMessage>(Object.entries(json));
};

/**
 * The core message framework manages messages and allows them to be accessible by
 * all plugins and consumers of sfdx-core. It is set up to handle localization down
 * the road at no additional effort to the consumer. Messages can be used for
 * anything from user output (like the console), to error messages, to returned
 * data from a method.
 *
 * Messages are loaded from loader functions. The loader functions will only run
 * when a message is required. This prevents all messages from being loaded into memory at
 * application startup. The functions can load from memory, a file, or a server.
 *
 * In the beginning of your app or file, add the loader functions to be used later. If using
 * json or js files in a root messages directory (`<moduleRoot>/messages`), load the entire directory
 * automatically with {@link Messages.importMessagesDirectory}. Message files must be the following formates.
 *
 * A `.json` file:
 * ```json
 * {
 *    "msgKey": "A message displayed in the user",
 *    "msgGroup": {
 *       "anotherMsgKey": "Another message displayed to the user"
 *    },
 *    "listOfMessage": ["message1", "message2"]
 * }
 * ```
 *
 * A `.js` file:
 * ```javascript
 * module.exports = {
 *    msgKey: 'A message displayed in the user',
 *    msgGroup: {
 *       anotherMsgKey: 'Another message displayed to the user'
 *    },
 *    listOfMessage: ['message1', 'message2']
 * }
 * ```
 *
 * A `.md` file:
 * ```markdown
 * # msgKey
 * A message displayed in the user
 *
 * # msgGroup.anotherMsgKey
 * Another message displayed to the user
 *
 * # listOfMessage
 * - message1
 * - message2
 * ```
 *
 * The values support [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) style strings
 * that apply the tokens passed into {@link Message.getMessage}
 *
 * **Note:** When running unit tests individually, you may see errors that the messages aren't found.
 * This is because `index.js` isn't loaded when tests run like they are when the package is required.
 * To allow tests to run, import the message directory in each test (it will only
 * do it once) or load the message file the test depends on individually.
 *
 * ```typescript
 * // Create loader functions for all files in the messages directory
 * Messages.importMessagesDirectory(__dirname);
 *
 * // Now you can use the messages from anywhere in your code or file.
 * // If using importMessageDirectory, the bundle name is the file name.
 * const messages: Messages = Messages.load(packageName, bundleName);
 *
 * // Messages now contains all the message in the bundleName file.
 * messages.getMessage('authInfoCreationError');
 * ```
 */
export class Messages<T extends string> {
  // It would be AWESOME to use Map<Key, Message> but js does an object instance comparison and doesn't let you
  // override valueOf or equals for the === operator, which map uses. So, Use Map<String, Message>

  // A map of loading functions to dynamically load messages when they need to be used
  private static loaders: Map<string, (locale: string) => Messages<string>> = new Map<
    string,
    (locale: string) => Messages<string>
  >();

  // A map cache of messages bundles that have already been loaded
  private static bundles: Map<string, Messages<string>> = new Map<string, Messages<string>>();

  /**
   * The locale of the messages in this bundle.
   */
  public readonly locale: string;
  /**
   * The bundle name.
   */
  public readonly bundleName: string;
  /**
   * Create a new messages bundle.
   *
   * **Note:** Use {Messages.load} unless you are writing your own loader function.
   *
   * @param bundleName The bundle name.
   * @param locale The locale.
   * @param messages The messages. Can not be modified once created.
   */
  public constructor(bundleName: string, locale: string, private messages: StoredMessageMap) {
    this.bundleName = bundleName;
    this.locale = locale;
  }

  /**
   * Internal readFile. Exposed for unit testing. Do not use util/fs.readFile as messages.js
   * should have no internal dependencies.
   *
   * @param filePath read file target.
   * @ignore
   */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  public static readFile = (filePath: string): AnyJson => require(filePath);

  /**
   * Get the locale. This will always return 'en_US' but will return the
   * machine's locale in the future.
   */
  public static getLocale(): string {
    return 'en_US';
  }

  /**
   * Set a custom loader function for a package and bundle that will be called on {@link Messages.load}.
   *
   * @param packageName The npm package name.
   * @param bundle The name of the bundle.
   * @param loader The loader function.
   */
  public static setLoaderFunction(packageName: string, bundle: string, loader: LoaderFunction<string>): void {
    this.loaders.set(new Key(packageName, bundle).toString(), loader);
  }

  /**
   * Generate a file loading function. Use {@link Messages.importMessageFile} unless
   * overriding the bundleName is required, then manually pass the loader
   * function to {@link Messages.setLoaderFunction}.
   *
   * @param bundleName The name of the bundle.
   * @param filePath The messages file path.
   */
  public static generateFileLoaderFunction(bundleName: string, filePath: string): LoaderFunction<string> {
    const ext = path.extname(filePath);
    if (!['.json', '.js', '.md'].includes(ext)) {
      throw new Error(`Only json, js and md message files are allowed, not ${ext}: ${filePath}`);
    }

    return (locale: string): Messages<string> => {
      let fileContents: string;
      let parser: FileParser;
      if (ext === '.md') {
        fileContents = fs.readFileSync(filePath, 'utf-8');
        parser = markdownLoader;
      } else {
        // Anything can be returned by a js file, so stringify the results to ensure valid json is returned.
        fileContents = JSON.stringify(Messages.readFile(filePath));
        // If the file is empty, JSON.stringify will turn it into "" which will validate on parse.
        if (fileContents === 'null' || fileContents === '""') fileContents = '';
        parser = jsAndJsonLoader;
      }

      if (!fileContents || fileContents.trim().length === 0) {
        // messages.js should have no internal dependencies.
        const error = new Error(`Invalid message file: ${filePath}. No content.`);
        error.name = 'SfError';
        throw error;
      }

      const map = parser(filePath, fileContents);

      return new Messages(bundleName, locale, map);
    };
  }

  /**
   * Add a single message file to the list of loading functions using the file name as the bundle name.
   * The loader will only be added if the bundle name is not already taken.
   *
   * @param packageName The npm package name.
   * @param filePath The path of the file.
   */
  public static importMessageFile(packageName: string, filePath: string): void {
    const bundleName = path.basename(filePath, path.extname(filePath));

    if (!Messages.isCached(packageName, bundleName)) {
      this.setLoaderFunction(packageName, bundleName, Messages.generateFileLoaderFunction(bundleName, filePath));
    }
  }

  /**
   * Import all json and js files in a messages directory. Use the file name as the bundle key when
   * {@link Messages.load} is called. By default, we're assuming the moduleDirectoryPart is a
   * typescript project and will truncate to root path (where the package.json file is). If your messages
   * directory is in another spot or you are not using typescript, pass in false for truncateToProjectPath.
   *
   * ```
   * // e.g. If your message directory is in the project root, you would do:
   * Messages.importMessagesDirectory(__dirname);
   * ```
   *
   * @param moduleDirectoryPath The path to load the messages folder.
   * @param truncateToProjectPath Will look for the messages directory in the project root (where the package.json file is located).
   * i.e., the module is typescript and the messages folder is in the top level of the module directory.
   * @param packageName The npm package name. Figured out from the root directory's package.json.
   */
  public static importMessagesDirectory(
    moduleDirectoryPath: string,
    truncateToProjectPath = true,
    packageName?: string
  ): void {
    let moduleMessagesDirPath = moduleDirectoryPath;
    let projectRoot = moduleDirectoryPath;

    if (!path.isAbsolute(moduleDirectoryPath)) {
      throw new Error('Invalid module path. Relative URLs are not allowed.');
    }

    while (projectRoot.length >= 0) {
      try {
        fs.statSync(path.join(projectRoot, 'package.json'));
        break;
      } catch (err) {
        if ((err as SfError).code !== 'ENOENT') throw err;
        projectRoot = projectRoot.substring(0, projectRoot.lastIndexOf(path.sep));
      }
    }

    if (truncateToProjectPath) {
      moduleMessagesDirPath = projectRoot;
    }

    if (!packageName) {
      const errMessage = `Invalid or missing package.json file at '${moduleMessagesDirPath}'. If not using a package.json, pass in a packageName.`;
      try {
        packageName = asString(ensureJsonMap(Messages.readFile(path.join(moduleMessagesDirPath, 'package.json'))).name);
        if (!packageName) {
          throw new NamedError('MissingPackageName', errMessage);
        }
      } catch (err) {
        throw new NamedError('MissingPackageName', errMessage, err as Error);
      }
    }

    moduleMessagesDirPath += `${path.sep}messages`;

    for (const file of fs.readdirSync(moduleMessagesDirPath)) {
      const filePath = path.join(moduleMessagesDirPath, file);
      const stat = fs.statSync(filePath);

      if (stat) {
        if (stat.isDirectory()) {
          // When we support other locales, load them from /messages/<local>/<bundleName>.json
          // Change generateFileLoaderFunction to handle loading locales.
        } else if (stat.isFile()) {
          this.importMessageFile(packageName, filePath);
        }
      }
    }
  }

  /**
   * Load messages for a given package and bundle. If the bundle is not already cached, use the loader function
   * created from {@link Messages.setLoaderFunction} or {@link Messages.importMessagesDirectory}.
   *
   * **NOTE: Use {@link Messages.load} instead for safe message validation and usage.**
   *
   * ```typescript
   * Messages.importMessagesDirectory(__dirname);
   * const messages = Messages.load('packageName', 'bundleName');
   * ```
   *
   * @param packageName The name of the npm package.
   * @param bundleName The name of the bundle to load.
   */
  public static loadMessages(packageName: string, bundleName: string): Messages<string> {
    const key = new Key(packageName, bundleName);
    let messages: Optional<Messages<string>>;

    if (this.isCached(packageName, bundleName)) {
      messages = this.bundles.get(key.toString());
    } else if (this.loaders.has(key.toString())) {
      const loader = this.loaders.get(key.toString());
      if (loader) {
        messages = loader(Messages.getLocale());
        this.bundles.set(key.toString(), messages);
        messages = this.bundles.get(key.toString());
      }
    }

    if (messages) {
      return messages;
    }

    // Don't use messages inside messages
    throw new NamedError('MissingBundleError', `Missing bundle ${key.toString()} for locale ${Messages.getLocale()}.`);
  }

  /**
   * Load messages for a given package and bundle. If the bundle is not already cached, use the loader function
   * created from {@link Messages.setLoaderFunction} or {@link Messages.importMessagesDirectory}.
   *
   * The message keys that will be used must be passed in for validation. This prevents runtime errors if messages are used but not defined.
   *
   * **NOTE: This should be defined at the top of the file so validation is done at load time rather than runtime.**
   *
   * ```typescript
   * Messages.importMessagesDirectory(__dirname);
   * const messages = Messages.load('packageName', 'bundleName', [
   *   'messageKey1',
   *   'messageKey2',
   * ]);
   * ```
   *
   * @param packageName The name of the npm package.
   * @param bundleName The name of the bundle to load.
   * @param keys The message keys that will be used.
   */
  public static load<T extends string>(packageName: string, bundleName: string, keys: [T, ...T[]]): Messages<T> {
    const key = new Key(packageName, bundleName);
    let messages: Optional<Messages<T>>;

    if (this.isCached(packageName, bundleName)) {
      messages = this.bundles.get(key.toString());
    } else if (this.loaders.has(key.toString())) {
      const loader = this.loaders.get(key.toString());
      if (loader) {
        messages = loader(Messages.getLocale());
        this.bundles.set(key.toString(), messages);
        messages = this.bundles.get(key.toString());
      }
    }

    if (messages) {
      // Type guard on key length, but do a runtime check.
      if (!keys || keys.length === 0) {
        throw new NamedError(
          'MissingKeysError',
          'Can not load messages without providing the message keys that will be used.'
        );
      }

      // Get all messages to validate they are actually present
      for (const messageKey of keys) {
        messages.getMessage(messageKey);
      }

      return messages;
    }

    // Don't use messages inside messages
    throw new NamedError('MissingBundleError', `Missing bundle ${key.toString()} for locale ${Messages.getLocale()}.`);
  }

  /**
   * Check if a bundle already been loaded.
   *
   * @param packageName The npm package name.
   * @param bundleName The bundle name.
   */
  public static isCached(packageName: string, bundleName: string): boolean {
    return this.bundles.has(new Key(packageName, bundleName).toString());
  }

  /**
   * Get a message using a message key and use the tokens as values for tokenization.
   *
   * If the key happens to be an array of messages, it will combine with OS.EOL.
   *
   * @param key The key of the message.
   * @param tokens The values to substitute in the message.
   *
   * **See** https://nodejs.org/api/util.html#util_util_format_format_args
   */
  public getMessage(key: T, tokens: Tokens = []): string {
    return this.getMessageWithMap(key, tokens, this.messages).join(os.EOL);
  }

  /**
   * Get messages using a message key and use the tokens as values for tokenization.
   *
   * This will return all messages if the key is an array in the messages file.
   *
   * ```json
   * {
   *   "myKey": [ "message1", "message2" ]
   * }
   * ```
   *
   * ```markdown
   * # myKey
   * * message1
   * * message2
   * ```
   *
   * @param key The key of the messages.
   * @param tokens The values to substitute in the message.
   *
   * **See** https://nodejs.org/api/util.html#util_util_format_format_args
   */
  public getMessages(key: T, tokens: Tokens = []): string[] {
    return this.getMessageWithMap(key, tokens, this.messages);
  }

  /**
   * Convenience method to create errors using message labels.
   *
   * `error.name` will be the upper-cased key, remove prefixed `error.` and will always end in Error.
   * `error.actions` will be loaded using `${key}.actions` if available.
   *
   * @param key The key of the error message.
   * @param tokens The error message tokens.
   * @param actionTokens The action messages tokens.
   * @param exitCodeOrCause The exit code which will be used by SfdxCommand or the underlying error that caused this error to be raised.
   * @param cause The underlying error that caused this error to be raised.
   */
  public createError(
    key: T,
    tokens: Tokens = [],
    actionTokens: Tokens = [],
    exitCodeOrCause?: number | Error,
    cause?: Error
  ): SfError {
    const { message, name, actions } = this.formatMessageContents({
      type: 'error',
      key,
      tokens,
      actionTokens,
    });
    return new SfError(message, name, actions, exitCodeOrCause, cause);
  }

  /**
   * SfError wants error to end with the word Error.  Use this to create errors while preserving their existing name (for compatibility reasons).
   *
   * @deprecated Use `createError` instead unless you need to preserver the error name to avoid breaking changes.
   * `error.name` will be the upper-cased key, remove prefixed `error.` and will always end in Error.
   * `error.actions` will be loaded using `${key}.actions` if available.
   *
   * @param key The key of the error message.
   * @param tokens The error message tokens.
   * @param actionTokens The action messages tokens.
   * @param exitCodeOrCause The exit code which will be used by SfdxCommand or the underlying error that caused this error to be raised.
   * @param cause The underlying error that caused this error to be raised.
   */
  public createErrorButPreserveName(
    key: T,
    tokens: Tokens = [],
    actionTokens: Tokens = [],
    exitCodeOrCause?: number | Error,
    cause?: Error
  ): SfError {
    const { message, name, actions } = this.formatMessageContents({
      type: 'error',
      key,
      tokens,
      actionTokens,
      preserveName: true,
    });
    return new SfError(message, name, actions, exitCodeOrCause, cause);
  }

  /**
   * Convenience method to create warning using message labels.
   *
   * `warning.name` will be the upper-cased key, remove prefixed `warning.` and will always end in Warning.
   * `warning.actions` will be loaded using `${key}.actions` if available.
   *
   * @param key The key of the warning message.
   * @param tokens The warning message tokens.
   * @param actionTokens The action messages tokens.
   */
  public createWarning(key: T, tokens: Tokens = [], actionTokens: Tokens = []): StructuredMessage {
    return this.formatMessageContents({ type: 'warning', key, tokens, actionTokens });
  }

  /**
   * Convenience method to create info using message labels.
   *
   * `info.name` will be the upper-cased key, remove prefixed `info.` and will always end in Info.
   * `info.actions` will be loaded using `${key}.actions` if available.
   *
   * @param key The key of the warning message.
   * @param tokens The warning message tokens.
   * @param actionTokens The action messages tokens.
   */
  public createInfo(key: T, tokens: Tokens = [], actionTokens: Tokens = []): StructuredMessage {
    return this.formatMessageContents({ type: 'info', key, tokens, actionTokens });
  }

  /**
   * Formats message contents given a message type, key, tokens and actions tokens
   *
   * `<type>.name` will be the upper-cased key, remove prefixed `<type>.` and will always end in 'Error | Warning | Info.
   * `<type>.actions` will be loaded using `${key}.actions` if available.
   *
   * @param type The type of the message set must 'error' | 'warning' | 'info'.
   * @param key The key of the warning message.
   * @param tokens The warning message tokens.
   * @param actionTokens The action messages tokens.
   * @param preserveName Do not require that the name end in the type ('error' | 'warning' | 'info').
   */
  private formatMessageContents({
    type,
    key,
    tokens = [],
    actionTokens = [],
    preserveName = false,
  }: {
    type: 'error' | 'warning' | 'info';
    key: T;
    tokens?: Tokens;
    actionTokens?: Tokens;
    preserveName?: boolean;
  }): StructuredMessage {
    const label = upperFirst(type);
    const labelRegExp = new RegExp(`${label}$`);
    const searchValue: RegExp = type === 'error' ? /^error.*\./ : new RegExp(`^${type}.`);
    // Convert key to name:
    //     'myMessage' -> `MyMessageWarning`
    //     'myMessageError' -> `MyMessageError`
    //     'warning.myMessage' -> `MyMessageWarning`
    const name = `${upperFirst(key.replace(searchValue, ''))}${labelRegExp.exec(key) || preserveName ? '' : label}`;
    const message = this.getMessage(key, tokens);
    let actions;
    try {
      actions = this.getMessageWithMap(`${key}.actions`, actionTokens, this.messages);
    } catch (e) {
      /* just ignore if actions aren't found */
    }
    return { message, name, actions };
  }

  private getMessageWithMap(key: string, tokens: Tokens = [], map: StoredMessageMap): string[] {
    // Allow nested keys for better grouping
    const group = RegExp(/([a-zA-Z0-9_-]+)\.(.*)/).exec(key);
    if (group) {
      const parentKey = group[1];
      const childKey = group[2];
      const childObject = map.get(parentKey);
      if (childObject && isJsonMap(childObject)) {
        const childMap = new Map<string, StoredMessage>(Object.entries<StoredMessage>(childObject));
        return this.getMessageWithMap(childKey, tokens, childMap);
      }
    }

    if (!map.has(key)) {
      // Don't use messages inside messages
      throw new NamedError(
        'MissingMessageError',
        `Missing message ${this.bundleName}:${key} for locale ${Messages.getLocale()}.`
      );
    }
    const msg = map.get(key);
    const messages = (isArray(msg) ? msg : [msg]) as string[];
    return messages.map((message) => {
      ensureString(message);
      return util.format(message, ...tokens);
    });
  }
}
