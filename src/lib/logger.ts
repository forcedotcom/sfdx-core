/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * The common set of `Logger` options.
 *
 * @typedef LoggerOptions
 * @property {string} name The logger name.
 * @property {any} [serializers] The logger's serializers.
 * @property {boolean} [src] Whether or not to log source file, line, and function information.
 * @property {LoggerLevelValue} [level] The desired log level.
 * @property {Writable} [stream] A stream to write to.
 * @property {LoggerStream} [streams] An array of streams to write to.
 *
 * @see {@link https://github.com/cwallsfdc/node-bunyan#constructor-api|Bunyan Constructor API}
 */
/**
 * Standard `Logger` levels.
 *
 * @typedef {number} LoggerLevel
 * @property TRACE
 * @property DEBUG
 * @property INFO
 * @property WARN
 * @property ERROR
 * @property FATAL
 *
 * @see {@link https://github.com/cwallsfdc/node-bunyan#levels|Bunyan Levels}
 */
/**
 * A Bunyan stream configuration.
 *
 * @typedef LoggerStream
 * @property {type} [type] The type of stream -- may be inferred from other properties.
 * @property {level} [level] The desired log level for the stream.
 * @property {stream} [stream] The stream to write to.  Mutually exclusive with `path`.
 * @property {path} [path] A log file path to write to.  Mutually exclusive with `stream`.
 * @property {name} [name] The name of the stream.
 * @property {any} [extras] Additional type-specific configuration parameters.
 *
 * @see {@link https://github.com/cwallsfdc/node-bunyan#streams|Bunyan Streams}
 */
/**
 * Any numeric `Logger` level.
 *
 * @typedef {LoggerLevel|number} LoggerLevelValue
 */
/**
 * A collection of named `FieldValue`s.
 *
 * @typedef {Object<string, FieldValue>} Fields
 * @see {@link https://github.com/cwallsfdc/node-bunyan#log-record-fields|Bunyan Log Record Fields}
 */
/**
 * All possible field value types.
 *
 * @typedef {string|number|boolean} FieldValue
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Writable } from 'stream';
import * as EventEmitter from 'events';
import * as Bunyan from 'bunyan-sfdx-no-dtrace';
import * as _ from 'lodash';
import { Global, Mode } from './global';
import { SfdxUtil } from './util';
import { SfdxError } from './sfdxError';

export interface LoggerOptions {
    name: string;
    serializers?: any;
    src?: boolean;
    level?: LoggerLevelValue;
    stream?: Writable;
    streams?: LoggerStream[];
}

export enum LoggerLevel {
    TRACE = 10,
    DEBUG = 20,
    INFO = 30,
    WARN = 40,
    ERROR = 50,
    FATAL = 60
}

export interface LoggerStream {
    type?: string; // tslint:disable-line no-reserved-keywords
    level?: LoggerLevelValue;
    stream?: Writable;
    name?: string;
    path?: string;
    [key: string]: any;
}

export type LoggerLevelValue = LoggerLevel | number;

export interface Fields {
    [key: string]: FieldValue;
}

export type FieldValue = string | number | boolean;

/**
 * A logging abstraction powered by {@link https://github.com/cwallsfdc/node-bunyan|Bunyan} that provides both a default
 * logger configuration that will log to `sfdx.log`, and a way to create custom loggers based on the same foundation.
 *
 * @example
 * // Gets the root sfdx logger
 * const logger = await Logger.root();
 * @example
 * // Creates a child logger of the root sfdx logger with custom fields applied
 * const childLogger = await Logger.child('myRootChild', {tag: 'value'});
 * @example
 * // Creates a custom logger unaffiliated with the root logger
 * const myCustomLogger = new Logger('myCustomLogger');
 * @example
 * // Creates a child of a custom logger unaffiliated with the root logger with custom fields applied
 * const myCustomChildLogger = myCustomLogger.child('myCustomChild', {tag: 'value'});
 *
 * @see https://github.com/cwallsfdc/node-bunyan
 * @see https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_log_messages.htm
 */
export class Logger {

    /**
     * The name of the root sfdx `Logger`.
     *
     * @type {string}
     * @see Logger.root
     */
    public static readonly ROOT_NAME = 'sfdx';

    /**
     * The default `LoggerLevel` when constructing new `Logger` instances.
     *
     * @type {LoggerLevel}
     */
    public static readonly DEFAULT_LEVEL = LoggerLevel.WARN;

    /**
     * A list of all lower case `LoggerLevel` names.
     *
     * @type {string[]}
     * @see LoggerLevel
     */
    public static readonly LEVEL_NAMES = Object.values(LoggerLevel)
        .filter((v) => _.isString(v))
        .map((v) => v.toLowerCase());

    /**
     * Gets the root logger with the default level and file stream.
     *
     * @returns {Promise<Logger>}
     */
    public static async root(): Promise<Logger> {
        if (this.rootLogger) {
            return this.rootLogger;
        }
        this.rootLogger = new Logger(Logger.ROOT_NAME).setLevel();
        // disable log file writing, if applicable
        if (process.env.SFDX_DISABLE_LOG_FILE !== 'true' && Global.getEnvironmentMode() !== Mode.TEST) {
            await this.rootLogger.addLogFileStream(Global.LOG_FILE_PATH);
        }
        return this.rootLogger;
    }

    /**
     * Destroys the root `Logger`.
     *
     * @ignore
     */
    public static destroyRoot(): void {
        if (this.rootLogger) {
            this.rootLogger.close();
            this.rootLogger = undefined;
        }
    }

    /**
     * Create a child of the root logger, inheriting this instance's configuration such as `level`, `streams`, etc.
     *
     * @param {string} name The name of the child logger.
     * @param {Fields} [fields] Additional fields included in all log lines.
     * @returns {Promise<Logger>}
     */
    public static async child(name: string, fields?: Fields): Promise<Logger> {
        return (await Logger.root()).child(name, fields);
    }

    /**
     * Gets a numeric `LoggerLevel` value by string name.
     *
     * @param {string} levelName The level name to convert to a `LoggerLevel` enum value.
     * @throws {SfdxError}
     *    **`{name: 'UnrecognizedLoggerLevelName'}`:** The level name was not case-insensitively recognized as a valid `LoggerLevel` value.
     * @see LoggerLevel
     */
    public static getLevelByName(levelName: string): LoggerLevelValue {
        const level = LoggerLevel[levelName && levelName.toUpperCase()];
        if (_.isNil(level)) {
            throw new SfdxError('UnrecognizedLoggerLevelName');
        }
        return level;
    }

    // Rollup all instance-specific process event listeners together to prevent global `MaxListenersExceededWarning`s.
    private static readonly lifecycle = (() => {
        const events = new EventEmitter();
        events.setMaxListeners(0); // never warn on listener counts
        process.on('uncaughtException', (err) => events.emit('uncaughtException', err));
        process.on('exit', () => events.emit('exit'));
        return events;
    })();

    // The sfdx root logger singleton
    private static rootLogger: Logger;

    // The actual Bunyan logger
    private bunyan: Bunyan;

    /**
     * Constructs a new `Logger`.
     *
     * @param {LoggerOptions|string} optionsOrName A set of `LoggerOptions` or name to use with the default options.
     * @throws {SfdxError}
     *    **`{name: 'RedundantRootLogger'}`:** More than one attempt is made to construct the root `Logger`.
     */
    public constructor(optionsOrName: LoggerOptions | string) {
        let options: LoggerOptions;
        if (typeof optionsOrName === 'string') {
            options = {
                name: optionsOrName,
                level: Logger.DEFAULT_LEVEL,
                serializers: Bunyan.stdSerializers
            };
        } else {
            options = optionsOrName;
        }

        if (Logger.rootLogger && options.name === Logger.ROOT_NAME) {
            throw new SfdxError('RedundantRootLogger');
        }

        this.bunyan = new Bunyan(options);
        this.bunyan.name = options.name;
        this.bunyan.filters = [];
        this.bunyan.streams = [];

        // all SFDX loggers must filter sensitive data
        this.addFilter((...args) => _filter(...args));

        if (Global.getEnvironmentMode() !== Mode.TEST) {
            Logger.lifecycle.on('uncaughtException', this.uncaughtExceptionHandler);
            Logger.lifecycle.on('exit', this.exitHandler);
        }

        this.trace(`Created '${this.getName()}' logger instance`);
    }

    /**
     * Adds a stream.
     *
     * @param {LoggerStream} stream The stream configuration to add.
     * @param {LoggerLevelValue} [defaultLevel] The default level of the stream.
     */
    public addStream(stream: LoggerStream, defaultLevel?: LoggerLevelValue): void {
        this.bunyan.addStream(stream, defaultLevel);
    }

    /**
     * Adds a file stream to this logger.
     *
     * @param {string} logFile The path to the log file.  If it doesn't exist it will be created.
     * @returns {Promise<void>} Resolved or rejected upon completion of the addition.
     */
    public async addLogFileStream(logFile: string): Promise<void> {
        try {
            // Check if we have write access to the log file (i.e., we created it already)
            await SfdxUtil.access(logFile, fs.constants.W_OK);
        } catch (err1) {
            try {
                await SfdxUtil.mkdirp(path.dirname(logFile), { mode: SfdxUtil.DEFAULT_USER_DIR_MODE });
            } catch (err2) {
                // noop; directory exists already
            }
            try {
                await SfdxUtil.writeFile(logFile, '', { mode: SfdxUtil.DEFAULT_USER_FILE_MODE });
            } catch (err3) {
                throw SfdxError.wrap(err3);
            }
        }

        // avoid multiple streams to same log file
        if (!this.bunyan.streams.find((stream) => stream.type === 'file' && stream.path === logFile)) {
            // TODO: rotating-file
            // https://github.com/trentm/node-bunyan#stream-type-rotating-file
            this.addStream({ type: 'file', path: logFile, level: this.bunyan.level() as number });
        }
    }

    /**
     * Gets the name of this logger.
     *
     * @returns {string}
     */
    public getName(): string {
        return this.bunyan.name;
    }

    /**
     * Gets the current level of this logger.
     *
     * @returns {LoggerLevelValue}
     */
    public getLevel(): LoggerLevelValue {
        return this.bunyan.level();
    }

    /**
     * Set the logging level of all streams for this logger.  If a specific `level` is not provided, this method will
     * attempt to read it from the environment variable `SFDX_LOG_LEVEL`, and if not found,
     * {@link Logger.DEFAULT_LOG_LEVEL} will be used instead.
     *
     * @example
     * // Sets the level from the environment or default value
     * logger.setLevel()
     * // Set the level from the INFO enum
     * @example logger.setLevel(LoggerLevel.INFO)
     * // Sets the level case-insensitively from a string value
     * @example logger.setLevel(Logger.getLevelByName('info'))
     *
     * @param {LoggerLevelValue} [level] The logger level.
     * @returns {Logger} For convenience `this` object is returned.
     * @throws {SfdxError}
     *    **`{name: 'UnrecognizedLoggerLevelName'}`:** A value of `level` read from `SFDX_LOG_LEVEL` was invalid.
     */
    public setLevel(level?: LoggerLevelValue): Logger {
        if (_.isNil(level)) {
            level = process.env.SFDX_LOG_LEVEL
                ? Logger.getLevelByName(process.env.SFDX_LOG_LEVEL)
                : Logger.DEFAULT_LEVEL;
        }
        this.bunyan.level(level);
        return this;
    }

    /**
     * Gets the underlying Bunyan logger.
     *
     * @returns {any} The low-level Bunyan logger.
     */
    public getBunyanLogger(): any {
        return this.bunyan;
    }

    /**
     * Compares the requested log level with the current log level.  Returns true if
     * the requested log level is greater than or equal to the current log level.
     *
     * @param {LoggerLevelValue} level The requested log level to compare against the currently set log level
     * @returns {boolean}
     */
    public shouldLog(level: LoggerLevelValue): boolean {
        if (typeof level === 'string') {
            level = Bunyan.levelFromName(level) as number;
        }
        return level >= this.getLevel();
    }

    /**
     * Use in-memory logging for this logger instance instead of any parent streams. Useful for testing.
     *
     * **WARNING: This cannot be undone for this logger instance.**
     *
     * @returns {Logger} For convenience this object is returned.
     */
    public useMemoryLogging(): Logger {
        this.bunyan.streams = [];
        this.bunyan.ringBuffer = new Bunyan.RingBuffer({ limit: 5000 });
        this.addStream({ type: 'raw', stream: this.bunyan.ringBuffer, level: this.bunyan.level() });
        return this;
    }

    /**
     * Gets an array of log line objects. Each element is an object that corresponds to a log line.
     *
     * @returns {Array<string>}
     */
    public getBufferedRecords(): string[] {
        if (this.bunyan.ringBuffer) {
            return this.bunyan.ringBuffer.records;
        }
        return [];
    }

    /**
     * Reads a text blob of all the log lines contained in memory or the log file.
     *
     * @returns {string}
     */
    public readLogContentsAsText(): string {
        if (this.bunyan.ringBuffer) {
            return this.getBufferedRecords().reduce((accum, value) => {
                accum += (JSON.stringify(value) + os.EOL);
                return accum;
            }, '');
        } else {
            let content = '';
            this.bunyan.streams.forEach(async (stream) => {
                if (stream.type === 'file') {
                    content += await SfdxUtil.readFile(stream.path, 'utf8');
                }
            });
            return content;
        }
    }

    /**
     * Adds a filter to be applied to all logged messages.
     *
     * @param {function} filter A function with signature `(...args) => any[]` that transforms log message arguments.
     */
    public addFilter(filter: (...args) => any[]): void {
        if (!this.bunyan.filters) {
            this.bunyan.filters = [];
        }
        this.bunyan.filters.push(filter);
    }

    /**
     * Close the logger, including any streams, and remove all listeners.
     *
     * @param {function} [fn] A function with signature `(stream: LoggerStream) => void` to call for each stream with
     *                        the stream as an arg.
     */
    public close(fn?: (stream: LoggerStream) => void): void {
        if (this.bunyan.streams) {
            try {
                this.bunyan.streams.forEach((entry) => {
                    if (fn) {
                        fn(entry);
                    }
                    // close file streams, flush buffer to disk
                    if (entry.type === 'file' && entry.stream.end) {
                        entry.stream.end();
                    }
                });
            } finally {
                Logger.lifecycle.removeListener('uncaughtException', this.uncaughtExceptionHandler);
                Logger.lifecycle.removeListener('exit', this.exitHandler);
            }
        }
    }

    /**
     * Create a child logger, typically to add a few log record fields.
     *
     * @param {string} name The name of the child logger that is emitted w/ log line as log:<name>
     * @param {Fields} [fields] Additional fields included in all log lines for the child logger.
     * @returns {Logger} For convenience this object is returned.
     */
    public child(name: string, fields: Fields = {}): Logger {
        if (!name) {
            throw new SfdxError('LoggerNameRequired');
        }
        fields.log = name;

        const child = new Logger(name);
        // only support including additional fields on log line (no config)
        child.bunyan = this.bunyan.child(fields, true);
        child.bunyan.name = name;
        child.bunyan.filters = this.bunyan.filters;

        this.trace(`Setup child '${name}' logger instance`);

        return child;
    }

    /**
     * Add a field to all log lines for this logger
     *
     * @param {string} name The name of the field to add.
     * @param {FieldValue} value The value of the field to be logged.
     * @returns {Logger} For convenience this object is returned.
     */
    public addField(name: string, value: FieldValue): Logger {
        this.bunyan.fields[name] = value;
        return this;
    }

    /**
     * Logs at `trace` level with filtering applied.
     *
     * @param {...any} args Any number of arguments to be logged.
     * @returns {Logger} For convenience this object is returned.
     */
    public trace(...args: any[]): Logger {
        this.bunyan.trace(this.applyFilters(LoggerLevel.TRACE, ...args));
        return this;
    }

    /**
     * Logs at `debug` level with filtering applied.
     *
     * @param {...any} args Any number of arguments to be logged.
     * @returns {Logger} For convenience this object is returned.
     */
    public debug(...args: any[]): Logger {
        this.bunyan.debug(this.applyFilters(LoggerLevel.DEBUG, ...args));
        return this;
    }

    /**
     * Logs at `info` level with filtering applied.
     *
     * @param {...any} args Any number of arguments to be logged.
     * @returns {Logger} For convenience this object is returned.
     */
    public info(...args: any[]): Logger {
        this.bunyan.info(this.applyFilters(LoggerLevel.INFO, ...args));
        return this;
    }

    /**
     * Logs at `warn` level with filtering applied.
     *
     * @param {...any} args Any number of arguments to be logged.
     * @returns {Logger} For convenience this object is returned.
     */
    public warn(...args: any[]): Logger {
        this.bunyan.warn(this.applyFilters(LoggerLevel.WARN, ...args));
        return this;
    }

    /**
     * Logs at `error` level with filtering applied.
     *
     * @param {...any} args Any number of arguments to be logged.
     * @returns {Logger} For convenience this object is returned.
     */
    public error(...args: any[]): Logger {
        this.bunyan.error(this.applyFilters(LoggerLevel.ERROR, ...args));
        return this;
    }

    /**
     * Logs at `fatal` level with filtering applied.
     *
     * @param {...any} args Any number of arguments to be logged.
     * @returns {Logger} For convenience this object is returned.
     */
    public fatal(...args: any[]): Logger {
        // always show fatal to stderr
        console.error(...args);
        this.bunyan.fatal(this.applyFilters(LoggerLevel.FATAL, ...args));
        return this;
    }

    private applyFilters(logLevel, ...args): undefined | any | any[] {
        if (this.shouldLog(logLevel)) {
            this.bunyan.filters.forEach((filter) => args = filter(...args));
        }
        return args && args.length === 1 ? args[0] : args;
    }

    private uncaughtExceptionHandler = (err: Error) => {
        // log the exception
        // FIXME: good chance this won't be logged because
        // process.exit was called before this is logged
        // https://github.com/trentm/node-bunyan/issues/95
        this.fatal(err);
    }

    private exitHandler = () => {
        this.close();
    }
}

// Ok to log clientid
const FILTERED_KEYS = [
    'sid',
    // Any json attribute that contains the words "access" and "token" will have the attribute/value hidden
    { name: 'access_token', regex: 'access[^\'"]*token' },
    // Any json attribute that contains the words "refresh" and "token" will have the attribute/value hidden
    { name: 'refresh_token', regex: 'refresh[^\'"]*token' },
    'clientsecret',
    // Any json attribute that contains the words "sfdx", "auth", and "url" will have the attribute/value hidden
    { name: 'sfdxauthurl', regex: 'sfdx[^\'"]*auth[^\'"]*url' }
];

// SFDX code and plugins should never show tokens or connect app information in the logs
const _filter = (...args) => args.map((arg) => {
    if (_.isArray(arg)) {
        return _filter(...arg);
    }

    if (arg) {
        let _arg = arg;

        // Normalize all objects into a string. This include errors.
        if (_.isObject(arg)) {
            _arg = JSON.stringify(arg);
        }

        const HIDDEN = 'HIDDEN';

        FILTERED_KEYS.forEach((key: any) => {
            let expElement = key;
            let expName = key;

            // Filtered keys can be strings or objects containing regular expression components.
            if (_.isPlainObject(key)) {
                expElement = key.regex;
                expName = key.name;
            }

            const hiddenAttrMessage = `"<${expName} - ${HIDDEN}>"`;

            // Match all json attribute values case insensitive: ex. {" Access*^&(*()^* Token " : " 45143075913458901348905 \n\t" ...}
            const regexTokens = new RegExp(`(['"][^'"]*${expElement}[^'"]*['"]\\s*:\\s*)['"][^'"]*['"]`, 'gi');
            _arg = _arg.replace(regexTokens, `$1${hiddenAttrMessage}`);

            // Match all key value attribute case insensitive: ex. {" key\t"    : ' access_token  ' , " value " : "  dsafgasr431 " ....}
            const keyRegex = new RegExp(`(['"]\\s*key\\s*['"]\\s*:)\\s*['"]\\s*${expElement}\\s*['"]\\s*.\\s*['"]\\s*value\\s*['"]\\s*:\\s*['"]\\s*[^'"]*['"]`, 'gi');
            _arg = _arg.replace(keyRegex, `$1${hiddenAttrMessage}`);
        });

        // This is a jsforce message we are masking. This can be removed after the following pull request is committed
        // and pushed to a jsforce release.
        //
        // Looking  For: "Refreshed access token = ..."
        // Related Jsforce pull requests:
        //  https://github.com/jsforce/jsforce/pull/598
        //  https://github.com/jsforce/jsforce/pull/608
        //  https://github.com/jsforce/jsforce/pull/609
        const jsForceTokenRefreshRegEx = new RegExp('Refreshed(.*)access(.*)token(.*)=\\s*[^\'"\\s*]*');
        _arg = _arg.replace(jsForceTokenRefreshRegEx, `<refresh_token - ${HIDDEN}>`);

        _arg = _arg.replace(/sid=(.*)/, `sid=<${HIDDEN}>`);

        // return an object if an object was logged; otherwise return the filtered string.
        return _.isObject(arg) ? JSON.parse(_arg) : _arg;
    } else {
        return arg;
    }

});
