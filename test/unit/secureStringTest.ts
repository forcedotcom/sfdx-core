/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { SecureBuffer } from '../../src/secureBuffer';

describe('secureBuffer', async () => {
  const secretText: string = 'FOO';
  const testReturnValue = 'BAR';
  const secretTextBuffer: Buffer = Buffer.from(secretText, 'utf8');

  it('validate consuming a buffer - encrypting and decrypting', () => {
    const sString: SecureBuffer<string> = new SecureBuffer();
    sString.consume(secretTextBuffer);
    const value = sString.value(
      (buffer: Buffer): string => {
        expect(buffer.toString('utf8')).to.be.equal(secretText);
        expect(secretTextBuffer.toString('utf8')).to.not.be.equal(secretText);
        return testReturnValue;
      }
    );
    expect(value).to.equal(testReturnValue);
  });

  it('falsy value', () => {
    const sString: SecureBuffer<string> = new SecureBuffer();
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
});
