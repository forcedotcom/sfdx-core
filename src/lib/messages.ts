/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * NOTE: This is the lowest level class in core and should not import any
 * other local classes or utils to prevent circular dependencies or testing
 * stub issues.
 */

import * as fs from 'fs';
import * as util from 'util';
import * as path from 'path';
import * as _ from 'lodash';
import { AnyJson, JsonMap } from './types';

class Key {
    constructor(private packageName, private bundleName) {}

    public toString() {
        return `${this.packageName}:${this.bundleName}`;
    }
}

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
 * @example
 * // Create loader functions for all files in the messages directory
 * Messages.importMessagesDirectory(__dirname);
 *
 * // Now you can use the messages from anywhere in your code or file.
 * // If using importMessageDirectory, the bundle name is the file name.
 * const messages : Messages = Messages.loadMessages(packageName, bundleName);
 *
 * // Messages now contains all the message in the bundleName file.
 * messages.getMessage('JsonParseError');
 *
 * @hideconstructor
 */
export class Messages {
    // Internal readFile. Exposed for unit testing. Do not use util/fs.readFile as messages.js
    // should have no internal dependencies.
    public static _readFile = (filePath: string): AnyJson => {
        return require(filePath);
    }

    /**
     * Get the locale. This will always return 'en_US' but will return the
     * machine's locale in the future.
     * @returns {string}
     */
    public static getLocale(): string {
        return 'en_US';
    }

    /**
     * A loader function.
     * @callback loaderFunction
     * @param {string} locale The local set by the framework.
     * @returns {Message} The messages.
     */

    /**
     * Set a custom loader function for a package and bundle that will be called on {@link Messages.loadMessages}.
     * @param {string} packageName The npm package name.
     * @param {string} bundle The name of the bundle.
     * @param {loaderFunction} loader The loader function.
     */
    public static setLoaderFunction(packageName: string, bundle: string, loader: (locale: string) => Messages): void {
        this.loaders.set(new Key(packageName, bundle).toString(), loader);
    }

    /**
     * Generate a file loading function. Use {@link Messages.importMessageFile} unless
     * overriding the bundleName is required, then manually pass the loader
     * function to {@link Messages.setLoaderFunction}.
     *
     * @param {string} bundle The name of the bundle.
     * @param {string} filePath The messages file path.
     * @returns {loaderFunction}
     */
    public static generateFileLoaderFunction(bundleName: string, filePath: string): (locale: string) => Messages {
        return (locale: string): Messages => {
            // Anything can be returned by a js file, so stringify the results to ensure valid json is returned.
            const fileContents: string = JSON.stringify(this._readFile(filePath));

            // If the file is empty, JSON.stringify will turn it into "" which will validate on parse, so throw.
            if (!fileContents || fileContents === 'null' || fileContents === '""') {
                const error = new Error(`Invalid message file: ${filePath}. No content.`);
                error.name = 'SfdxError';
                throw error;
            }

            let json;

            try {
                json = JSON.parse(fileContents);

                if (!_.isObject(json)) {
                    // Bubble up
                    throw new Error(`Unexpected token. Found returned content type '${typeof json}'.`);
                }
            } catch (err) {
                // Provide a nicer error message for a common JSON parse error; Unexpected token
                if (err.message.startsWith('Unexpected token')) {
                    const parseError = new Error(`Invalid JSON content in message file: ${filePath}\n${err.message}`);
                    parseError.name = err.name;
                    throw parseError;
                }
                throw err;
            }

            const map = new Map();

            _.forEach(json, (value, key) => {
                map.set(key, value);
            });

            return new Messages(bundleName, locale, map);
        };
    }

    /**
     * Add a single message file to the list of loading functions using the file name as the bundle name.
     * The loader will only be added if the bundle name is not already taken.
     *
     * @param {string} packageName The npm package name.
     * @param {string} filePath The path of the file.
     */
    public static importMessageFile(packageName: string, filePath: string): void {
        if (path.extname(filePath) !== '.json' && path.extname(filePath) !== '.js') {
            throw new Error(`Only json and js message files are allowed, not ${path.extname(filePath)}`);
        }
        const bundleName = path.basename(filePath, path.extname(filePath));

        if (!this.isCached(packageName, bundleName)) {
            this.setLoaderFunction(packageName, bundleName, Messages.generateFileLoaderFunction(bundleName, filePath));
        }
    }

