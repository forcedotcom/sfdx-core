/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { CLI } from 'cli-ux';
import { Logger, LoggerLevel } from './logger';
import { TableOptions, TableColumn } from 'cli-ux/lib/table';
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
export class UX extends CLI {

    // Collection of warnings that can be accessed and manipulated later.
    public static warnings = new Set<string>();

    /**
     * Formats a deprecation warning for display to `stderr`, `stdout`, and/or logs.
     *
     * @param def The definition for the deprecated object.
     * @returns {string} The formatted deprecation message.
     */
    public static formatDeprecationWarning(def: DeprecationDefinition) {
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
    public static async create() {
        return new UX(await Logger.child('UX'));
    }

    /**
     * Do not directly construct instances of this class -- use {@link UX.create} instead.
     */
    constructor(private logger: Logger, private isOutputEnabled: boolean = true) {
        super();
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` if stream output is enabled.
     *
     * @returns {UX}
     */
    public log(data?: string, ...args: any[]) {
        if (this.isOutputEnabled) {
            super.log(data, ...args);
        }

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.info(data, ...args);

        return this;
    }

    /**
     * Logs at `INFO` level and conditionally writes directly to `stdout` without a newline,
     * if stream output is enabled. Useful when writing to the same line of `stdout` over multiple
     * invocations.
     *
     * @returns {UX}
     */
    public logRaw(...args: any[]) {
        this.logger.info(...args);

        if (this.isOutputEnabled) {
            this.stdout.write(...args);
        }

        return this;
    }

    /**
     * Logs an object as JSON at `INFO` level and to `stdout`.
     *
     * @param obj The object to log -- must be serializable as JSON.
     * @returns {UX}
     * @throws {TypeError} If the object is not JSON-serializable.
     */
    public logJson(obj: object) {
        this.styledJSON(obj);

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.info(obj);

        return this;
    }

    /**
     * Logs a warning as `WARN` level and conditionally writes to `stderr` if the log
     * level is `WARN` or above and stream output is enabled.  The message is added
     * to the static {@link UX.warnings} set if stream output is _not_ enabled, for later
     * consumption and manipulation.
     *
     * @param message The warning message to output.
     * @returns {UX}
     * @see UX.warnings
     */
    public warn(message: string) {
        const warning: string = color.yellow('WARNING:');

        // Necessarily log to sfdx.log.
        this.logger.warn(warning, message);

        if (this.logger.shouldLog(LoggerLevel.WARN)) {
            if (!this.isOutputEnabled) {
                UX.warnings.add(message);
            } else {
                this.stderr.log(warning + message);
            }
        }

        return this;
    }

    /**
     * Logs an error at `ERROR` level and conditionally writes to `stderr` if stream
     * output is enabled.
     *
     * @returns {UX}
     */
    public error(...args: any[]) {
        if (this.isOutputEnabled) {
            this.stderr.log(...args);
        }

        this.logger.error(...args);

        return this;
    }

    /**
     * Logs an object as JSON at `ERROR` level and to `stderr`.
     *
     * @param obj The error object to log -- must be serializable as JSON.
     * @returns {UX}
     * @throws {TypeError} If the object is not JSON-serializable.
     */
    public errorJson(obj: object) {
        const err = JSON.stringify(obj, null, 4);
        this.stderr.log(err);

        this.logger.error(err);

        return this;
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` in a table format if
     * stream output is enabled.
     *
     * @param rows The rows of data to be output in table format.
     * @param options The table options to use for formatting.
     * @returns {UX}
     */
    public table(rows: any[], options: Partial<SfdxTableOptions> = {}) {
        if (this.isOutputEnabled) {
            const columns = _.get(options, 'columns');
            if (columns) {
                const _columns: Array<Partial<TableColumn>> = [];
                // Unfortunately, have to use _.forEach rather than _.map here because lodash typings
                // don't like the possibility of 2 different iterator types.
                _.forEach(columns, (col) => {
                    if (_.isString(col)) {
                        _columns.push({ key: col, label: _.toUpper(col) } as Partial<TableColumn>);
                    } else {
                        // default to uppercase labels for consistency but allow overriding
                        // if already defined for the column config.
                        _columns.push(Object.assign({ label: _.toUpper(col['key']) }, col) as Partial<TableColumn>);
                    }
                });
                options.columns = _columns as Array<Partial<TableColumn>>;
            }
            super.table(rows, options as Partial<TableOptions>);
        }

        // Log after table output as log filtering mutates data.
        this.logger.info(rows);

        return this;
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` in a styled object format if
     * stream output is enabled.
     *
     * @param obj The object to be styled for stdout.
     * @param keys The object keys to be written to stdout.
     * @returns {UX}
     */
    public styledObject(obj: any, keys?: string[]) {
        this.logger.info(obj);
        if (this.isOutputEnabled) {
            super.styledObject(obj, keys);
        }
        return this;
    }

    /**
     * Logs at `INFO` level and conditionally writes to `stdout` in a styled header format if
     * stream output is enabled.
     *
     * @param header The header to be styled.
     * @returns {UX}
     */
    public styledHeader(header: string) {
        this.logger.info(header);
        if (this.isOutputEnabled) {
            super.styledHeader(header);
        }
        return this;
    }
}

/**
 * A table option configuration type.  May be a detailed configuration, or
 * more simply just a string array in the simple cases where table header values
 * are the only desired config option.
 */
// This is mostly a copy of cli-ux/table TableOptions except that it's more flexible
// (and probably a bit too flexible) with table columns.
export type SfdxTableOptions = {
    columns: Array<Partial<TableColumn>>
    colSep: string
    after: (row: any[], options: TableOptions) => void
    printLine: (row: any[]) => void
    printRow: (row: any[]) => void
    printHeader: (row: any[]) => void
    headerAnsi: any
} | {
    columns: string[]
};

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
