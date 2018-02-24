/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import * as _ from 'lodash';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as childProcess from 'child_process';

import { SfdxError, SfdxErrorConfig } from './sfdxError';
import { SfdxUtil } from './util';
import { Global } from './global';
import { KeychainConfig } from './config/keychainConfig';

/* tslint:disable: no-bitwise */

const GET_PASSWORD_RETRY_COUNT: number = 3;

/**
 * Helper to reduce an array of cli args down to a presentable string for logging.
 * @param optionsArray - cli command args.
 */
function _optionsToString(optionsArray) {
    return optionsArray.reduce((accum, element) => `${accum} ${element}`);
}

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
        throw SfdxError.create('sfdx-core', 'encryption', 'MissingCredentialProgramError', [programPath]);
    }

    if (noPermission) {
        throw SfdxError.create('sfdx-core', 'encryption', 'CredentialProgramAccessError', [programPath]);
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
            fn(SfdxError.create('sfdx-core', 'encryption', 'KeyChainServiceRequiredError'));
            return;
        }

        if (_.isNil(opts.account)) {
            fn(SfdxError.create('sfdx-core', 'encryption', 'KeyChainAccountRequiredError'));
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
                return await this.osImpl.onGetCommandClose(code, stdout, stderr, opts, fn);
            } catch (e) {
                if (e.retry) {
                    if (retryCount >= GET_PASSWORD_RETRY_COUNT) {
                        throw SfdxError.create('sfdx-core', 'encryption', 'PasswordRetryError', [GET_PASSWORD_RETRY_COUNT]);
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
            fn(SfdxError.create('sfdx-core', 'encryption', 'KeyChainServiceRequiredError'));
            return;
        }

        if (_.isNil(opts.account)) {
            fn(SfdxError.create('sfdx-core', 'encryption', 'KeyChainAccountRequiredError'));
            return;
        }

        if (_.isNil(opts.password)) {
            fn(SfdxError.create('sfdx-core', 'encryption', 'PasswordRequiredError'));
            return;
        }

        await _validateProgram(this.osImpl.getProgram(), this.fsIfc, _isExe);

        const credManager = this.osImpl.setCommandFunc(opts, childProcess.spawn);

        let stdout = '';
        let stderr = '';

        credManager.stdout.on('data', (data) => { stdout += data; });
        credManager.stderr.on('data', (data) => { stderr += data; });

        credManager.on('close', async (code) => await this.osImpl.onSetCommandClose(code, stdout, stderr, opts, fn));

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

    async onGetCommandClose(code, stdout, stderr, opts, fn) {

        if (code === 1) {
            const command = `${_linuxImpl.getProgram()} ${_optionsToString(_linuxImpl.getProgramOptions(opts))}`;
            const errorConfig = new SfdxErrorConfig(
                'sfdx-core',
                'encryption',
                'PasswordNotFoundError',
                [`\n${stdout} - ${stderr}`],
                'PasswordNotFoundErrorAction',
                [command]
            );
            const error = SfdxError.create(errorConfig);

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

    async onSetCommandClose(code, stdout, stderr, opts, fn) {
        if (code !== 0) {
            const command = `${_linuxImpl.getProgram()} ${_optionsToString(_linuxImpl.setProgramOptions(opts))}`;
            const errorConfig = new SfdxErrorConfig(
                'sfdx-core',
                'encryption',
                'SetCredentialError',
                [`\n${stdout} - ${stderr}`],
                'SetCredentialErrorAction',
                [os.userInfo().username, command]
            );
            fn(SfdxError.create(errorConfig));
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

    async onGetCommandClose(code, stdout, stderr, opts, fn) {
        let err: SfdxError;

        if (code !== 0) {
            switch (code) {
                case 128:
                    err = SfdxError.create('sfdx-core', 'encryption', 'KeyChainUserCanceledError');
                    break;
                default:
                    const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.getProgramOptions(opts))}`;
                    const errorConfig = new SfdxErrorConfig(
                        'sfdx-core',
                        'encryption',
                        'PasswordNotFoundError',
                        [`\n${stdout} - ${stderr}`],
                        'PasswordNotFoundErrorAction',
                        [command]
                    );
                    err = SfdxError.create(errorConfig);
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
            const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.getProgramOptions(opts))}`;
            const errorConfig = new SfdxErrorConfig(
                'sfdx-core',
                'encryption',
                'PasswordNotFoundError',
                [`\n${stdout} - ${stderr}`],
                'PasswordNotFoundErrorAction',
                [command]
            );
            fn(SfdxError.create(errorConfig));
        }
    },

    setProgramOptions(opts) {
        return ['add-generic-password', '-a', opts.account, '-s',
            opts.service, '-w', opts.password];
    },

    setCommandFunc(opts, fn) {
        return fn(_darwinImpl.getProgram(), _darwinImpl.setProgramOptions(opts));
    },

    async onSetCommandClose(code, stdout, stderr, opts, fn) {
        if (code !== 0) {
            const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.setProgramOptions(opts))}`;
            const errorConfig = new SfdxErrorConfig(
                'sfdx-core',
                'encryption',
                'SetCredentialError',
                [`\n${stdout} - ${stderr}`],
                'SetCredentialErrorAction',
                [os.userInfo().username, command]
            );
            fn(SfdxError.create(errorConfig));
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
        const config: KeychainConfig = await KeychainConfig.create(KeychainConfig.getDefaultOptions());
        await config.write(obj);

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

    protected static SECRET_FILE: string = path.join(Global.DIR, KeychainConfig.KEYCHAIN_FILENAME);

    public async getPassword(opts, fn): Promise<any> {
        // validate the file in .sfdx
        await this.isValidFileAccess(async (fileAccessError) => {

            // the file checks out.
            if (_.isNil(fileAccessError)) {

                // read it's contents
                return KeychainConfig.create(KeychainConfig.getDefaultOptions())
                    .then((config: KeychainConfig) => config.readJSON())
                    .then(async (readObj: SecretFields) => {
                        // validate service name and account just because
                        if ((opts.service === readObj.service ) && (opts.account === readObj.account)) {
                            fn(null, readObj.key);
                        } else {
                            // if the service and account names don't match then maybe someone or something is editing
                            // that file. #donotallow
                            const errorConfig = new SfdxErrorConfig('sfdx-core', 'encryption', 'GenericKeychainServiceError', [KeychainConfig.KEYCHAIN_FILENAME], 'GenericKeychainServiceErrorAction');
                            const err = SfdxError.create(errorConfig);
                            fn(err);
                        }
                    })
                    .catch((readJsonErr) => {
                        fn(readJsonErr);
                    });
            } else {
                if (fileAccessError.code === 'ENOENT') {
                    fn(SfdxError.create('sfdx-core', 'encryption', 'PasswordNotFoundError', []));
                } else {
                    fn(fileAccessError);
                }
            }
        });
    }

    public async setPassword(opts, fn): Promise<any> {
        // validate the file in .sfdx
        await this.isValidFileAccess((fileAccessError) => {
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

    protected async isValidFileAccess(cb): Promise<any> {
        // This call just ensures the .sfdx dir exists and has the correct permissions.
        await Global.createDir();

        try {
            await SfdxUtil.access(Global.DIR, fs.constants.R_OK | fs.constants.X_OK | fs.constants.W_OK);
            cb(null);
        } catch (err) {
            cb(err);
        }
    }
}

export class GenericUnixKeychainAccess extends GenericKeychainAccess {

    protected async isValidFileAccess(cb): Promise<any> {
        await super.isValidFileAccess(async (err) => {
            if (!_.isNil(err)) {
                cb(err);
            } else {
                const keyFile = await KeychainConfig.create(KeychainConfig.getDefaultOptions());
                const stats = await keyFile.stat();
                const octalModeStr  = (stats.mode & 0o777).toString(8);
                const EXPECTED_OCTAL_PERM_VALUE = '600';
                if (octalModeStr === EXPECTED_OCTAL_PERM_VALUE) {
                    cb();
                } else {
                    const errorConfig = new SfdxErrorConfig(
                        'sfdx-core',
                        'encryption',
                        'GenericKeychainInvalidPermsError',
                        null,
                        'GenericKeychainInvalidPermsErrorAction',
                        [GenericKeychainAccess.SECRET_FILE, EXPECTED_OCTAL_PERM_VALUE]
                    );
                    cb(SfdxError.create(errorConfig));
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
