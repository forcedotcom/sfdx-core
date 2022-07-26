/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { EventEmitter } from 'events';
import * as os from 'os';
import * as path from 'path';
import { Writable } from 'stream';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Bunyan from '@salesforce/bunyan';
import { Env, parseJson, parseJsonMap } from '@salesforce/kit';
import {
  Dictionary,
  ensure,
  ensureNumber,
  isArray,
  isFunction,
  isKeyOf,
  isObject,
  isPlainObject,
  isString,
  Many,
  Optional,
} from '@salesforce/ts-types';
import * as Debug from 'debug';
import { Global, Mode } from './global';
import { SfError } from './sfError';

/**
 * A Bunyan `Serializer` function.
 *
 * @param input The input to be serialized.
 * **See** {@link https://github.com/forcedotcom/node-bunyan#serializers|Bunyan Serializers API}
 */
export type Serializer = (input: unknown) => unknown;

/**
 * A collection of named `Serializer`s.
 *
 * **See** {@link https://github.com/forcedotcom/node-bunyan#serializers|Bunyan Serializers API}
 */
export interface Serializers {
  [key: string]: Serializer;
}

/**
 * The common set of `Logger` options.
 */
export interface LoggerOptions {
  /**
   * The logger name.
   */
  name: string;

  /**
   * The logger format type. Current options include LogFmt or JSON (default).
   */
  format?: LoggerFormat;

  /**
   * The logger's serializers.
   */
  serializers?: Serializers;
  /**
   * Whether or not to log source file, line, and function information.
   */
  src?: boolean;
  /**
   * The desired log level.
   */
  level?: LoggerLevelValue;
  /**
   * A stream to write to.
   */
  stream?: Writable;
  /**
   * An array of streams to write to.
   */
  streams?: LoggerStream[];
}

/**
 * Standard `Logger` levels.
 *
 * **See** {@link https://github.com/forcedotcom/node-bunyan#levels|Bunyan Levels}
 */
export enum LoggerLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60,
}

/**
 *  `Logger` format types.
 */
export enum LoggerFormat {
  JSON,
  LOGFMT,
}

/**
 * A Bunyan stream configuration.
 *
 * @see {@link https://github.com/forcedotcom/node-bunyan#streams|Bunyan Streams}
 */
export interface LoggerStream {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  /**
   * The type of stream -- may be inferred from other properties.
   */
  type?: string;
  /**
   * The desired log level for the stream.
   */
  level?: LoggerLevelValue;
  /**
   * The stream to write to.  Mutually exclusive with `path`.
   */
  stream?: Writable;
  /**
   * The name of the stream.
   */
  name?: string;
  /**
   * A log file path to write to.  Mutually exclusive with `stream`.
   */
  path?: string;
}

/**
 * Any numeric `Logger` level.
 */
export type LoggerLevelValue = LoggerLevel | number;

/**
 * A collection of named `FieldValue`s.
 *
 * **See** {@link https://github.com/forcedotcom/node-bunyan#log-record-fields|Bunyan Log Record Fields}
 */
export interface Fields {
  [key: string]: FieldValue;
}

/**
 * All possible field value types.
 */
export type FieldValue = string | number | boolean;

/**
 * Log line interface
 */
export interface LogLine {
  name: string;
  hostname: string;
  pid: string;
  log: string;
  level: number;
  msg: string;
  time: string;
  v: number;
}

/**
 * A logging abstraction powered by {@link https://github.com/forcedotcom/node-bunyan|Bunyan} that provides both a default
 * logger configuration that will log to `sfdx.log`, and a way to create custom loggers based on the same foundation.
 *
 * ```
 * // Gets the root sfdx logger
 * const logger = await Logger.root();
 *
 * // Creates a child logger of the root sfdx logger with custom fields applied
 * const childLogger = await Logger.child('myRootChild', {tag: 'value'});
 *
 * // Creates a custom logger unaffiliated with the root logger
 * const myCustomLogger = new Logger('myCustomLogger');
 *
 * // Creates a child of a custom logger unaffiliated with the root logger with custom fields applied
 * const myCustomChildLogger = myCustomLogger.child('myCustomChild', {tag: 'value'});
 * ```
 * **See** https://github.com/forcedotcom/node-bunyan
 *
 * **See** https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_dev_cli_log_messages.htm
 */
