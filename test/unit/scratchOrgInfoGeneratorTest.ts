/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { /* assert,*/ expect } from 'chai';
// import { AnyJson } from '@salesforce/ts-types';
import { stubMethod, stubInterface } from '@salesforce/ts-sinon';
import { shouldThrow } from '../../src/testSetup';
import { Org } from '../../src/org';
import { Connection } from '../../src/connection';
// import { ScratchOrgInfo } from '../../src/scratchOrgInfoApi';
import { ScratchOrgInfoPayload, getAncestorIds, generateScratchOrgInfo } from '../../src/scratchOrgInfoGenerator';
import { SfdxProjectJson } from '../../src/sfdxProject';
import { Messages } from '../../src/messages';

const packageId = '05iB0000000cWwnIAE';
const packageVersionSubscriberId = '04tB0000000cWwnIAE';
const badPackageId = '03iB0000000cWwnIAE';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoGenerator');

describe('ancestorIds', () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(Connection.prototype);
    stubMethod(sandbox, Connection.prototype, 'singleRecordQuery')
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
      .resolves({ Id: packageId, IsReleased: true });
  });
  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('basic ids', () => {
    it('Should parse 05i ancestorId keys in sfdx-project.json', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId },
        ],
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal(packageId);
    });
    it('Should parse 04t ancestorId keys in sfdx-project.json', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageVersionSubscriberId },
        ],
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal(packageId);
    });
    it('Should throw on a bad ID', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: 'ABC' },
        ],
      });
      try {
        await shouldThrow(
          getAncestorIds(
            { package2AncestorIds: 'foo' } as unknown as ScratchOrgInfoPayload,
            projectJson as unknown as SfdxProjectJson,
            await Org.create({})
          )
        );
      } catch (err) {
        expect(err).to.exist;
      }
    });
    it('Should throw on a bad returned Id', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          {
            path: 'foo',
            package: packageId,
            versionNumber: '4.7.0.NEXT',
            ancestorId: 'ABC',
            ancestorVersion: '4.0.0.0',
          },
        ],
        get: (arg) => {
          if (arg === 'packageAliases') {
            return { alias: packageId };
          }
        },
      });
      try {
        await shouldThrow(
          getAncestorIds(
            { ancestorId: 'foABCo' } as unknown as ScratchOrgInfoPayload,
            projectJson as unknown as SfdxProjectJson,
            await Org.create({})
          )
        );
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe('multiple ancestors', () => {
    it('Should merge duplicated ancestors', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId },
          { path: 'bar', package: 'barPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId },
        ],
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal(packageId);
    });

    it('Should join multiple ancestors', async () => {
      const otherPackageId = packageId.replace('W', 'Q');
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId },
          { path: 'bar', package: 'barPkgName', versionNumber: '4.7.0.NEXT', ancestorId: otherPackageId },
        ],
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal(`${packageId};${otherPackageId}`);
    });
  });

  describe('unusual projects', () => {
    it('Should return an error if the package2AncestorIds key is included in the scratch org definition', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageVersionSubscriberId },
        ],
      });
      try {
        await shouldThrow(
          getAncestorIds(
            { package2AncestorIds: 'foo' } as unknown as ScratchOrgInfoPayload,
            projectJson as unknown as SfdxProjectJson,
            await Org.create({})
          )
        );
      } catch (err) {
        expect(err).to.exist;
        expect(err.message).to.equal(messages.getMessage('errorpackage2AncestorIdsKeyNotSupported'));
      }
    });

    it('Should not fail with an empty packageDirectories key', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [],
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal('');
    });

    it('Should return empty string with no ancestors', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [{ path: 'foo', package: 'fooPkgName' }],
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal('');
    });
  });

  describe('aliases as ancestorId', () => {
    it('Should resolve an alias', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: 'alias' },
        ],
        get: (arg) => {
          if (arg === 'packageAliases') {
            return { alias: packageId };
          }
        },
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal(packageId);
    });

    it('Should throw on unresolvable alias', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: 'alias' },
        ],
        get: (arg) => {
          if (arg === 'packageAliases') {
            return { notTheAlias: packageId };
          }
        },
      });
      try {
        await shouldThrow(
          getAncestorIds(
            { package2AncestorIds: 'foo' } as unknown as ScratchOrgInfoPayload,
            projectJson as unknown as SfdxProjectJson,
            await Org.create({})
          )
        );
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe('ancestorVersion', () => {
    it('Should throw on an invalid ancestorVersion', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorVersion: '5.0' },
        ],
      });
      try {
        await shouldThrow(
          getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            projectJson as unknown as SfdxProjectJson,
            await Org.create({})
          )
        );
      } catch (err) {
        expect(err).to.exist;
        expect(err.message).to.equal(messages.getMessage('errorInvalidAncestorVersionFormat', ['5.0']));
      }
    });

    it('Should resolve an alias ancestor version', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorVersion: '4.0.0.0' },
        ],
        get: (arg) => {
          if (arg === 'packageAliases') {
            return { fooPkgName: packageId };
          }
        },
      });
      expect(
        await getAncestorIds(
          {} as unknown as ScratchOrgInfoPayload,
          projectJson as unknown as SfdxProjectJson,
          await Org.create({})
        )
      ).to.equal(packageId);
    });
  });
});

