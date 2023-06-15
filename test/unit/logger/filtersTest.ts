/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect } from 'chai';
import { filterSecrets, HIDDEN } from '../../../src/logger/filters';
import { unwrapArrray } from '../../../src/util/unwrapArrray';

describe('filters', () => {
  const sid = '00D55000000M2qA!AQ0AQHg3LnYDOyobmH07';
  const simpleString = `sid=${sid}`;
  const stringWithObject = ` The rain in Spain: ${JSON.stringify({
    // eslint-disable-next-line camelcase
    access_token: sid,
  })}`;
  const obj1 = { accessToken: `${sid}`, refreshToken: `${sid}` };
  const obj2 = { key: 'Access Token', value: `${sid}` };
  const arr1 = [
    { key: 'ACCESS token ', value: `${sid}` },
    { key: 'refresh  TOKEN', value: `${sid}` },
    { key: 'Sfdx Auth Url', value: `${sid}` },
  ];
  const arr2 = [
    { key: ' AcCESS 78token', value: ` ${sid} ` },
    { key: ' refresh  _TOKEn ', value: ` ${sid} ` },
    { key: ' SfdX__AuthUrl  ', value: ` ${sid} ` },
  ];

  it(`filters ${simpleString} correctly`, () => {
    const result = getUnwrapped(simpleString);
    expect(result).to.not.contain(sid);
    expect(result).to.contain(HIDDEN);
  });

  it(`filters ${stringWithObject} correctly`, () => {
    const result = getUnwrapped(stringWithObject);
    expect(result).to.not.contain(sid);
    expect(result).to.contain(HIDDEN);
  });

  it('filters obj1 correctly', () => {
    const result = getUnwrapped(obj1);
    assert(result);
    Object.entries(result).forEach(([, value]) => {
      expect(value).to.not.contain(sid);
      expect(value).to.contain(HIDDEN);
    });
  });

  it('filters obj2 correctly', () => {
    const result = getUnwrapped(obj2);
    assert(result);
    Object.entries(result).forEach(([, value]) => {
      expect(value).to.not.contain(sid);
      expect(value).to.contain(HIDDEN);
    });
  });

  it('filters arr1 correctly', () => {
    const result = getUnwrapped(arr1);
    assert(result);
    assert(Array.isArray(result));
    result.forEach((item: Record<string, unknown>) => {
      assert(item);
      Object.entries(item).forEach(([, value]) => {
        expect(value).to.not.contain(sid);
        expect(value).to.contain(HIDDEN);
      });
    });
  });

  it('filters arr2 correctly', () => {
    const result = getUnwrapped(arr2);
    assert(result);
    assert(Array.isArray(result));
    result.forEach((item: Record<string, unknown>) => {
      assert(item);
      Object.entries(item).forEach(([, value]) => {
        expect(value).to.not.contain(sid);
        expect(value).to.contain(HIDDEN);
      });
    });
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
      expect(result).to.have.property('accessToken').contains(HIDDEN);
    });
  });
});

const getUnwrapped = (input: unknown): unknown => unwrapArrray(filterSecrets(input));