export class Logger {
  /**
   * The name of the root sfdx `Logger`.
   */
  public static readonly ROOT_NAME = 'sf';

  /**
   * The default `LoggerLevel` when constructing new `Logger` instances.
   */
  public static readonly DEFAULT_LEVEL = LoggerLevel.WARN;

  /**
   * A list of all lower case `LoggerLevel` names.
   *
   * **See** {@link LoggerLevel}
   */
  public static readonly LEVEL_NAMES = Object.values(LoggerLevel)
    .filter(isString)
    .map((v: string) => v.toLowerCase());
  // Rollup all instance-specific process event listeners together to prevent global `MaxListenersExceededWarning`s.
  private static readonly lifecycle = (() => {
    const events = new EventEmitter();
    events.setMaxListeners(0); // never warn on listener counts
    process.on('uncaughtException', (err) => events.emit('uncaughtException', err));
    process.on('exit', () => events.emit('exit'));
    return events;
  })();

  // The sfdx root logger singleton
  private static rootLogger?: Logger;

  /**
   * The default rotation period for logs. Example '1d' will rotate logs daily (at midnight).
   * See 'period' docs here: https://github.com/forcedotcom/node-bunyan#stream-type-rotating-file
   */

  public readonly logRotationPeriod = new Env().getString('SF_LOG_ROTATION_PERIOD') || '1d';

  /**
   * The number of backup rotated log files to keep.
   * Example: '3' will have the base sf.log file, and the past 3 (period) log files.
   * See 'count' docs here: https://github.com/forcedotcom/node-bunyan#stream-type-rotating-file
   */

  public readonly logRotationCount = new Env().getNumber('SF_LOG_ROTATION_COUNT') || 2;

  /**
   * Whether debug is enabled for this Logger.
   */
  public debugEnabled = false;

  // The actual Bunyan logger
  private bunyan: Bunyan;

  private readonly format: LoggerFormat;

  /**
   * Constructs a new `Logger`.
   *
   * @param optionsOrName A set of `LoggerOptions` or name to use with the default options.
   *
   * **Throws** *{@link SfError}{ name: 'RedundantRootLoggerError' }* More than one attempt is made to construct the root
   * `Logger`.
   */
  public constructor(optionsOrName: LoggerOptions | string) {
    let options: LoggerOptions;
    if (typeof optionsOrName === 'string') {
      options = {
        name: optionsOrName,
        level: Logger.DEFAULT_LEVEL,
        serializers: Bunyan.stdSerializers,
      };
    } else {
      options = optionsOrName;
    }

    if (Logger.rootLogger && options.name === Logger.ROOT_NAME) {
      throw new SfError('Can not create another root logger.', 'RedundantRootLoggerError');
    }

    // Inspect format to know what logging format to use then delete from options to
    // ensure it doesn't conflict with Bunyan.
    this.format = options.format || LoggerFormat.JSON;
    delete options.format;

    // If the log format is LOGFMT, we need to convert any stream(s) into a LOGFMT type stream.
    if (this.format === LoggerFormat.LOGFMT && options.stream) {
      const ls: LoggerStream = this.createLogFmtFormatterStream({ stream: options.stream });
      options.stream = ls.stream;
    }
    if (this.format === LoggerFormat.LOGFMT && options.streams) {
      const logFmtConvertedStreams: LoggerStream[] = [];
      options.streams.forEach((ls: LoggerStream) => {
        logFmtConvertedStreams.push(this.createLogFmtFormatterStream(ls));
      });
      options.streams = logFmtConvertedStreams;
    }

    this.bunyan = new Bunyan(options);
    this.bunyan.name = options.name;
    this.bunyan.filters = [];

    if (!options.streams && !options.stream) {
      this.bunyan.streams = [];
    }

    // all SFDX loggers must filter sensitive data
    this.addFilter((...args) => _filter(...args));

    if (Global.getEnvironmentMode() !== Mode.TEST) {
      Logger.lifecycle.on('uncaughtException', this.uncaughtExceptionHandler);
      Logger.lifecycle.on('exit', this.exitHandler);
    }

    this.trace(`Created '${this.getName()}' logger instance`);
  }

