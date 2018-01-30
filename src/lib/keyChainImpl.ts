/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';
// const fs = require('fs-extra');
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as childProcess from 'child_process';

import { SfdxError } from './sfdxError';
import { SfdxUtil } from './util';
import { Global } from './global';

/* tslint:disable: no-bitwise */

const GET_PASSWORD_RETRY_COUNT: number = 3;
const SECRET_FILE_NAME: string = 'key.json';

/**
 * Helper to reduce an array of cli args down to a presentable string for logging.
 * @param optionsArray - cli command args.
 * @private
 */
function _optionsToString(optionsArray) {
    return optionsArray.reduce((accum, element) => `${accum} ${element}`);
}

/**
 * Re-usable errors
 */
/*
const _errors = {
    setCredentialError: (stdout, stderr) => srcDevUtil.getError(
        messages.getMessage('keyChainServiceCommandFailed', `${stdout} - ${stderr}`), 'SetCredentialError'),

    passwordNotFoundError: (stdout?, stderr?) => {
        let message = messages.getMessage('keyChainPasswordNotFound');
        message += `\n${stdout} - ${stderr}`;
        return srcDevUtil.getError(message, 'PasswordNotFound');
    },

    userCanceledError: () => srcDevUtil.getError(messages.getMessage('keyChainUserCanceled'), 'user_canceled'),
};
*/

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
 * private helper to validate that a program exists on the file system and is executable
 * @param programPath - the absolute path of the program
 * @param fsIfc - the file system interface
 * @param isExeIfc - executable validation function
 * @private
 */
const _validateProgram = async (programPath, fsIfc, isExeIfc) => {
    let noPermission;
    try {
        const stats = fsIfc.statSync(programPath);
        noPermission = !isExeIfc(stats.mode, stats.gid, stats.uid);
    } catch (e) {
        throw await SfdxError.create('sfdx-error', 'MissingCredentialProgramError', [programPath]);
    }

    if (noPermission) {
        throw await SfdxError.create('sfdx-error', 'CredentialProgramAccessError', [programPath]);
    }
};

export class KeychainAccess {

    /**
     * abstract prototype for general cross platform keychain interaction
     * @param osImpl - the platform impl for (linux, darwin, windows)
     * @param fsIfc - the file system interface
     * @constructor
     */
    constructor(private osImpl, private fsIfc) {}

    public async validateProgram() {
        await _validateProgram(this.osImpl.getProgram(), this.fsIfc, _isExe);
    }

    /**
     * gets a password using the native program for credential management.
     * @param opts - options for the credential lookup
     * @param fn - callback function (err, password)
     * @param retryCount - used internally to track the number of retries for getting a password out of the keychain.
     */
    public async getPassword(opts, fn, retryCount = 0): Promise<string> {
        if (_.isNil(opts.service)) {
            fn(await SfdxError.create('sfdx-core', 'KeyChainServiceRequiredError'));
            return;
        }

        if (_.isNil(opts.account)) {
            fn(await SfdxError.create('sfdx-core', 'KeyChainAccountRequiredError'));
            return;
        }

        await this.validateProgram();

        const credManager = this.osImpl.getCommandFunc(opts, childProcess.spawn);

        let stdout = '';
        let stderr = '';

        credManager.stdout.on('data', (data) => { stdout += data; });
        credManager.stderr.on('data', (data) => { stderr += data; });

        credManager.on('close', async (code) => {
            try {
                return this.osImpl.onGetCommandClose(code, stdout, stderr, opts, fn);
            } catch (e) {
                if (e.retry) {
                    if (retryCount >= GET_PASSWORD_RETRY_COUNT) {
                        throw await SfdxError.create('sfdx-core', 'PasswordRetryError', [GET_PASSWORD_RETRY_COUNT]);
                    }
                    return this.getPassword(opts, fn, retryCount + 1);
                } else {
                    // if retry
                    throw e;
                }
            }
        });

        credManager.stdin.end();
    }

    /**
     * sets a password using the native program for credential management.
     * @param opts - options for the credential lookup
     * @param fn - callback function (err, password)
     */
    public async setPassword(opts, fn): Promise<any> {

        if (_.isNil(opts.service)) {
            fn(await SfdxError.create('sfdx-core', 'KeyChainServiceRequiredError'));
            return;
        }

        if (_.isNil(opts.account)) {
            fn(await SfdxError.create('sfdx-core', 'KeyChainAccountRequiredError'));
            return;
        }

        if (_.isNil(opts.password)) {
            fn(await SfdxError.create('sfdx-core', 'PasswordRequiredError'));
            return;
        }

        await _validateProgram(this.osImpl.getProgram(), this.fsIfc, _isExe);

        const credManager = this.osImpl.setCommandFunc(opts, childProcess.spawn);

        let stdout = '';
        let stderr = '';

        credManager.stdout.on('data', (data) => { stdout += data; });
        credManager.stderr.on('data', (data) => { stderr += data; });

        credManager.on('close', (code) => this.osImpl.onSetCommandClose(code, stdout, stderr, opts, fn));

        credManager.stdin.end();
    }
}

