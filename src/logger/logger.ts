/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { EventEmitter } from 'events';
import * as os from 'os';
// import * as path from 'path';
import { Writable } from 'stream';
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as Bunyan from '@salesforce/bunyan';
import {
  Env,
  // parseJsonMap
} from '@salesforce/kit';
import {
  // Dictionary,
  // ensure,
  // ensureNumber,
  // isFunction,
  isKeyOf,
  isString,
} from '@salesforce/ts-types';
// import * as Debug from 'debug';
import { pino } from 'pino';
import { isNumber } from 'lodash';
import { Global, Mode } from '../global';
import { SfError } from '../sfError';
import { unwrapArrray } from '../util/unwrapArrray';
import { rootLogger as baseLogger, getCustomLogger } from './logger2';

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

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
   * @deprecated LogFmt is no longer supported, only json
   * The logger format type. Current options include LogFmt or JSON (default).
   */
  format?: LoggerFormat;

  /**
   * @deprecated
   * The logger's serializers.
   */
  serializers?: Serializers;
  /**
   * @deprecated this was never implemented
   * Whether or not to log source file, line, and function information.
   */
  src?: boolean;
  /**
   * The desired log level.
   */
  level?: LoggerLevelValue;
  /**
   * @deprecated
   * A stream to write to.
   */
  stream?: Writable;
  /**
   * @deprecated
   * An array of streams to write to.
   */
  streams?: LoggerStream[];

  /** send log files somewhere besides the standard location.  useful for testing */
  customPath?: string;

  /** you want the Logger class constructed as a child and not a new logger */
  asChild?: boolean;
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
 * `Logger` format types.
 */
export enum LoggerFormat {
  JSON,
  LOGFMT,
}