describe('throws on singleRecordQuery', () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(Connection.prototype);
    stubMethod(sandbox, Connection.prototype, 'singleRecordQuery')
      .withArgs(`SELECT Id FROM Package2Version WHERE SubscriberPackageVersionId = '${packageVersionSubscriberId}'`, {
        tooling: true,
      })
      .rejects()
      .withArgs(
        `SELECT Id, IsReleased FROM Package2Version WHERE Package2Id = '${packageId}' AND MajorVersion = 4 AND MinorVersion = 0 AND PatchVersion = 0 and IsReleased = true`,
        {
          tooling: true,
        }
      )
      .rejects();
  });
  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('basic ids throw', () => {
    it('Should throw on a bad returned Id', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          {
            path: 'foo',
            package: packageId,
            versionNumber: '4.7.0.NEXT',
            ancestorId: 'ABC',
            ancestorVersion: '4.0.0.0',
          },
        ],
        get: (arg) => {
          if (arg === 'packageAliases') {
            return { alias: packageId };
          }
        },
      });
      try {
        await shouldThrow(
          getAncestorIds(
            { ancestorId: 'ABC' } as unknown as ScratchOrgInfoPayload,
            projectJson as unknown as SfdxProjectJson,
            await Org.create({})
          )
        );
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });
});

describe('different ancestorId', () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(Connection.prototype);
    stubMethod(sandbox, Connection.prototype, 'singleRecordQuery')
      .withArgs(`SELECT Id FROM Package2Version WHERE SubscriberPackageVersionId = '${packageVersionSubscriberId}'`, {
        tooling: true,
      })
      .resolves({ Id: badPackageId, IsReleased: true })
      .withArgs(
        `SELECT Id, IsReleased FROM Package2Version WHERE Package2Id = '${badPackageId}' AND MajorVersion = 4 AND MinorVersion = 0 AND PatchVersion = 0 and IsReleased = true`,
        {
          tooling: true,
        }
      )
      .resolves({ Id: badPackageId, IsReleased: true });
  });
  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });

  describe('Invalid ancestorId throws', () => {
    it('Should throw on a bad packageAliases', async () => {
      const projectJson = stubInterface<SfdxProjectJson>(sandbox, {
        getPackageDirectories: () => [
          {
            path: 'foo',
            package: badPackageId,
            versionNumber: '4.7.0.NEXT',
            ancestorId: badPackageId,
          },
        ],
        get: (arg) => {
          if (arg === 'packageAliases') {
            return { alias: packageId };
          }
        },
      });
      try {
        await shouldThrow(
          getAncestorIds(
            { ancestorId: 'ABC' } as unknown as ScratchOrgInfoPayload,
            projectJson as unknown as SfdxProjectJson,
            await Org.create({})
          )
        );
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });
});

describe('generateScratchOrgInfo', () => {
  const sandbox = sinon.createSandbox();
  beforeEach(() => {
    stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
    stubMethod(sandbox, Org.prototype, 'getConnection').returns(Connection.prototype);
    stubMethod(sandbox, Connection.prototype, 'getAuthInfoFields').returns({
      clientId: '1234',
    });
    stubMethod(sandbox, SfdxProjectJson, 'create').returns(SfdxProjectJson.prototype);
  });

  afterEach(() => {
    sandbox.restore();
  });

  after(() => {
    sandbox.restore();
  });
  it('Generates the package2AncestorIds scratch org property', async () => {
    expect(
      await generateScratchOrgInfo({
        hubOrg: await Org.create({}),
        scratchOrgInfoPayload: {} as ScratchOrgInfoPayload,
        nonamespace: false,
        ignoreAncestorIds: false,
      })
    ).to.deep.equal({
      orgName: 'Company',
      package2AncestorIds: '',
      connectedAppConsumerKey: '1234',
      connectedAppCallbackUrl: 'http://localhost:1717/OauthRedirect',
    });
  });
});
