/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import { SObject } from 'jsforce';
import { shouldThrow } from '../../src/testSetup';
import { Org } from '../../src/org';
import { Connection } from '../../src/connection';
import SettingsGenerator from '../../src/scratchOrgSettingsGenerator';
import { requestScratchOrgCreation, ScratchOrgInfo, JsForceError } from '../../src/scratchOrgInfoApi';
import { Messages } from '../../src/messages';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoApi');

const TEMPLATE_SCRATCH_ORG_INFO: ScratchOrgInfo = {
  LoginUrl: 'https://login.salesforce.com',
  Snapshot: '1234',
  AuthCode: '1234',
  Status: 'New',
  SignupEmail: 'sfdx-cli@salesforce.com',
  SignupUsername: 'sfdx-cli',
  Username: 'sfdx-cli',
  SignupInstance: 'http://salesforce.com',
};

describe('requestScratchOrgCreation', () => {
  const sandbox = sinon.createSandbox();
  const connectionStub = sinon.createStubInstance(Connection);
  beforeEach(() => {
    stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().resolves(true),
    } as unknown as SObject<unknown>);
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(connectionStub);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('requestScratchOrgCreation', async () => {
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    const result = await requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings);
    expect(result).to.be.true;
  });
  it('requestScratchOrgCreation JsForce Error', async () => {
    const errorString = 'JsForce-Error';
    const jsForceError = new Error(errorString) as JsForceError;
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().rejects(jsForceError),
    } as unknown as SObject<unknown>);
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      expect(error).to.exist;
      expect(error.toString()).to.include(errorString);
    }
  });
  it('requestScratchOrgCreation JsForce Error', async () => {
    const jsForceError = new Error('JsForce-Error') as JsForceError;
    jsForceError.errorCode = 'REQUIRED_FIELD_MISSING';
    jsForceError.fields = ['error-field'];
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().rejects(jsForceError),
    } as unknown as SObject<unknown>);
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      expect(error).to.exist;
      expect(error.toString()).to.include(messages.getMessage('signupFieldsMissing', [jsForceError.fields.toString()]));
    }
  });
  it('requestScratchOrgCreation has signupDuplicateSettingsSpecified', async () => {
    const hubOrg = new Org({});
    const s = { a: 'b' };
    const scratchDef = {
      ...TEMPLATE_SCRATCH_ORG_INFO,
      settings: s,
      orgPreferences: {
        preference: true,
      },
    } as unknown as ScratchOrgInfo;
    const settings = new SettingsGenerator();
    await settings.extract(scratchDef);
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, scratchDef, settings));
      assert.fail('Expected an error to be thrown.');
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.have.keys(['cause', 'name', 'actions', 'exitCode']);
      expect(error.toString()).to.include('signupDuplicateSettingsSpecified');
    }
  });
  it('requestScratchOrgCreation is deprecatedPrefFormat', async () => {
    const hubOrg = new Org({});
    const scratchDef = {
      ...TEMPLATE_SCRATCH_ORG_INFO,
      orgPreferences: {
        preference: true,
      },
    } as unknown as ScratchOrgInfo;
    const settings = new SettingsGenerator();
    await settings.extract(scratchDef);
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, scratchDef, settings));
    } catch (error) {
      expect(error).to.exist;
      expect(error).to.have.keys(['cause', 'name', 'actions', 'exitCode']);
      expect(error.toString()).to.include(messages.getMessage('deprecatedPrefFormat'));
    }
  });
});