  /**
   * Gets the root logger with the default level, file stream, and DEBUG enabled.
   */
  public static async root(): Promise<Logger> {
    if (this.rootLogger) {
      return this.rootLogger;
    }
    const rootLogger = (this.rootLogger = new Logger(Logger.ROOT_NAME).setLevel());

    // disable log file writing, if applicable
    if (process.env.SFDX_DISABLE_LOG_FILE !== 'true' && Global.getEnvironmentMode() !== Mode.TEST) {
      await rootLogger.addLogFileStream(Global.LOG_FILE_PATH);
    }

    rootLogger.enableDEBUG();
    return rootLogger;
  }

  /**
   * Gets the root logger with the default level, file stream, and DEBUG enabled.
   */
  public static getRoot(): Logger {
    if (this.rootLogger) {
      return this.rootLogger;
    }
    const rootLogger = (this.rootLogger = new Logger(Logger.ROOT_NAME).setLevel());

    // disable log file writing, if applicable
    if (process.env.SFDX_DISABLE_LOG_FILE !== 'true' && Global.getEnvironmentMode() !== Mode.TEST) {
      rootLogger.addLogFileStreamSync(Global.LOG_FILE_PATH);
    }

    rootLogger.enableDEBUG();
    return rootLogger;
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
   * @param name The name of the child logger.
   * @param fields Additional fields included in all log lines.
   */
  public static async child(name: string, fields?: Fields): Promise<Logger> {
    return (await Logger.root()).child(name, fields);
  }

  /**
   * Create a child of the root logger, inheriting this instance's configuration such as `level`, `streams`, etc.
   *
   * @param name The name of the child logger.
   * @param fields Additional fields included in all log lines.
   */
  public static childFromRoot(name: string, fields?: Fields): Logger {
    return Logger.getRoot().child(name, fields);
  }

  /**
   * Gets a numeric `LoggerLevel` value by string name.
   *
   * @param {string} levelName The level name to convert to a `LoggerLevel` enum value.
   *
   * **Throws** *{@link SfError}{ name: 'UnrecognizedLoggerLevelNameError' }* The level name was not case-insensitively recognized as a valid `LoggerLevel` value.
   * @see {@Link LoggerLevel}
   */
  public static getLevelByName(levelName: string): LoggerLevelValue {
    levelName = levelName.toUpperCase();
    if (!isKeyOf(LoggerLevel, levelName)) {
      throw new SfError(`Invalid log level "${levelName}".`, 'UnrecognizedLoggerLevelNameError');
    }
    return LoggerLevel[levelName];
  }

  /**
   * Adds a stream.
   *
   * @param stream The stream configuration to add.
   * @param defaultLevel The default level of the stream.
   */
  public addStream(stream: LoggerStream, defaultLevel?: LoggerLevelValue): void {
    if (this.format === LoggerFormat.LOGFMT) {
      stream = this.createLogFmtFormatterStream(stream);
    }
    this.bunyan.addStream(stream, defaultLevel);
  }

  /**
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  public async addLogFileStream(logFile: string): Promise<void> {
    try {
      // Check if we have write access to the log file (i.e., we created it already)
      await fs.promises.access(logFile, fs.constants.W_OK);
    } catch (err1) {
      try {
        await fs.promises.mkdir(path.dirname(logFile), { recursive: true, mode: 0x700 });
      } catch (err2) {
        // noop; directory exists already
      }
      try {
        await fs.promises.writeFile(logFile, '', { mode: '600' });
      } catch (err3) {
        throw SfError.wrap(err3 as string | Error);
      }
    }

    // avoid multiple streams to same log file
    if (
      !this.bunyan.streams.find(
        // No bunyan typings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stream: any) => stream.type === 'rotating-file' && stream.path === logFile
      )
    ) {
      this.addStream({
        type: 'rotating-file',
        path: logFile,
        period: this.logRotationPeriod,
        count: this.logRotationCount,
        level: this.bunyan.level() as number,
      });
    }
  }

  /**
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  public addLogFileStreamSync(logFile: string): void {
    try {
      // Check if we have write access to the log file (i.e., we created it already)
      fs.accessSync(logFile, fs.constants.W_OK);
    } catch (err1) {
      try {
        fs.mkdirSync(path.dirname(logFile), { mode: 0x700 });
      } catch (err2) {
        // noop; directory exists already
      }
      try {
        fs.writeFileSync(logFile, '', { mode: '600' });
      } catch (err3) {
        throw SfError.wrap(err3 as string | Error);
      }
    }

    // avoid multiple streams to same log file
    if (
      !this.bunyan.streams.find(
        // No bunyan typings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (stream: any) => stream.type === 'rotating-file' && stream.path === logFile
      )
    ) {
      this.addStream({
        type: 'rotating-file',
        path: logFile,
        period: this.logRotationPeriod,
        count: this.logRotationCount,
        level: this.bunyan.level() as number,
      });
    }
  }

  /**
   * Gets the name of this logger.
   */
  public getName(): string {
    return this.bunyan.name;
  }

  /**
   * Gets the current level of this logger.
   */
  public getLevel(): LoggerLevelValue {
    return this.bunyan.level();
  }

  /**
   * Set the logging level of all streams for this logger.  If a specific `level` is not provided, this method will
   * attempt to read it from the environment variable `SFDX_LOG_LEVEL`, and if not found,
   * {@link Logger.DEFAULT_LOG_LEVEL} will be used instead. For convenience `this` object is returned.
   *
   * @param {LoggerLevelValue} [level] The logger level.
   *
   * **Throws** *{@link SfError}{ name: 'UnrecognizedLoggerLevelNameError' }* A value of `level` read from `SFDX_LOG_LEVEL`
   * was invalid.
   *
   * ```
   * // Sets the level from the environment or default value
   * logger.setLevel()
   *
   * // Set the level from the INFO enum
   * logger.setLevel(LoggerLevel.INFO)
   *
   * // Sets the level case-insensitively from a string value
   * logger.setLevel(Logger.getLevelByName('info'))
   * ```
   */
  public setLevel(level?: LoggerLevelValue): Logger {
    if (level == null) {
      level = process.env.SFDX_LOG_LEVEL ? Logger.getLevelByName(process.env.SFDX_LOG_LEVEL) : Logger.DEFAULT_LEVEL;
    }
    this.bunyan.level(level);
    return this;
  }

  /**
   * Gets the underlying Bunyan logger.
   */
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public getBunyanLogger() {
    return this.bunyan;
  }

  /**
   * Compares the requested log level with the current log level.  Returns true if
   * the requested log level is greater than or equal to the current log level.
   *
   * @param level The requested log level to compare against the currently set log level.
   */
  public shouldLog(level: LoggerLevelValue): boolean {
    if (typeof level === 'string') {
      level = Bunyan.levelFromName(level) as number;
    }
    return level >= this.getLevel();
  }

  /**
   * Use in-memory logging for this logger instance instead of any parent streams. Useful for testing.
   * For convenience this object is returned.
   *
   * **WARNING: This cannot be undone for this logger instance.**
   */
  public useMemoryLogging(): Logger {
    this.bunyan.streams = [];
    this.bunyan.ringBuffer = new Bunyan.RingBuffer({ limit: 5000 });
    this.addStream({
      type: 'raw',
      stream: this.bunyan.ringBuffer,
      level: this.bunyan.level(),
    });
    return this;
  }

  /**
   * Gets an array of log line objects. Each element is an object that corresponds to a log line.
   */
  public getBufferedRecords(): LogLine[] {
    if (this.bunyan.ringBuffer) {
      return this.bunyan.ringBuffer.records;
    }
    return [];
  }

  /**
   * Reads a text blob of all the log lines contained in memory or the log file.
   */
  public readLogContentsAsText(): string {
    if (this.bunyan.ringBuffer) {
      return this.getBufferedRecords().reduce((accum, line) => {
        accum += JSON.stringify(line) + os.EOL;
        return accum;
      }, '');
    } else {
      let content = '';
      // No bunyan typings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.bunyan.streams.forEach(async (stream: any) => {
        if (stream.type === 'file') {
          content += await fs.promises.readFile(stream.path, 'utf8');
        }
      });
      return content;
    }
  }

  /**
   * Adds a filter to be applied to all logged messages.
   *
   * @param filter A function with signature `(...args: any[]) => any[]` that transforms log message arguments.
   */
  public addFilter(filter: (...args: unknown[]) => unknown): void {
    // eslint disable-line @typescript-eslint/no-explicit-any
    if (!this.bunyan.filters) {
      this.bunyan.filters = [];
    }
    this.bunyan.filters.push(filter);
  }

  /**
   * Close the logger, including any streams, and remove all listeners.
   *
   * @param fn A function with signature `(stream: LoggerStream) => void` to call for each stream with
   *                        the stream as an arg.
   */
  public close(fn?: (stream: LoggerStream) => void): void {
    if (this.bunyan.streams) {
      try {
        this.bunyan.streams.forEach((entry: LoggerStream) => {
          if (fn) {
            fn(entry);
          }
          // close file streams, flush buffer to disk
          // eslint-disable-next-line @typescript-eslint/unbound-method
          if (entry.type === 'file' && entry.stream && isFunction(entry.stream.end)) {
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
   * Create a child logger, typically to add a few log record fields. For convenience this object is returned.
   *
   * @param name The name of the child logger that is emitted w/ log line as `log:<name>`.
   * @param fields Additional fields included in all log lines for the child logger.
   */
  public child(name: string, fields: Fields = {}): Logger {
    if (!name) {
      throw new SfError('LoggerNameRequired');
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
   * Add a field to all log lines for this logger. For convenience `this` object is returned.
   *
   * @param name The name of the field to add.
   * @param value The value of the field to be logged.
   */
  public addField(name: string, value: FieldValue): Logger {
    this.bunyan.fields[name] = value;
    return this;
  }

  /**
   * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public trace(...args: any[]): Logger {
    this.bunyan.trace(this.applyFilters(LoggerLevel.TRACE, ...args));
    return this;
  }

  /**
   * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public debug(...args: unknown[]): Logger {
    this.bunyan.debug(this.applyFilters(LoggerLevel.DEBUG, ...args));
    return this;
  }

  /**
   * Logs at `debug` level with filtering applied.
   *
   * @param cb A callback that returns on array objects to be logged.
   */
  public debugCallback(cb: () => unknown[] | string): void {
    if (this.getLevel() === LoggerLevel.DEBUG || process.env.DEBUG) {
      const result = cb();
      if (isArray(result)) {
        this.bunyan.debug(this.applyFilters(LoggerLevel.DEBUG, ...result));
      } else {
        this.bunyan.debug(this.applyFilters(LoggerLevel.DEBUG, ...[result]));
      }
    }
  }

  /**
   * Logs at `info` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public info(...args: unknown[]): Logger {
    this.bunyan.info(this.applyFilters(LoggerLevel.INFO, ...args));
    return this;
  }

  /**
   * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public warn(...args: unknown[]): Logger {
    this.bunyan.warn(this.applyFilters(LoggerLevel.WARN, ...args));
    return this;
  }

  /**
   * Logs at `error` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public error(...args: unknown[]): Logger {
    this.bunyan.error(this.applyFilters(LoggerLevel.ERROR, ...args));
    return this;
  }

  /**
   * Logs at `fatal` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public fatal(...args: unknown[]): Logger {
    // always show fatal to stderr
    // eslint-disable-next-line no-console
    console.error(...args);
    this.bunyan.fatal(this.applyFilters(LoggerLevel.FATAL, ...args));
    return this;
  }

  /**
   * Enables logging to stdout when the DEBUG environment variable is used. It uses the logger
   * name as the debug name, so you can do DEBUG=<logger-name> to filter the results to your logger.
   */
  public enableDEBUG(): void {
    // The debug library does this for you, but no point setting up the stream if it isn't there
    if (process.env.DEBUG && !this.debugEnabled) {
      const debuggers: Dictionary<Debug.IDebugger> = {};

      debuggers.core = Debug(`${this.getName()}:core`);

      this.addStream({
        name: 'debug',
        stream: new Writable({
          write: (chunk, encoding, next) => {
            try {
              const json = parseJsonMap(chunk.toString());
              const logLevel = ensureNumber(json.level);
              if (this.getLevel() <= logLevel) {
                let debuggerName = 'core';
                if (isString(json.log)) {
                  debuggerName = json.log;
                  if (!debuggers[debuggerName]) {
                    debuggers[debuggerName] = Debug(`${this.getName()}:${debuggerName}`);
                  }
                }
                const level = LoggerLevel[logLevel];
                ensure(debuggers[debuggerName])(`${level} ${json.msg}`);
              }
            } catch (err) {
              // do nothing
            }
            next();
          },
        }),
        // Consume all levels
        level: 0,
      });
      this.debugEnabled = true;
    }
  }

  private applyFilters(logLevel: LoggerLevel, ...args: unknown[]): Optional<Many<unknown>> {
    if (this.shouldLog(logLevel)) {
      // No bunyan typings
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.bunyan.filters.forEach((filter: any) => (args = filter(...args)));
    }
    return args && args.length === 1 ? args[0] : args;
  }

  private uncaughtExceptionHandler = (err: Error) => {
    // W-7558552
    // Only log uncaught exceptions in root logger
    if (this === Logger.rootLogger) {
      // log the exception
      // FIXME: good chance this won't be logged because
      // process.exit was called before this is logged
      // https://github.com/trentm/node-bunyan/issues/95
      this.fatal(err);
    }
  };

  private exitHandler = () => {
    this.close();
  };

  private createLogFmtFormatterStream(loggerStream: LoggerStream): LoggerStream {
    const logFmtWriteableStream = new Writable({
      write: (chunk, enc, cb) => {
        try {
          const parsedJSON = JSON.parse(chunk.toString());
          const keys = Object.keys(parsedJSON);

          let logEntry = '';
          keys.forEach((key) => {
            let logMsg = `${parsedJSON[key]}`;
            if (logMsg.trim().includes(' ')) {
              logMsg = `"${logMsg}"`;
            }
            logEntry += `${key}=${logMsg} `;
          });
          if (loggerStream.stream) {
            loggerStream.stream.write(logEntry.trimRight() + '\n');
          }
        } catch (error) {
          if (loggerStream.stream) {
            loggerStream.stream.write(chunk.toString());
          }
        }
        cb(null);
      },
    });

    return Object.assign({}, loggerStream, { stream: logFmtWriteableStream });
  }
}

type FilteredKey = string | { name: string; regex: string };

// Ok to log clientid
const FILTERED_KEYS: FilteredKey[] = [
  'sid',
  'Authorization',
  // Any json attribute that contains the words "access" and "token" will have the attribute/value hidden
  { name: 'access_token', regex: 'access[^\'"]*token' },
  // Any json attribute that contains the words "refresh" and "token" will have the attribute/value hidden
  { name: 'refresh_token', regex: 'refresh[^\'"]*token' },
  'clientsecret',
  // Any json attribute that contains the words "sfdx", "auth", and "url" will have the attribute/value hidden
  { name: 'sfdxauthurl', regex: 'sfdx[^\'"]*auth[^\'"]*url' },
];

// SFDX code and plugins should never show tokens or connect app information in the logs
const _filter = (...args: unknown[]): unknown => {
  return args.map((arg) => {
    if (isArray(arg)) {
      return _filter(...arg);
    }

    if (arg) {
      let _arg: string;

      // Normalize all objects into a string. This include errors.
      if (arg instanceof Buffer) {
        _arg = '<Buffer>';
      } else if (isObject(arg)) {
        _arg = JSON.stringify(arg);
      } else if (isString(arg)) {
        _arg = arg;
      } else {
        _arg = '';
      }

      const HIDDEN = 'HIDDEN';

      FILTERED_KEYS.forEach((key: FilteredKey) => {
        let expElement = key;
        let expName = key;

        // Filtered keys can be strings or objects containing regular expression components.
        if (isPlainObject(key)) {
          expElement = key.regex;
          expName = key.name;
        }

        const hiddenAttrMessage = `"<${expName} - ${HIDDEN}>"`;

        // Match all json attribute values case insensitive: ex. {" Access*^&(*()^* Token " : " 45143075913458901348905 \n\t" ...}
        const regexTokens = new RegExp(`(['"][^'"]*${expElement}[^'"]*['"]\\s*:\\s*)['"][^'"]*['"]`, 'gi');

        _arg = _arg.replace(regexTokens, `$1${hiddenAttrMessage}`);

        // Match all key value attribute case insensitive: ex. {" key\t"    : ' access_token  ' , " value " : "  dsafgasr431 " ....}
        const keyRegex = new RegExp(
          `(['"]\\s*key\\s*['"]\\s*:)\\s*['"]\\s*${expElement}\\s*['"]\\s*.\\s*['"]\\s*value\\s*['"]\\s*:\\s*['"]\\s*[^'"]*['"]`,
          'gi'
        );
        _arg = _arg.replace(keyRegex, `$1${hiddenAttrMessage}`);
      });

      _arg = _arg.replace(/(00D\w{12,15})![.\w]*/, `<${HIDDEN}>`);

      // return an object if an object was logged; otherwise return the filtered string.
      return isObject(arg) ? parseJson(_arg) : _arg;
    } else {
      return arg;
    }
  });
};
