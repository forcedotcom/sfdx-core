/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';

import Messages from './messages';
import { color } from './ux';
import { Global, Modes } from './global';

/**
 * A class to manage all the keys and tokens for a message bundle to use with SfdxError.
 *
 * @example
 * SfdxError.create(new SfdxErrorConfig('apex', 'runTest').addAction('apexErrorAction1', [className]));
 */
export class SfdxErrorConfig {
    public readonly packageName: string;
    public readonly bundleName: string;
    public errorKey: string;
    private errorTokens: Array<string | boolean | number>;

    private messages: Messages;
    private actions: Map<string, Array<string | boolean | number>> = new Map();

    /**
     * Create a new SfdxErrorConfig.
     * @param bundleName The message bundle.
     * @param errorKey The error message key.
     * @param errorTokens The tokens to use when getting the error message
     * @param actionKey The action message keys.
     * @param actionTokens The tokens to use when getting the action message(s)
     */
    constructor(packageName: string,
                bundleName: string,
                errorKey: string,
                errorTokens: Array<string | boolean | number> = [],
                actionKey?: string,
                actionTokens?: Array<string | boolean | number>
        ) {
        this.packageName = packageName;
        this.bundleName = bundleName;
        this.errorKey = errorKey;
        this.errorTokens = errorTokens;
        if (actionKey) {
            this.actions.set(actionKey, actionTokens);
        }
    }

    /**
     * Set the error key. Returns the SfdxErrorConfig for chaining.
     * @param key Set the error key.
     */
    public setErrorKey(key: string): SfdxErrorConfig {
        this.errorKey = key;
        return this;
    }

    /**
     * Set the error tokens. Returns the SfdxErrorConfig for chaining.
     * @param tokens The error tokens
     */
    public setErrorTokens(tokens: Array<string | boolean | number>): SfdxErrorConfig {
        this.errorTokens = tokens;
        return this;
    }

    /**
     * Add an error action to assist the user with a resolution. Returns the SfdxErrorConfig for chaining.
     * @param actionKey The action key in the message bundle
     * @param actionTokens The action tokens for the string
     */
    public addAction(actionKey: string, actionTokens?: Array<string | boolean | number>): SfdxErrorConfig {
        this.actions.set(actionKey, actionTokens);
        return this;
    }

    /**
     * Load the messages using Messages.loadMessages.
     */
    public load(): Messages {
        this.messages = Messages.loadMessages(this.packageName, this.bundleName);
        return this.messages;
    }

    /**
     * Get the error message using messages.getMessage.
     * @throws AlmError If errorMessages.load was not called first
     */
    public getError(): string {
        if (!this.messages) {
            throw new SfdxError('SfdxErrorConfig not loaded.');
        }
        return this.messages.getMessage(this.errorKey, this.errorTokens);
    }

    /**
     * Get the action messages using messages.getMessage.
     * @throws AlmError If errorMessages.load was not called first
     */
    public getActions(): string[] {
        if (!this.messages) {
            throw new SfdxError('SfdxErrorConfig not loaded.');
        }

        if (this.actions.size === 0) { return; }

        const actions: string[] = [];
        this.actions.forEach((tokens, key) => {
            actions.push(this.messages.getMessage(key, tokens));
        });
        return actions;
    }

    /**
     * Remove all actions from this error config. Useful when reusing SfdxErrorConfig
     * for other error messages within the same bundle. Returns the SfdxErrorConfig for chaining.
     */
    public removeActions(): SfdxErrorConfig {
        this.actions = new Map();
        return this;
    }

}

/*
 * A generalized sfdx error which also contains an action. The action is used in the
 * CLI to help guide users past the error.
 *
 * @example
 * To throw an error in a synchronous function you must either pass the error message and actions
 * directly to the constructor, e.g.,
 *      throw new SfdxError('The error message', 'TheErrorName', ['Take this action'])
 * Or you can load the messages in an asynchronous function so they are available in synchronous
 * functions, e.g.,
 *      public async init() {
 *          Messages.importMessagesDirectory(__dirname);
 *          this.messages = Messages.loadMessages('myPackageName', 'myBundleName');
 *      }
 *      public doSomething() {
 *          if (conditionNotMet) {
 *              const myErrMsg = this.messages.getMessage('MyErrorMessageKey');
 *              throw new SfdxError(myErrMsg, 'MyErrorName');
 *          }
 *      }
 * To throw an error in an asynchronous function you can use the static create methods, e.g.,
 *      throw SfdxError.create('myBundleName', 'MyErrorMessageKey', [messageToken1]);
 */