/**
 * A Bunyan stream configuration.
 *
 * @deprecated
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
  // hostname: string;
  // pid: string;
  // log: string;
  level: number;
  msg: string;
  time: string;
  // v: number;
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
  private static readonly lifecycle = ((): EventEmitter => {
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

  public readonly logRotationPeriod = new Env().getString('SF_LOG_ROTATION_PERIOD') ?? '1d';

  /**
   * The number of backup rotated log files to keep.
   * Example: '3' will have the base sf.log file, and the past 3 (period) log files.
   * See 'count' docs here: https://github.com/forcedotcom/node-bunyan#stream-type-rotating-file
   */

  public readonly logRotationCount = new Env().getNumber('SF_LOG_ROTATION_COUNT') ?? 2;

  /**
   * Whether debug is enabled for this Logger.
   */
  public debugEnabled = false;

  // The actual Bunyan logger
  private actualLogger: pino.Logger;

  private customPath?: string;
  /**
   * Constructs a new `Logger`.
   *
   * @param optionsOrName A set of `LoggerOptions` or name to use with the default options.
   *
   * **Throws** *{@link SfError}{ name: 'RedundantRootLoggerError' }* More than one attempt is made to construct the root
   * `Logger`.
   */
  public constructor(optionsOrName: LoggerOptions | string) {
    const options: LoggerOptions =
      typeof optionsOrName === 'string'
        ? { name: optionsOrName, level: Logger.DEFAULT_LEVEL, serializers: Bunyan.stdSerializers }
        : optionsOrName;

    this.customPath = options.customPath;

    if (Logger.rootLogger && options.name === Logger.ROOT_NAME) {
      throw new SfError('Can not create another root logger.', 'RedundantRootLoggerError');
    }

    this.actualLogger =
      this.customPath || (!options.asChild && options.name && options.name !== Logger.ROOT_NAME)
        ? getCustomLogger({ customPath: this.customPath, name: options.name })
        : baseLogger;

    if (options.format) {
      this.actualLogger.warn(options.streams ?? options.stream, 'Log format is no longer supported.');
    }
    if (options.streams || options.stream) {
      this.actualLogger.warn(options.streams ?? options.stream, 'Setting streams on the logger is deprecated.');
    }

    // all SFDX loggers must filter sensitive data
    // this.addFilter((...args) => filterSecrets(...args));

    if (Global.getEnvironmentMode() !== Mode.TEST) {
      Logger.lifecycle.on('uncaughtException', this.uncaughtExceptionHandler);
      Logger.lifecycle.on('exit', this.exitHandler);
    }

    this.actualLogger.trace(options, `Created '${this.getName()}' logger instance`);
  }

  /**
   * Gets the root logger with the default level, file stream, and DEBUG enabled.
   */
  public static async root(): Promise<Logger> {
    if (this.rootLogger) {
      // this.rootLogger.trace('Was asked for a root logger, one already exists, so using that');
      return this.rootLogger;
    }
    const rootLogger = (this.rootLogger = new Logger(Logger.ROOT_NAME).setLevel());
    rootLogger.warn('Made a new root logger.');

    // disable log file writing, if applicable
    const disableLogFile = new Env().getString('SF_DISABLE_LOG_FILE');
    if (disableLogFile !== 'true' && Global.getEnvironmentMode() !== Mode.TEST) {
      await rootLogger.addLogFileStream(Global.LOG_FILE_PATH);
    }

    // rootLogger.enableDEBUG();
    return rootLogger;
  }

  /**
   * Gets the root logger with the default level, file stream, and DEBUG enabled.
   */
  public static getRoot(): Logger {
    if (!this.rootLogger) {
      this.rootLogger = new Logger(Logger.ROOT_NAME);
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
   * @deprecated no replacement yet
   *
   * @param stream The stream configuration to add.
   * @param defaultLevel The default level of the stream.
   */
  // eslint-disable-next-line class-methods-use-this
  public addStream(stream: LoggerStream, defaultLevel?: LoggerLevelValue): void {
    // if (this.format === LoggerFormat.LOGFMT) {
    //   stream = this.createLogFmtFormatterStream(stream);
    // }
    // this.bunyan.addStream(stream, defaultLevel);
  }

  /**
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @deprecated no replacement yet
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  // eslint-disable-next-line class-methods-use-this
  public async addLogFileStream(logFile: string): Promise<void> {
    // try {
    //   // Check if we have write access to the log file (i.e., we created it already)
    //   await fs.promises.access(logFile, fs.constants.W_OK);
    // } catch (err1) {
    //   try {
    //     if (process.platform === 'win32') {
    //       await fs.promises.mkdir(path.dirname(logFile), { recursive: true });
    //     } else {
    //       await fs.promises.mkdir(path.dirname(logFile), { recursive: true, mode: 0o700 });
    //     }
    //   } catch (err2) {
    //     throw SfError.wrap(err2 as string | Error);
    //   }
    //   try {
    //     await fs.promises.writeFile(logFile, '', { mode: '600' });
    //   } catch (err3) {
    //     throw SfError.wrap(err3 as string | Error);
    //   }
    // }
    // // avoid multiple streams to same log file
    // if (
    //   !this.bunyan.streams.find(
    //     // No bunyan typings
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (stream: any) => stream.type === 'rotating-file' && stream.path === logFile
    //   )
    // ) {
    //   this.addStream({
    //     type: 'rotating-file',
    //     path: logFile,
    //     period: this.logRotationPeriod,
    //     count: this.logRotationCount,
    //     level: this.bunyan.level(),
    //   });
    // }
  }

  /**
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @deprecated no replacement yet
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  // eslint-disable-next-line class-methods-use-this
  public addLogFileStreamSync(logFile: string): void {
    // try {
    //   // Check if we have write access to the log file (i.e., we created it already)
    //   fs.accessSync(logFile, fs.constants.W_OK);
    // } catch (err1) {
    //   try {
    //     fs.mkdirSync(path.dirname(logFile), {
    //       recursive: true,
    //       ...(process.platform === 'win32' ? {} : { mode: 0o700 }),
    //     });
    //   } catch (err2) {
    //     throw SfError.wrap(err2 as Error);
    //   }
    //   try {
    //     fs.writeFileSync(logFile, '', { mode: '600' });
    //   } catch (err3) {
    //     throw SfError.wrap(err3 as string | Error);
    //   }
    // }
    // // avoid multiple streams to same log file
    // if (
    //   !this.bunyan.streams.find(
    //     // No bunyan typings
    //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //     (stream: any) => stream.type === 'rotating-file' && stream.path === logFile
    //   )
    // ) {
    //   this.addStream({
    //     type: 'rotating-file',
    //     path: logFile,
    //     period: this.logRotationPeriod,
    //     count: this.logRotationCount,
    //     level: this.bunyan.level(),
    //   });
    // }
  }

  /**
   * Gets the name of this logger.
   */
  public getName(): string {
    return this.actualLogger.bindings().name;
  }

  /**
   * Gets the current level of this logger.
   */
  public getLevel(): LoggerLevelValue {
    return this.actualLogger.levels.values[this.actualLogger.level];
  }

  /**
   * Set the logging level of all streams for this logger.  If a specific `level` is not provided, this method will
   * attempt to read it from the environment variable `SFDX_LOG_LEVEL`, and if not found,
   * {@link Logger.DEFAULT_LOG_LEVEL} will be used instead. For convenience `this` object is returned.
   *
   * @deprecated no replacement yet
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
  // eslint-disable-next-line class-methods-use-this
  public setLevel(level?: LoggerLevelValue): Logger {
    if (!isNumber(level)) {
      const logLevelFromEnvVar = new Env().getString('SF_LOG_LEVEL');
      level = logLevelFromEnvVar ? Logger.getLevelByName(logLevelFromEnvVar) : Logger.DEFAULT_LEVEL;
    }
    this.actualLogger.level = this.actualLogger.levels.labels[level];
    return this;
  }

  /**
   * Gets the underlying Bunyan logger.
   */
  // leave this typed as any to keep if from trying to export the type from the untyped bunyan module
  // this prevents consumers from getting node_modules/@salesforce/core/lib/logger.d.ts:281:24 - error TS2304: Cannot find name 'Bunyan'.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  public getBunyanLogger(): typeof baseLogger {
    return this.actualLogger;
  }

  /**
   * Compares the requested log level with the current log level.  Returns true if
   * the requested log level is greater than or equal to the current log level.
   *
   * @param level The requested log level to compare against the currently set log level.
   */
  public shouldLog(level: LoggerLevelValue): boolean {
    return this.actualLogger.isLevelEnabled(this.actualLogger.levels.labels[level]);

    // if (typeof level === 'string') {
    //   level = Bunyan.levelFromName(level) as number;
    // }
    // return level >= this.getLevel();
  }

  /**
   * @deprecated no replacement yet
   * Use in-memory logging for this logger instance instead of any parent streams. Useful for testing.
   * For convenience this object is returned.
   *
   * **WARNING: This cannot be undone for this logger instance.**
   */
  public useMemoryLogging(): Logger {
    // this.bunyan.streams = [];
    // this.bunyan.ringBuffer = new Bunyan.RingBuffer({ limit: 5000 });
    // this.addStream({
    //   type: 'raw',
    //   stream: this.bunyan.ringBuffer,
    //   level: this.bunyan.level(),
    // });
    return this;
  }

  /**
   *
   * Gets an array of log line objects. Each element is an object that corresponds to a log line.
   */
  // eslint-disable-next-line class-methods-use-this
  public getBufferedRecords(): LogLine[] {
    if (this.customPath) {
      return fs
        .readFileSync(this.customPath, 'utf8')
        .split(os.EOL)
        .map((line) => JSON.parse(line) as LogLine);
    }

    return [];
  }

  /**
   * Reads a text blob of all the log lines contained in memory or the log file.
   *
   * @deprecated no replacement yet
   */
  // eslint-disable-next-line class-methods-use-this
  public readLogContentsAsText(): string {
    if (this.customPath) {
      return fs.readFileSync(this.customPath, 'utf8');
    }

    return '';
  }

  /**
   * Adds a filter to be applied to all logged messages.
   *
   * @deprecated no replacement yet
   *
   * @param filter A function with signature `(...args: any[]) => any[]` that transforms log message arguments.
   */
  // eslint-disable-next-line class-methods-use-this
  public addFilter(filter: (...args: unknown[]) => unknown): void {
    // if (!this.bunyan.filters) {
    //   this.bunyan.filters = [];
    // }
    // this.bunyan.filters.push(filter);
  }

  /**
   * @deprecated no replacement yet
   * Close the logger, including any streams, and remove all listeners.
   *
   * @param fn A function with signature `(stream: LoggerStream) => void` to call for each stream with the stream as an arg.
   */
  // eslint-disable-next-line class-methods-use-this
  public close(fn?: (stream: LoggerStream) => void): void {
    // if (this.bunyan.streams) {
    //   try {
    //     this.bunyan.streams.forEach((entry: LoggerStream) => {
    //       if (fn) {
    //         fn(entry);
    //       }
    //       // close file streams, flush buffer to disk
    //       // eslint-disable-next-line @typescript-eslint/unbound-method
    //       if (entry.type === 'file' && entry.stream && isFunction(entry.stream.end)) {
    //         entry.stream.end();
    //       }
    //     });
    //   } finally {
    //     Logger.lifecycle.removeListener('uncaughtException', this.uncaughtExceptionHandler);
    //     Logger.lifecycle.removeListener('exit', this.exitHandler);
    //   }
    // }
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

    const child = new Logger({ name, asChild: true });
    // only support including additional fields on log line (no config)
    child.actualLogger = this.actualLogger.child({ ...fields, name });

    this.trace(`Setup child '${name}' logger instance`);

    return child;
  }

  /**
   * Add a field to all log lines for this logger. For convenience `this` object is returned.
   *
   * @deprecated use `child` instead
   *
   * @param name The name of the field to add.
   * @param value The value of the field to be logged.
   */
  public addField(name: string, value: FieldValue): Logger {
    // this.bunyan.fields[name] = value;
    return this;
  }

  /**
   * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public trace(...args: any[]): Logger {
    this.actualLogger.trace(unwrapArrray(args));
    return this;
  }

  /**
   * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public debug(...args: any[]): Logger {
    this.actualLogger.debug(unwrapArrray(args));
    return this;
  }

  /**
   * Logs at `debug` level with filtering applied.
   *
   * @param cb A callback that returns on array objects to be logged.
   */
  // eslint-disable-next-line class-methods-use-this
  public debugCallback(cb: () => unknown[] | string): void {
    // if (this.getLevel() === LoggerLevel.DEBUG || process.env.DEBUG) {
    //   const result = cb();
    //   if (isArray(result)) {
    //     this.actualLogger.debug(this.applyFilters(LoggerLevel.DEBUG, ...result));
    //   } else {
    //     this.actualLogger.debug(this.applyFilters(LoggerLevel.DEBUG, ...[result]));
    //   }
    // }
  }

  /**
   * Logs at `info` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public info(...args: any[]): Logger {
    this.actualLogger.info(unwrapArrray(args));
    return this;
  }

  /**
   * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public warn(...args: any[]): Logger {
    this.actualLogger.warn(unwrapArrray(args));
    return this;
  }

  /**
   * Logs at `error` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public error(...args: any[]): Logger {
    this.actualLogger.error(unwrapArrray(args));
    return this;
  }

  /**
   * Logs at `fatal` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public fatal(...args: any[]): Logger {
    // always show fatal to stderr
    // IMPORTANT:
    // Do not use console.error() here, if fatal() is called from the uncaughtException handler, it
    // will be re-thrown and caught again by the uncaughtException handler, causing an infinite loop.
    console.log(unwrapArrray(args)); // eslint-disable-line no-console
    this.actualLogger.fatal(unwrapArrray(args));
    return this;
  }

  /**
   * @deprecated.  It's built into the logger2 streams now.
   *
   * Enables logging to stdout when the DEBUG environment variable is used. It uses the logger
   * name as the debug name, so you can do DEBUG=<logger-name> to filter the results to your logger.
   */
  // eslint-disable-next-line class-methods-use-this
  public enableDEBUG(): void {
    // // The debug library does this for you, but no point setting up the stream if it isn't there
    // if (process.env.DEBUG && !this.debugEnabled) {
    //   const debuggers: Dictionary<Debug.IDebugger> = {};
    //   debuggers.core = Debug(`${this.getName()}:core`);
    //   this.addStream({
    //     name: 'debug',
    //     stream: new Writable({
    //       write: (chunk, encoding, next) => {
    //         try {
    //           // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    //           const json = parseJsonMap(chunk.toString());
    //           const logLevel = ensureNumber(json.level);
    //           if (this.getLevel() <= logLevel) {
    //             let debuggerName = 'core';
    //             if (isString(json.log)) {
    //               debuggerName = json.log;
    //               if (!debuggers[debuggerName]) {
    //                 debuggers[debuggerName] = Debug(`${this.getName()}:${debuggerName}`);
    //               }
    //             }
    //             const level = LoggerLevel[logLevel];
    //             ensure(debuggers[debuggerName])(`${level} ${json.msg}`);
    //           }
    //         } catch (err) {
    //           // do nothing
    //         }
    //         next();
    //       },
    //     }),
    //     // Consume all levels
    //     level: 0,
    //   });
    //   this.debugEnabled = true;
    // }
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
}
