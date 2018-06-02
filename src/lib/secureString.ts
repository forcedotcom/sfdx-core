import * as crypto from 'crypto';

const cipherName: string =  'aes256';
const cipherSize: number = 32;

/**
 * Used to store and retrieve a SecretStrings in memory.
 * @example
 *
 * const sString: SecureString<string> = new SecureString();
 * sString.consume(secretTextBuffer);
 * const value: string = sString.value((buffer: Buffer): string => {
 *     const password: string = buffer.toString('utf8');
 *     // doSomething with the password
 *     // returns something of type <T>
 *     return testReturnValue;
 * });
 *
 */
export class SecureString <T> {
    private secret: Buffer;
    private key = crypto.randomBytes(cipherSize);
    private iv = crypto.randomBytes(16);

    /**
     * Invokes a callback with a decrypted version of the string.
     * @param {DecipherCallback} cb - The callback containing the decrypted buffer parameter that returns a desired
     * typed object. It's important to understand that once the callback goes out of scope the buffer is overwritten with
     * random data. Do not make a copy of this object and persist it!
     * @return T - The value of the callback
     */
    public value(cb: (buffer: Buffer) => T): T   {
        if (cb) {
            const cipher = crypto.createDecipheriv(cipherName, this.key, this.iv);
            const a = cipher.update(this.secret);
            const b = cipher.final();
            const c = Buffer.concat([a, b]);
            try {
                return cb(c);
            } finally {
                crypto.randomFillSync(a);
                crypto.randomFillSync(b);
                crypto.randomFillSync(c);
            }
        }
    }

    /**
     * @callback DecipherCallback
     * @param {Buffer} buffer - A buffer containing the decrypted secret.
     * @returns T - The intended type of the object to return. This is implementation specific.
     */

    /**
     * Overwrites the value of the encrypted secret with random data.
     */
    public clear() {
        if (this.secret) {
            crypto.randomFillSync(this.secret);
        }
        const cipher = crypto.createCipheriv(cipherName, this.key, this.iv);
        this.secret = Buffer.concat([cipher.update(Buffer.from('')), cipher.final()]);
    }

    /**
     * Consumes a buffer of data that's intended to be secret.
     * @param {Buffer} buffer - Data to encrypt. The input buffer is overwritten with random data after it's encrypted
     * and assigned internally.
     */
    public consume(buffer: Buffer) {
        let targetBuffer = buffer;
        if (!targetBuffer) {
            targetBuffer = Buffer.from('');
        }
        const cipher = crypto.createCipheriv(cipherName, this.key, this.iv);
        this.secret = Buffer.concat([
            cipher.update(targetBuffer),
            cipher.final()]);
        crypto.randomFillSync(targetBuffer);
    }
}
