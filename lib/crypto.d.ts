import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Optional } from '@salesforce/ts-types';
import { KeyChain } from './keyChainImpl';
interface CryptoOptions {
  keychain?: KeyChain;
  platform?: string;
  retryStatus?: string;
  noResetOnClose?: boolean;
}
/**
 * Class for managing encrypting and decrypting private auth information.
 */
export declare class Crypto extends AsyncOptionalCreatable<CryptoOptions> {
  private _key;
  private options;
  private messages;
  private noResetOnClose;
  /**
   * Constructor
   * **Do not directly construct instances of this class -- use {@link Crypto.create} instead.**
   * @param options The options for the class instance.
   * @ignore
   */
  constructor(options?: CryptoOptions);
  /**
   * Encrypts text. Returns the encrypted string or undefined if no string was passed.
   * @param text The text to encrypt.
   */
  encrypt(text?: string): Optional<string>;
  /**
   * Decrypts text.
   * @param text The text to decrypt.
   */
  decrypt(text?: string): Optional<string>;
  /**
   * Clears the crypto state. This should be called in a finally block.
   */
  close(): void;
  /**
   * Initialize async components.
   */
  protected init(): Promise<void>;
  private getKeyChain;
}
export {};
