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
import { AuthInfo } from '../../src/authInfo';
import { MyDomainResolver } from '../../src/status/myDomainResolver';
import SettingsGenerator from '../../src/scratchOrgSettingsGenerator';
import {
  requestScratchOrgCreation,
  ScratchOrgInfo,
  JsForceError,
  deploySettingsAndResolveUrl,
} from '../../src/scratchOrgInfoApi';
import { Messages } from '../../src/messages';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoApi');
const errorCodesMessages = Messages.loadMessages('@salesforce/core', 'scratchOrgErrorCodes');

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
    const error = new Error('MyError');
    error.name = 'NamedOrgNotFound';
    stubMethod(sandbox, AuthInfo, 'create').rejects(error);
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    const result = await requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings);
    expect(result).to.be.true;
  });

  it('requestScratchOrgCreation no username field in scratchOrgRequest', async () => {
    const scratchOrgRequest = Object.assign({}, TEMPLATE_SCRATCH_ORG_INFO);
    delete scratchOrgRequest.Username;
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    const result = await requestScratchOrgCreation(hubOrg, scratchOrgRequest, settings);
    expect(result).to.be.true;
  });

  it('requestScratchOrgCreation no username field in scratchOrgRequest is empty', async () => {
    const scratchOrgRequest = Object.assign({}, TEMPLATE_SCRATCH_ORG_INFO);
    scratchOrgRequest.Username = undefined;
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    const result = await requestScratchOrgCreation(hubOrg, scratchOrgRequest, settings);
    expect(result).to.be.true;
  });

  it('requestScratchOrgCreation user exists', async () => {
    stubMethod(sandbox, AuthInfo, 'create').resolves();
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include(errorCodesMessages.getMessage('C-1007'));
    }
  });

  it('requestScratchOrgCreation JsForce Error NamedOrgNotFound', async () => {
    const err = new Error('MyError');
    err.name = 'NamedOrgNotFound';
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().rejects(),
    } as unknown as SObject<unknown>);
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      expect(error).to.exist;
    }
  });

  it('requestScratchOrgCreation JsForce Error', async () => {
    const err = new Error('MyError');
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().rejects(),
    } as unknown as SObject<unknown>);
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include('MyError');
    }
  });

  it('requestScratchOrgCreation JsForce Error with REQUIRED_FIELD_MISSING', async () => {
    const err = new Error('MyError');
    err.name = 'NamedOrgNotFound';
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
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
      expect(error.message).to.include(messages.getMessage('signupFieldsMissing', [jsForceError.fields.toString()]));
    }
  });

  it('requestScratchOrgCreation JsForce Error with REQUIRED_FIELD_MISSING', async () => {
    const err = new Error('MyError');
    err.name = 'NamedOrgNotFound';
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
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
      expect(error.message).to.include(messages.getMessage('signupFieldsMissing', [jsForceError.fields.toString()]));
    }
  });

  it('requestScratchOrgCreation has signupDuplicateSettingsSpecified', async () => {
    const err = new Error('MyError');
    err.name = 'NamedOrgNotFound';
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
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
    const err = new Error('MyError');
    err.name = 'NamedOrgNotFound';
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
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

describe('requestScratchOrgCreation', () => {
  const sandbox = sinon.createSandbox();
  const scratchOrgAuthInfoStub = sinon.createStubInstance(AuthInfo);
  const orgSettingsStub = sinon.createStubInstance(SettingsGenerator);
  const myDomainResolverStub = sinon.createStubInstance(MyDomainResolver);
  const apiVersion = '53.0';
  const scratchOrg = new Org({});
  beforeEach(() => {
    stubMethod(sandbox, MyDomainResolver, 'create').returns(myDomainResolverStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('requestScratchOrgCreation happy path', async () => {
    orgSettingsStub.hasSettings.returns(true);
    orgSettingsStub.createDeploy.resolves();
    orgSettingsStub.deploySettingsViaFolder.withArgs(scratchOrg, apiVersion).resolves();
    scratchOrgAuthInfoStub.getFields.returns({
      instanceUrl: 'https://my-org.salesforce.com',
    });
    myDomainResolverStub.resolve.resolves();
    const authInfo = await deploySettingsAndResolveUrl(scratchOrgAuthInfoStub, apiVersion, orgSettingsStub, scratchOrg);
    expect(authInfo).to.equal(scratchOrgAuthInfoStub);
  });

  it('requestScratchOrgCreation does not have settings', async () => {
    orgSettingsStub.hasSettings.returns(false);
    orgSettingsStub.createDeploy.resolves();
    orgSettingsStub.deploySettingsViaFolder.withArgs(scratchOrg, apiVersion).resolves();
    scratchOrgAuthInfoStub.getFields.returns({
      instanceUrl: 'https://my-org.salesforce.com',
    });
    myDomainResolverStub.resolve.resolves();
    const authInfo = await deploySettingsAndResolveUrl(scratchOrgAuthInfoStub, apiVersion, orgSettingsStub, scratchOrg);
    expect(authInfo).to.equal(scratchOrgAuthInfoStub);
  });

  it('requestScratchOrgCreation createDeploy fails', async () => {
    orgSettingsStub.hasSettings.returns(true);
    orgSettingsStub.createDeploy.rejects(new Error('MyError'));
    try {
      await shouldThrow(deploySettingsAndResolveUrl(scratchOrgAuthInfoStub, apiVersion, orgSettingsStub, scratchOrg));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include('MyError');
    }
  });

  it('requestScratchOrgCreation cant resolve loginUrl', async () => {
    orgSettingsStub.hasSettings.returns(false);
    orgSettingsStub.createDeploy.resolves();
    orgSettingsStub.deploySettingsViaFolder.withArgs(scratchOrg, apiVersion).resolves();
    scratchOrgAuthInfoStub.getFields.returns({
      instanceUrl: 'https://my-org.salesforce.com',
    });
    myDomainResolverStub.resolve.rejects(new Error('MyError'));
    try {
      await shouldThrow(deploySettingsAndResolveUrl(scratchOrgAuthInfoStub, apiVersion, orgSettingsStub, scratchOrg));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include('MyError');
    }
  });

  it('requestScratchOrgCreation cant resolve loginUrl with MyDomainResolverTimeoutError', async () => {
    orgSettingsStub.hasSettings.returns(false);
    orgSettingsStub.createDeploy.resolves();
    orgSettingsStub.deploySettingsViaFolder.withArgs(scratchOrg, apiVersion).resolves();
    const fields = {
      instanceUrl: 'https://my-org.salesforce.com',
      orgId: 'MyOrg',
      username: 'PlatformCLI',
    };
    scratchOrgAuthInfoStub.getFields.returns(fields);
    const networkError = new Error('MyError');
    networkError.name = 'MyDomainResolverTimeoutError';
    myDomainResolverStub.resolve.rejects(networkError);
    try {
      await shouldThrow(deploySettingsAndResolveUrl(scratchOrgAuthInfoStub, apiVersion, orgSettingsStub, scratchOrg));
    } catch (error) {
      expect(error).to.exist;
      expect(error.data).to.have.keys(['orgId', 'username', 'instanceUrl']);
      expect(error.data).to.deep.equal(fields);
    }
  });

  it('requestScratchOrgCreation AuthInfo.getFields returns undefined instanceUrl', async () => {
    orgSettingsStub.hasSettings.returns(true);
    orgSettingsStub.createDeploy.resolves();
    orgSettingsStub.deploySettingsViaFolder.withArgs(scratchOrg, apiVersion).resolves();
    scratchOrgAuthInfoStub.getFields.returns({
      instanceUrl: undefined,
    });
    myDomainResolverStub.resolve.resolves();
    const authInfo = await deploySettingsAndResolveUrl(scratchOrgAuthInfoStub, apiVersion, orgSettingsStub, scratchOrg);
    expect(authInfo).to.equal(undefined);
  });
});
