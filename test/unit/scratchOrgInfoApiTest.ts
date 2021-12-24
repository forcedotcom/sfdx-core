/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { env, Duration } from '@salesforce/kit';
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
  pollForScratchOrgInfo,
  authorizeScratchOrg,
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

describe('pollForScratchOrgInfo', () => {
  const sandbox = sinon.createSandbox();
  const hubOrg = new Org({});
  const scratchOrgInfoId = '1234';
  const username = 'PlatformCLI';
  const connectionStub = sinon.createStubInstance(Connection);

  beforeEach(() => {
    stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(connectionStub);
    stubMethod(sandbox, Org.prototype, 'getUsername').returns(username);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('pollForScratchOrgInfo return Status: Active', async () => {
    const retrieve = {
      Status: 'Active',
    };
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).resolves(retrieve),
    } as unknown as SObject<unknown>);
    const result = await pollForScratchOrgInfo(hubOrg, scratchOrgInfoId);
    expect(result).to.deep.equal(retrieve);
  });

  it('pollForScratchOrgInfo return Status: Error', async () => {
    const retrieve = {
      Status: 'Error',
      Id: scratchOrgInfoId,
    };
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).resolves(retrieve),
    } as unknown as SObject<unknown>);
    try {
      await shouldThrow(pollForScratchOrgInfo(hubOrg, scratchOrgInfoId));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include(
        errorCodesMessages.getMessage('signupFailedUnknown', [scratchOrgInfoId, username]),
        'signupFailedUnknown'
      );
    }
  });

  it('pollForScratchOrgInfo retrieve rejects', async () => {
    const creating = {
      Status: 'Creating',
    };
    const active = {
      Status: 'Active',
    };
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).onCall(0).resolves(creating).onCall(1).resolves(active),
    } as unknown as SObject<unknown>);
    const result = await pollForScratchOrgInfo(hubOrg, scratchOrgInfoId);
    expect(result).to.deep.equal(active);
  });

  it('pollForScratchOrgInfo retrieve rejects', async () => {
    const timeout = Duration.milliseconds(150);
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).rejects(new Error('MyError')),
    } as unknown as SObject<unknown>);
    try {
      await shouldThrow(pollForScratchOrgInfo(hubOrg, scratchOrgInfoId, timeout));
    } catch (error) {
      expect(error).to.exist;
      expect(error.name).to.include('orgCreationTimeout');
    }
  });
});

describe('authorizeScratchOrg', () => {
  const sandbox = sinon.createSandbox();
  const hubOrgStub = sinon.createStubInstance(Org);
  const connectionStub = sinon.createStubInstance(Connection);
  const privateKey = '12345';
  const username = 'PlatformCLI';
  const authInfo = 'my-auth-info';
  let authInfoStub: sinon.SinonStub;
  beforeEach(() => {
    authInfoStub = stubMethod(sandbox, AuthInfo, 'create').resolves(authInfo);
    stubMethod(sandbox, AuthInfo.prototype, 'save').resolves();
    connectionStub.getAuthInfoFields.returns({
      privateKey,
    });
    hubOrgStub.getConnection.returns(connectionStub);
    hubOrgStub.getUsername.returns(username);
  });

  afterEach(() => {
    env.unset('SFDX_CLIENT_SECRET');
    sandbox.restore();
  });

  it('authorizeScratchOrg', async () => {
    hubOrgStub.isDevHubOrg.returns(true);
    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete: TEMPLATE_SCRATCH_ORG_INFO,
      hubOrg: hubOrgStub,
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg with signupTargetLoginUrlConfig', async () => {
    hubOrgStub.isDevHubOrg.returns(true);
    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete: TEMPLATE_SCRATCH_ORG_INFO,
      hubOrg: hubOrgStub,
      signupTargetLoginUrlConfig: 'http://salesforce.com',
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg with SignupInstance', async () => {
    hubOrgStub.isDevHubOrg.returns(true);
    const scratchOrgInfoComplete = Object.assign({}, TEMPLATE_SCRATCH_ORG_INFO, {
      SignupInstance: 'utf8',
    });
    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete,
      hubOrg: hubOrgStub,
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg with SignupInstance ends with s', async () => {
    hubOrgStub.isDevHubOrg.returns(true);
    const scratchOrgInfoComplete = Object.assign({}, TEMPLATE_SCRATCH_ORG_INFO, {
      SignupInstance: 's',
    });
    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete,
      hubOrg: hubOrgStub,
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg isJwtFlow with SFDX_CLIENT_SECRET', async () => {
    hubOrgStub.isDevHubOrg.returns(true);
    env.setString('SFDX_CLIENT_SECRET', '1234');

    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete: TEMPLATE_SCRATCH_ORG_INFO,
      hubOrg: hubOrgStub,
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg not isJwtFlow and clientSecret', async () => {
    hubOrgStub.isDevHubOrg.returns(true);
    connectionStub.getAuthInfoFields.returns({
      privateKey: undefined,
    });

    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete: TEMPLATE_SCRATCH_ORG_INFO,
      hubOrg: hubOrgStub,
      clientSecret: '1234',
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg not isJwtFlow no clientSecret', async () => {
    hubOrgStub.isDevHubOrg.returns(true);
    connectionStub.getAuthInfoFields.returns({
      privateKey: undefined,
    });

    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete: TEMPLATE_SCRATCH_ORG_INFO,
      hubOrg: hubOrgStub,
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg not DevHub with retry', async () => {
    hubOrgStub.isDevHubOrg.returns(false);
    hubOrgStub.determineIfDevHubOrg.withArgs(true).resolves();

    const result = await authorizeScratchOrg({
      scratchOrgInfoComplete: TEMPLATE_SCRATCH_ORG_INFO,
      hubOrg: hubOrgStub,
      retry: 2,
    });

    expect(result).to.be.equal(authInfo);
  });

  it('authorizeScratchOrg retry fails and timeouts', async () => {
    authInfoStub.restore();
    stubMethod(sandbox, AuthInfo, 'create').rejects(new Error('MyError'));
    env.setNumber('SFDX_JWT_AUTH_RETRY_TIMEOUT', 1);
    hubOrgStub.isDevHubOrg.returns(true);

    try {
      await shouldThrow(
        authorizeScratchOrg({
          scratchOrgInfoComplete: TEMPLATE_SCRATCH_ORG_INFO,
          hubOrg: hubOrgStub,
          retry: 2,
        })
      );
    } catch (error) {
      expect(error).to.exist;
      expect(error.toString()).to.include('Timeout');
    }
  });
});
