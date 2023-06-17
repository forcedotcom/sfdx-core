/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { EventEmitter } from 'events';
import { Writable } from 'stream';
import { Env } from '@salesforce/kit';
import { isKeyOf, isString } from '@salesforce/ts-types';
import { Logger as PinoLogger } from 'pino';
import { SfError } from '../sfError';
import { Global, Mode } from '../global';
import { rootLogger } from './logger';

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */

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
  asChild: boolean;
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
 * `Logger` format types.
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

  // the actual logger this class is wrapping
  private pino!: PinoLogger;

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
        asChild: false,
      };
    } else {
      options = optionsOrName;
    }

    if (options.asChild) {
      // let Logger.child handle setting the child
    } else {
      this.pino = rootLogger;
    }

    if (Logger.rootLogger && options.name === Logger.ROOT_NAME) {
      throw new SfError('Can not create another root logger.', 'RedundantRootLoggerError');
    }

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
    const newRootLogger = (this.rootLogger = new Logger(Logger.ROOT_NAME).setLevel());

    // disable log file writing, if applicable
    const disableLogFile = new Env().getString('SF_DISABLE_LOG_FILE');
    if (disableLogFile !== 'true' && Global.getEnvironmentMode() !== Mode.TEST) {
      await newRootLogger.addLogFileStream(Global.LOG_FILE_PATH);
    }

    newRootLogger.enableDEBUG();
    return newRootLogger;
  }

  /**
   * Gets the root logger with the default level, file stream, and DEBUG enabled.
   */
  public static getRoot(): Logger {
    if (this.rootLogger) {
      return this.rootLogger;
    }
    const newRootLogger = (this.rootLogger = new Logger(Logger.ROOT_NAME).setLevel());

    // disable log file writing, if applicable
    if (process.env.SFDX_DISABLE_LOG_FILE !== 'true' && Global.getEnvironmentMode() !== Mode.TEST) {
      newRootLogger.addLogFileStreamSync(Global.LOG_FILE_PATH);
    }

    newRootLogger.enableDEBUG();
    return newRootLogger;
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
   * @deprecated
   * Adds a stream.
   *
   * @param stream The stream configuration to add.
   * @param defaultLevel The default level of the stream.
   */
  public addStream(stream: LoggerStream, defaultLevel?: LoggerLevelValue): void {
    this.warn('manipulating streams on a logger is no longer supported');
  }

  /**
   * @deprecated
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async addLogFileStream(logFile: string): Promise<void> {
    this.warn('manipulating streams on a logger is no longer supported');
  }

  /**
   * @deprecated
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  public addLogFileStreamSync(logFile: string): void {
    this.warn('manipulating streams on a logger is no longer supported');
  }

  /**
   * Gets the name of this logger.
   */
  public getName(): string {
    return this.pino.bindings().name;
  }

  /**
   * Gets the current level of this logger.
   */
  public getLevel(): LoggerLevelValue {
    return this.pino.levels.values[this.pino.level];
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
      const logLevelFromEnvVar = new Env().getString('SF_LOG_LEVEL');
      level = logLevelFromEnvVar ? Logger.getLevelByName(logLevelFromEnvVar) : Logger.DEFAULT_LEVEL;
    }
    this.pino.level = this.pino.levels.labels[level];
    return this;
  }

  /**
   * @deprecated
   * Gets the underlying logger, which is no longer Bunyan.
   */
  // leave this typed as any to keep if from trying to export the type from the untyped bunyan module
  // this prevents consumers from getting node_modules/@salesforce/core/lib/logger.d.ts:281:24 - error TS2304: Cannot find name 'Bunyan'.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  public getBunyanLogger(): any {
    return this.pino;
  }

  /**
   * Compares the requested log level with the current log level.  Returns true if
   * the requested log level is greater than or equal to the current log level.
   *
   * @param level The requested log level to compare against the currently set log level.
   */
  public shouldLog(level: LoggerLevelValue): boolean {
    return this.pino.isLevelEnabled(this.pino.levels.labels[level]);
  }

  /**
   * @deprecated
   * Use in-memory logging for this logger instance instead of any parent streams. Useful for testing.
   * For convenience this object is returned.
   *
   * **WARNING: This cannot be undone for this logger instance.**
   */
  public useMemoryLogging(): Logger {
    return this;
  }

  /**
   * @deprecated
   * Gets an array of log line objects. Each element is an object that corresponds to a log line.
   */
  // eslint-disable-next-line class-methods-use-this
  public getBufferedRecords(): LogLine[] {
    return [];
  }

  /**
   * @deprecated
   *
   * Reads a text blob of all the log lines contained in memory or the log file.
   */
  public readLogContentsAsText(): string {
    this.warn('readLogContentsAsText is no longer supported.  It always returns empty strings');
    return '';
  }

  /**
   * @deprecated
   * Adds a filter to be applied to all logged messages.
   *
   * @param filter A function with signature `(...args: any[]) => any[]` that transforms log message arguments.
   */
  public addFilter(filter: (...args: unknown[]) => unknown): void {
    this.warn('addFilter is deprecated and does nothing');
  }

  /**
   * @deprecated
   * Close the logger, including any streams, and remove all listeners.
   *
   * @param fn A function with signature `(stream: LoggerStream) => void` to call for each stream with the stream as an arg.
   */
  public close(fn?: (stream: LoggerStream) => void): void {
    this.warn('closing a logger is deprecated and does nothing');
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

    const child = new Logger({ name, asChild: true });
    // only support including additional fields on log line (no config)
    child.pino = this.pino.child({ ...fields, name });
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
    this.pino.setBindings({ ...this.pino.bindings(), [name]: value });
    return this;
  }

  /**
   * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public trace(...args: any[]): Logger {
    // @ts-expect-error leaving args typed as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.pino.trace(...args);
    return this;
  }

  /**
   * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public debug(...args: unknown[]): Logger {
    // @ts-expect-error leaving args typed as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.pino.debug(...args);
    return this;
  }

  /**
   * @deprecated
   * Logs at `debug` level with filtering applied.
   *
   * @param cb A callback that returns on array objects to be logged.
   */
  public debugCallback(cb: () => unknown[] | string): void {
    this.pino.warn('debugCallback is deprecated and does nothing');
  }

  /**
   * Logs at `info` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public info(...args: unknown[]): Logger {
    // @ts-expect-error leaving args typed as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.pino.info(...args);
    return this;
  }

  /**
   * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public warn(...args: unknown[]): Logger {
    // @ts-expect-error leaving args typed as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.pino.warn(...args);
    return this;
  }

  /**
   * Logs at `error` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public error(...args: unknown[]): Logger {
    // @ts-expect-error leaving args typed as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.pino.error(...args);
    return this;
  }

  /**
   * Logs at `fatal` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public fatal(...args: unknown[]): Logger {
    // always show fatal to stderr
    // IMPORTANT:
    // Do not use console.error() here, if fatal() is called from the uncaughtException handler, it
    // will be re-thrown and caught again by the uncaughtException handler, causing an infinite loop.
    console.log(...args); // eslint-disable-line no-console
    // @ts-expect-error leaving args typed as any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.pino.fatal(...args);
    return this;
  }

  /**
   * @deprecated
   * Enables logging to stdout when the DEBUG environment variable is used. It uses the logger
   * name as the debug name, so you can do DEBUG=<logger-name> to filter the results to your logger.
   */
  public enableDEBUG(): void {
    // The debug library does this for you, but no point setting up the stream if it isn't there
    this.pino.warn('enableDEBUG is deprecated and does nothing');
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
