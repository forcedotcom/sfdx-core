/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
