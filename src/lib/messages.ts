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

/**
 * Load messages from message files of the right locale.
 *
 * In majority of modules, use Messages.importMessagesDirectory(<module path>) where module
 * path is the root folder location that contains a messages folder. Typically the root folder
 * location is obtained with __dirname. See Messages.importMessagesDirectory for example.
 *
 * If individual files use their own messages file OR you need to load messages for an individual
 * test, use Messages.importMessageFile(<file path>);
 */
export class Messages {
    // Internal readFile. Exposed for unit testing. Do not use sfdxUtil.readFile as messages.js
    // should have no internal dependencies.
    static _readFile = util.promisify(fs.readFile);

    // A map of loading functions to dynamically load messages when they need to be used
    static loaders : Map<string, (locale : string) => Promise<Messages>> = new Map<string, (locale : string) => Promise<Messages>>();

    // A map cache of messages bundles that have already been loaded
    static bundles : Map<string, Messages> = new Map<string, Messages>();

    static get locale() {
        return 'en_US';
    }

    /**
     * Import a custom loader function for a key that will be called on Messages.loadMessages.
     * @param key The key of the bundle
     * @param loader The loader function
     */
    static import(bundlekey : string, loader : (locale : string) => Promise<Messages>) : void {
        this.loaders.set(bundlekey, loader);
    }

    /**
     * Generate a file loading function. Use Messages.importMessageFile unless
     * overriding the bundleName is required, then manually pass the loader
     * function to Messages.import();
     *
     * @param bundleName The name of the bundle
     * @param filePath The messages file path
     */
    static generateFileLoaderFunction(bundleName : string, filePath : string) : (locale : string) => Promise<Messages> {
        return async (locale : string) : Promise<Messages> => {
            let fileContents: string;

            try {
                fileContents = await this._readFile(filePath, 'utf8');
            }
            catch (err) {
                // TODO: we should catch ugly exceptions and rethrow nicer ones. Just re-throwing for now.
                throw err;
            }

            if (!fileContents || _.isEmpty(_.trim(fileContents))) {
                throw new Error(`Invalid message file: ${filePath}. No content.`);
            }

            let json;

            try {
                json = JSON.parse(fileContents);
            }
            catch (err) {
                // TODO: we should catch ugly exceptions and rethrow nicer ones. Just re-throwing for now.
                throw err;
            }

            const map = new Map();

            _.forEach(json, (value, key) => {
                map.set(key, value);
            });

            return Promise.resolve(new Messages(bundleName, locale, map));
        };
    }

    /**
     * Add a single message file to the list of loading functions using the file name as the bundle name.
     * The loader will only be added if the bundle name is not already taken.
     *
     * @param filePath The path of the file.
     */
    static importMessageFile(filePath : string) {
        if (path.extname(filePath) !== '.json') {
            throw new Error(`Only json message files are allowed, not ${path.extname(filePath)}`);
        }
        const bundleName = path.basename(filePath, '.json');

        if (!this.loaders.has(bundleName)) {
            this.loaders.set(bundleName, Messages.generateFileLoaderFunction(bundleName, filePath));
        }
    }

    /**
     * Import all json files in a messages directory. Use the file name as the bundle key when
     * Messages.loadMessages is called. By default, we assuming the moduleDirectoryPart is a
     * typescript project and in the ./dist/ folder which we will attempt to remove. If your messages
     * directory is in another spot or you are not using typescript, pass in false for hasDistFolder.
     *
     * @example
     * // e.g. If your index.js is in a ./src/ folder and compiled to a ./dist/ folder, you would do:
     * Messages.importMessagesDirectory(`${__dirname.replace('/dist', '')}`);
     *
     * @param moduleDirectoryPath The path to load the messages folder
     * @param hasDistFolder Will remove the last "/dist" from the folder path. i.e. the module is typescript
     * and the messages folder is in the top level of the module directory.
     */
    static importMessagesDirectory(moduleDirectoryPath : string, hasDistFolder = true) : void {
        if (hasDistFolder) {
            moduleDirectoryPath = `${moduleDirectoryPath.replace('/dist', '')}`;
        }

        fs.readdirSync(`${moduleDirectoryPath}/messages`).forEach(file => {
            const filePath = path.join(moduleDirectoryPath, file);
            const stat = fs.statSync(filePath);

            if (stat) {
                if (stat.isDirectory()) {
                    // When we support other locales, load them from /messages/<local>/<bundleName>.json
                    // Change generateFileLoaderFunction to handle loading locales.
                } else if (stat.isFile()) {
                    this.importMessageFile(filePath);
                }
            }
        });
    }

    /**
     * Load messages for a given bundle. If the bundle is not already cached, use the loader function
     * created from Messages.import or Messages.importMessagesDirectory.
     * @param bundle Name of the bundle to load
     */
    static async loadMessages(bundle : string) : Promise<Messages> {
        if (this.bundles.has(bundle)) {
            return Promise.resolve(this.bundles.get(bundle));
        }
        if (this.loaders.has(bundle)) {
            const loader : (locale : string) => Promise<Messages> = this.loaders.get(bundle);
            const messages : Messages = await loader(Messages.locale);
            this.bundles.set(bundle, messages);
            return this.bundles.get(bundle);
        }
        // Don't use messages inside messages
        throw new Error(`Missing bundle ${bundle} for locale ${Messages.locale}.`);
    }

    readonly locale : string
    readonly bundle : string

    constructor(bundle : string, locale : string, private messages : Map<string, string>) {
        this.bundle = bundle;
        this.locale = locale;
    }

    /**
     * Get a message with a given label
     * @param label The label of the message
     * @param args The args to substitute in the message using util.format.
     */
    getMessage(label : string, args : Array<string | boolean | number> = []) {
        if (!this.messages.has(label)) {
            // Don't use messages inside messages
            throw new Error(`Missing label ${this.bundle}:${label} for locale ${Messages.locale}.`);
        }
        return util.format(this.messages.get(label), ...args);
    }

}

export default Messages;