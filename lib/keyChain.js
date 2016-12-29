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
const spawn = require('child_process').spawn;
const util = require('util');

// Thirdparty
const optional = require('optional-js');

// Local
const sfdxError = require(path.join(__dirname, 'sfdxError'));

const GET_PASSWORD_RETRY_COUNT = 3;

/**
 * contants for platform type
 * @type {{WINDOWS: string, DARWIN: string, LINUX: string}}
 */
const platforms = {
    WINDOWS: 'windows',
    DARWIN: 'darwin',
    LINUX: 'linux'
};

module.exports.platforms = platforms;

/**
 * Re-usable errors
 */
const _errors = {

    serviceRequired: () => sfdxError('ServiceRequired', [], 'keyChain'),

    accountRequired: () => sfdxError('AccountRequired', [], 'keyChain'),

    setCredentialError: (stdout, stderr) => sfdxError('CredentialError', [stdout, stderr], 'keyChain'),

    getCredentialError: (stdout, stderr) => sfdxError('CredentialError', [stdout, stderr], 'keyChain'),

    passwordNotFoundError: () => sfdxError('PasswordNotFound', [], 'keyChain'),

    userCanceledError: () => sfdxError('UserCanceled', [], 'keyChain'),

    parseError: () => sfdxError('SetCredentialParseError', [], 'keyChain')
};

/**
 * Helper to determine if a program is executable
 * @param mode - stats mode
 * @param gid - unix group id
 * @param uid - unix user id
 * @returns {boolean} true if the program is executable for the user. for windows true is always returned
 * @private
 */
const _isExe = (mode, gid, uid) => {
    if (process.platform === 'win32') {
        return true;
    }

    return Boolean((mode & parseInt('0001', 8)) ||
        ((mode & parseInt('0010', 8)) && process.getgid && gid === process.getgid()) ||
        ((mode & parseInt('0100', 8)) && process.getuid && uid === process.getuid()));
};

/**
 * private helper to validate that a program exists on the files system and is executable
 * @param programPath - the absolute path of the program
 * @param fsIfc - the file system interface
 * @param isExeIfc - executable validation function
 * @private
 */
const _validateProgram = (programPath, fsIfc, isExeIfc) => {
    let noPermission;
    try {
        const stats = fsIfc.statSync(programPath);
        if (!isExeIfc(stats.mode, stats.gid, stats.uid)) {
            noPermission = new Error(`Can't execute ${programPath}.`);
            noPermission.name = 'CantExecuteError';
        }
    }
    catch (e) {
        const error = new Error(`Cant find required security software ${programPath}`);
        error.name = 'CantFindCredentialProgram';
        throw error;
    }

    if (!util.isNullOrUndefined(noPermission)) {
        throw noPermission;
    }
};
module.exports.validateProgram = _validateProgram;


/**
 * abstract prototype for general cross platform keychain interaction
 * @param osImpl - the platform impl for (linux, darwin, windows)
 * @param fsIfc - the file system interface
 * @constructor
 */
function KeychainAccess(osImpl, fsIfc) {
    this.osImpl = osImpl;
    this.fsIfc = fsIfc;
}

/**
 * gets a password using the native program for credential management.
 * @param opts - options for the credential lookup
 * @param fn - callback function (err, password)
 * @param retryCount - used internally to track the number of retries for getting a password out of the keychain.
 */
KeychainAccess.prototype.getPassword = function(opts, fn, retryCount) {

    if (util.isNullOrUndefined(opts.service)) {
        fn(_errors.serviceRequired());
        return;
    }

    if (util.isNullOrUndefined(opts.account)) {
        fn(_errors.accountRequired());
        return;
    }

    _validateProgram(this.osImpl.program, this.fsIfc, _isExe);

    const credManager = this.osImpl.getCommandFunc(opts, spawn);

    let stdout = '';
    let stderr = '';

    credManager.stdout.on('data', (data) => { stdout += data; });
    credManager.stderr.on('data', (data) => { stderr += data; });

    credManager.on('close', (code) => {

        const currentCount = optional.ofNullable(retryCount).orElse(0);

        try {
            return this.osImpl.onGetCommandClose(code, stdout, stderr, opts, fn);
        }
        catch (e) {
            if (e.retry) {

                if (currentCount >= GET_PASSWORD_RETRY_COUNT) {
                    throw sfdxError('RetryForGetPasswordError', [GET_PASSWORD_RETRY_COUNT], 'keyChain');
                }
                return this.getPassword(opts, fn, currentCount+1);
            }
            else {
                // if rety
                throw e;
            }
        }
    });

    credManager.stdin.end();
};


