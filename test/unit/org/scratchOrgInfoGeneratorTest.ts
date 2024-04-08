/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'node:fs';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { stubMethod, stubInterface } from '@salesforce/ts-sinon';
import { MockTestOrgData, shouldThrow, TestContext } from '../../../src/testSetup';
import { Org } from '../../../src/org/org';
import { Connection } from '../../../src/org/connection';
import {
  ScratchOrgInfoPayload,
  getAncestorIds,
  generateScratchOrgInfo,
  getScratchOrgInfoPayload,
} from '../../../src/org/scratchOrgInfoGenerator';
import { SfProjectJson } from '../../../src/sfProject';
import { Messages } from '../../../src/messages';

const packageId = '05iB0000000cWwnIAE';
const packageVersionSubscriberId = '04tB0000000cWwnIAE';
const badPackageId = '03iB0000000cWwnIAE';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgInfoGenerator');

describe('scratchOrgInfoGenerator', () => {
  const $$ = new TestContext();

  describe('ancestorIds', () => {
    const testData = new MockTestOrgData();

    beforeEach(async () => {
      await $$.stubAuths(testData);

      stubMethod($$.SANDBOX, Org, 'create').resolves(Org.prototype);
      stubMethod($$.SANDBOX, Org.prototype, 'getConnection').returns(Connection.prototype);
      stubMethod($$.SANDBOX, Connection.prototype, 'singleRecordQuery')
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
        .resolves({ Id: packageId, IsReleased: true })
        .withArgs(
          'SELECT Id FROM Package2Version ' +
            `WHERE Package2Id = '${packageId}' AND IsReleased = True AND IsDeprecated = False AND PatchVersion = 0 ` +
            'ORDER BY MajorVersion Desc, MinorVersion Desc, PatchVersion Desc, BuildNumber Desc LIMIT 1',
          {
            tooling: true,
          }
        )
        .resolves({ Id: packageId, IsReleased: true });
    });

    describe('basic ids', () => {
      it('Should parse 05i ancestorId keys in sfdx-project.json', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorId: packageId,
                default: true,
              },
            ],
            packageAliases: { alias: packageId },
          },
        });
        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(packageId);
      });
      it('Should parse 04t ancestorId keys in sfdx-project.json', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorId: packageVersionSubscriberId,
                default: true,
              },
            ],
            packageAliases: { alias: packageId },
          },
        });
        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(packageId);
      });
      it('Should throw on a bad ID', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: 'ABC', default: true },
            ],
          },
        });

        try {
          await shouldThrow(
            getAncestorIds(
              { package2AncestorIds: 'foo' } as unknown as ScratchOrgInfoPayload,
              await SfProjectJson.create(),
              await Org.create({})
            )
          );
        } catch (err) {
          expect(err).to.exist;
        }
      });
      it('Should throw on a bad returned Id', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: packageId,
                versionNumber: '4.7.0.NEXT',
                ancestorId: 'ABC',
                ancestorVersion: '4.0.0.0',
                default: true,
              },
            ],
            packageAliases: { alias: packageId },
          },
        });

        try {
          await shouldThrow(
            getAncestorIds(
              { ancestorId: 'foABCo' } as unknown as ScratchOrgInfoPayload,
              await SfProjectJson.create(),
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
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId, default: true },
              { path: 'bar', package: 'barPkgName', versionNumber: '4.7.0.NEXT', ancestorId: packageId },
            ],
            packageAliases: { alias: packageId },
          },
        });

        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(packageId);
      });

      it('Should join multiple ancestors', async () => {
        const otherPackageId = packageId.replace('W', 'Q');
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorId: packageId,
                default: true,
              },
              { path: 'bar', package: 'barPkgName', versionNumber: '4.7.0.NEXT', ancestorId: otherPackageId },
            ],
            packageAliases: { alias: packageId },
          },
        });

        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(`${packageId};${otherPackageId}`);
      });
    });

    describe('unusual projects', () => {
      it('Should return an error if the package2AncestorIds key is included in the scratch org definition', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorId: packageVersionSubscriberId,
                default: true,
              },
            ],
          },
        });

        try {
          await shouldThrow(
            getAncestorIds(
              { package2AncestorIds: 'foo' } as unknown as ScratchOrgInfoPayload,
              await SfProjectJson.create(),
              await Org.create({})
            )
          );
        } catch (err) {
          expect(err).to.exist;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect((err as Error).message).to.equal(messages.getMessage('Package2AncestorsIdsKeyNotSupportedError'));
        }
      });

      it('Should return empty string with no ancestors', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
              },
            ],
          },
        });
        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal('');
      });
    });

    describe('aliases as ancestorId', () => {
      it('Should resolve an alias', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorId: 'alias',
                default: true,
              },
            ],
            packageAliases: { alias: packageId },
          },
        });
        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(packageId);
      });

      it('Should resolve an alias packageAliases is undefined', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorId: 'alias',
                default: true,
              },
            ],
          },
        });

        try {
          await shouldThrow(
            getAncestorIds({} as unknown as ScratchOrgInfoPayload, await SfProjectJson.create(), await Org.create({}))
          );
        } catch (err) {
          expect(err).to.exist;
        }
      });

      it('Should throw on unresolvable alias', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorId: 'alias',
                default: true,
              },
            ],
            packageAliases: { notTheAlias: packageId },
          },
        });
        try {
          await shouldThrow(
            getAncestorIds(
              { package2AncestorIds: 'foo' } as unknown as ScratchOrgInfoPayload,
              await SfProjectJson.create(),
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
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorVersion: '5.0',
                default: true,
              },
            ],
            packageAliases: { alias: packageId },
          },
        });

        try {
          await shouldThrow(
            getAncestorIds({} as unknown as ScratchOrgInfoPayload, await SfProjectJson.create(), await Org.create({}))
          );
        } catch (err) {
          expect(err).to.exist;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect((err as Error).message).to.equal(messages.getMessage('InvalidAncestorVersionFormatError', ['5.0']));
        }
      });

      it('Should resolve an alias ancestor version', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorVersion: '4.0.0.0',
                default: true,
              },
            ],
            packageAliases: { fooPkgName: packageId },
          },
        });
        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(packageId);
      });

      it('Should resolve via HIGHEST ancestorVersion', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorVersion: 'HIGHEST',
                default: true,
              },
            ],
            packageAliases: { fooPkgName: packageId },
          },
        });

        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(packageId);
      });

      it('Should resolve via NONE ancestorVersion', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              {
                path: 'foo',
                package: 'fooPkgName',
                versionNumber: '4.7.0.NEXT',
                ancestorVersion: 'NONE',
                default: true,
              },
            ],
            packageAliases: { fooPkgName: packageId },
          },
        });

        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal('');
      });
      it('Should resolve via HIGHEST ancestorId', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: 'HIGHEST', default: true },
            ],
            packageAliases: { fooPkgName: packageId },
          },
        });

        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal(packageId);
      });

      it('Should resolve via NONE ancestorId', async () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              { path: 'foo', package: 'fooPkgName', versionNumber: '4.7.0.NEXT', ancestorId: 'NONE', default: true },
            ],
            packageAliases: { fooPkgName: packageId },
          },
        });
        expect(
          await getAncestorIds(
            {} as unknown as ScratchOrgInfoPayload,
            await SfProjectJson.create(),
            await Org.create({})
          )
        ).to.equal('');
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
        const projectJson = stubInterface<SfProjectJson>(sandbox, {
          getPackageDirectories: () => [
            {
              path: 'foo',
              package: packageId,
              versionNumber: '4.7.0.NEXT',
              ancestorId: 'ABC',
              ancestorVersion: '4.0.0.0',
            },
          ],
          get: (arg: string) => {
            if (arg === 'packageAliases') {
              return { alias: packageId };
            }
          },
        });
        try {
          await shouldThrow(
            getAncestorIds(
              { ancestorId: 'ABC' } as unknown as ScratchOrgInfoPayload,
              projectJson as unknown as SfProjectJson,
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
        const projectJson = stubInterface<SfProjectJson>(sandbox, {
          getPackageDirectories: () => [
            {
              path: 'foo',
              package: badPackageId,
              versionNumber: '4.7.0.NEXT',
              ancestorId: badPackageId,
            },
          ],
          get: (arg: string) => {
            if (arg === 'packageAliases') {
              return { alias: packageId };
            }
          },
        });
        try {
          await shouldThrow(
            getAncestorIds(
              { ancestorId: 'ABC' } as unknown as ScratchOrgInfoPayload,
              projectJson as unknown as SfProjectJson,
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
    const testData = new MockTestOrgData();
    describe('with clientId', () => {
      beforeEach(async () => {
        await $$.stubAuths(testData);
      });

      it('Generates empty package2AncestorIds scratch org property', async () => {
        expect(
          await generateScratchOrgInfo({
            hubOrg: await Org.create({ aliasOrUsername: testData.username }),
            scratchOrgInfoPayload: {} as ScratchOrgInfoPayload,
            nonamespace: false,
            ignoreAncestorIds: false,
          })
        ).to.deep.equal({
          orgName: 'Company',
          package2AncestorIds: '',
          connectedAppCallbackUrl: 'http://localhost:1717/OauthRedirect',
          connectedAppConsumerKey: testData.clientId,
        });
      });
      it('Generates empty package2AncestorIds scratch org property with hasPackages', async () => {
        // stubMethod(sandbox, SfProjectJson.prototype, 'hasPackages').returns(true);
        // stubMethod(sandbox, SfProjectJson.prototype, 'isGlobal').returns(true);
        expect(
          await generateScratchOrgInfo({
            hubOrg: await Org.create({ aliasOrUsername: testData.username }),
            scratchOrgInfoPayload: {} as ScratchOrgInfoPayload,
            nonamespace: false,
            ignoreAncestorIds: false,
          })
        ).to.deep.equal({
          orgName: 'Company',
          package2AncestorIds: '',
          connectedAppConsumerKey: testData.clientId,
          connectedAppCallbackUrl: 'http://localhost:1717/OauthRedirect',
        });
      });
      it('Generates the package2AncestorIds scratch org property with ignoreAncestorIds', async () => {
        expect(
          await generateScratchOrgInfo({
            hubOrg: await Org.create({ aliasOrUsername: testData.username }),
            scratchOrgInfoPayload: {} as ScratchOrgInfoPayload,
            nonamespace: false,
            ignoreAncestorIds: true,
          })
        ).to.deep.equal({
          orgName: 'Company',
          package2AncestorIds: '',
          connectedAppConsumerKey: testData.clientId,
          connectedAppCallbackUrl: 'http://localhost:1717/OauthRedirect',
        });
      });
    });
    describe('no client id', () => {
      const orgWithoutClientId = new MockTestOrgData();
      // @ts-expect-error - cannot assign undefined to string
      orgWithoutClientId.clientId = undefined;
      beforeEach(async () => {
        // $$.restore();
        await $$.stubAuths(orgWithoutClientId);
      });
      it('Generates the package2AncestorIds scratch org property with ignoreAncestorIds no clientId with connectedAppConsumerKey', async () => {
        expect(
          await generateScratchOrgInfo({
            hubOrg: await Org.create({ aliasOrUsername: orgWithoutClientId.username }),
            scratchOrgInfoPayload: {
              connectedAppConsumerKey: orgWithoutClientId.clientId,
            } as ScratchOrgInfoPayload,
            nonamespace: false,
            ignoreAncestorIds: true,
          })
        ).to.deep.equal({
          orgName: 'Company',
          package2AncestorIds: '',
          connectedAppConsumerKey: 'PlatformCLI',
          connectedAppCallbackUrl: 'http://localhost:1717/OauthRedirect',
        });
      });
      it('Generates the package2AncestorIds scratch org property with ignoreAncestorIds no clientId with no connectedAppConsumerKey and orgName', async () => {
        expect(
          await generateScratchOrgInfo({
            hubOrg: await Org.create({ aliasOrUsername: testData.username }),
            scratchOrgInfoPayload: {
              orgName: 'MyOrgName',
              // @ts-expect-error - cannot assign undefined to string
              connectedAppConsumerKey: undefined,
            },
            nonamespace: false,
            ignoreAncestorIds: true,
          })
        ).to.deep.equal({
          orgName: 'MyOrgName',
          package2AncestorIds: '',
          connectedAppConsumerKey: 'PlatformCLI',
          connectedAppCallbackUrl: 'http://localhost:1717/OauthRedirect',
        });
      });
    });
  });

  describe('generateScratchOrgInfo no SfProjectJson', () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, Org.prototype, 'getConnection').returns(Connection.prototype);
      stubMethod(sandbox, Connection.prototype, 'getAuthInfoFields').returns({
        clientId: '1234',
      });
      stubMethod(sandbox, SfProjectJson, 'create').rejects();
    });

    afterEach(() => {
      sandbox.restore();
    });

    after(() => {
      sandbox.restore();
    });
    it('Generates the package2AncestorIds scratch org property no SfProjectJson', async () => {
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

  describe('generateScratchOrgInfo no nonamespace', () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
      stubMethod(sandbox, Org, 'create').resolves(Org.prototype);
      stubMethod(sandbox, Org.prototype, 'getConnection').returns(Connection.prototype);
      stubMethod(sandbox, Connection.prototype, 'getAuthInfoFields').returns({
        clientId: '1234',
      });
      stubMethod(sandbox, SfProjectJson, 'create').returns(SfProjectJson.prototype);
      stubMethod(sandbox, SfProjectJson.prototype, 'get').withArgs('namespace').returns('my-namespace');
    });

    afterEach(() => {
      sandbox.restore();
    });

    after(() => {
      sandbox.restore();
    });
    it('calls generateScratchOrgInfo with no nonamespace but SfProjectJson.get("name") is true', async () => {
      expect(
        await generateScratchOrgInfo({
          hubOrg: await Org.create({}),
          scratchOrgInfoPayload: {} as ScratchOrgInfoPayload,
          nonamespace: false,
          ignoreAncestorIds: false,
        })
      ).to.deep.equal({
        orgName: 'Company',
        namespace: 'my-namespace',
        package2AncestorIds: '',
        connectedAppConsumerKey: '1234',
        connectedAppCallbackUrl: 'http://localhost:1717/OauthRedirect',
      });
    });
  });

  describe('getScratchOrgInfoPayload', () => {
    const sandbox = sinon.createSandbox();
    beforeEach(() => {
      stubMethod(sandbox, fs.promises, 'readFile')
        .withArgs('./my-file.json', 'utf8')
        .resolves('{ "features": "my-feature" }');
    });

    afterEach(() => {
      sandbox.restore();
    });

    after(() => {
      sandbox.restore();
    });

    it('generates scratch org info payload with durationDays', async () => {
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          durationDays: 1,
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('generates scratch org info payload with definitionjson', async () => {
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
          definitionjson: '{ "features": "my-feature" }',
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          durationDays: 1,
          features: 'my-feature',
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('generates scratch org info payload with definitionfile', async () => {
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
          definitionfile: './my-file.json',
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          durationDays: 1,
          features: 'my-feature',
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('generates scratch org info payload with durationDays and connectedAppConsumerKey', async () => {
      const connectedAppConsumerKey = '12345';
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
          connectedAppConsumerKey,
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          connectedAppConsumerKey,
          durationDays: 1,
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('generates scratch org info payload with features', async () => {
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            features: 'my-feature1;my-feature-2',
          },
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          features: 'my-feature1;my-feature-2',
          durationDays: 1,
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('generates scratch org info payload with features with comma', async () => {
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            features: 'my-feature1,my-feature-2',
          },
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          features: 'my-feature1;my-feature-2',
          durationDays: 1,
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('generates scratch org info payload with features is an array', async () => {
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            features: ['my-feature1', 'my-feature-2'],
          },
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          features: 'my-feature1;my-feature-2',
          durationDays: 1,
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('passes option verification snapshot', async () => {
      expect(
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            snapshot: 1,
          },
        })
      ).to.deep.equal({
        scratchOrgInfoPayload: {
          snapshot: 1,
          durationDays: 1,
        },
        ignoreAncestorIds: false,
        warnings: [],
      });
    });
    it('fails to read definitionfile', async () => {
      sandbox.restore();
      stubMethod(sandbox, fs.promises, 'readFile').withArgs('./my-file.json', 'utf8').rejects();
      try {
        await getScratchOrgInfoPayload({
          durationDays: 1,
          definitionfile: './my-file.json',
        });
      } catch (err) {
        expect(err).to.exist;
      }
    });
    it('fails to parsing definitionfile', async () => {
      sandbox.restore();
      stubMethod(sandbox, fs.promises, 'readFile').withArgs('./my-file.json', 'utf8').resolves('not-json');
      try {
        await getScratchOrgInfoPayload({
          durationDays: 1,
          definitionfile: './my-file.json',
        });
      } catch (err) {
        expect(err).to.exist;
      }
    });
    it('fails on option verification durationdays', async () => {
      try {
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            durationdays: 1,
          },
        });
      } catch (err) {
        expect(err).to.exist;
      }
    });
    it('fails on option verification snapshot', async () => {
      try {
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            snapshot: 1,
            orgPreferences: {
              pref: 1,
            },
          },
        });
      } catch (err) {
        expect(err).to.exist;
      }
    });
    it('fails on deprecated orgConfig orgPreferences', async () => {
      try {
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            orgPreferences: {},
          },
        });
      } catch (err) {
        expect(err).to.exist;
      }
    });
    it('fails on orgConfig uppercase props', async () => {
      try {
        await getScratchOrgInfoPayload({
          durationDays: 1,
          orgConfig: {
            MyProp: {},
          },
        });
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });
});
