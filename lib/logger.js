/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// tslint:disable-next-line:ordered-imports
// @ts-ignore No typings available for our copy of bunyan
import * as Bunyan from '@salesforce/bunyan';
import { parseJson, parseJsonMap } from '@salesforce/kit';
import {
  ensure,
  ensureNumber,
  isArray,
  isFunction,
  isKeyOf,
  isObject,
  isPlainObject,
  isString
} from '@salesforce/ts-types';
import * as Debug from 'debug';
import { EventEmitter } from 'events';
import * as os from 'os';
import * as path from 'path';
import { Writable } from 'stream';
import { Global, Mode } from './global';
import { SfdxError } from './sfdxError';
import { fs } from './util/fs';
/**
 * Standard `Logger` levels.
 *
 * **See** {@link https://github.com/forcedotcom/node-bunyan#levels|Bunyan Levels}
 */
export var LoggerLevel;
(function(LoggerLevel) {
  LoggerLevel[(LoggerLevel['TRACE'] = 10)] = 'TRACE';
  LoggerLevel[(LoggerLevel['DEBUG'] = 20)] = 'DEBUG';
  LoggerLevel[(LoggerLevel['INFO'] = 30)] = 'INFO';
  LoggerLevel[(LoggerLevel['WARN'] = 40)] = 'WARN';
  LoggerLevel[(LoggerLevel['ERROR'] = 50)] = 'ERROR';
  LoggerLevel[(LoggerLevel['FATAL'] = 60)] = 'FATAL';
})(LoggerLevel || (LoggerLevel = {}));
/**
 *  `Logger` format types.
 */
