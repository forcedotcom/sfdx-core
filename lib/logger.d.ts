import { Writable } from 'stream';
/**
 * A Bunyan `Serializer` function.
 * @param input The input to be serialized.
 * **See** {@link https://github.com/forcedotcom/node-bunyan#serializers|Bunyan Serializers API}
 */
export declare type Serializer = (input: any) => any;
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
export declare enum LoggerLevel {
  TRACE = 10,
  DEBUG = 20,
  INFO = 30,
  WARN = 40,
  ERROR = 50,
  FATAL = 60
}
/**
 *  `Logger` format types.
 */
export declare enum LoggerFormat {
  JSON = 0,
  LOGFMT = 1
}
/**
 * A Bunyan stream configuration.
 *
 * @see {@link https://github.com/forcedotcom/node-bunyan#streams|Bunyan Streams}
 */
export interface LoggerStream {
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
  [key: string]: any;
}
/**
 * Any numeric `Logger` level.
 */
export declare type LoggerLevelValue = LoggerLevel | number;
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
export declare type FieldValue = string | number | boolean;
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
 * **See** https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_cli_log_messages.htm
 */
export declare class Logger {
  /**
   * The name of the root sfdx `Logger`.
   */
  static readonly ROOT_NAME = 'sfdx';
  /**
   * The default `LoggerLevel` when constructing new `Logger` instances.
   */
  static readonly DEFAULT_LEVEL = LoggerLevel.WARN;
  /**
   * A list of all lower case `LoggerLevel` names.
   *
   * **See** {@link LoggerLevel}
   */
  static readonly LEVEL_NAMES: string[];
  /**
   * Gets the root logger with the default level and file stream.
   */
  static root(): Promise<Logger>;
  /**
   * Destroys the root `Logger`.
   *
   * @ignore
   */
  static destroyRoot(): void;
  /**
   * Create a child of the root logger, inheriting this instance's configuration such as `level`, `streams`, etc.
   *
   * @param name The name of the child logger.
   * @param fields Additional fields included in all log lines.
   */
  static child(name: string, fields?: Fields): Promise<Logger>;
  /**
   * Gets a numeric `LoggerLevel` value by string name.
   *
   * @param {string} levelName The level name to convert to a `LoggerLevel` enum value.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnrecognizedLoggerLevelName' }* The level name was not case-insensitively recognized as a valid `LoggerLevel` value.
   * @see {@Link LoggerLevel}
   */
  static getLevelByName(levelName: string): LoggerLevelValue;
  private static readonly lifecycle;
  private static rootLogger?;
  private bunyan;
  private format;
  /**
   * Constructs a new `Logger`.
   *
   * @param optionsOrName A set of `LoggerOptions` or name to use with the default options.
   *
   * **Throws** *{@link SfdxError}{ name: 'RedundantRootLogger' }* More than one attempt is made to construct the root
   * `Logger`.
   */
  constructor(optionsOrName: LoggerOptions | string);
  /**
   * Adds a stream.
   *
   * @param stream The stream configuration to add.
   * @param defaultLevel The default level of the stream.
   */
  addStream(stream: LoggerStream, defaultLevel?: LoggerLevelValue): void;
  /**
   * Adds a file stream to this logger. Resolved or rejected upon completion of the addition.
   *
   * @param logFile The path to the log file.  If it doesn't exist it will be created.
   */
  addLogFileStream(logFile: string): Promise<void>;
  /**
   * Gets the name of this logger.
   */
  getName(): string;
  /**
   * Gets the current level of this logger.
   */
  getLevel(): LoggerLevelValue;
  /**
   * Set the logging level of all streams for this logger.  If a specific `level` is not provided, this method will
   * attempt to read it from the environment variable `SFDX_LOG_LEVEL`, and if not found,
   * {@link Logger.DEFAULT_LOG_LEVEL} will be used instead. For convenience `this` object is returned.
   *
   * @param {LoggerLevelValue} [level] The logger level.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnrecognizedLoggerLevelName' }* A value of `level` read from `SFDX_LOG_LEVEL`
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
  setLevel(level?: LoggerLevelValue): Logger;
  /**
   * Gets the underlying Bunyan logger.
   */
  getBunyanLogger(): any;
  /**
   * Compares the requested log level with the current log level.  Returns true if
   * the requested log level is greater than or equal to the current log level.
   *
   * @param level The requested log level to compare against the currently set log level.
   */
  shouldLog(level: LoggerLevelValue): boolean;
  /**
   * Use in-memory logging for this logger instance instead of any parent streams. Useful for testing.
   * For convenience this object is returned.
   *
   * **WARNING: This cannot be undone for this logger instance.**
   */
  useMemoryLogging(): Logger;
  /**
   * Gets an array of log line objects. Each element is an object that corresponds to a log line.
   */
  getBufferedRecords(): LogLine[];
  /**
   * Reads a text blob of all the log lines contained in memory or the log file.
   */
  readLogContentsAsText(): string;
  /**
   * Adds a filter to be applied to all logged messages.
   *
   * @param filter A function with signature `(...args: any[]) => any[]` that transforms log message arguments.
   */
  addFilter(filter: (...args: unknown[]) => unknown): void;
  /**
   * Close the logger, including any streams, and remove all listeners.
   *
   * @param fn A function with signature `(stream: LoggerStream) => void` to call for each stream with
   *                        the stream as an arg.
   */
  close(fn?: (stream: LoggerStream) => void): void;
  /**
   * Create a child logger, typically to add a few log record fields. For convenience this object is returned.
   *
   * @param name The name of the child logger that is emitted w/ log line as `log:<name>`.
   * @param fields Additional fields included in all log lines for the child logger.
   */
  child(name: string, fields?: Fields): Logger;
  /**
   * Add a field to all log lines for this logger. For convenience `this` object is returned.
   *
   * @param name The name of the field to add.
   * @param value The value of the field to be logged.
   */
  addField(name: string, value: FieldValue): Logger;
  /**
   * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  trace(...args: any[]): Logger;
  /**
   * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  debug(...args: unknown[]): Logger;
  /**
   * Logs at `debug` level with filtering applied.
   *
   * @param cb A callback that returns on array objects to be logged.
   */
  debugCallback(cb: () => unknown[] | string): void;
  /**
   * Logs at `info` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  info(...args: unknown[]): Logger;
  /**
   * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  warn(...args: unknown[]): Logger;
  /**
   * Logs at `error` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  error(...args: unknown[]): Logger;
  /**
   * Logs at `fatal` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  fatal(...args: unknown[]): Logger;
  private applyFilters;
  private uncaughtExceptionHandler;
  private exitHandler;
  private createLogFmtFormatterStream;
}
