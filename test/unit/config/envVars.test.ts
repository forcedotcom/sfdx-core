/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { describe } from 'mocha';
import { EnvVars } from '../../../src/config/envVars';
import { TestContext } from '../../../src/testSetup';
import { Lifecycle } from '../../../src/lifecycleEvents';
import { Messages } from '../../../src/messages';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'envVars');

describe('envVars', () => {
  const testEnvVars = ['foo', 'SFDX_ACCESS_TOKEN', 'SF_ACCESS_TOKEN'];
  const $$ = new TestContext();
  let warnStub: sinon.SinonStub<string[]>;

  beforeEach(() => {
    warnStub = $$.SANDBOX.stub(Lifecycle.prototype, 'emitWarning');
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
    expect(warnStub.callCount).to.equal(0);
  });

  it('should load well known env var (replaced)', () => {
    process.env['SF_ACCESS_TOKEN'] = 'some access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SF_ACCESS_TOKEN')).to.equal('some access token');
    expect(warnStub.callCount).to.equal(0);
  });

  it('should load well known env var (replaced)', () => {
    process.env['SFDX_ACCESS_TOKEN'] = 'some access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SFDX_ACCESS_TOKEN')).to.equal('some access token');
    expect(warnStub.getCalls().flatMap((c) => c.args)).to.deep.include(
      messages.getMessage('deprecatedEnv', ['SFDX_ACCESS_TOKEN', 'SF_ACCESS_TOKEN'])
    );
    expect(warnStub.callCount).to.equal(1);
  });

  it('should load well known env var and set synonym', () => {
    process.env['SFDX_ACCESS_TOKEN'] = 'some access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SFDX_ACCESS_TOKEN')).to.equal('some access token');
    expect(envVars.getString('SF_ACCESS_TOKEN')).to.equal('some access token');
    expect(warnStub.getCalls().flatMap((c) => c.args)).to.deep.include(
      messages.getMessage('deprecatedEnv', ['SFDX_ACCESS_TOKEN', 'SF_ACCESS_TOKEN'])
    );
  });

  it('should load well known env var and override existing synonym', () => {
    process.env['SFDX_ACCESS_TOKEN'] = 'some access token';
    process.env['SF_ACCESS_TOKEN'] = 'some other access token';
    const envVars = new EnvVars();
    expect(envVars.getString('SFDX_ACCESS_TOKEN')).to.equal('some other access token');
    expect(envVars.getString('SF_ACCESS_TOKEN')).to.equal('some other access token');
    expect(warnStub.getCalls().flatMap((c) => c.args)).to.deep.include(
      messages.getMessage('deprecatedEnvDisagreement', ['SFDX_ACCESS_TOKEN', 'SF_ACCESS_TOKEN', 'SF_ACCESS_TOKEN'])
    );
  });
});
