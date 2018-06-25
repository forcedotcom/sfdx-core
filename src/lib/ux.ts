/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * A table option configuration type that can be the TableOptions as defined by
 * [oclif/cli-ux](https://github.com/oclif/cli-ux/blob/master/src/styled/table.ts) or a string array of table keys to be used as table headers
 * for simple tables.
 * @typedef {object} TableOptions
 * @property {Partial<OclifTableOptions> | string[]} options
 */

 /**
  * A prompt option configuration as defined by
  * [oclif/cli-ux](https://github.com/oclif/cli-ux/blob/master/src/prompt.ts).
  * @typedef {object} IPromptOptions
  * @property {string} prompt The prompt string displayed to the user.
  * @property {'normal' | 'mask' | 'hide'} type `Normal` does not hide the user input, `mask` hides the user input after the user presses `ENTER`, and `hide` hides the user input as it is being typed.
  */

import { Logger, LoggerLevel } from './logger';
import {
    TableOptions as OclifTableOptions,
    TableColumn as OclifTableColumn
} from 'cli-ux/lib/styled/table';
import { IPromptOptions } from 'cli-ux';
import * as _ from 'lodash';
import chalk from 'chalk';

// Needed for typescript compilation to create typings files.
// tslint:disable-next-line:no-unused-variable
import { Chalk, ColorSupport } from 'chalk';

// tslint:disable-next-line:variable-name
export const CustomColors = {
    supportsColor: chalk.supportsColor,
    // map gray -> dim because it's not solarized compatible
    gray: (s: string) => chalk.dim(s),
    grey: (s: string) => chalk.dim(s),
    configVar: (s: string) => chalk.green(s),
    release: (s: string) => chalk.blue.bold(s),
    cmd: (s: string) => chalk.cyan.bold(s)
};

export const color = new Proxy(chalk, {
    // tslint:disable-next-line:no-shadowed-variable
    get: (chalk, name) => {
      if (CustomColors[name]) { return CustomColors[name]; }
      return chalk[name];
    }
});

/**
 * Utilities for interacting with terminal I/O.
 */
export class UX {

    /**
     * Collection of warnings that can be accessed and manipulated later.
     * @type {Set<string>}
     */
    public static warnings: Set<string> = new Set<string>();

    /**
     * Formats a deprecation warning for display to `stderr`, `stdout`, and/or logs.
     *
     * @param {DeprecationDefinition} def The definition for the deprecated object.
     * @returns {string} The formatted deprecation message.
     */
    public static formatDeprecationWarning(def: DeprecationDefinition): string {
        let msg = def.messageOverride || `The ${def.type} "${def.name}" has been deprecated and will be removed in v${(def.version + 1)}.0 or later.`;
        if (def.to) {
            msg += ` Use "${def.to}" instead.`;
        }
        if (def.message) {
            msg += ` ${def.message}`;
        }
        return msg;
    }

    /**
     * Create a `UX` instance.
     *
     * @returns {Promise<UX>} A `Promise` of the created `UX` instance.
     */
    public static async create(): Promise<UX> {
        return new UX(await Logger.child('UX'));
    }

    // The oclif/cli-ux
    public cli;

    /**
     * Do not directly construct instances of this class -- use {@link UX.create} instead.
     */
    constructor(private logger: Logger, private isOutputEnabled: boolean = true, cli?) {
        this.cli = cli || require('cli-ux').cli;
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` if stream output is enabled.
     *
     * @param {...any[]} args The messages or objects to log.
     * @returns {UX}
     */
    public log(...args: any[]): UX { // tslint:disable-line:no-any
        if (this.isOutputEnabled) {
            this.cli.log(...args);
        }

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.info(...args);

        return this;
    }

    /**
     * Log JSON to stdout and to the log file with log level info.
     *
     * @param {object} obj The object to log -- must be serializable as JSON.
     * @returns {UX}
     * @throws {TypeError} If the object is not JSON-serializable.
     */
    public logJson(obj: object): UX {
        this.cli.styledJSON(obj);

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.info(obj);

        return this;
    }

    /**
     * Prompt the user for input.
     * @param {string} name The string that the user sees when prompted for information.
     * @param {IPromptOptions} options A prompt option configuration.
     * @returns {Promise<string>} The user input to the prompt.
     */
    public async prompt(name: string, options: IPromptOptions = {}): Promise<string> {
        return this.cli.prompt(name, options);
    }

    /**
     * Prompt the user for confirmation.
     * @param {string} message The message displayed to the user.
     * @returns {Promise<boolean>} Returns `true` if the user inputs 'y' or 'yes', and `false` if the user inputs 'n' or 'no'.
     */
    public async confirm(message: string): Promise<boolean> {
        return this.cli.confirm(message);
    }

    /**
     * Start a spinner action after displaying the given message.
     * @param {string} message The message displayed to the user.
     */
    public startSpinner(message: string): void {
        this.cli.action.start(message);
    }

    /**
     * Pause the spinner and call the given function.
     * @param {function} fn The function to be called in the pause.
     * @param {string} icon The string displayed to the user.
     * @returns {T} The result returned by the passed in function.
     */
    public pauseSpinner<T>(fn: () => T, icon?: string): T {
        return this.cli.action.pause(fn, icon);
    }

    /**
     * Update the spinner status.
     * @param {string} status The message displayed to the user.
     */
    public setSpinnerStatus(status?: string): void {
        this.cli.action.status = status;
    }

    /**
     * Get the spinner status.
     * @returns {string}
     */
    public getSpinnerStatus(): string {
        return this.cli.action.status;
    }

    /**
     * Stop the spinner action.
     * @param {string} message The message displayed to the user.
     */
    public stopSpinner(message?: string): void {
        this.cli.action.stop(message);
    }

    /**
     * Logs a warning as `WARN` level and conditionally writes to `stderr` if the log
     * level is `WARN` or above and stream output is enabled.  The message is added
     * to the static {@link UX.warnings} set if stream output is _not_ enabled, for later
     * consumption and manipulation.
     *
     * @param {string} message The warning message to output.
     * @returns {UX}
     * @see UX.warnings
     */
    public warn(message: string): UX {
        const warning: string = color.yellow('WARNING:');

        // Necessarily log to sfdx.log.
        this.logger.warn(warning, message);

        if (this.logger.shouldLog(LoggerLevel.WARN)) {
            if (!this.isOutputEnabled) {
                UX.warnings.add(message);
            } else {
                console.warn(`${warning} ${message}`);
            }
        }

        return this;
    }

    /**
     * Logs an error at `ERROR` level and conditionally writes to `stderr` if stream
     * output is enabled.
     *
     * @param {...any[]} args The errors to log.
     * @returns {UX}
     */
    public error(...args: any[]): UX { // tslint:disable-line:no-any
        if (this.isOutputEnabled) {
            console.error(...args);
        }

        this.logger.error(...args);

        return this;
    }

    /**
     * Logs an object as JSON at `ERROR` level and to `stderr`.
     *
     * @param {object} obj The error object to log -- must be serializable as JSON.
     * @returns {UX}
     * @throws {TypeError} If the object is not JSON-serializable.
     */
    public errorJson(obj: object): UX {
        const err = JSON.stringify(obj, null, 4);
        console.error(err);
        this.logger.error(err);
        return this;
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` in a table format if
     * stream output is enabled.
     *
     * @param {object[]} rows The rows of data to be output in table format.
     * @param {TableOptions} options The {@link TableOptions} to use for formatting.
     * @returns {UX}
     */
    public table(rows: any[], options: TableOptions = {}): UX { // tslint:disable-line:no-any
        if (this.isOutputEnabled) {
            const tableOptions = _.isArray(options) ? { columns: options } : options;
            const columns = _.get(tableOptions, 'columns');
            if (columns) {
                const _columns: Array<Partial<OclifTableColumn>> = [];
                // Unfortunately, have to use _.forEach rather than _.map here because lodash typings
                // don't like the possibility of 2 different iterator types.
                _.forEach(columns, (col) => {
                    if (_.isString(col)) {
                        _columns.push({ key: col, label: _.toUpper(col) });
                    } else {
                        // default to uppercase labels for consistency but allow overriding
                        // if already defined for the column config.
                        _columns.push(Object.assign({ label: _.toUpper(col['key']) }, col));
                    }
                });
                tableOptions.columns = _columns;
            }
            this.cli.table(rows, tableOptions);
        }

        // Log after table output as log filtering mutates data.
        this.logger.info(rows);

        return this;
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` in a styled object format if
     * stream output is enabled.
     *
     * @param {object} obj The object to be styled for stdout.
     * @param {string[]} [keys] The object keys to be written to stdout.
     * @returns {UX}
     */
    public styledObject(obj: object, keys?: string[]): UX {
        this.logger.info(obj);
        if (this.isOutputEnabled) {
            this.cli.styledObject(obj, keys);
        }
        return this;
    }

    /**
     * Log at `INFO` level and conditionally write to `stdout` in styled JSON format if
     * stream output is enabled.
     *
     * @param {object} obj The object to be styled for stdout.
     * @returns {UX}
     */
    public styledJSON(obj: object): UX {
        this.logger.info(obj);
        if (this.isOutputEnabled) {
            this.cli.styledJSON(obj);
        }
        return this;
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` in a styled header format if
     * stream output is enabled.
     *
     * @param {string} header The header to be styled.
     * @returns {UX}
     */
    public styledHeader(header: string): UX {
        this.logger.info(header);
        if (this.isOutputEnabled) {
            this.cli.styledHeader(header);
        }
        return this;
    }
}

/**
 * A table option configuration type.  May be a detailed configuration, or
 * more simply just a string array in the simple cases where table header values
 * are the only desired config option.
 */
export type TableOptions = Partial<OclifTableOptions> | string[];

/**
 * A deprecation warning message configuration type.  A typical instance can pass `name`,
 * `type`, and `version` for a standard message.  Alternatively, the `messageOverride` can
 * be used as a special case deprecated message.
 */
export type DeprecationDefinition = {
    name: string,
    // tslint:disable-next-line no-reserved-keywords
    type: string,
    version: number,
    to?: string,
    message?: string,
    messageOverride?: never
} | {
    name?: never,
    // tslint:disable-next-line no-reserved-keywords
    type?: never,
    version?: never,
    to?: string,
    message?: string,
    messageOverride: string
};