    /**
     * Import all json and js files in a messages directory. Use the file name as the bundle key when
     * {@link Messages.loadMessages} is called. By default, we're assuming the moduleDirectoryPart is a
     * typescript project and will truncate to root path (where the package.json file is). If your messages
     * directory is in another spot or you are not using typescript, pass in false for truncateToProjectPath.
     *
     * @example
     * // e.g. If your message directory is in the project root, you would do:
     * Messages.importMessagesDirectory(__dirname);
     *
     * @param {string} moduleDirectoryPath The path to load the messages folder.
     * @param {boolean} truncateToProjectPath Will remove everything after the last "/dist" or "/src" from the folder path.
     * i.e., the module is typescript and the messages folder is in the top level of the module directory.
     * @param {string} packageName The npm package name. Figured out from the root directory's package.json.
     */
    public static importMessagesDirectory(moduleDirectoryPath: string, truncateToProjectPath: boolean = true, packageName?: string): void {
        let moduleMessagesDirPath = moduleDirectoryPath;
        let projectRoot: string = moduleDirectoryPath;

        if (!path.isAbsolute(moduleDirectoryPath)) {
            throw new Error('Invalid module path. Relative URLs are not allowed.');
        }

        while (projectRoot.length >= 0) {
            try {
                fs.statSync(path.join(projectRoot, 'package.json'));
                break;
            } catch (err) {
                if (err.code !== 'ENOENT') { throw err; }
                projectRoot = projectRoot.substring(0, projectRoot.lastIndexOf(path.sep));
            }
        }

        if (truncateToProjectPath) {
            moduleMessagesDirPath = projectRoot;
        }

        if (!packageName) {
            try {
                packageName = (this._readFile(path.join(moduleMessagesDirPath, 'package.json')) as JsonMap).name as string;
            } catch (err) {
                const error = new Error(`Invalid or missing package.json file at '${moduleMessagesDirPath}'. If not using a package.json, pass in a packageName.\n${err.message}`);
                error.name = 'MissingPackageName';
                throw error;
            }
        }

        moduleMessagesDirPath += `${path.sep}messages`;

        fs.readdirSync(moduleMessagesDirPath).forEach((file) => {
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
        });
    }

    /**
     * Load messages for a given package and bundle. If the bundle is not already cached, use the loader function
     * created from {@link Messages.setLoaderFunction} or {@link Messages.importMessagesDirectory}.
     *
     * @param {string} packageName The name of the npm package.
     * @param {string} bundleName The name of the bundle to load.
     * @returns {Messages}
     */
    public static loadMessages(packageName: string, bundleName: string): Messages {
        const key = new Key(packageName, bundleName);

        if (this.isCached(packageName, bundleName)) {
            return this.bundles.get(key.toString());
        }
        if (this.loaders.has(key.toString())) {
            const loader: (locale: string) => Messages = this.loaders.get(key.toString());
            const messages: Messages = loader(Messages.getLocale());
            this.bundles.set(key.toString(), messages);
            return this.bundles.get(key.toString());
        }
        // Don't use messages inside messages
        throw new Error(`Missing bundle ${key.toString()} for locale ${Messages.getLocale()}.`);
    }

    /**
     * Check if a bundle already been loaded.
     * @param {string} packageName The npm package name.
     * @param {string} bundleName The bundle name.
     */
    public static isCached(packageName: string, bundleName: string) {
        return this.bundles.has(new Key(packageName, bundleName).toString());
    }

    // It would be AWESOME to use Map<Key, Message> but js does an object instance comparison and doesn't let you
    // override valueOf or equals for the === operator, which map uses. So, Use Map<String, Message>

    // A map of loading functions to dynamically load messages when they need to be used
    private static loaders: Map<string, (locale: string) => Messages> = new Map<string, (locale: string) => Messages>();

    // A map cache of messages bundles that have already been loaded
    private static bundles: Map<string, Messages> = new Map<string, Messages>();

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
     * **Note:** Use {Messages.loadMessages} unless you are writing your own loader function.
     * @param {string} bundleName The bundle name.
     * @param {string} locale The locale.
     * @param {Map<string, string>} messages The messages. Can not be modified once created.
     */
    constructor(bundleName: string, locale: string, private messages: Map<string, string>) {
        this.bundleName = bundleName;
        this.locale = locale;
    }

    /**
     * Get a message using a message key and use the tokens as values for tokenization.
     * @param key The key of the message.
     * @param tokens The values to substitute in the message.
     * @returns {string}
     * @see https://nodejs.org/api/util.html#util_util_format_format_args
     */
    public getMessage(key: string, tokens: any[] = []): string { // tslint:disable-line:no-any
        if (!this.messages.has(key)) {
            // Don't use messages inside messages
            throw new Error(`Missing message ${this.bundleName}:${key} for locale ${Messages.getLocale()}.`);
        }
        return util.format(this.messages.get(key), ...tokens);
    }
}
