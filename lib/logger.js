/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
const fs = require('fs');
const path = require('path');
const util = require('util');

// Thirdparty
const Promise = require('bluebird');
const mkdirp = Promise.promisify(require('mkdirp'));
const bunyan = require('bunyan');
const heroku = require('heroku-cli-util');

// Local
const sfdxError = require(path.join(__dirname, 'sfdxError'));

const ROOT_LOGGER_NAME = 'appcloud';

let loggerRegistry = []; // store so we reuse and properly close
let globalLogger;

/**
 * SFDX Logger logs all lines at or above a given level to a file. It also
 * handles logging to stdout, which delegates to heroku-cli-util.
 *
 * Implementation extends Bunyan.
 *
 * https://github.com/trentm/node-bunyan
 *
 * Things to note:
 *   # Logging API params:
 *     Note that this implies you cannot blindly pass any object as the first argument
 *     to log it because that object might include fields that collide with Bunyan's
 *     core record fields. In other words, log.info(mywidget) may not yield what you
 *     expect. Instead of a string representation of mywidget that other logging
 *     libraries may give you, Bunyan will try to JSON-ify your object. It is a Bunyan
 *     best practice to always give a field name to included objects, e.g.:
 *
 *     log.info({widget: mywidget}, ...)
 *
 *   # Issues:
 *     - Ensuring writable stream is flushed on exception
 *       https://github.com/trentm/node-bunyan/issues/37
 *
 */
class Logger extends bunyan {
    constructor(options, _childOptions, _childSimple) {
        super(options, _childOptions, _childSimple);
        this.name = options.name;
        this.colorEnabled = false;
        this.humanConsumable = true;
        this.filters = [];
    }

    /**
     * Adds a filter to the array
     * @param filter - function defined in the command constructor
     * that manipulates log messages
     */
    addFilter(filter) {
        this.filters.push(filter);
    }

    /**
     * When logging messages to the log file, this method
     * calls the filters defined in the executed commands.
     * @param args - this can be an array of strings, objects, etc.
     */
    applyFilters(...args) {
        this.filters.forEach(filter => {
            args = filter(...args);
        });
        return args;
    }

    /**
     * Set the state of the logger to be human consumable or not. Human
     * consumable enables colors and typical output to stdout. When disabled,
     * it prevents color and stdout and only allows outputting JSON.
     */
    setHumanConsumable(isConsumable) {
        this.humanConsumable = isConsumable;
        this.colorEnabled = isConsumable;
    }

    /**
     *
     */
    close(fn) {
        if (this.streams) {
            this.streams.forEach(stream => {
                if (fn) {
                    fn(stream);
                }

                // close stream, flush buffer to disk
                if (stream.type === 'file') {
                    stream.stream.end();
                }
            });
        }
    }

    /**
     * Create a child logger, typically to add a few log record fields.
     *
     * @see bunyan.child(options, simple).
     */
    child(name, config, simple) {
        if (!name) {
            throw sfdxError('LoggerNameRequired');
        }

        const options = {
            childname: name,
            config
        };

        const child = super.child(options, simple);

        child.colorEnabled = this.colorEnabled;
        child.humanConsumable = this.humanConsumable;
        child.filters = this.filters;

        this.debug(`Setup '${name}' logger instance`);

        // store to close on exit
        loggerRegistry.push(child);

        return child;
    }

    setConfig(name, value) {
        if (!this.fields.config) {
            this.fields.config = {};
        }
        this.fields.config[name] = value;
    }

    isDebugEnabled() {
        return this.debug();
    }

    /**
     *  Go directly to stdout. Useful when wanting to write to the same line.
     */
    logRaw(...args) {
        this.info(this.applyFilters(...args));

        if (this.humanConsumable) {
            heroku.console.writeLog(...args);
            // If we stop using heroku
            // process.stdout.write(...args);
        }

        return this;
    }

