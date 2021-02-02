import { AnyJson } from '@salesforce/ts-types';
export declare type Tokens = Array<string | boolean | number | null | undefined>;
/**
 * A loader function to return messages.
 * @param locale The local set by the framework.
 */
export declare type LoaderFunction = (locale: string) => Messages;
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
 * automatically with {@link Messages.importMessagesDirectory}. Message files must be in `.json` or `.js`
 * that exports a json object with **only** top level key-value pairs. The values support
 * [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) style strings
 * that apply the tokens passed into {@link Message.getMessage}
 *
 * A sample message file.
 * ```
 * {
 *    'msgKey': 'A message displayed in the terminal'
 * }
 * ```
 *
 * **Note:** When running unit tests individually, you may see errors that the messages aren't found.
 * This is because `index.js` isn't loaded when tests run like they are when the package is required.
 * To allow tests to run, import the message directory in each test (it will only
 * do it once) or load the message file the test depends on individually.
 *
 * ```
 * // Create loader functions for all files in the messages directory
 * Messages.importMessagesDirectory(__dirname);
 *
 * // Now you can use the messages from anywhere in your code or file.
 * // If using importMessageDirectory, the bundle name is the file name.
 * const messages : Messages = Messages.loadMessages(packageName, bundleName);
 *
 * // Messages now contains all the message in the bundleName file.
 * messages.getMessage('JsonParseError');
 * ```
 */
export declare class Messages {
  private messages;
  /**
   * Internal readFile. Exposed for unit testing. Do not use util/fs.readFile as messages.js
   * should have no internal dependencies.
   * @param filePath read file target.
   * @ignore
   */
  static _readFile: (filePath: string) => AnyJson;
  /**
   * Get the locale. This will always return 'en_US' but will return the
   * machine's locale in the future.
   */
  static getLocale(): string;
  /**
   * Set a custom loader function for a package and bundle that will be called on {@link Messages.loadMessages}.
   * @param packageName The npm package name.
   * @param bundle The name of the bundle.
   * @param loader The loader function.
   */
  static setLoaderFunction(packageName: string, bundle: string, loader: LoaderFunction): void;
  /**
   * Generate a file loading function. Use {@link Messages.importMessageFile} unless
   * overriding the bundleName is required, then manually pass the loader
   * function to {@link Messages.setLoaderFunction}.
   *
   * @param bundleName The name of the bundle.
   * @param filePath The messages file path.
   */
  static generateFileLoaderFunction(bundleName: string, filePath: string): LoaderFunction;
  /**
   * Add a single message file to the list of loading functions using the file name as the bundle name.
   * The loader will only be added if the bundle name is not already taken.
   *
   * @param packageName The npm package name.
   * @param filePath The path of the file.
   */
  static importMessageFile(packageName: string, filePath: string): void;
  /**
   * Import all json and js files in a messages directory. Use the file name as the bundle key when
   * {@link Messages.loadMessages} is called. By default, we're assuming the moduleDirectoryPart is a
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
  static importMessagesDirectory(
    moduleDirectoryPath: string,
    truncateToProjectPath?: boolean,
    packageName?: string
  ): void;
  /**
   * Load messages for a given package and bundle. If the bundle is not already cached, use the loader function
   * created from {@link Messages.setLoaderFunction} or {@link Messages.importMessagesDirectory}.
   *
   * @param packageName The name of the npm package.
   * @param bundleName The name of the bundle to load.
   */
  static loadMessages(packageName: string, bundleName: string): Messages;
  /**
   * Check if a bundle already been loaded.
   * @param packageName The npm package name.
   * @param bundleName The bundle name.
   */
  static isCached(packageName: string, bundleName: string): boolean;
  private static loaders;
  private static bundles;
  /**
   * The locale of the messages in this bundle.
   */
  readonly locale: string;
  /**
   * The bundle name.
   */
  readonly bundleName: string;
  /**
   * Create a new messages bundle.
   *
   * **Note:** Use {Messages.loadMessages} unless you are writing your own loader function.
   * @param bundleName The bundle name.
   * @param locale The locale.
   * @param messages The messages. Can not be modified once created.
   */
  constructor(bundleName: string, locale: string, messages: Map<string, AnyJson>);
  /**
   * Get a message using a message key and use the tokens as values for tokenization.
   * @param key The key of the message.
   * @param tokens The values to substitute in the message.
   *
   * **See** https://nodejs.org/api/util.html#util_util_format_format_args
   */
  getMessage(key: string, tokens?: Tokens): string;
  private getMessageWithMap;
}