/**
 * sets a password using the native program for credential management.
 * @param opts - options for the credential lookup
 * @param fn - callback function (err, password)
 */
KeychainAccess.prototype.setPassword = function(opts, fn) {

    if (util.isNullOrUndefined(opts.service)) {
        fn(_errors.serviceRequired());
        return;
    }

    if (util.isNullOrUndefined(opts.account)) {
        fn(_errors.accountRequired());
        return;
    }

    if (util.isNullOrUndefined(opts.password)) {
        fn(sfdxError('PasswordRequired', [], 'keyChain'));
        return;
    }

    _validateProgram(this.osImpl.program, this.fsIfc, _isExe);

    const credManager = this.osImpl.setCommandFunc(opts, spawn);

    let stdout = '';
    let stderr = '';

    credManager.stdout.on('data', (data) => { stdout += data; });
    credManager.stderr.on('data', (data) => { stderr += data; });

    credManager.on('close', (code) => this.osImpl.onSetCommandClose(code,stdout, stderr, fn));

    credManager.stdin.end();
};

/**
 * windows implementation
 *
 * uses the included credManScript
 *
 * @type {{credManPath: *, program: *, getCommandFunc: _windowsImpl.getCommandFunc, passwordRegex: RegExp, _filterPassword: _windowsImpl._filterPassword, _checkPasswordRegExResult: _windowsImpl._checkPasswordRegExResult, onGetCommandClose: _windowsImpl.onGetCommandClose, setCommandFunc: _windowsImpl.setCommandFunc, onSetCommandClose: _windowsImpl.onSetCommandClose}}
 * @private
 */
