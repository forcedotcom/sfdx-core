import { Optional } from '@salesforce/ts-types';
/**
 * Returns the intended type of the object to return. This is implementation specific.
 * @param buffer A buffer containing the decrypted secret.
 */
export declare type DecipherCallback<T> = (buffer: Buffer) => T;
/**
 * Used to store and retrieve a sensitive information in memory. This is not meant for at rest encryption.
 *
 * ```
 * const sString: SecureBuffer<string> = new SecureBuffer();
 * sString.consume(secretTextBuffer);
 * const value: string = sString.value((buffer: Buffer): string => {
 *     const password: string = buffer.toString('utf8');
 *     // doSomething with the password
 *     // returns something of type <T>
 *     return testReturnValue;
 * });
 * ```
 */
export declare class SecureBuffer<T> {
  private key;
  private iv;
  private secret?;
  /**
   * Invokes a callback with a decrypted version of the buffer.
   * @param cb The callback containing the decrypted buffer parameter that returns a desired.
   * typed object. It's important to understand that once the callback goes out of scope the buffer parameters is
   * overwritten with random data. Do not make a copy of this buffer and persist it!
   */
  value(cb: DecipherCallback<T>): Optional<T>;
  /**
   * Overwrites the value of the encrypted secret with random data.
   */
  clear(): void;
  /**
   * Consumes a buffer of data that's intended to be secret.
   * @param buffer Data to encrypt. The input buffer is overwritten with random data after it's encrypted
   * and assigned internally.
   */
  consume(buffer: Buffer): void;
}
