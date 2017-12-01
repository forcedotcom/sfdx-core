/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { CLI } from 'cli-ux';
import { Logger, LoggerLevel } from './logger';
import { TableOptions } from 'cli-ux/lib/table';
import _ from 'lodash';
import chalk from 'chalk';

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
    get: (chalk, name) => {
      if (CustomColors[name]) return CustomColors[name]
      return chalk[name]
    },
});

export default class UX extends CLI {

    // Collection of warnings that can be accessed and manipulated later.
    public static warnings : Set<string> = new Set<string>();

    constructor(private logger : Logger, private isOutputEnabled : boolean) {
        super();
    }

    /**
     * Logs at INFO level and conditionally writes to stdout if stream output is enabled.
     */
    log(data? : string, ...args : any[]) : UX {
        if (this.isOutputEnabled) {
            super.log(data, ...args);
        }

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.info(...args);

        return this;
    }

    /**
     *  Go directly to stdout. Useful when wanting to write to the same line.
     */
    logRaw(...args : any[]) : UX {
        this.logger.info(...args);

        if (this.isOutputEnabled) {
            super.stdout.write(...args);
        }

        return this;
    }

    /**
     * Log JSON to stdout and to the log file with log level info.
     *
     * @param obj The object to log.
     */
    logJson(obj : any) : UX {
        super.styledJSON(obj);

        // log to sfdx.log after the console as log filtering mutates the args.
        this.logger.trace(obj);

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
    warn(message : string) {
        const warning: string = color.yellow('WARNING:');

        // Necessarily log to sfdx.log.
        this.logger.warn(warning, message);

        if (this.logger.shouldLog(LoggerLevel.WARN)) {
            if (!this.isOutputEnabled) {
                UX.warnings.add(message);
            }
            else {
                super.stderr.write(warning + message);
            }
        }
    }

    /**
     * Log an error and conditionally write to stderr if stream output is enabled.
     */
    error(...args : any[]) {
        if (this.isOutputEnabled) {
            super.stderr.write(...args);
        }
        this.logger.error(...args);
    }

    /**
     * Log JSON to stderr and to the log file with log level error.
     *
     * @param obj The error object to log.
     */
    errorJson(obj : any) {
        const err = JSON.stringify(obj);
        super.stderr.write(err);
        return this.logger.error(err);
    }

    /**
     * Formats a deprecation warning for display to stderr, stdout, and/or logs.
     *
     * @param name The name of the deprecated object.
     * @param def The definition for the deprecated object.
     * @param type The type of the deprecated object.
     */
    formatDeprecationWarning(name : string, def : DeprecationDefinition, type : string) {
        let msg = def.messageOverride || `The ${type} "${name}" has been deprecated and will be removed in v${`${(def.version + 1)}.0`} or later.`;
        if (def.to) {
            msg += ` Use "${def.to}" instead.`;
        }
        if (def.message) {
            msg += ` ${def.message}`;
        }
        return msg;
    }

    /**
     * Log at INFO level and conditionally write to stdout in a table format if
     * stream output is enabled.
     *
     * @param data The data to be output in table format.
     * @param options The table options to use for formatting.
     */
    table(data : any[], options : Partial<TableOptions>) : UX {
        if (this.isOutputEnabled) {
            let columns = _.get(options, 'columns');
            if (columns) {
                options.columns = _.map(columns, (col) => {
                    if (_.isString(col)) {
                        return { key: col, label: _.toUpper(col) };
                    }
                    return { key: col.key, label: _.toUpper(col.label), format: col.format };
                });
            }
            super.table(data, options);
        }

        // Log after table output as log filtering mutates data.
        this.logger.info(...data);

        return this;
    }

    /**
     * Log at INFO level and conditionally write to stdout in styled object format if
     * stream output is enabled.
     *
     * @param obj The object to be styled for stdout.
     * @param keys The object keys to be written to stdout.
     */
    styledObject(obj : any, keys : string[]) : UX {
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
    styledHeader(header : string) : UX {
        this.logger.info(header);
        if (this.isOutputEnabled) {
            super.styledHeader(header);
        }
        return this;
    }
}

export interface DeprecationDefinition {
    version : number,
    to? : string,
    message? : string,
    messageOverride? : string
}
