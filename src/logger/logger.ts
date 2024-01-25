/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'node:os';
import * as path from 'node:path';

import { Logger as PinoLogger, pino } from 'pino';
import { Env } from '@salesforce/kit';
import { isKeyOf, isString } from '@salesforce/ts-types';
import { Global, Mode } from '../global';
import { SfError } from '../sfError';
import { unwrapArray } from '../util/unwrapArray';
import { MemoryLogger } from './memoryLogger';
import { cleanup } from './cleanup';

/**
 * The common set of `Logger` options.
 */
export interface LoggerOptions {
  /**
   * The logger name.
   */
  name: string;

  /**
   * The desired log level.
   */
  level?: LoggerLevelValue;

  /**
   * Create a logger with the fields set
   */
  fields?: Fields;

  /** log to memory instead of to a file.  Intended for Unit Testing */
  useMemoryLogger?: boolean;
}

/**
 * Standard `Logger` levels.
 *
 * **See** {@link https://getpino.io/#/docs/api?id=logger-level |Logger Levels}
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
 * Any numeric `Logger` level.
 */
export type LoggerLevelValue = LoggerLevel | number;

/**
 * An object
 */
export type Fields = Record<string, unknown>;

/**
 * All possible field value types.
 */
export type FieldValue = string | number | boolean | Fields;

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
 * A logging abstraction powered by {@link https://github.com/pinojs/pino | Pino} that provides both a default
 * logger configuration that will log to the default path, and a way to create custom loggers based on the same foundation.
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
 *
 * // get a raw pino logger from the root instance of Logger
 * // you can use these to avoid constructing another Logger wrapper class and to get better type support
 * const logger = Logger.getRawRootLogger().child({name: 'foo', otherProp: 'bar'});
 * logger.info({some: 'stuff'}, 'a message');
 *
 *
 * // get a raw pino logger from the current instance
 * const childLogger = await Logger.child('myRootChild', {tag: 'value'});
 * const logger = childLogger.getRawLogger();
 * ```
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

  // The sfdx root logger singleton
  private static rootLogger?: Logger;

  private pinoLogger: PinoLogger;

  private memoryLogger?: MemoryLogger;
  /**
   * Constructs a new `Logger`.
   *
   * @param optionsOrName A set of `LoggerOptions` or name to use with the default options.
   *
   * **Throws** *{@link SfError}{ name: 'RedundantRootLoggerError' }* More than one attempt is made to construct the root
   * `Logger`.
   */
  public constructor(optionsOrName: LoggerOptions | string) {
    const enabled = process.env.SFDX_DISABLE_LOG_FILE !== 'true' && process.env.SF_DISABLE_LOG_FILE !== 'true';

    const options: LoggerOptions =
      typeof optionsOrName === 'string'
        ? { name: optionsOrName, level: Logger.DEFAULT_LEVEL, fields: {} }
        : optionsOrName;

    if (Logger.rootLogger && options.name === Logger.ROOT_NAME) {
      throw new SfError('Can not create another root logger.', 'RedundantRootLoggerError');
    }

    // if there is a rootLogger, use its Pino instance
    if (Logger.rootLogger) {
      this.pinoLogger = Logger.rootLogger.pinoLogger.child({ ...options.fields, name: options.name });
      this.memoryLogger = Logger.rootLogger.memoryLogger; // if the root was constructed with memory logging, keep that
      this.pinoLogger.trace(`Created '${options.name}' child logger instance`);
    } else {
      const level = computeLevel(options.level);
      const commonOptions = {
        name: options.name ?? Logger.ROOT_NAME,
        base: options.fields ?? {},
        level,
        enabled,
      };
      if (Boolean(options.useMemoryLogger) || Global.getEnvironmentMode() === Mode.TEST || !enabled) {
        this.memoryLogger = new MemoryLogger();
        this.pinoLogger = pino(commonOptions, this.memoryLogger);
      } else {
        this.pinoLogger = pino({
          ...commonOptions,
          transport: {
            pipeline: [
              {
                target: path.join('..', '..', 'lib', 'logger', 'transformStream'),
              },
              getWriteStream(level),
            ],
          },
        });
        // when a new file logger root is instantiated, we check for old log files.
        // but we don't want to wait for it
        // and it's async and we can't wait from a ctor anyway
        void cleanup();
      }

      Logger.rootLogger = this;
    }
  }

  /**
   *
   * Gets the root logger.  It's a singleton
   * See also getRawLogger if you don't need the root logger
   */
  public static async root(): Promise<Logger> {
    return Promise.resolve(this.getRoot());
  }

  /**
   * Gets the root logger.  It's a singleton
   */
  public static getRoot(): Logger {
    if (this.rootLogger) {
      return this.rootLogger;
    }
    const rootLogger = (this.rootLogger = new Logger(Logger.ROOT_NAME));
    return rootLogger;
  }

  /**
   * Destroys the root `Logger`.
   *
   * @ignore
   */
  public static destroyRoot(): void {
    if (this.rootLogger) {
      this.rootLogger = undefined;
    }
  }

  /**
   * Create a child of the root logger, inheriting this instance's configuration such as `level`, transports, etc.
   *
   * @param name The name of the child logger.
   * @param fields Additional fields included in all log lines.
   */
  public static async child(name: string, fields?: Fields): Promise<Logger> {
    return (await Logger.root()).child(name, fields);
  }

  /**
   * Create a child of the root logger, inheriting this instance's configuration such as `level`, transports, etc.
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

  /** get the bare (pino) logger instead of using the class hierarchy */
  public static getRawRootLogger(): PinoLogger {
    return Logger.getRoot().pinoLogger;
  }

  /** get the bare (pino) logger instead of using the class hierarchy */
  public getRawLogger(): PinoLogger {
    return this.pinoLogger;
  }

  /**
   * Gets the name of this logger.
   */
  public getName(): string {
    return (this.pinoLogger.bindings().name as string) ?? '';
  }

  /**
   * Gets the current level of this logger.
   */
  public getLevel(): LoggerLevelValue {
    return this.pinoLogger.levelVal;
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
    this.pinoLogger.level = this.pinoLogger.levels.labels[level] ?? this.pinoLogger.levels.labels[Logger.DEFAULT_LEVEL];
    return this;
  }

  /**
   * Compares the requested log level with the current log level.  Returns true if
   * the requested log level is greater than or equal to the current log level.
   *
   * @param level The requested log level to compare against the currently set log level.
   */
  public shouldLog(level: LoggerLevelValue): boolean {
    return (typeof level === 'string' ? this.pinoLogger.levelVal : level) >= this.getLevel();
  }

  /**
   * Gets an array of log line objects. Each element is an object that corresponds to a log line.
   */
  public getBufferedRecords(): LogLine[] {
    if (!this.memoryLogger) {
      throw new Error('getBufferedRecords is only supported when useMemoryLogging is true');
    }
    return (this.memoryLogger?.loggedData as unknown as LogLine[]) ?? [];
  }

  /**
   * Reads a text blob of all the log lines contained in memory or the log file.
   */
  public readLogContentsAsText(): string {
    if (this.memoryLogger) {
      return this.memoryLogger.loggedData.reduce((accum, line) => {
        accum += JSON.stringify(line) + os.EOL;
        return accum;
      }, '');
    } else {
      this.pinoLogger.warn(
        'readLogContentsAsText is not supported for file streams, only used when useMemoryLogging is true'
      );
      const content = '';
      return content;
    }
  }

  /**
   * Create a child logger, typically to add a few log record fields. For convenience this object is returned.
   *
   * @param name The name of the child logger that is emitted w/ log line.  Will be prefixed with the parent logger name and `:`
   * @param fields Additional fields included in all log lines for the child logger.
   */
  public child(name: string, fields: Fields = {}): Logger {
    const fullName = `${this.getName()}:${name}`;
    const child = new Logger({ name: fullName, fields });
    this.pinoLogger.trace(`Setup child '${fullName}' logger instance`);

    return child;
  }

  /**
   * Add a field to all log lines for this logger. For convenience `this` object is returned.
   *
   * @param name The name of the field to add.
   * @param value The value of the field to be logged.
   */
  public addField(name: string, value: FieldValue): Logger {
    this.pinoLogger.setBindings({ ...this.pinoLogger.bindings(), [name]: value });
    return this;
  }

  /**
   * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public trace(...args: any[]): Logger {
    this.pinoLogger.trace(unwrapArray(args));
    return this;
  }

  /**
   * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public debug(...args: unknown[]): Logger {
    this.pinoLogger.debug(unwrapArray(args));
    return this;
  }

  /**
   * Logs at `debug` level with filtering applied.
   *
   * @param cb A callback that returns on array objects to be logged.
   */
  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  public debugCallback(cb: () => unknown[] | string): void {}

  /**
   * Logs at `info` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public info(...args: unknown[]): Logger {
    this.pinoLogger.info(unwrapArray(args));
    return this;
  }

  /**
   * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public warn(...args: unknown[]): Logger {
    this.pinoLogger.warn(unwrapArray(args));
    return this;
  }

  /**
   * Logs at `error` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  public error(...args: unknown[]): Logger {
    this.pinoLogger.error(unwrapArray(args));
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
    this.pinoLogger.fatal(unwrapArray(args));
    return this;
  }
}

/** return various streams that the logger could send data to, depending on the options and env  */
const getWriteStream = (level = 'warn'): pino.TransportSingleOptions => {
  // used when debug mode, writes to stdout (colorized)
  if (process.env.DEBUG) {
    return {
      target: 'pino-pretty',
      options: { colorize: true },
    };
  }

  // default: we're writing to a rotating file
  const rotator = new Map([
    ['1m', new Date().toISOString().split(':').slice(0, 2).join('-')],
    ['1h', new Date().toISOString().split(':').slice(0, 1).join('-')],
    ['1d', new Date().toISOString().split('T')[0]],
  ]);
  const logRotationPeriod = new Env().getString('SF_LOG_ROTATION_PERIOD') ?? '1d';

  return {
    // write to a rotating file
    target: 'pino/file',
    options: {
      destination: path.join(Global.SF_DIR, `sf-${rotator.get(logRotationPeriod) ?? rotator.get('1d')}.log`),
      mkdir: true,
      level,
    },
  };
};

export const computeLevel = (optionsLevel?: number | string): string => {
  const env = new Env();
  const envValue = isNaN(env.getNumber('SF_LOG_LEVEL') ?? NaN)
    ? env.getString('SF_LOG_LEVEL')
    : env.getNumber('SF_LOG_LEVEL');

  if (typeof envValue !== 'undefined') {
    return typeof envValue === 'string' ? envValue : numberToLevel(envValue);
  }
  return levelFromOption(optionsLevel);
};

const levelFromOption = (value?: string | number): string => {
  switch (typeof value) {
    case 'number':
      return numberToLevel(value);
    case 'string':
      return value;
    default:
      return pino.levels.labels[Logger.DEFAULT_LEVEL];
  }
};
// /** match a number to a pino level, or if a match isn't found, the next highest level */
const numberToLevel = (level: number): string =>
  pino.levels.labels[level] ??
  Object.entries(pino.levels.labels).find(([value]) => Number(value) > level)?.[1] ??
  'warn';