export var LoggerFormat;
(function(LoggerFormat) {
  LoggerFormat[(LoggerFormat['JSON'] = 0)] = 'JSON';
  LoggerFormat[(LoggerFormat['LOGFMT'] = 1)] = 'LOGFMT';
})(LoggerFormat || (LoggerFormat = {}));
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
export class Logger {
  /**
   * Constructs a new `Logger`.
   *
   * @param optionsOrName A set of `LoggerOptions` or name to use with the default options.
   *
   * **Throws** *{@link SfdxError}{ name: 'RedundantRootLogger' }* More than one attempt is made to construct the root
   * `Logger`.
   */
  constructor(optionsOrName) {
    this.uncaughtExceptionHandler = err => {
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
    this.exitHandler = () => {
      this.close();
    };
    let options;
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
    // Inspect format to know what logging format to use then delete from options to
    // ensure it doesn't conflict with Bunyan.
    this.format = options.format || LoggerFormat.JSON;
    delete options.format;
    // If the log format is LOGFMT, we need to convert any stream(s) into a LOGFMT type stream.
    if (this.format === LoggerFormat.LOGFMT && options.stream) {
      const ls = this.createLogFmtFormatterStream({ stream: options.stream });
      options.stream = ls.stream;
    }
    if (this.format === LoggerFormat.LOGFMT && options.streams) {
      const logFmtConvertedStreams = [];
      options.streams.forEach(ls => {
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
   * Gets the root logger with the default level and file stream.
   */
  static async root() {
    if (this.rootLogger) {
      return this.rootLogger;
    }
    const rootLogger = (this.rootLogger = new Logger(Logger.ROOT_NAME).setLevel());
    // disable log file writing, if applicable
    if (process.env.SFDX_DISABLE_LOG_FILE !== 'true' && Global.getEnvironmentMode() !== Mode.TEST) {
      await rootLogger.addLogFileStream(Global.LOG_FILE_PATH);
    }
    // The debug library does this for you, but no point setting up the stream if it isn't there
    if (process.env.DEBUG) {
      const debuggers = {};
      debuggers.core = Debug(`${rootLogger.getName()}:core`);
      rootLogger.addStream({
        name: 'debug',
        stream: new Writable({
          write: (chunk, encoding, next) => {
            const json = parseJsonMap(chunk.toString());
            let debuggerName = 'core';
            if (isString(json.log)) {
              debuggerName = json.log;
              if (!debuggers[debuggerName]) {
                debuggers[debuggerName] = Debug(`${rootLogger.getName()}:${debuggerName}`);
              }
            }
            const level = LoggerLevel[ensureNumber(json.level)];
            ensure(debuggers[debuggerName])(`${level} ${json.msg}`);
            next();
          }
        }),
        // Consume all levels
        level: 0
      });
    }
    return rootLogger;
  }
  /**
   * Destroys the root `Logger`.
   *
   * @ignore
   */
  static destroyRoot() {
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
  static async child(name, fields) {
    return (await Logger.root()).child(name, fields);
  }
  /**
   * Gets a numeric `LoggerLevel` value by string name.
   *
   * @param {string} levelName The level name to convert to a `LoggerLevel` enum value.
   *
   * **Throws** *{@link SfdxError}{ name: 'UnrecognizedLoggerLevelName' }* The level name was not case-insensitively recognized as a valid `LoggerLevel` value.
   * @see {@Link LoggerLevel}
   */
  static getLevelByName(levelName) {
    levelName = levelName.toUpperCase();
    if (!isKeyOf(LoggerLevel, levelName)) {
      throw new SfdxError('UnrecognizedLoggerLevelName');
    }
    return LoggerLevel[levelName];
  }
  /**
   * Adds a stream.
   *
   * @param stream The stream configuration to add.
   * @param defaultLevel The default level of the stream.
   */
  addStream(stream, defaultLevel) {
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
  async addLogFileStream(logFile) {
    try {
      // Check if we have write access to the log file (i.e., we created it already)
      await fs.access(logFile, fs.constants.W_OK);
    } catch (err1) {
      try {
        await fs.mkdirp(path.dirname(logFile), {
          mode: fs.DEFAULT_USER_DIR_MODE
        });
      } catch (err2) {
        // noop; directory exists already
      }
      try {
        await fs.writeFile(logFile, '', { mode: fs.DEFAULT_USER_FILE_MODE });
      } catch (err3) {
        throw SfdxError.wrap(err3);
      }
    }
    // avoid multiple streams to same log file
    if (
      !this.bunyan.streams.find(
        // tslint:disable-next-line:no-any No bunyan typings
        stream => stream.type === 'file' && stream.path === logFile
      )
    ) {
      // TODO: rotating-file
      // https://github.com/trentm/node-bunyan#stream-type-rotating-file
      this.addStream({
        type: 'file',
        path: logFile,
        level: this.bunyan.level()
      });
    }
  }
  /**
   * Gets the name of this logger.
   */
  getName() {
    return this.bunyan.name;
  }
  /**
   * Gets the current level of this logger.
   */
  getLevel() {
    return this.bunyan.level();
  }
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
  setLevel(level) {
    if (level == null) {
      level = process.env.SFDX_LOG_LEVEL ? Logger.getLevelByName(process.env.SFDX_LOG_LEVEL) : Logger.DEFAULT_LEVEL;
    }
    this.bunyan.level(level);
    return this;
  }
  /**
   * Gets the underlying Bunyan logger.
   */
  // tslint:disable-next-line:no-any
  getBunyanLogger() {
    return this.bunyan;
  }
  /**
   * Compares the requested log level with the current log level.  Returns true if
   * the requested log level is greater than or equal to the current log level.
   *
   * @param level The requested log level to compare against the currently set log level.
   */
  shouldLog(level) {
    if (typeof level === 'string') {
      level = Bunyan.levelFromName(level);
    }
    return level >= this.getLevel();
  }
  /**
   * Use in-memory logging for this logger instance instead of any parent streams. Useful for testing.
   * For convenience this object is returned.
   *
   * **WARNING: This cannot be undone for this logger instance.**
   */
  useMemoryLogging() {
    this.bunyan.streams = [];
    this.bunyan.ringBuffer = new Bunyan.RingBuffer({ limit: 5000 });
    this.addStream({
      type: 'raw',
      stream: this.bunyan.ringBuffer,
      level: this.bunyan.level()
    });
    return this;
  }
  /**
   * Gets an array of log line objects. Each element is an object that corresponds to a log line.
   */
  getBufferedRecords() {
    if (this.bunyan.ringBuffer) {
      return this.bunyan.ringBuffer.records;
    }
    return [];
  }
  /**
   * Reads a text blob of all the log lines contained in memory or the log file.
   */
  readLogContentsAsText() {
    if (this.bunyan.ringBuffer) {
      return this.getBufferedRecords().reduce((accum, line) => {
        accum += JSON.stringify(line) + os.EOL;
        return accum;
      }, '');
    } else {
      let content = '';
      // tslint:disable-next-line:no-any No bunyan typings
      this.bunyan.streams.forEach(async stream => {
        if (stream.type === 'file') {
          content += await fs.readFile(stream.path, 'utf8');
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
  addFilter(filter) {
    // tslint:disable-line:no-any
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
  close(fn) {
    if (this.bunyan.streams) {
      try {
        this.bunyan.streams.forEach(entry => {
          if (fn) {
            fn(entry);
          }
          // close file streams, flush buffer to disk
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
  child(name, fields = {}) {
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
   * Add a field to all log lines for this logger. For convenience `this` object is returned.
   *
   * @param name The name of the field to add.
   * @param value The value of the field to be logged.
   */
  addField(name, value) {
    this.bunyan.fields[name] = value;
    return this;
  }
  /**
   * Logs at `trace` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  // tslint:disable-next-line:no-any
  trace(...args) {
    this.bunyan.trace(this.applyFilters(LoggerLevel.TRACE, ...args));
    return this;
  }
  /**
   * Logs at `debug` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  debug(...args) {
    this.bunyan.debug(this.applyFilters(LoggerLevel.DEBUG, ...args));
    return this;
  }
  /**
   * Logs at `debug` level with filtering applied.
   *
   * @param cb A callback that returns on array objects to be logged.
   */
  debugCallback(cb) {
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
  info(...args) {
    this.bunyan.info(this.applyFilters(LoggerLevel.INFO, ...args));
    return this;
  }
  /**
   * Logs at `warn` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  warn(...args) {
    this.bunyan.warn(this.applyFilters(LoggerLevel.WARN, ...args));
    return this;
  }
  /**
   * Logs at `error` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  error(...args) {
    this.bunyan.error(this.applyFilters(LoggerLevel.ERROR, ...args));
    return this;
  }
  /**
   * Logs at `fatal` level with filtering applied. For convenience `this` object is returned.
   *
   * @param args Any number of arguments to be logged.
   */
  fatal(...args) {
    // always show fatal to stderr
    console.error(...args);
    this.bunyan.fatal(this.applyFilters(LoggerLevel.FATAL, ...args));
    return this;
  }
  applyFilters(logLevel, ...args) {
    if (this.shouldLog(logLevel)) {
      // tslint:disable-next-line:no-any No bunyan typings
      this.bunyan.filters.forEach(filter => (args = filter(...args)));
    }
    return args && args.length === 1 ? args[0] : args;
  }
  createLogFmtFormatterStream(loggerStream) {
    const logFmtWriteableStream = new Writable({
      write: (chunk, enc, cb) => {
        try {
          const parsedJSON = JSON.parse(chunk.toString());
          const keys = Object.keys(parsedJSON);
          let logEntry = '';
          keys.forEach(key => {
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
      }
    });
    return Object.assign({}, loggerStream, { stream: logFmtWriteableStream });
  }
}
/**
 * The name of the root sfdx `Logger`.
 */
Logger.ROOT_NAME = 'sfdx';
/**
 * The default `LoggerLevel` when constructing new `Logger` instances.
 */
Logger.DEFAULT_LEVEL = LoggerLevel.WARN;
/**
 * A list of all lower case `LoggerLevel` names.
 *
 * **See** {@link LoggerLevel}
 */
Logger.LEVEL_NAMES = Object.values(LoggerLevel)
  .filter(isString)
  .map(v => v.toLowerCase());
// Rollup all instance-specific process event listeners together to prevent global `MaxListenersExceededWarning`s.
Logger.lifecycle = (() => {
  const events = new EventEmitter();
  events.setMaxListeners(0); // never warn on listener counts
  process.on('uncaughtException', err => events.emit('uncaughtException', err));
  process.on('exit', () => events.emit('exit'));
  return events;
})();
// Ok to log clientid
const FILTERED_KEYS = [
  'sid',
  'Authorization',
  // Any json attribute that contains the words "access" and "token" will have the attribute/value hidden
  { name: 'access_token', regex: 'access[^\'"]*token' },
  // Any json attribute that contains the words "refresh" and "token" will have the attribute/value hidden
  { name: 'refresh_token', regex: 'refresh[^\'"]*token' },
  'clientsecret',
  // Any json attribute that contains the words "sfdx", "auth", and "url" will have the attribute/value hidden
  { name: 'sfdxauthurl', regex: 'sfdx[^\'"]*auth[^\'"]*url' }
];
// SFDX code and plugins should never show tokens or connect app information in the logs
const _filter = (...args) => {
  return args.map(arg => {
    if (isArray(arg)) {
      return _filter(...arg);
    }
    if (arg) {
      let _arg;
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
      FILTERED_KEYS.forEach(key => {
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
      return isObject(arg) ? parseJson(_arg) : _arg;
    } else {
      return arg;
    }
  });
};
//# sourceMappingURL=logger.js.map