/**
 * linux implementation
 *
 * uses libsecret
 *
 * @private
 */
const _linuxImpl = {
    getProgram() {
        return process.env.SFDX_SECRET_TOOL_PATH || path.join(path.sep, 'usr', 'bin', 'secret-tool');
    },

    getProgramOptions(opts) {
        return ['lookup', 'user', opts.account, 'domain', opts.service];
    },

    getCommandFunc(opts, fn) {
        return fn(_linuxImpl.getProgram(), _linuxImpl.getProgramOptions(opts));
    },

    onGetCommandClose(code, stdout, stderr, opts, fn) {

        if (code === 1) {
            const error = new Error(`Could not find password.\n${stdout} - ${stderr}`);
            error.name = 'PasswordNotFound';
            // const error = _errors.passwordNotFoundError(stdout, stderr);
            const command = `${_linuxImpl.getProgram()} ${_optionsToString(_linuxImpl.getProgramOptions(opts))}`;
            // error.action = messages.getMessage('keychainPasswordNotFoundAction', [command]);
            error['action'] = `Ensure a valid password is returned with the following command: [${_linuxImpl.getProgram()} ${_optionsToString(_linuxImpl.getProgramOptions(opts))}].`;

            // This is a workaround for linux.
            // Calling secret-tool too fast can cause it to return an unexpected error. (below)
            if (!_.isNil(stderr) &&
                stderr.includes('invalid or unencryptable secret')) {
                error['retry'] = true;

                // Throwing here allows us to perform a retry in KeychainAccess
                throw error;
            }

            // All other issues we will report back to the handler.
            fn(error);
        } else {
            fn(null, stdout.trim());
        }
    },

    setProgramOptions(opts) {
        return ['store', '--label=\'salesforce.com\'', 'user', opts.account, 'domain', opts.service];
    },

    setCommandFunc(opts, fn) {
        const secretTool = fn(_linuxImpl.getProgram(), _linuxImpl.setProgramOptions(opts));
        secretTool.stdin.write(`${opts.password}\n`);
        return secretTool;
    },

    onSetCommandClose(code, stdout, stderr, opts, fn) {
        if (code !== 0) {
            const error = new Error(`Command failed with response.\n${stdout} - ${stderr}`);
            error.name = 'SetCredentialError';
            // const error = _errors.setCredentialError(stdout, stderr);
            const command = `${_linuxImpl.getProgram()} ${_optionsToString(_linuxImpl.setProgramOptions(opts))}`;
            // error.action = messages.getMessage('keychainSetCommandFailedAction', [os.userInfo().username, command]);
            error['action'] = `Determine why this command failed to set an encryption key for user ${os.userInfo().username}: [${command}].`,
            fn(error);
        } else {
            fn(null);
        }
    }
};

/**
 * OSX implementation
 *
 * /usr/bin/security is a cli front end for OSX keychain.
 *
 * @private
 */
const _darwinImpl = {
    getProgram() {
        return path.join(path.sep, 'usr', 'bin', 'security');
    },

    getProgramOptions(opts) {
        return ['find-generic-password', '-a', opts.account, '-s', opts.service, '-g'];
    },

    getCommandFunc(opts, fn) {
        return fn(_darwinImpl.getProgram(), _darwinImpl.getProgramOptions(opts));
    },

    onGetCommandClose(code, stdout, stderr, opts, fn) {
        let err;

        if (code !== 0) {
            switch (code) {
                case 128:
                    err = new Error('User canceled authentication');
                    // err = _errors.userCanceledError();
                    err.name = 'user_canceled';
                    break;
                default:
                    err = new Error(`Could not find password.\n${stdout} - ${stderr}`);
                    err.name = 'PasswordNotFound';
                    // err = _errors.passwordNotFoundError(stdout, stderr);
                    // err.action = messages.getMessage('keychainPasswordNotFoundAction',
                        // [`${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.getProgramOptions(opts))}`]);
                    err['action'] = `Ensure a valid password is returned with the following command: [${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.getProgramOptions(opts))}].`;
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
            const error = new Error(`Could not find password.\n${stdout} - ${stderr}`);
            error.name = 'PasswordNotFound';
            // const error = _errors.passwordNotFoundError(stdout, stderr);
            const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.getProgramOptions(opts))}`;
            // error.action = messages.getMessage('keychainPasswordNotFoundAction', [command]);
            error['action'] = `Ensure a valid password is returned with the following command: [${command}].`,
            fn(error);
        }
    },

    setProgramOptions(opts) {
        return ['add-generic-password', '-a', opts.account, '-s',
            opts.service, '-w', opts.password];
    },

    setCommandFunc(opts, fn) {
        return fn(_darwinImpl.getProgram(), _darwinImpl.setProgramOptions(opts));
    },

    onSetCommandClose(code, stdout, stderr, opts, fn) {
        if (code !== 0) {
            const error = new Error(`Command failed with response.\n${stdout} - ${stderr}`);
            error.name = 'SetCredentialError';
            // const error = _errors.setCredentialError(stdout, stderr);
            const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.setProgramOptions(opts))}`;
            // error.action = messages.getMessage('keychainSetCommandFailedAction', [os.userInfo().username, command]);
            error['action'] = `Determine why this command failed to set an encryption key for user ${os.userInfo().username}: [${command}].`,
            fn(error);
        } else {
            fn(null);
        }
    }
};