export class SfdxError extends Error {
    /**
     * Create a new SfdxError.
     * @param {string} packageName The message package name used to create the SfdxError.
     * @param {string} bundleName The message bundle name used to create the SfdxError.
     * @param {string} key The key within the bundle for the message.
     * @param {Array<string | boolean | number>} tokens The values to use for message tokenization.
     */
    public static create(packageName: string, bundleName: string, key: string, tokens?: Array<string | boolean | number>): SfdxError;

    /**
     * Create a new SfdxError.
     * @param {SfdxErrorConfig} errorConfig The SfdxErrorConfig object used to create the SfdxError.
     */
    public static create(errorConfig: SfdxErrorConfig): SfdxError;

    // The create implementation function.
    public static create(packageNameOrErrorConfig: string | SfdxErrorConfig, bundleName?: string, key?: string, tokens?: Array<string | boolean | number>): SfdxError {
        let errorConfig: SfdxErrorConfig;

        if (_.isString(packageNameOrErrorConfig)) {
            errorConfig = new SfdxErrorConfig(packageNameOrErrorConfig as string, bundleName, key, tokens);
        } else {
            errorConfig = packageNameOrErrorConfig as SfdxErrorConfig;
        }

        errorConfig.load();

        return new SfdxError(errorConfig.getError(), errorConfig.errorKey, errorConfig.getActions());
    }

    /**
     * Convert an Error to an SfdxError.
     * @param {Error} err The error to convert.
     */
    public static wrap(err: Error): SfdxError {
        const sfdxError = new SfdxError(err.message, err.name);
        sfdxError.stack = `${err.stack}\n${sfdxError.stack}`;
        return sfdxError;
    }

    public name: string;
    public message: string;
    public actions: string[];
    public exitCode: number;
    public commandName: string;

    // Additional data helpful for consumers of this error.  E.g., API call result
    public data: any;

    /**
     * Create an SfdxError.
     * @param {string} message The error message
     * @param {string} name The error name. Defaults to 'SfdxError'
     * @param {string[]} action The action message
     * @param {number} exitCode The exit code which will be used by the CLI.
     */
    constructor(message: string, name?: string, actions?: string[], exitCode?: number) {
        super(message);
        this.name = name || 'SfdxError';
        this.actions = actions;
        this.exitCode = exitCode || 1;
    }

    public setCommandName(commandName: string) {
        this.commandName = commandName;
        return this;
    }

    public setData(data: any) {
        this.data = data;
        return this;
    }

    /**
     * Format errors and actions for human consumption. Adds 'ERROR running <command name>',
     * and outputs all errors in red.  When there are actions, we add 'Try this:' in blue
     * followed by each action in red on its own line.
     */
    public format() {
        const colorizedArgs: string[] = [];
        const runningWith =  this.commandName ? ` running ${this.commandName}` : '';
        colorizedArgs.push(color.bold(`ERROR${runningWith}: `));
        colorizedArgs.push(color.red(this.message));

        // Format any actions.
        if (_.get(this, 'actions.length')) {
            colorizedArgs.push(`\n\n${color.blue(color.bold('Try this:'))}`);
            this.actions.forEach((action) => {
                colorizedArgs.push(`\n${color.red(action)}`);
            });
        }
        if (this.stack && Global.getEnvironmentMode().is(Modes.DEVELOPMENT)) {
            colorizedArgs.push(color.red(`\n*** Internal Diagnostic ***\n\n${this.stack}\n******\n`));
        }

        return colorizedArgs;
    }

    public toJson() {
        const json: any = {
            name: this.name,
            message: this.message || this.name,
            exitCode: this.exitCode,
            actions: this.actions
        };

        if (this.commandName) {
            json.commandName = this.commandName;
        }

        if (this.data) {
            json.data = this.data;
        }

        return json;
    }
}

export default SfdxError;
