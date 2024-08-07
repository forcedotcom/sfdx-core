/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect, config } from 'chai';
import { filterSecrets, HIDDEN } from '../../../src/logger/filters';
import { unwrapArray } from '../../../src/util/unwrapArray';

config.truncateThreshold = 0;

describe('filters', () => {
  const sid = '00D55000000M2qA!AQ0AQHg3LnYDOyobmH07';
  const simpleString = `sid=${sid}`;
  const stringWithObject = ` The rain in Spain: ${JSON.stringify({
    // eslint-disable-next-line camelcase
    access_token: sid,
  })}`;

  it(`filters ${simpleString} correctly`, () => {
    const result = getUnwrapped(simpleString);
    expect(result).to.not.contain(sid);
    expect(result).to.contain('REDACTED ACCESS TOKEN');
  });

  it(`filters ${stringWithObject} correctly`, () => {
    const result = getUnwrapped(stringWithObject);
    expect(result).to.not.contain(sid);
    expect(result).to.contain('REDACTED ACCESS TOKEN');
  });

  it('filters regular object correctly', () => {
    const result = getUnwrapped({ accessToken: `${sid}`, refreshToken: `${sid}` });
    assert(result);
    const bigString = JSON.stringify(result);
    expect(bigString).to.not.contain(sid);
    expect(bigString).to.contain('REDACTED ACCESS TOKEN');
    expect(bigString).to.contain('refresh_token - HIDDEN');
  });

  it('filters key/value object correctly', () => {
    const result = getUnwrapped({ key: 'Access Token', value: `${sid}` });
    assert(result);
    const bigString = JSON.stringify(result);
    expect(bigString).to.not.contain(sid);
    expect(bigString).to.contain('REDACTED ACCESS TOKEN');
  });

  it('filters auth code correctly', () => {
    const result = getUnwrapped({ authCode: 'authcode value' });
    assert(result);
    const bigString = JSON.stringify(result);
    expect(bigString).to.not.contain('authCode value');
    expect(bigString).to.contain('authcode - HIDDEN');
  });

  describe('client id', () => {
    it('filters clientId correctly', () => {
      const result = getUnwrapped({ clientId: 'clientIdValue' });
      assert(result);
      const bigString = JSON.stringify(result);
      expect(bigString).to.not.contain('clientIdValue');
      expect(bigString).to.contain('REDACTED CLIENT ID');
    });

    it('filters clientId correctly (case insensitive)', () => {
      const result = getUnwrapped({ ClientId: 'clientIdValue' });
      assert(result);
      const bigString = JSON.stringify(result);
      expect(bigString).to.not.contain('clientIdValue');
      expect(bigString).to.contain('REDACTED CLIENT ID');
    });

    it('filters clientId correctly (separator)', () => {
      // eslint-disable-next-line camelcase
      const result = getUnwrapped({ Client_Id: 'clientIdValue' });
      assert(result);
      const bigString = JSON.stringify(result);
      expect(bigString).to.not.contain('clientIdValue');
      expect(bigString).to.contain('REDACTED CLIENT ID');
    });
  });

  it('filters array correctly', () => {
    const result = getUnwrapped([
      { key: 'ACCESS token ', value: `${sid}` },
      { key: 'refresh  TOKEN', value: `${sid}` },
      { key: 'Sfdx Auth Url', value: `${sid}` },
    ]);
    assert(result);
    assert(Array.isArray(result));
    const bigString = JSON.stringify(result);

    expect(bigString).to.not.contain(sid);
    expect(bigString).to.contain('REDACTED ACCESS TOKEN');
    expect(bigString).to.contain('refresh_token - HIDDEN');
  });

  it('filters another array correctly', () => {
    const result = getUnwrapped([
      { key: ' AcCESS 78token', value: ` ${sid} ` },
      { key: ' refresh  _TOKEn ', value: ` ${sid} ` },
      { key: ' SfdX__AuthUrl  ', value: ` ${sid} ` },
    ]);
    assert(result);
    assert(Array.isArray(result));
    const bigString = JSON.stringify(result);
    expect(bigString).to.not.contain(sid);
    expect(bigString).to.contain(HIDDEN);
    expect(bigString).to.contain('refresh_token - HIDDEN');
  });

  describe('does not filter innocent stuff', () => {
    it('basic string', () => {
      const result = getUnwrapped('some string');
      expect(result).to.equal('some string');
    });
    it('basic object', () => {
      const input = { foo: 'bar' };
      const result = getUnwrapped(input);
      expect(result).to.deep.equal(input);
    });
    it('basic array', () => {
      const input = ['foo', 'bar'];
      const result = getUnwrapped(input);
      expect(result).to.deep.equal(input);
    });
    it('object with one bad prop', () => {
      const input = { foo: 'bar', accessToken: `${sid}` };
      const result = getUnwrapped(input);
      expect(result).to.have.property('foo', 'bar');
      expect(result).to.have.property('accessToken').contains('REDACTED ACCESS TOKEN');
    });
    describe('clientId', () => {
      it('default connected app', () => {
        const input = { clientId: 'PlatformCLI' };
        const result = getUnwrapped(input);
        expect(result).to.deep.equal(input);
      });
      it('default connected app (case insensitive)', () => {
        const input = { ClientID: 'PlatformCLI' };
        const result = getUnwrapped(input);
        expect(result).to.deep.equal(input);
      });
      it('default connected app (case insensitive)', () => {
        // eslint-disable-next-line camelcase
        const input = { client_id: 'PlatformCLI' };
        const result = getUnwrapped(input);
        expect(result).to.deep.equal(input);
      });
    });
  });
});

const getUnwrapped = (input: unknown): unknown => unwrapArray(filterSecrets(input));
