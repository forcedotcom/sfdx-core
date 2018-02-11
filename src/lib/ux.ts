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
 * A helper class for interacting with the shell
 *
 * @extends cli-ux
 */
export default class UX extends CLI {

    // Collection of warnings that can be accessed and manipulated later.
    public static warnings: Set<string> = new Set<string>();

    /**
     * Formats a deprecation warning for display to stderr, stdout, and/or logs.
     *
     * @param def The definition for the deprecated object.
     * @returns {string} the formatted deprecation message.
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
     * Create a UX instance.
     * @returns {Promise<UX>} The UX instance.
     */
    public static async create(): Promise<UX> {
        return new UX(await Logger.child('UX'));
    }

    constructor(private logger: Logger, private isOutputEnabled: boolean = true) {
        super();
    }

    /**
     * Logs at INFO level and conditionally writes to stdout if stream output is enabled.
     */
    public log(data?: string, ...args: any[]): UX {
        if (this.isOutputEnabled) {
            super.log(data, ...args);
        }

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.info(data, ...args);

        return this;
    }

    /**
     *  Go directly to stdout. Useful when wanting to write to the same line.
     */
    public logRaw(...args: any[]): UX {
        this.logger.info(...args);

        if (this.isOutputEnabled) {
            this.stdout.write(...args);
        }

        return this;
    }

    /**
     * Log JSON to stdout and to the log file with log level info.
     *
     * @param obj The object to log.
     */
    public logJson(obj: any): UX {
        this.styledJSON(obj);

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.info(obj);

        return this;
    }

    /**
     * Log a warning and conditionally write to stderr if the log level is
     * WARNING or above and stream output is enabled.  The message is added
     * to a static warnings Set if stream output is not enabled for later
     * consumption and manipulation.  @see SfdxUX.warnings
     *
     * @param message The warning message to output.
     */
    public warn(message: string): UX {
        const warning: string = color.yellow('WARNING:');

        // Necessarily log to sfdx.log.
        this.logger.warn(warning, message);

        if (this.logger.shouldLog(LoggerLevel.WARN)) {
            if (!this.isOutputEnabled) {
                UX.warnings.add(message);
            } else {
                this.stderr.write(warning + message);
            }
        }
        return this;
    }

    /**
     * Log an error and conditionally write to stderr if stream output is enabled.
     */
    public error(...args: any[]) {
        if (this.isOutputEnabled) {
            this.stderr.write(...args);
        }
        return this.logger.error(...args);
    }

    /**
     * Log JSON to stderr and to the log file with log level error.
     *
     * @param obj The error object to log.
     */
    public errorJson(obj: any) {
        const err = JSON.stringify(obj, null, 4);
        this.stderr.write(err);
        return this.logger.error(err);
    }

    /**
     * Log at INFO level and conditionally write to stdout in a table format if
     * stream output is enabled.
     *
     * @param data The data to be output in table format.
     * @param options The table options to use for formatting.
     */
    public table(data: any[], options: Partial<SfdxTableOptions> = {}): UX {
        if (this.isOutputEnabled) {
            const columns = _.get(options, 'columns');
            if (columns) {
                const _columns: Array<Partial<TableColumn>> = [];
                // Unfortunately, have to use _.forEach rather than _.map here because lodash typings
                // don't like the possibility of 2 different iterator types.
                // tslint:disable-next-line:no-unused-expression
                _.forEach(columns, (col) => {
                    if (_.isString(col)) {
                        _columns.push({ key: col, label: _.toUpper(col) } as Partial<TableColumn>);
                    } else {
                        // default to uppercase labels for consistency but allow overriding
                        // if already defined for the column config.
                        _columns.push(Object.assign({ label: _.toUpper(col['key']) }, col) as Partial<TableColumn>);
                    }
                }) as Array<Partial<TableColumn>>;
                options.columns = _columns as Array<Partial<TableColumn>>;
            }
            super.table(data, options as Partial<TableOptions>);
        }

        // Log after table output as log filtering mutates data.
        this.logger.info(data);

        return this;
    }

    /**
     * Log at INFO level and conditionally write to stdout in styled object format if
     * stream output is enabled.
     *
     * @param obj The object to be styled for stdout.
     * @param keys The object keys to be written to stdout.
     */
    public styledObject(obj: any, keys?: string[]): UX {
        this.logger.info(obj);
        if (this.isOutputEnabled) {
            super.styledObject(obj, keys);
        }
        return this;
    }

    /**
     * Log at INFO level and conditionally write to stdout in styled header format if
     * stream output is enabled.
     *
     * @param header The header to be styled.
     */
    public styledHeader(header: string): UX {
        this.logger.info(header);
        if (this.isOutputEnabled) {
            super.styledHeader(header);
        }
        return this;
    }
}

/**
 * Type to configure table options.  This is mostly a copy of cli-ux/table TableOptions
 * except that it's more flexible (and probably a bit too flexible) with table columns.
 * It also accepts just a string array in the simple cases where table header values
 * are the only desired config option.
 */
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
 * Type to configure a deprecation warning message.  A typical config can pass name,
 * type, and version for a standard message.  Alternatively, the messageOverride can
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
