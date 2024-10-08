/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Duration } from '@salesforce/kit';
import { Connection } from '@jsforce/jsforce-node';
import { Org } from '../../../src/org/org';
import { AuthInfo } from '../../../src/org/authInfo';
import { SfProject, SfProjectJson } from '../../../src/sfProject';
import { scratchOrgCreate, ScratchOrgCreateOptions, scratchOrgResume } from '../../../src/org/scratchOrgCreate';
import { ScratchOrgCache } from '../../../src/org/scratchOrgCache';

const packageId = '05iB0000000cWwnIAE';
const packageVersionSubscriberId = '04tB0000000cWwnIAE';
const clientId = 'MyClientId';

describe('scratchOrgCreate', () => {
  const sandbox = sinon.createSandbox();
  const hubOrgStub = sinon.createStubInstance(Org);
  const authInfoStub = sinon.createStubInstance(AuthInfo);
  const sfProjectJsonStub = sinon.createStubInstance(SfProjectJson);
  const cacheStub = sinon.createStubInstance(ScratchOrgCache);
  let authInfoCreateStub: sinon.SinonStub;
  let sfProjectResolveStub: sinon.SinonStub;
  const signupTargetLoginUrl = 'https://signup-target-login-url.salesforce.com';
  const scratchOrgInfoId = '2SR3u0000008gBEGAY';
  const username = 'PlatformCLI';
  const scratchOrgInfo = {
    Status: 'Active',
    SignupUsername: username,
    Id: scratchOrgInfoId,
    SignupInstance: 'CS51',
  };
  const authFields = {
    instanceUrl: 'https://salesforce.com',
    orgId: '00D0R000000eJDy',
  };
  beforeEach(() => {
    sandbox.stub(ScratchOrgCache, 'create').resolves(cacheStub);
    sandbox.stub(Org, 'create').resolves(hubOrgStub);
    authInfoCreateStub = sandbox.stub(AuthInfo, 'create');
    authInfoCreateStub.resolves(authInfoStub);
    sfProjectJsonStub.getPackageDirectories.resolves([
      { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId },
    ]);
    sfProjectResolveStub = sandbox.stub(SfProject, 'resolve');
    sfProjectResolveStub.resolves({
      resolveProjectConfig: sandbox.stub().resolves({ signupTargetLoginUrl }),
    } as unknown as SfProject);
    hubOrgStub.isDevHubOrg.returns(true);
    hubOrgStub.determineIfDevHubOrg.withArgs(true).resolves();
    // @ts-expect-error - type not complete
    hubOrgStub.getConnection.returns({
      getAuthInfoFields: sandbox.stub().returns({
        clientId,
      }),
      tooling: {
        sobject: sandbox
          .stub()
          .withArgs('SourceMember')
          .returns({
            find: sandbox
              .stub()
              .withArgs({ RevisionCounter: { $gt: 0 } }, ['Id'])
              .resolves([
                {
                  Id: '1234',
                },
              ]),
            update: sandbox.spy(),
          }),
      },
      sobject: sandbox
        .stub()
        .withArgs('ScratchOrgInfo')
        .returns({
          create: sinon.stub().resolves({
            id: scratchOrgInfoId,
          }),
          retrieve: sinon.stub().withArgs(scratchOrgInfoId).resolves(scratchOrgInfo),
        }),
      singleRecordQuery: sandbox
        .stub()
        .withArgs(`SELECT Id FROM Package2Version WHERE SubscriberPackageVersionId = '${packageVersionSubscriberId}'`, {
          tooling: true,
        })
        .resolves({ Id: packageId, IsReleased: true })
        .withArgs(
          `SELECT Id, IsReleased FROM Package2Version WHERE Package2Id = '${packageId}' AND MajorVersion = 4 AND MinorVersion = 0 AND PatchVersion = 0 and IsReleased = true`,
          {
            tooling: true,
          }
        )
        .resolves({ Id: packageId, IsReleased: true }),
    } as unknown as Connection);
    hubOrgStub.getUsername.returns(username);
    authInfoStub.getFields.returns(authFields);
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('scratchOrgCreate happy path', async () => {
    const scratchOrgCreateOptions = {
      hubOrg: hubOrgStub,
    } as ScratchOrgCreateOptions;
    const scratchOrgCreateResult = await scratchOrgCreate(scratchOrgCreateOptions);
    expect(scratchOrgCreateResult).to.deep.equal({
      authFields,
      authInfo: {},
      scratchOrgInfo,
      username,
      warnings: [],
    });
    expect(scratchOrgCreateResult).to.deep.equal({
      username,
      scratchOrgInfo,
      authInfo: {},
      authFields,
      warnings: [],
    });
    const authInfoOptions = authInfoCreateStub.firstCall.args[0] as AuthInfo.Options;
    expect(authInfoOptions.oauth2Options).to.have.property('loginUrl', signupTargetLoginUrl);
  });

  it('exits early for wait 0', async () => {
    const scratchOrgCreateOptions = {
      hubOrg: hubOrgStub,
      wait: Duration.minutes(0),
    } as ScratchOrgCreateOptions;
    const scratchOrgCreateResult = await scratchOrgCreate(scratchOrgCreateOptions);
    // early return does not have the optional auth stuff
    expect(scratchOrgCreateResult).to.deep.equal({
      scratchOrgInfo,
      username,
      warnings: [],
    });
  });

  it('resumes with signupTargetLoginUrl override', async () => {
    cacheStub.get.withArgs(scratchOrgInfoId).returns({
      hubUsername: 'PlatformCLI',
    });
    cacheStub.has.withArgs(scratchOrgInfoId).returns(true);
    const scratchOrgCreateResult = await scratchOrgResume(scratchOrgInfoId);
    // resume has all the data it originally would have
    expect(scratchOrgCreateResult).to.deep.equal({
      username,
      scratchOrgInfo,
      authInfo: {},
      authFields,
      warnings: [],
    });
    const authInfoOptions = authInfoCreateStub.firstCall.args[0] as AuthInfo.Options;
    expect(authInfoOptions.oauth2Options).to.have.property('loginUrl', signupTargetLoginUrl);
  });

  it('resumes without signupTargetLoginUrl override', async () => {
    cacheStub.get.withArgs(scratchOrgInfoId).returns({
      hubUsername: 'PlatformCLI',
    });
    cacheStub.has.withArgs(scratchOrgInfoId).returns(true);
    sfProjectResolveStub.restore();
    sandbox.stub(SfProject, 'resolve').resolves({
      resolveProjectConfig: sandbox.stub().resolves({}),
    } as unknown as SfProject);
    const scratchOrgCreateResult = await scratchOrgResume(scratchOrgInfoId);
    // resume has all the data it originally would have
    expect(scratchOrgCreateResult).to.deep.equal({
      username,
      scratchOrgInfo,
      authInfo: {},
      authFields,
      warnings: [],
    });
    const authInfoOptions = authInfoCreateStub.firstCall.args[0] as AuthInfo.Options;
    expect(authInfoOptions.oauth2Options).to.have.property(
      'loginUrl',
      `https://${scratchOrgInfo.SignupInstance}.salesforce.com`
    );
  });
});
