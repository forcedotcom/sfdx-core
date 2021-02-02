/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { asString, ensure } from '@salesforce/ts-types';
import * as childProcess from 'child_process';
import * as nodeFs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { ConfigFile } from './config/configFile';
import { KeychainConfig } from './config/keychainConfig';
import { Global } from './global';
import { SfdxError, SfdxErrorConfig } from './sfdxError';
import { fs } from './util/fs';
/* tslint:disable: no-bitwise */
const GET_PASSWORD_RETRY_COUNT = 3;
/**
 * Helper to reduce an array of cli args down to a presentable string for logging.
 * @param optionsArray CLI command args.
 */
function _optionsToString(optionsArray) {
  return optionsArray.reduce((accum, element) => `${accum} ${element}`);
}
/**
 * Helper to determine if a program is executable. Returns `true` if the program is executable for the user. For
 * Windows true is always returned.
 * @param mode Stats mode.
 * @param gid Unix group id.
 * @param uid Unix user id.
 */
const _isExe = (mode, gid, uid) => {
  if (process.platform === 'win32') {
    return true;
  }
  return Boolean(
    mode & parseInt('0001', 8) ||
      (mode & parseInt('0010', 8) && process.getgid && gid === process.getgid()) ||
      (mode & parseInt('0100', 8) && process.getuid && uid === process.getuid())
  );
};
/**
 * Private helper to validate that a program exists on the file system and is executable.
 *
 * **Throws** *{@link SfdxError}{ name: 'MissingCredentialProgramError' }* When the OS credential program isn't found.
 *
 * **Throws** *{@link SfdxError}{ name: 'CredentialProgramAccessError' }* When the OS credential program isn't accessible.
 *
 * @param programPath The absolute path of the program.
 * @param fsIfc The file system interface.
 * @param isExeIfc Executable validation function.
 */
const _validateProgram = async (programPath, fsIfc, isExeIfc) => {
  let noPermission;
  try {
    const stats = fsIfc.statSync(programPath);
    noPermission = !isExeIfc(stats.mode, stats.gid, stats.uid);
  } catch (e) {
    throw SfdxError.create('@salesforce/core', 'encryption', 'MissingCredentialProgramError', [programPath]);
  }
  if (noPermission) {
    throw SfdxError.create('@salesforce/core', 'encryption', 'CredentialProgramAccessError', [programPath]);
  }
};
/**
 * @private
 */
