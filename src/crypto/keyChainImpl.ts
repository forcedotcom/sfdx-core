/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as childProcess from 'node:child_process';
import * as nodeFs from 'node:fs';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { asString, ensureString, Nullable } from '@salesforce/ts-types';
import { parseJsonMap } from '@salesforce/kit';
import { Global } from '../global';
import { SfError } from '../sfError';
import { Messages } from '../messages';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'encryption');

export type FsIfc = Pick<typeof nodeFs, 'statSync'>;

const GET_PASSWORD_RETRY_COUNT = 3;

/**
 * Helper to reduce an array of cli args down to a presentable string for logging.
 *
 * @param optionsArray CLI command args.
 */
const optionsToString = (optionsArray: string[]): string => optionsArray.join(' ');

/**
 * Helper to determine if a program is executable. Returns `true` if the program is executable for the user. For
 * Windows true is always returned.
 *
 * @param mode Stats mode.
 * @param gid Unix group id.
 * @param uid Unix user id.
 */
const isExe = (mode: number, gid: number, uid: number): boolean => {
  if (process.platform === 'win32') {
    return true;
  }

  return Boolean(
    mode & parseInt('0001', 8) ||
      Boolean(mode & parseInt('0010', 8) && process.getgid && gid === process.getgid()) ||
      (mode & parseInt('0100', 8) && process.getuid && uid === process.getuid())
  );
};

/**
 * Private helper to validate that a program exists on the file system and is executable.
 *
 * **Throws** *{@link SfError}{ name: 'MissingCredentialProgramError' }* When the OS credential program isn't found.
 *
 * **Throws** *{@link SfError}{ name: 'CredentialProgramAccessError' }* When the OS credential program isn't accessible.
 *
 * @param programPath The absolute path of the program.
 * @param fsIfc The file system interface.
 * @param isExeIfc Executable validation function.
 */
// eslint-disable-next-line no-underscore-dangle
const _validateProgram = async (
  programPath: string,
  fsIfc: FsIfc,
  isExeIfc: (mode: number, gid: number, uid: number) => boolean
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<void> => {
  let noPermission;
  try {
    const stats = fsIfc.statSync(programPath);
    noPermission = !isExeIfc(stats.mode, stats.gid, stats.uid);
  } catch (e) {
    throw messages.createError('missingCredentialProgramError', [programPath]);
  }

  if (noPermission) {
    throw messages.createError('credentialProgramAccessError', [programPath]);
  }
};

/**
 * Basic keychain interface.
 */
export interface PasswordStore {
  /**
   * Gets a password
   *
   * @param opts cli level password options.
   * @param fn function callback for password.
   * @param retryCount number of reties to get the password.
   */
  getPassword(
    opts: ProgramOpts,
    fn: (error: Nullable<Error>, password?: string) => void,
    retryCount?: number
  ): Promise<void>;

  /**
   * Sets a password.
   *
   * @param opts cli level password options.
   * @param fn function callback for password.
   */
  setPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, contents?: SecretContents) => void): Promise<void>;
}

/**
 * @private
 */
export class KeychainAccess implements PasswordStore {
  /**
   * Abstract prototype for general cross platform keychain interaction.
   *
   * @param osImpl The platform impl for (linux, darwin, windows).
   * @param fsIfc The file system interface.
   */
  public constructor(private osImpl: OsImpl, private fsIfc: FsIfc) {}

  /**
   * Validates the os level program is executable.
   */
  public async validateProgram(): Promise<void> {
    await _validateProgram(this.osImpl.getProgram(), this.fsIfc, isExe);
  }