    /**
     * Log JSON to stdout and to the log file with log level info.
     */
    logJson(obj) {
        heroku.log(JSON.stringify(obj));
        this.info(this.applyFilters(obj));
    }

    /**
     * Logs INFO level log AND logs to console.log in human-readable form.
     *
     * See "Logging API params" in top-level doc.
     *
     * @see bunyan.debug()
     */
    log(...args) {
        this.info(this.applyFilters(...args));

        if (this.humanConsumable) {
            heroku.log(...args);
        }

        return this;
    }

    error(...args) {
        if (this.humanConsumable) {
            heroku.log(...args);
        }

        return super.error(this.applyFilters(...args));
    }

    fatal(...args) {
        // Alwas show fatal to stdout
        heroku.log(...args);
        return super.fatal(...args);
    }

    table(...args) {
        this.info(...args);
        if (this.humanConsumable) {
            heroku.table(...args);
        }
        return this;
    }

    styledHash(...args) {
        this.info(...args);
        if (this.humanConsumable) {
            heroku.styledHash(...args);
        }
        return this;
    }

    styledHeader(...args) {
        this.info(...args);
        if (this.humanConsumable) {
            heroku.styledHeader(...args);
        }
        return this;
    }

    get color() {
        const colorFns = {};
        Object.keys(heroku.color.styles).forEach(color => {
            colorFns[color] = (msg) => {
                if (this.colorEnabled) {
                    return heroku.color[color](msg);
                }
                return msg;
            };
        });
        return colorFns;
    }

    /**
     * Get/set the level of all streams on this logger.
     *
     * @see bunyan.nameFromLevel(value).
     */
    nameFromLevel(value) {
        return bunyan.nameFromLevel[value === undefined ? this.level() : value];
    }

    enableFileLogging(logFile, level) {
        if (util.isNullOrUndefined(logFile)) {
            throw sfdxError('LogFileRequired');
        }
        if (util.isNullOrUndefined(level)) {
            // Log everything
            level = 'error';
        }

        // TODO look into using bunyans revolving file logging.
        return mkdirp(path.dirname(logFile))
        .then(() =>
            // Empty out file
            Promise.promisify(fs.writeFile)(logFile, '')
        )
        .then(() => {
            // Log everything to the file
            this.addStream({ type: 'file', path : logFile, level });
        });
    }

    // clear registry and set a new globalLogger to support testing with test workspaces
    reset() {
        globalLogger.close();
        globalLogger.streams = [];
        loggerRegistry = [];
        return globalLogger;
    }
}

// close streams
// FIXME: sadly, this does not work when process.exit is called; for now, disabled process.exit
const closeStreams = function(fn) {
    loggerRegistry.forEach(child => {
        child.close(fn);
    });
};

const serializers = bunyan.stdSerializers;

serializers.config = obj => {
    const configCopy = {};

    Object.keys(obj).forEach(key => {
        const val = obj[key];
        if (util.isString(val) || util.isNumber(val) || util.isBoolean(val)) {
            configCopy[key] = val;
        }
    });

    return configCopy;
};

globalLogger = new Logger({
    name: ROOT_LOGGER_NAME,
    level: 'trace',
    serializers,
    // No streams for now, not until it is enabled
    streams: []
});

loggerRegistry.push(globalLogger);

// ensure that uncaughtException is logged
process.on('uncaughtException', err => {
    // prevent infinite recursion
    // TODO I don't think we need this anymore. I think it was fixed in node but
    // not sure how to test it.
    // process.removeListener('uncaughtException', arguments.callee);

    // log the exception
    const logger = globalLogger;
    if (logger) {
        logger.fatal(err);
    }

    closeStreams(stream => {
        // TODO do we need this?
        stream.stream.on('close', () => {
            throw err;
        });
    });
});

// FIXME: ensure that streams are flushed on ext
// https://github.com/trentm/node-bunyan/issues/37
process.on('exit', () => {
    closeStreams();
});

module.exports = globalLogger;
