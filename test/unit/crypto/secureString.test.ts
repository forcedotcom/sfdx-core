/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import crypto from 'node:crypto';
import { expect } from 'chai';
import { stub } from 'sinon';
import { SecureBuffer } from '../../../src/crypto/secureBuffer';

describe('secureBuffer', () => {
  const secretText = 'FOO';
  const testReturnValue = 'BAR';
  const secretTextBuffer: Buffer = Buffer.from(secretText, 'utf8');

  it('validate consuming a buffer - encrypting and decrypting', () => {
    const sString: SecureBuffer<string> = new SecureBuffer();
    sString.consume(secretTextBuffer);
    const value = sString.value((buffer: Buffer): string => {
      expect(buffer.toString('utf8')).to.be.equal(secretText);
      expect(secretTextBuffer.toString('utf8')).to.not.be.equal(secretText);
      return testReturnValue;
    });
    expect(value).to.equal(testReturnValue);
  });

  it('falsy value', () => {
    const sString: SecureBuffer<string> = new SecureBuffer();
    // @ts-expect-error: falsy value
    sString.consume(null);
    const value = sString.value((buffer: Buffer) => {
      expect(buffer.toString('utf8')).to.be.equal('');
      return testReturnValue;
    });
    expect(value).to.equal(testReturnValue);
  });

  it('falsy callback', () => {
    const sString: SecureBuffer<string> = new SecureBuffer();
    sString.consume(secretTextBuffer);
    // @ts-expect-error: falsy callback
    sString.value(null);
  });

  it('test clearing the secret buffer', () => {
    const sString: SecureBuffer<void> = new SecureBuffer();
    sString.consume(secretTextBuffer);
    sString.clear();
    sString.value((buffer: Buffer) => {
      expect(buffer.toString('utf8')).to.not.be.equal(secretText);
    });
  });

  it('test backwards compatibility between aes256 and aes-256-cbc', () => {
    const key = Buffer.from('aaaabbbbccccddddeeeeffffgggghhhh');
    const iv = Buffer.from('aaaabbbbccccdddd');
    const cipher = crypto.createCipheriv('aes256', key, iv);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const createCipherStub = stub(crypto, 'createCipheriv').returns(cipher);
    const createDecipherStub = stub(crypto, 'createDecipheriv').returns(decipher);
    try {
      const secure = new SecureBuffer();
      secure.consume(Buffer.from(secretText, 'utf8'));
      expect(createCipherStub.calledOnce).to.be.true;
      secure.value((val) => expect(val.toString('utf8')).to.be.equal(secretText));
      expect(createDecipherStub.calledOnce).to.be.true;
    } finally {
      createCipherStub.restore();
      createDecipherStub.restore();
    }
  });
});