const _windowsImpl = {

    credManPath: path.join(__dirname, '..', 'CredMan.ps1'),
    program: path.join('C:', 'Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe'),

    getCommandFunc(opts, fn) {
        return fn(_windowsImpl.program, ['-ExecutionPolicy', 'ByPass', '-File',
            _windowsImpl.credManPath, '-GetCred', '-Target', opts.service, '-User', opts.account]);
    },

    passwordRegex: /Password\s*:\s.*/,

    _filterPassword(passwordArray) {
        return passwordArray[0].split(':')[1].trim().replace(/'/g, '');
    },

    _checkPasswordRegExResult(passwordArray) {
        return !util.isNullOrUndefined(passwordArray) && (passwordArray instanceof Array);
    },

    onGetCommandClose (code, stdout, stderr, opts, fn) {
        if (code !== 0) {
            fn(_errors.getCredentialError(stdout, stderr));
        }
        else {

            const passwordLine = stdout.match(_windowsImpl.passwordRegex);
            if (_windowsImpl._checkPasswordRegExResult(passwordLine)) {
                const password = _windowsImpl._filterPassword(passwordLine);
                if (password.length > 0) {
                    fn(null, password);
                    return;
                }
            }
            else {
                const notFound = stdout.indexOf(opts.service) > -1 && stdout.indexOf('type was not found') > 0;

                if (notFound) {
                    fn(_errors.passwordNotFoundError());
                    return;
                }
            }

            fn(_errors.parseError());
        }
    },

    setCommandFunc(opts, fn) {
        return fn(_windowsImpl.program, ['-ExecutionPolicy', 'ByPass', '-File', _windowsImpl.credManPath, '-AddCred',
            '-Target', opts.service, '-User', opts.account, '-Pass', opts.password]);
    },

    onSetCommandClose(code, stdout, stderr, fn) {
        if (code !== 0) {
            fn(_errors.setCredentialError());
        }
        else {

            const passwordLine = stdout.match(_windowsImpl.passwordRegex);
            if (_windowsImpl._checkPasswordRegExResult(passwordLine)) {
                const password = _windowsImpl._filterPassword(passwordLine);
                if (password.length > 0) {
                    fn(null, password);
                    return;
                }
            }

            fn(_errors.parseError());
        }
    }
};

module.exports[platforms.WINDOWS] = new KeychainAccess(_windowsImpl, fs);

/**
 * linux implementation
 *
 * uses libsecret
 *
 * @type {{program: *, getCommandFunc: _linuxImpl.getCommandFunc, onGetCommandClose: _linuxImpl.onGetCommandClose, setCommandFunc: _linuxImpl.setCommandFunc, onSetCommandClose: _linuxImpl.onSetCommandClose}}
 * @private
 */
const _linuxImpl = {
    program: process.env.APPCLOUD_SECRET_TOOL_PATH || path.join(path.sep, 'usr', 'bin', 'secret-tool'),
    getCommandFunc(opts, fn) {
        return fn(_linuxImpl.program, ['lookup', 'user', opts.account, 'domain', opts.service]);
    },

    onGetCommandClose (code, stdout, stderr, opts, fn) {

        if (code === 1) {
            const error = _errors.passwordNotFoundError();

            // This is a workaround for linux.
            // Calling secret-tool too fast can cause it to return an unexpected error. (below)
            if (!util.isNullOrUndefined(stderr) &&
                stderr.includes('invalid or unencryptable secret')) {
                error.retry = true;

                // Throwing here allows us to perform a retry in KeychainAccess
                throw error;
            }

            // All other issues we will report back to the handler.
            fn(error);
        }
        else {
            fn(null, stdout.trim());
        }
    },

    setCommandFunc(opts, fn) {
        const secretTool = fn(_linuxImpl.program, ['store', '--label=\'salesforce.com\'', 'user', opts.account, 'domain', opts.service]);
        secretTool.stdin.write(`${opts.password}\n`);
        return secretTool;
    },

    onSetCommandClose(code, stdout, stderr, fn) {
        if (code !== 0) {
            fn(_errors.getCredentialError(stdout, stderr));
        }
        else {
            fn(null);
        }
    }
};

module.exports[platforms.LINUX] = new KeychainAccess(_linuxImpl, fs);

/**
 * OSX implementation
 *
 * /usr/bin/security is a cli front end for OSX keychain.
 *
 * @type {{program: *, getCommandFunc: _darwinImpl.getCommandFunc, onGetCommandClose: _darwinImpl.onGetCommandClose, setCommandFunc: _darwinImpl.setCommandFunc, onSetCommandClose: _darwinImpl.onSetCommandClose}}
 * @private
 */
const _darwinImpl = {
    program: path.join(path.sep, 'usr', 'bin', 'security'),
    getCommandFunc(opts, fn) {
        return fn(_darwinImpl.program, ['find-generic-password', '-a', opts.account, '-s', opts.service, '-g']);
    },

    onGetCommandClose (code, stdout, stderr, opts, fn) {
        let err;

        if (code !== 0) {
            switch (code) {
                case 128:
                    err = _errors.userCanceledError();
                    err.name = 'user_canceled';
                    break;
                default:
                    err = _errors.passwordNotFoundError();
            }
            fn(err, null);
            return;
        }

        // For better or worse, the last line (containing the actual password) is actually written to stderr instead of
        // stdout. Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
        if (/password/.test(stderr)) {
            const password = stderr.match(/"(.*)"/, '')[1];
            fn(null, password);
        } else {
            fn(_errors.passwordNotFoundError(), null);
        }
    },

    setCommandFunc(opts, fn) {
        return fn(_darwinImpl.program, ['add-generic-password', '-a', opts.account, '-s',
            opts.service, '-w', opts.password]);
    },

    onSetCommandClose(code, stdout, stderr, fn) {
        if (code !== 0) {
            fn(_errors.setCredentialError(stdout, stderr));
        } else {
            fn(null);
        }
    }
};

module.exports[platforms.DARWIN] = new KeychainAccess(_darwinImpl, fs);