export class KeychainAccess {
  /**
   * Abstract prototype for general cross platform keychain interaction.
   * @param osImpl The platform impl for (linux, darwin, windows).
   * @param fsIfc The file system interface.
   */
  constructor(osImpl, fsIfc) {
    this.osImpl = osImpl;
    this.fsIfc = fsIfc;
  }
  /**
   * Validates the os level program is executable.
   */
  async validateProgram() {
    await _validateProgram(this.osImpl.getProgram(), this.fsIfc, _isExe);
  }
  /**
   * Returns a password using the native program for credential management.
   * @param opts Options for the credential lookup.
   * @param fn Callback function (err, password).
   * @param retryCount Used internally to track the number of retries for getting a password out of the keychain.
   */
  async getPassword(opts, fn, retryCount = 0) {
    if (opts.service == null) {
      fn(SfdxError.create('@salesforce/core', 'encryption', 'KeyChainServiceRequiredError'));
      return;
    }
    if (opts.account == null) {
      fn(SfdxError.create('@salesforce/core', 'encryption', 'KeyChainAccountRequiredError'));
      return;
    }
    await this.validateProgram();
    const credManager = this.osImpl.getCommandFunc(opts, childProcess.spawn);
    let stdout = '';
    let stderr = '';
    if (credManager.stdout) {
      credManager.stdout.on('data', data => {
        stdout += data;
      });
    }
    if (credManager.stderr) {
      credManager.stderr.on('data', data => {
        stderr += data;
      });
    }
    credManager.on('close', async code => {
      try {
        return await this.osImpl.onGetCommandClose(code, stdout, stderr, opts, fn);
      } catch (e) {
        if (e.retry) {
          if (retryCount >= GET_PASSWORD_RETRY_COUNT) {
            throw SfdxError.create('@salesforce/core', 'encryption', 'PasswordRetryError', [GET_PASSWORD_RETRY_COUNT]);
          }
          return this.getPassword(opts, fn, retryCount + 1);
        } else {
          // if retry
          throw e;
        }
      }
    });
    if (credManager.stdin) {
      credManager.stdin.end();
    }
  }
  /**
   * Sets a password using the native program for credential management.
   * @param opts Options for the credential lookup.
   * @param fn Callback function (err, password).
   */
  async setPassword(opts, fn) {
    if (opts.service == null) {
      fn(SfdxError.create('@salesforce/core', 'encryption', 'KeyChainServiceRequiredError'));
      return;
    }
    if (opts.account == null) {
      fn(SfdxError.create('@salesforce/core', 'encryption', 'KeyChainAccountRequiredError'));
      return;
    }
    if (opts.password == null) {
      fn(SfdxError.create('@salesforce/core', 'encryption', 'PasswordRequiredError'));
      return;
    }
    await _validateProgram(this.osImpl.getProgram(), this.fsIfc, _isExe);
    const credManager = this.osImpl.setCommandFunc(opts, childProcess.spawn);
    let stdout = '';
    let stderr = '';
    if (credManager.stdout) {
      credManager.stdout.on('data', data => {
        stdout += data;
      });
    }
    if (credManager.stderr) {
      credManager.stderr.on('data', data => {
        stderr += data;
      });
    }
    credManager.on('close', async code => await this.osImpl.onSetCommandClose(code, stdout, stderr, opts, fn));
    if (credManager.stdin) {
      credManager.stdin.end();
    }
  }
}
/**
 * Linux implementation.
 *
 * Uses libsecret.
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
        '@salesforce/core',
        'encryption',
        'PasswordNotFoundError',
        [`\n${stdout} - ${stderr}`],
        'PasswordNotFoundErrorAction',
        [command]
      );
      const error = SfdxError.create(errorConfig);
      // This is a workaround for linux.
      // Calling secret-tool too fast can cause it to return an unexpected error. (below)
      if (stderr != null && stderr.includes('invalid or unencryptable secret')) {
        // @ts-ignore TODO: make an error subclass with this field
        error.retry = true;
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
    return ['store', "--label='salesforce.com'", 'user', opts.account, 'domain', opts.service];
  },
  setCommandFunc(opts, fn) {
    const secretTool = fn(_linuxImpl.getProgram(), _linuxImpl.setProgramOptions(opts));
    if (secretTool.stdin) {
      secretTool.stdin.write(`${opts.password}\n`);
    }
    return secretTool;
  },
  async onSetCommandClose(code, stdout, stderr, opts, fn) {
    if (code !== 0) {
      const command = `${_linuxImpl.getProgram()} ${_optionsToString(_linuxImpl.setProgramOptions(opts))}`;
      const errorConfig = new SfdxErrorConfig(
        '@salesforce/core',
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
 * OSX implementation.
 *
 * /usr/bin/security is a cli front end for OSX keychain.
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
    let err;
    if (code !== 0) {
      switch (code) {
        case 128:
          err = SfdxError.create('@salesforce/core', 'encryption', 'KeyChainUserCanceledError');
          break;
        default:
          const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.getProgramOptions(opts))}`;
          const errorConfig = new SfdxErrorConfig(
            '@salesforce/core',
            'encryption',
            'PasswordNotFoundError',
            [`\n${stdout} - ${stderr}`],
            'PasswordNotFoundErrorAction',
            [command]
          );
          err = SfdxError.create(errorConfig);
      }
      fn(err);
      return;
    }
    // For better or worse, the last line (containing the actual password) is actually written to stderr instead of
    // stdout. Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
    if (/password/.test(stderr)) {
      const match = stderr.match(/"(.*)"/);
      if (!match || !match[1]) {
        const errorConfig = new SfdxErrorConfig(
          '@salesforce/core',
          'encryption',
          'PasswordNotFoundError',
          [`\n${stdout} - ${stderr}`],
          'PasswordNotFoundErrorAction'
        );
        fn(SfdxError.create(errorConfig));
      } else {
        fn(null, match[1]);
      }
    } else {
      const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.getProgramOptions(opts))}`;
      const errorConfig = new SfdxErrorConfig(
        '@salesforce/core',
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
    const result = ['add-generic-password', '-a', opts.account, '-s', opts.service];
    if (opts.password) {
      result.push('-w', opts.password);
    }
    return result;
  },
  setCommandFunc(opts, fn) {
    return fn(_darwinImpl.getProgram(), _darwinImpl.setProgramOptions(opts));
  },
  async onSetCommandClose(code, stdout, stderr, opts, fn) {
    if (code !== 0) {
      const command = `${_darwinImpl.getProgram()} ${_optionsToString(_darwinImpl.setProgramOptions(opts))}`;
      const errorConfig = new SfdxErrorConfig(
        '@salesforce/core',
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
  try {
    const config = await KeychainConfig.create(KeychainConfig.getDefaultOptions());
    config.set(SecretField.ACCOUNT, opts.account);
    config.set(SecretField.KEY, opts.password || '');
    config.set(SecretField.SERVICE, opts.service);
    await config.write();
    fn(null, config.getContents());
  } catch (err) {
    fn(err);
  }
}
var SecretField;
(function(SecretField) {
  SecretField['SERVICE'] = 'service';
  SecretField['ACCOUNT'] = 'account';
  SecretField['KEY'] = 'key';
})(SecretField || (SecretField = {}));
// istanbul ignore next - getPassword/setPassword is always mocked out
/**
 * @@ignore
 */
