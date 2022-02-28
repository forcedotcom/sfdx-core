/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Connection } from 'jsforce'; // RecordResult
import { AuthInfo, Org } from '../../../src/org';
import { SfProjectJson, SfProject } from '../../../src/sfProject';
import { scratchOrgCreate, ScratchOrgCreateOptions } from '../../../src/org/scratchOrgCreate';

const packageId = '05iB0000000cWwnIAE';
const packageVersionSubscriberId = '04tB0000000cWwnIAE';
const clientId = 'MyClientId';

describe('scratchOrgCreate', () => {
  const sandbox = sinon.createSandbox();
  const hubOrgStub = sinon.createStubInstance(Org);
  const authInfoStub = sinon.createStubInstance(AuthInfo);
  const sfProjectJsonStub = sinon.createStubInstance(SfProjectJson);
  const scratchOrgInfoId = '1234';
  const username = 'PlatformCLI';
  const retrieve = {
    Status: 'Active',
  };
  const authFields = {
    instanceUrl: 'https://salesforce.com',
    orgId: '12345',
  };
  beforeEach(() => {
    sandbox.stub(Org, 'create').resolves(hubOrgStub);
    sandbox.stub(AuthInfo, 'create').resolves(authInfoStub);
    sfProjectJsonStub.getPackageDirectories.resolves([
      { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId },
    ]);
    sandbox.stub(SfProject, 'resolve').resolves({
      resolveProjectConfig: sandbox.stub().resolves({
        signupTargetLoginUrl: 'https://salesforce.com',
      }),
    } as unknown as SfProject);
    hubOrgStub.isDevHubOrg.returns(false);
    hubOrgStub.determineIfDevHubOrg.withArgs(true).resolves();
    // @ts-ignore
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
          retrieve: sinon.stub().withArgs(scratchOrgInfoId).resolves(retrieve),
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
      authFields: {
        instanceUrl: 'https://salesforce.com',
        orgId: '12345',
      },
      authInfo: {},
      scratchOrgInfo: retrieve,
      username,
      warnings: [],
    });
    expect(scratchOrgCreateResult).to.have.keys(['username', 'scratchOrgInfo', 'authInfo', 'authFields', 'warnings']);
    expect(scratchOrgCreateResult).to.deep.equal({
      username,
      scratchOrgInfo: {
        Status: 'Active',
      },
      authInfo: {},
      authFields,
      warnings: [],
    });
  });
});
