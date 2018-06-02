import { SecureString } from '../../lib/secureString';
import { expect } from 'chai';

describe('secureString', async () => {
    const secretText: string = 'FOO';
    const testReturnValue = 'BAR';
    const secretTextBuffer: Buffer = Buffer.from(secretText, 'utf8');

    it('validate consuming a string buffer encrypting and decrypting', () => {
        const sString: SecureString<string> = new SecureString();
        sString.consume(secretTextBuffer);
        const value: string = sString.value((buffer: Buffer): string => {
            expect(buffer.toString('utf8')).to.be.equal(secretText);
            expect(secretTextBuffer.toString('utf8')).to.not.be.equal(secretText);
            return testReturnValue;
        });
        expect(value).to.equal(testReturnValue);
    });

    it('falsy value', () => {
        const sString: SecureString<string> = new SecureString();
        sString.consume(null);
        const value: string = sString.value((buffer: Buffer) => {
            expect(buffer.toString('utf8')).to.be.equal('');
            return testReturnValue;
        });
        expect(value).to.equal(testReturnValue);
    });

    it('falsy callback', () => {
        const sString: SecureString<string> = new SecureString();
        sString.consume(secretTextBuffer);
        sString.value(null);
    });

    it ('test clearing the secret string', () => {
        const sString: SecureString<void> = new SecureString();
        sString.consume(secretTextBuffer);
        sString.clear();
        sString.value((buffer: Buffer) => {
            expect(buffer.toString('utf8')).to.not.be.equal(secretText);
        });
    });
});
