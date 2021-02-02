import { Nullable } from '@salesforce/ts-types';
import * as childProcess from 'child_process';
import * as nodeFs from 'fs';
export declare type FsIfc = Pick<typeof nodeFs, 'statSync'>;
/**
 * Basic keychain interface.
 */
export interface PasswordStore {
  /**
   * Gets a password
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
   * @param opts cli level password options.
   * @param fn function callback for password.
   */
  setPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, password?: string) => void): Promise<void>;
}
/**
 * @private
 */
export declare class KeychainAccess implements PasswordStore {
  private osImpl;
  private fsIfc;
  /**
   * Abstract prototype for general cross platform keychain interaction.
   * @param osImpl The platform impl for (linux, darwin, windows).
   * @param fsIfc The file system interface.
   */
  constructor(osImpl: OsImpl, fsIfc: FsIfc);
  /**
   * Validates the os level program is executable.
   */
  validateProgram(): Promise<void>;
  /**
   * Returns a password using the native program for credential management.
   * @param opts Options for the credential lookup.
   * @param fn Callback function (err, password).
   * @param retryCount Used internally to track the number of retries for getting a password out of the keychain.
   */
  getPassword(
    opts: ProgramOpts,
    fn: (error: Nullable<Error>, password?: string) => void,
    retryCount?: number
  ): Promise<void>;
  /**
   * Sets a password using the native program for credential management.
   * @param opts Options for the credential lookup.
   * @param fn Callback function (err, password).
   */
  setPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, password?: string) => void): Promise<void>;
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
 * @@ignore
 */
export declare class GenericKeychainAccess implements PasswordStore {
  getPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, password?: string) => void): Promise<void>;
  setPassword(opts: ProgramOpts, fn: (error: Nullable<Error>, password?: string) => void): Promise<void>;
  protected isValidFileAccess(cb: (error: Nullable<NodeJS.ErrnoException>) => Promise<void>): Promise<void>;
}
/**
 * @ignore
 */
export declare class GenericUnixKeychainAccess extends GenericKeychainAccess {
  protected isValidFileAccess(cb: (error: Nullable<Error>) => Promise<void>): Promise<void>;
}
/**
 * @ignore
 */
export declare class GenericWindowsKeychainAccess extends GenericKeychainAccess {
  protected isValidFileAccess(cb: (error: Nullable<Error>) => Promise<void>): Promise<void>;
}
/**
 * @ignore
 */
export declare const keyChainImpl: {
  generic_unix: GenericUnixKeychainAccess;
  generic_windows: GenericWindowsKeychainAccess;
  darwin: KeychainAccess;
  linux: KeychainAccess;
  validateProgram: (
    programPath: string,
    fsIfc: Pick<typeof nodeFs, 'statSync'>,
    isExeIfc: (mode: number, gid: number, uid: number) => boolean
  ) => Promise<void>;
};
export declare type KeyChain = GenericUnixKeychainAccess | GenericWindowsKeychainAccess | KeychainAccess;
export {};
