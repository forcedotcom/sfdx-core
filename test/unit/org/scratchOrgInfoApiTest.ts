/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import * as sinon from 'sinon';
import { expect } from 'chai';
import { env, Duration } from '@salesforce/kit';
import { stubMethod } from '@salesforce/ts-sinon';
import { Connection } from '../../../src/org';
import { shouldThrow } from '../../../src/testSetup';
import { Org } from '../../../src/org';
import { AuthInfo } from '../../../src/org';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import SettingsGenerator from '../../../src/org/scratchOrgSettingsGenerator';
import {
  requestScratchOrgCreation,
  JsForceError,
  deploySettings,
  resolveUrl,
  pollForScratchOrgInfo,
  authorizeScratchOrg,
} from '../../../src/org/scratchOrgInfoApi';
import * as mockForStandaloneFunctions from '../../../src/org/scratchOrgInfoApi';
import { ScratchOrgInfo } from '../../../src/org/scratchOrgTypes';
import { Messages } from '../../../src/messages';
import { SfError } from '../../../src/sfError';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoApi');
const errorCodesMessages = Messages.load('@salesforce/core', 'scratchOrgErrorCodes', [
  'SignupFailedUnknownError',
  'C-1007',
]);

const scratchOrgInfoId = '2SRK0000001QZxF';
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
    // @ts-ignore partial type returned
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().resolves(true),
    });
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(connectionStub);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('requestScratchOrgCreation tests basic ScratchOrgInfo object with all fields included', async () => {
    const error = new Error('MyError');
    error.name = 'NamedOrgNotFoundError';
    stubMethod(sandbox, AuthInfo, 'create').rejects(error);
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    const result = await requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings);
    expect(result).to.be.true;
  });

  it('requestScratchOrgCreation no username field in scratchOrgRequest', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { Username, ...scratchOrgRequest } = { ...TEMPLATE_SCRATCH_ORG_INFO };
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    const result = await requestScratchOrgCreation(hubOrg, scratchOrgRequest as ScratchOrgInfo, settings);
    expect(result).to.be.true;
  });

  it('requestScratchOrgCreation no username field in scratchOrgRequest is empty', async () => {
    const scratchOrgRequest = { ...TEMPLATE_SCRATCH_ORG_INFO, Username: undefined };
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

  it('requestScratchOrgCreation Error AuthInfo.create fails with NamedOrgNotFound and sobject fails too', async () => {
    const err = new Error('MyError');
    err.name = 'NamedOrgNotFoundError';
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().rejects(new Error('MyCreateError')),
    });
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include('MyCreateError');
    }
  });

  it('requestScratchOrgCreation AuthInfo.create fails', async () => {
    const err = new Error('MyError');
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().rejects(),
    });
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include('MyError');
    }
  });

  it('requestScratchOrgCreation sobject().create fails with REQUIRED_FIELD_MISSING', async () => {
    const err = new Error('MyError');
    err.name = 'NamedOrgNotFoundError';
    stubMethod(sandbox, AuthInfo, 'create').rejects(err);
    const jsForceError = {
      ...new Error('JsForce-Error'),
      errorCode: 'REQUIRED_FIELD_MISSING',
      fields: ['error-field'],
    } as JsForceError;

    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      create: sinon.stub().rejects(jsForceError),
    });
    const hubOrg = new Org({});
    const settings = new SettingsGenerator();
    try {
      await shouldThrow(requestScratchOrgCreation(hubOrg, TEMPLATE_SCRATCH_ORG_INFO, settings));
    } catch (error) {
      const e = error as SfError;
      expect(e).to.exist;
      expect(e).to.have.property('message');
      expect(e.message).to.include(messages.getMessage('SignupFieldsMissingError', [jsForceError.fields.toString()]));
    }
  });

  it('requestScratchOrgCreation has SignupDuplicateSettingsSpecifiedError', async () => {
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
    } catch (error) {
      if (!(error instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(error).to.exist;
      expect(error).to.have.keys(['cause', 'name', 'actions', 'exitCode']);
      expect(error.toString()).to.include('SignupDuplicateSettingsSpecifiedError');
    }
  });

  it('requestScratchOrgCreation is DeprecatedPrefFormat', async () => {
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
      if (!(error instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(error).to.exist;
      expect(error).to.have.keys(['cause', 'name', 'actions', 'exitCode']);
      expect(error.toString()).to.include(messages.getMessage('DeprecatedPrefFormat'));
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
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(Connection.prototype);
    stubMethod(sandbox, mockForStandaloneFunctions, 'updateRevisionCounterToZero').resolves();
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
    const [authInfo] = await Promise.all([
      resolveUrl(scratchOrgAuthInfoStub),
      deploySettings(scratchOrg, orgSettingsStub, apiVersion),
    ]);
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
    const [authInfo] = await Promise.all([
      resolveUrl(scratchOrgAuthInfoStub),
      deploySettings(scratchOrg, orgSettingsStub, apiVersion),
    ]);
    expect(authInfo).to.equal(scratchOrgAuthInfoStub);
  });

  it('requestScratchOrgCreation createDeploy fails', async () => {
    orgSettingsStub.hasSettings.returns(true);
    orgSettingsStub.createDeploy.rejects(new Error('MyError'));
    try {
      await shouldThrow(deploySettings(scratchOrg, orgSettingsStub, apiVersion));
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
      await shouldThrow(resolveUrl(scratchOrgAuthInfoStub));
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
      await shouldThrow(resolveUrl(scratchOrgAuthInfoStub));
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
    try {
      await shouldThrow(resolveUrl(scratchOrgAuthInfoStub));
    } catch (error) {
      expect(error).to.exist;
      expect(error.data).to.have.keys(['orgId', 'username', 'instanceUrl']);
    }
  });
});

describe('pollForScratchOrgInfo', () => {
  const sandbox = sinon.createSandbox();
  const username = 'PlatformCLI';
  const hubOrg = new Org({});
  const connectionStub = sinon.createStubInstance(Connection);
  const orgId = '00D123456789012345';
  beforeEach(() => {
    stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(connectionStub);
    stubMethod(sandbox, Org.prototype, 'getUsername').returns(username);
    stubMethod(sandbox, Org.prototype, 'getOrgId').returns(orgId);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('pollForScratchOrgInfo return Status: Active', async () => {
    const retrieve = {
      Status: 'Active',
      Id: scratchOrgInfoId,
    };
    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).resolves(retrieve),
    });
    const result = await pollForScratchOrgInfo(hubOrg, scratchOrgInfoId);
    expect(result).to.deep.equal(retrieve);
  });

  it('pollForScratchOrgInfo return Status: Error', async () => {
    const retrieve = {
      Status: 'Error',
      Id: scratchOrgInfoId,
    };
    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).resolves(retrieve),
    });
    try {
      await shouldThrow(pollForScratchOrgInfo(hubOrg, scratchOrgInfoId));
    } catch (error) {
      expect(error).to.exist;
      expect(error.message).to.include(
        errorCodesMessages.getMessage('SignupFailedUnknownError', [scratchOrgInfoId, username]),
        'signupFailedUnknown'
      );
    }
  });

  it('pollForScratchOrgInfo keeps polling until Active', async () => {
    const creating = {
      Status: 'Creating',
      Id: scratchOrgInfoId,
    };
    const active = {
      Status: 'Active',
      Id: scratchOrgInfoId,
    };
    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).onCall(0).resolves(creating).onCall(1).resolves(active),
    });
    const result = await pollForScratchOrgInfo(hubOrg, scratchOrgInfoId);
    expect(result).to.deep.equal(active);
  });

  it('pollForScratchOrgInfo retrieve rejects with timeout', async () => {
    const timeout = Duration.milliseconds(150);
    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon.stub().withArgs(scratchOrgInfoId).rejects(new Error('MyError')),
    });
    try {
      await shouldThrow(pollForScratchOrgInfo(hubOrg, scratchOrgInfoId, timeout));
    } catch (error) {
      expect(error).to.exist;
      expect(error.name).to.include('ScratchOrgInfoTimeoutError');
    }
  });

  it('pollForScratchOrgInfo should tolerate network errors', async () => {
    const retrieve = {
      Id: scratchOrgInfoId,
      Status: 'Active',
    };
    const timeout = Duration.milliseconds(3000);
    // @ts-ignore
    connectionStub.sobject.withArgs('ScratchOrgInfo').returns({
      retrieve: sinon
        .stub()
        .withArgs(scratchOrgInfoId)
        .onCall(0)
        .rejects(new Error('ETIMEDOUT'))
        .onCall(1)
        .rejects(new Error('ENOTFOUND'))
        .onCall(2)
        .resolves(retrieve),
    });
    const result = await pollForScratchOrgInfo(hubOrg, scratchOrgInfoId, timeout);
    expect(result).to.deep.equal(retrieve);
  });
});

describe('authorizeScratchOrg', () => {
  const sandbox = sinon.createSandbox();
  const hubOrgStub = sinon.createStubInstance(Org);
  const connectionStub = sinon.createStubInstance(Connection);
  const privateKey = '12345';
  const username = 'PlatformCLI';
  const authInfo = {
    save: sinon.stub().resolves(),
  };
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
      if (!(error instanceof Error)) {
        expect.fail('should have thrown SfError');
      }
      expect(error).to.exist;
      expect(error.toString()).to.include('Timeout');
    }
  });
});