async function _writeFile(opts, fn) {
    const obj: SecretFields = {
        service: opts.service,
        account: opts.account,
        key: opts.password
    };

    try {
        await Global.saveConfigInfo(SECRET_FILE_NAME, obj);
        fn(null, obj);
    } catch (err) {
        fn(err);
    }
}

interface SecretFields {
    service: string;
    account: string;
    key: string;
}

export class GenericKeychainAccess {

    protected static SECRET_FILE: string = path.join(Global.DIR, SECRET_FILE_NAME);

    // protected async isValidFileAccess(cb) {
    public isValidFileAccess(cb) {
        // This call just ensures the .sfdx dir exists and has the correct permissions.
        // await Global.createDir();
        SfdxUtil.mkdirp(path.join(Global.DIR), SfdxUtil.DEFAULT_USER_DIR_MODE)
        .then(() => {
            fs.stat(GenericKeychainAccess.SECRET_FILE, (_err, stats) => {
                !_.isNil(_err) ? cb(_err) : cb(null, stats);
            });
        });
    }

    public async getPassword(opts, fn) {
        // validate the file in .sfdx
        this.isValidFileAccess((fileAccessError) => {

            // the file checks out.
            if (_.isNil(fileAccessError)) {

                // read it's contents
                SfdxUtil.readJSON(GenericKeychainAccess.SECRET_FILE)
                    .then((readObj: SecretFields) => {
                        // validate service name and account just because
                        if ((opts.service === readObj.service ) && (opts.account === readObj.account)) {
                            fn(null, readObj.key);
                        } else {
                            // if the service and account names don't match then maybe someone or something is editing
                            // that file. #donotallow
                            // fn(almError('genericUnixKeychainServiceAccountMismatch', [GenericKeychainAccess.SECRET_FILE],
                            //     'genericUnixKeychainServiceAccountMismatchAction', null));
                            const err = new Error(`The service and account specified in ${GenericKeychainAccess.SECRET_FILE} do not match the version of the toolbelt.`);
                            err.name = 'GenericKeychainServiceAccountMismatch';
                            err['action'] = 'Check your toolbelt version and re-auth.';
                            fn(err);
                        }
                    })
                    .catch((readJsonErr) => {
                        fn(readJsonErr);
                    });
            } else {
                if (fileAccessError.code === 'ENOENT') {
                    const error = new Error('Could not find password.');
                    error.name = 'PasswordNotFound';
                    fn(error);
                } else {
                    fn(fileAccessError);
                }
            }
        });
    }

    public async setPassword(opts, fn): Promise<any> {
        // validate the file in .sfdx
        this.isValidFileAccess((fileAccessError) => {
            // if there is a validation error
            if (!_.isNil(fileAccessError)) {

                // file not found
                if (fileAccessError.code === 'ENOENT') {

                    // create the file
                    _writeFile.call(this, opts, fn);
                } else {
                    fn(fileAccessError);
                }
            } else {
                // the existing file validated. we can write the updated key
                _writeFile.call(this, opts, fn);
            }
        });
    }
}

export class GenericUnixKeychainAccess extends GenericKeychainAccess {

    public isValidFileAccess(cb) {
        super.isValidFileAccess((err, stats) => {
            if (!_.isNil(err)) {
                cb(err);
            } else {
                const octalModeStr  = (stats.mode & 0o777).toString(8);
                const EXPECTED_OCTAL_PERM_VALUE = '600';
                if (octalModeStr === EXPECTED_OCTAL_PERM_VALUE) {
                    cb();
                } else {
                    // cb(almError('genericUnixKeychainInvalidPerms', null, 'genericUnixKeychainInvalidPermsAction',
                    //     [GenericKeychainAccess.SECRET_FILE, EXPECTED_OCTAL_PERM_VALUE]));
                    const error = new Error('Invalid file permissions for secret file');
                    error.name = 'GenericKeychainAccessInvalidPerms';
                    error['action'] = `Ensure the file ${GenericKeychainAccess.SECRET_FILE} has the file permission octal value of ${EXPECTED_OCTAL_PERM_VALUE}.`,
                    cb();
                }
            }
        });
    }
}

export class GenericWindowsKeychainAccess extends GenericKeychainAccess {}

export const keyChainImpl = {
    generic_unix: new GenericUnixKeychainAccess(),
    generic_windows: new GenericWindowsKeychainAccess(),
    darwin: new KeychainAccess(_darwinImpl, fs),
    linux: new KeychainAccess(_linuxImpl, fs),
    validateProgram: _validateProgram
};