export class GenericKeychainAccess {
  async getPassword(opts, fn) {
    // validate the file in .sfdx
    await this.isValidFileAccess(async fileAccessError => {
      // the file checks out.
      if (fileAccessError == null) {
        // read it's contents
        return KeychainConfig.create(KeychainConfig.getDefaultOptions())
          .then(config => {
            // validate service name and account just because
            if (opts.service === config.get(SecretField.SERVICE) && opts.account === config.get(SecretField.ACCOUNT)) {
              const key = config.get(SecretField.KEY);
              fn(null, asString(key));
            } else {
              // if the service and account names don't match then maybe someone or something is editing
              // that file. #donotallow
              const errorConfig = new SfdxErrorConfig(
                '@salesforce/core',
                'encryption',
                'GenericKeychainServiceError',
                [KeychainConfig.getFileName()],
                'GenericKeychainServiceErrorAction'
              );
              const err = SfdxError.create(errorConfig);
              fn(err);
            }
          })
          .catch(readJsonErr => {
            fn(readJsonErr);
          });
      } else {
        if (fileAccessError.code === 'ENOENT') {
          fn(SfdxError.create('@salesforce/core', 'encryption', 'PasswordNotFoundError', []));
        } else {
          fn(fileAccessError);
        }
      }
    });
  }
  async setPassword(opts, fn) {
    // validate the file in .sfdx
    await this.isValidFileAccess(async fileAccessError => {
      // if there is a validation error
      if (fileAccessError != null) {
        // file not found
        if (fileAccessError.code === 'ENOENT') {
          // create the file
          await _writeFile.call(this, opts, fn);
        } else {
          fn(fileAccessError);
        }
      } else {
        // the existing file validated. we can write the updated key
        await _writeFile.call(this, opts, fn);
      }
    });
  }
  async isValidFileAccess(cb) {
    try {
      const root = await ConfigFile.resolveRootFolder(true);
      await fs.access(path.join(root, Global.STATE_FOLDER), fs.constants.R_OK | fs.constants.X_OK | fs.constants.W_OK);
      await cb(null);
    } catch (err) {
      await cb(err);
    }
  }
}
/**
 * @ignore
 */
// istanbul ignore next - getPassword/setPassword is always mocked out
export class GenericUnixKeychainAccess extends GenericKeychainAccess {
  async isValidFileAccess(cb) {
    const secretFile = path.join(
      await ConfigFile.resolveRootFolder(true),
      Global.STATE_FOLDER,
      ensure(KeychainConfig.getDefaultOptions().filename)
    );
    await super.isValidFileAccess(async err => {
      if (err != null) {
        await cb(err);
      } else {
        const keyFile = await KeychainConfig.create(KeychainConfig.getDefaultOptions());
        const stats = await keyFile.stat();
        const octalModeStr = (stats.mode & 0o777).toString(8);
        const EXPECTED_OCTAL_PERM_VALUE = '600';
        if (octalModeStr === EXPECTED_OCTAL_PERM_VALUE) {
          await cb(null);
        } else {
          const errorConfig = new SfdxErrorConfig(
            '@salesforce/core',
            'encryption',
            'GenericKeychainInvalidPermsError',
            undefined,
            'GenericKeychainInvalidPermsErrorAction',
            [secretFile, EXPECTED_OCTAL_PERM_VALUE]
          );
          await cb(SfdxError.create(errorConfig));
        }
      }
    });
  }
}
/**
 * @ignore
 */
export class GenericWindowsKeychainAccess extends GenericKeychainAccess {
  async isValidFileAccess(cb) {
    await super.isValidFileAccess(async err => {
      if (err != null) {
        await cb(err);
      } else {
        try {
          const secretFile = path.join(
            await ConfigFile.resolveRootFolder(true),
            Global.STATE_FOLDER,
            ensure(KeychainConfig.getDefaultOptions().filename)
          );
          await fs.access(secretFile, fs.constants.R_OK | fs.constants.W_OK);
          await cb(null);
        } catch (e) {
          await cb(err);
        }
      }
    });
  }
}
/**
 * @ignore
 */
export const keyChainImpl = {
  generic_unix: new GenericUnixKeychainAccess(),
  generic_windows: new GenericWindowsKeychainAccess(),
  darwin: new KeychainAccess(_darwinImpl, nodeFs),
  linux: new KeychainAccess(_linuxImpl, nodeFs),
  validateProgram: _validateProgram
};
//# sourceMappingURL=keyChainImpl.js.map