  /**
   * Returns a password using the native program for credential management.
   *
   * @param opts Options for the credential lookup.
   * @param fn Callback function (err, password).
   * @param retryCount Used internally to track the number of retries for getting a password out of the keychain.
   */
  public async getPassword(
    opts: ProgramOpts,
    fn: (error: Nullable<Error>, password?: string) => void,
    retryCount = 0
  ): Promise<void> {
    if (opts.service == null) {
      fn(messages.createError('keyChainServiceRequiredError'));
      return;
    }

    if (opts.account == null) {
      fn(messages.createError('keyChainAccountRequiredError'));
      return;
    }

    await this.validateProgram();

    const credManager = this.osImpl.getCommandFunc(opts, childProcess.spawn);

    let stdout = '';
    let stderr = '';

    if (credManager.stdout) {
      credManager.stdout.on('data', (data) => {
        stdout += data;
      });
    }
    if (credManager.stderr) {
      credManager.stderr.on('data', (data) => {
        stderr += data;
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    credManager.on('close', async (code: number) => {
      try {
        return await this.osImpl.onGetCommandClose(code, stdout, stderr, opts, fn);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (e.retry) {
          if (retryCount >= GET_PASSWORD_RETRY_COUNT) {
            throw messages.createError('passwordRetryError', [GET_PASSWORD_RETRY_COUNT]);
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
   *
   * @param opts Options for the credential lookup.
   * @param fn Callback function (err, ConfigContents).
   */
  public async setPassword(
    opts: ProgramOpts,
    fn: (error: Nullable<Error>, contents?: SecretContents) => void
  ): Promise<void> {
    if (opts.service == null) {
      fn(messages.createError('keyChainServiceRequiredError'));
      return;
    }

    if (opts.account == null) {
      fn(messages.createError('keyChainAccountRequiredError'));
      return;
    }

    if (opts.password == null) {
      fn(messages.createError('passwordRequiredError'));
      return;
    }

    await _validateProgram(this.osImpl.getProgram(), this.fsIfc, isExe);

    const credManager = this.osImpl.setCommandFunc(opts, childProcess.spawn);

    let stdout = '';
    let stderr = '';

    if (credManager.stdout) {
      credManager.stdout.on('data', (data: string) => {
        stdout += data;
      });
    }

    if (credManager.stderr) {
      credManager.stderr.on('data', (data: string) => {
        stderr += data;
      });
    }

    credManager.on(
      'close',
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async (code: number) => this.osImpl.onSetCommandClose(code, stdout, stderr, opts, fn)
    );

    if (credManager.stdin) {
      credManager.stdin.end();
    }
  }
}

interface ProgramOpts {
  account: string;
  service: string;
  password?: string;
}

interface OsImpl {
  getProgram(): string;
  getProgramOptions(opts: ProgramOpts): string[];
  getCommandFunc(
    opts: ProgramOpts,
    fn: (program: string, opts: string[]) => childProcess.ChildProcess
  ): childProcess.ChildProcess;
  onGetCommandClose(
    code: number,
    stdout: string,
    stderr: string,
    opts: ProgramOpts,
    fn: (err: Nullable<Error>, result?: string) => void
  ): Promise<void>;
  setProgramOptions(opts: ProgramOpts): string[];
  setCommandFunc(
    opts: ProgramOpts,
    fn: (program: string, opts: string[]) => childProcess.ChildProcess
  ): childProcess.ChildProcess;
  onSetCommandClose(
    code: number,
    stdout: string,
    stderr: string,
    opts: ProgramOpts,
    fn: (err: Nullable<Error>) => void
  ): Promise<void>;
}

/**
 * Linux implementation.
 *
 * Uses libsecret.
 */
const linuxImpl: OsImpl = {
  getProgram() {
    return process.env.SFDX_SECRET_TOOL_PATH ?? path.join(path.sep, 'usr', 'bin', 'secret-tool');
  },

  getProgramOptions(opts) {
    return ['lookup', 'user', opts.account, 'domain', opts.service];
  },

  getCommandFunc(opts, fn) {
    return fn(linuxImpl.getProgram(), linuxImpl.getProgramOptions(opts));
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async onGetCommandClose(code, stdout, stderr, opts, fn) {
    if (code === 1) {
      const command = `${linuxImpl.getProgram()} ${optionsToString(linuxImpl.getProgramOptions(opts))}`;
      const error = messages.createError('passwordNotFoundError', [], [command]);
      // This is a workaround for linux.
      // Calling secret-tool too fast can cause it to return an unexpected error. (below)
      if (stderr?.includes('invalid or unencryptable secret')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
    const secretTool = fn(linuxImpl.getProgram(), linuxImpl.setProgramOptions(opts));
    if (secretTool.stdin) {
      secretTool.stdin.write(`${opts.password}\n`);
    }
    return secretTool;
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async onSetCommandClose(code, stdout, stderr, opts, fn) {
    if (code !== 0) {
      const command = `${linuxImpl.getProgram()} ${optionsToString(linuxImpl.setProgramOptions(opts))}`;
      fn(messages.createError('setCredentialError', [`${stdout} - ${stderr}`], [os.userInfo().username, command]));
    } else {
      fn(null);
    }
  },
};

/**
 * OSX implementation.
 *
 * /usr/bin/security is a cli front end for OSX keychain.
 */
const darwinImpl: OsImpl = {
  getProgram() {
    return path.join(path.sep, 'usr', 'bin', 'security');
  },

  getProgramOptions(opts) {
    return ['find-generic-password', '-a', opts.account, '-s', opts.service, '-g'];
  },

  getCommandFunc(opts, fn) {
    return fn(darwinImpl.getProgram(), darwinImpl.getProgramOptions(opts));
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async onGetCommandClose(code, stdout, stderr, opts, fn) {
    let err: SfError;

    if (code !== 0) {
      switch (code) {
        case 128: {
          err = messages.createError('keyChainUserCanceledError');
          break;
        }
        default: {
          const command = `${darwinImpl.getProgram()} ${optionsToString(darwinImpl.getProgramOptions(opts))}`;
          err = messages.createError('passwordNotFoundError', [`${stdout} - ${stderr}`], [command]);
        }
      }
      fn(err);
      return;
    }

    // For better or worse, the last line (containing the actual password) is actually written to stderr instead of
    // stdout. Reference: http://blog.macromates.com/2006/keychain-access-from-shell/
    if (stderr.includes('password')) {
      const match = RegExp(/"(.*)"/).exec(stderr);
      if (!match?.[1]) {
        fn(messages.createError('passwordNotFoundError', [`${stdout} - ${stderr}`]));
      } else {
        fn(null, match[1]);
      }
    } else {
      const command = `${darwinImpl.getProgram()} ${optionsToString(darwinImpl.getProgramOptions(opts))}`;
      fn(messages.createError('passwordNotFoundError', [`${stdout} - ${stderr}`], [command]));
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
    return fn(darwinImpl.getProgram(), darwinImpl.setProgramOptions(opts));
  },

  // eslint-disable-next-line @typescript-eslint/require-await
  async onSetCommandClose(code, stdout, stderr, opts, fn) {
    if (code !== 0) {
      const command = `${darwinImpl.getProgram()} ${optionsToString(darwinImpl.setProgramOptions(opts))}`;
      fn(messages.createError('setCredentialError', [`${stdout} - ${stderr}`], [os.userInfo().username, command]));
    } else {
      fn(null);
    }
  },
};

const getSecretFile = (): string => path.join(Global.DIR, 'key.json');

enum SecretField {
  SERVICE = 'service',
  ACCOUNT = 'account',
  KEY = 'key',
}

type SecretContents = {
  [SecretField.ACCOUNT]: string;
  [SecretField.KEY]?: string;
  [SecretField.SERVICE]: string;
};

async function writeFile(
  opts: ProgramOpts,
  fn: (error: Nullable<Error>, contents?: SecretContents) => void
): Promise<void> {
  try {
    const contents = {
      [SecretField.ACCOUNT]: opts.account,
      [SecretField.KEY]: opts.password,
      [SecretField.SERVICE]: opts.service,
    };
    const secretFile = getSecretFile();
    await fs.promises.mkdir(path.dirname(secretFile), { recursive: true });
    await fs.promises.writeFile(secretFile, JSON.stringify(contents, null, 4), { mode: '600' });

    fn(null, contents);
  } catch (err) {
    fn(err as Error);
  }
}

async function readFile(): Promise<ProgramOpts> {
  // The file and access is validated before this method is called
  const fileContents = parseJsonMap(await fs.promises.readFile(getSecretFile(), 'utf8'));
  return {
    account: ensureString(fileContents[SecretField.ACCOUNT]),
    password: asString(fileContents[SecretField.KEY]),
    service: ensureString(fileContents[SecretField.SERVICE]),
  };
}

// istanbul ignore next - getPassword/setPassword is always mocked out
/**
 * @@ignore
 */
export class GenericKeychainAccess implements PasswordStore {
  public async getPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, password?: string) => void): Promise<void> {
    // validate the file in .sfdx
    await this.isValidFileAccess(async (fileAccessError) => {
      // the file checks out.
      if (fileAccessError == null) {
        // read it's contents
        try {
          const { service, account, password } = await readFile();
          // validate service name and account just because
          if (opts.service === service && opts.account === account) {
            fn(null, password);
          } else {
            // if the service and account names don't match then maybe someone or something is editing
            // that file. #donotallow
            fn(messages.createError('genericKeychainServiceError', [getSecretFile()]));
          }
        } catch (readJsonErr) {
          fn(readJsonErr as Error);
        }
      } else if (fileAccessError.code === 'ENOENT') {
        fn(messages.createError('passwordNotFoundError'));
      } else {
        fn(fileAccessError);
      }
    });
  }

  public async setPassword(
    opts: ProgramOpts,
    fn: (error: Nullable<Error>, contents?: SecretContents) => void
  ): Promise<void> {
    // validate the file in .sfdx
    await this.isValidFileAccess(async (fileAccessError) => {
      // if there is a validation error
      if (fileAccessError != null) {
        // file not found
        if (fileAccessError.code === 'ENOENT') {
          // create the file
          await writeFile.call(this, opts, fn);
        } else {
          fn(fileAccessError);
        }
      } else {
        // the existing file validated. we can write the updated key
        await writeFile.call(this, opts, fn);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  protected async isValidFileAccess(cb: (error: Nullable<NodeJS.ErrnoException>) => Promise<void>): Promise<void> {
    try {
      const root = homedir();
      await fs.promises.access(
        path.join(root, Global.SFDX_STATE_FOLDER),
        fs.constants.R_OK | fs.constants.X_OK | fs.constants.W_OK
      );
      await cb(null);
    } catch (err) {
      await cb(err as Error);
    }
  }
}

/**
 * @ignore
 */
// istanbul ignore next - getPassword/setPassword is always mocked out
export class GenericUnixKeychainAccess extends GenericKeychainAccess {
  protected async isValidFileAccess(cb: (error: Nullable<Error>) => Promise<void>): Promise<void> {
    await super.isValidFileAccess(async (err) => {
      if (err != null) {
        await cb(err);
      } else {
        const secretFile = getSecretFile();
        const stats = await fs.promises.stat(secretFile);
        const octalModeStr = (stats.mode & 0o777).toString(8);
        const EXPECTED_OCTAL_PERM_VALUE = '600';
        if (octalModeStr === EXPECTED_OCTAL_PERM_VALUE) {
          await cb(null);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          cb(
            messages.createError(
              'genericKeychainInvalidPermsError',
              [secretFile],
              [secretFile, EXPECTED_OCTAL_PERM_VALUE]
            )
          );
        }
      }
    });
  }
}

/**
 * @ignore
 */
export class GenericWindowsKeychainAccess extends GenericKeychainAccess {
  protected async isValidFileAccess(cb: (error: Nullable<Error>) => Promise<void>): Promise<void> {
    await super.isValidFileAccess(async (err) => {
      if (err != null) {
        await cb(err);
      } else {
        try {
          await fs.promises.access(getSecretFile(), fs.constants.R_OK | fs.constants.W_OK);
          await cb(null);
        } catch (e) {
          await cb(e as Error);
        }
      }
    });
  }
}

/**
 * @ignore
 */
export const keyChainImpl = {
  // eslint-disable-next-line camelcase
  generic_unix: new GenericUnixKeychainAccess(),
  // eslint-disable-next-line camelcase
  generic_windows: new GenericWindowsKeychainAccess(),
  darwin: new KeychainAccess(darwinImpl, nodeFs),
  linux: new KeychainAccess(linuxImpl, nodeFs),
  validateProgram: _validateProgram,
};

export type KeyChain = GenericUnixKeychainAccess | GenericWindowsKeychainAccess | KeychainAccess;
