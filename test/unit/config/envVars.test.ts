/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { EnvVars } from '../../../src/config/envVars';
import { Global } from '../../../src/global';
import { testSetup } from '../../../src/testSetup';

describe('envVars', () => {
  const testEnvVars = ['foo', 'SFDX_ACCESS_TOKEN', 'SF_ACCESS_TOKEN', 'SF_SFDX_INTEROPERABILITY'];

  beforeEach(() => {
    Global.SFDX_INTEROPERABILITY = true;
  });

  afterEach(() => {
    for (const envVar of testEnvVars) {
      delete process.env[envVar];
    }
  });
  it('should load any env var', () => {
    process.env['foo'] = 'bar';
    const envVars = new EnvVars();
    expect(envVars.getString('foo')).to.equal('bar');
  });
  it('should load well known env var', () => {
    process.env['SFDX_ACCESS_TOKEN'] = 'some access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SFDX_ACCESS_TOKEN')).to.equal('some access token');
  });
  it('should load well known env var and set synonym', () => {
    process.env['SFDX_ACCESS_TOKEN'] = 'some access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SFDX_ACCESS_TOKEN')).to.equal('some access token');
    expect(envVars.getString('SF_ACCESS_TOKEN')).to.equal('some access token');
  });
  it('should load well known env var and override existing synonym', () => {
    process.env['SFDX_ACCESS_TOKEN'] = 'some access token';
    process.env['SF_ACCESS_TOKEN'] = 'some other access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SFDX_ACCESS_TOKEN')).to.equal('some access token');
    expect(envVars.getString('SF_ACCESS_TOKEN')).to.equal('some access token');
  });
});

describe('envVars - no interop', () => {
  before(() => {
    testSetup();
  });
  it('should load well known env var not set synonym interoperability is disabled', () => {
    process.env['SFDX_ACCESS_TOKEN'] = 'some access token';
    process.env['SF_ACCESS_TOKEN'] = 'some other access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SFDX_ACCESS_TOKEN')).to.equal('some access token');
    expect(envVars.getString('SF_ACCESS_TOKEN')).to.equal('some other access token');
  });
});
