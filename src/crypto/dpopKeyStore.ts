/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as path from 'node:path';
import { fs } from '../fs/fs';
import { Global } from '../global';
import { Logger } from '../logger/logger';
import { Messages } from '../messages';
import { retrieveKeychain } from './keyChain';
import { KeychainAccess, SecretReference } from './keyChainImpl';

export { SecretReference } from './keyChainImpl';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'dpop');

/**
 * Keychain service under which DPoP private keys are stored.
 */
export const DPOP_KEYCHAIN_SERVICE = 'sfdx-dpop';

const KEY_REFERENCE_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * A store for named secrets, such as an OS keychain.
 */
export type SecretStore = {
  setSecret(ref: SecretReference, secret: string): Promise<void>;
  getSecret(ref: SecretReference): Promise<string>;
  deleteSecret(ref: SecretReference): Promise<void>;
};

export type DpopKeyStoreOptions = {
  /** The OS secret store. When absent or failing, keys are kept in files under `directory`. */
  keychain?: SecretStore;
  /** The state directory; fallback key files are written to `<directory>/dpop/<reference>.key`. */
  directory: string;
};

/**
 * Persists DPoP private keys by reference, outside of auth files. Keys go to the OS keychain when one is available,
 * and otherwise to a separate owner-only (0600) file.
 */
export class DpopKeyStore {
  private readonly keychain?: SecretStore;
  private readonly keyDirectory: string;

  public constructor(options: DpopKeyStoreOptions) {
    this.keychain = options.keychain;
    this.keyDirectory = path.join(options.directory, 'dpop');
  }

  /**
   * Creates a store backed by this platform's native keychain, if any, and the global state directory.
   */
  public static async create(): Promise<DpopKeyStore> {
    return new DpopKeyStore(await DpopKeyStore.defaultOptions());
  }

  private static async defaultOptions(): Promise<DpopKeyStoreOptions> {
    const keychain = await retrieveKeychain(process.platform);
    return {
      keychain: keychain instanceof KeychainAccess ? keychain : undefined,
      directory: Global.DIR,
    };
  }

  /**
   * Stores a private key PEM under a reference.
   *
   * **Throws** *{@link SfError}{ name: 'InvalidDpopKeyReferenceError' }* When the reference is not a UUID.
   *
   * @param reference The key reference.
   * @param privateKey The private key PEM.
   */
  public async store(reference: string, privateKey: string): Promise<void> {
    const secretRef = toSecretReference(reference);
    if (this.keychain) {
      try {
        await this.keychain.setSecret(secretRef, privateKey);
        return;
      } catch (e) {
        Logger.childFromRoot('DpopKeyStore').warn(
          `The OS keychain could not store the DPoP key; using a local key file: ${errorMessage(e)}`
        );
      }
    }
    try {
      await fs.promises.mkdir(this.keyDirectory, { recursive: true, mode: 0o700 });
      await fs.promises.chmod(this.keyDirectory, 0o700);
      const filePath = this.keyFilePath(reference);
      await fs.promises.writeFile(filePath, privateKey, { mode: 0o600 });
      await fs.promises.chmod(filePath, 0o600);
    } catch (e) {
      throw messages.createError('dpopKeyStorageFailed', [errorMessage(e)], [], e as Error);
    }
  }

  /**
   * Retrieves the private key PEM for a reference.
   *
   * @param reference The key reference.
   */
  public async retrieve(reference: string): Promise<string> {
    const secretRef = toSecretReference(reference);
    if (this.keychain) {
      try {
        return await this.keychain.getSecret(secretRef);
      } catch {
        // Keys stored while the keychain was unavailable live in a file.
      }
    }
    try {
      return await fs.promises.readFile(this.keyFilePath(reference), 'utf8');
    } catch (e) {
      throw messages.createError('dpopKeyNotFound', [reference], [], e as Error);
    }
  }

  /**
   * Deletes the private key for a reference from the keychain and the key file.
   *
   * @param reference The key reference.
   * @returns Whether a key was deleted from either location.
   */
  public async delete(reference: string): Promise<boolean> {
    const secretRef = toSecretReference(reference);
    let deleted = false;
    if (this.keychain) {
      try {
        await this.keychain.deleteSecret(secretRef);
        deleted = true;
      } catch {
        // The key may only exist in a file.
      }
    }
    try {
      await fs.promises.unlink(this.keyFilePath(reference));
      deleted = true;
    } catch {
      // No key file.
    }
    return deleted;
  }

  private keyFilePath(reference: string): string {
    return path.join(this.keyDirectory, `${reference}.key`);
  }
}

const toSecretReference = (reference: string): SecretReference => {
  // Only UUIDs are accepted, so a reference can never escape the key directory.
  if (!KEY_REFERENCE_PATTERN.test(reference)) {
    throw messages.createError('invalidDpopKeyReference');
  }
  return { service: DPOP_KEYCHAIN_SERVICE, account: reference };
};

const errorMessage = (e: unknown): string => (e instanceof Error ? e.message : String(e));
