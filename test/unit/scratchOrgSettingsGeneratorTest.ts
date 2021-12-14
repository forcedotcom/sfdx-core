/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { /* assert, */ expect } from 'chai';
import { Org } from '../../src/org';
import { sfdc } from '../../src/util/sfdc';
import { Connection } from '../../src/connection';
import { ZipWriter } from '../../src/util/zipWriter';
import { ScratchOrgInfo } from '../../src/scratchOrgInfoApi';
import SettingsGenerator from '../../src/scratchOrgSettingsGenerator';
import { MockTestOrgData } from '../../src/testSetup';
// import { generateScratchOrgInfo, getScratchOrgInfoPayload } from '../../scratchOrgInfoGenerator';

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

describe('scratchOrgSettingsGenerator', () => {
  // let sandbox: sinon.SinonSandbox;
  // let settings; 1080664
  // Need to create the workspace every time since we want to test with
  // workspace that isn't configured to a connected app.

  describe('extract', () => {
    it('no settings', async () => {
      const scratchDef = TEMPLATE_SCRATCH_ORG_INFO;
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      expect(settings.hasSettings()).to.be.false;
    });
    it('settings', async () => {
      const s = { a: 'b' };
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        settings: s,
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      expect(settings.hasSettings()).to.be.true;
    });

    it('object settings', async () => {
      const os = { obj: { sharingModel: 'sm', defaultRecordType: 'drt' } };
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        objectSettings: os,
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      expect(settings.hasSettings()).to.be.true;
    });

    it('both settings and object settings', async () => {
      const s = { a: 'b' };
      const os = { obj: { sharingModel: 'sm', defaultRecordType: 'drt' } };
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        settings: s,
        objectSettings: os,
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      expect(settings.hasSettings()).to.be.true;
    });
  });

  describe('createDeploy', () => {
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;

    beforeEach(() => {
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, path: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(path).to.be.a('string').and.to.have.length.greaterThan(0);
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should create settings dir', async () => {
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        settings: {
          lightningExperienceSettings: {
            enableS1DesktopEnabled: true,
          },
          mobileSettings: {
            enableS1EncryptedStoragePref2: false,
          },
        },
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      await settings.createDeploy();
      expect(addToZipStub.callCount).to.equal(2);
      expect(addToZipStub.firstCall.firstArg).to.be.a('string').and.length.to.be.greaterThan(0);
      expect(addToZipStub.secondCall.firstArg).to.be.a('string').and.length.to.be.greaterThan(0);
    });
  });

  describe('deploySettingsViaFolder', () => {
    let adminTestData: MockTestOrgData;
    const scratchOrg = new Org({});
    const deployId = '12345678';
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, path: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(path).to.be.a('string').and.to.have.length.greaterThan(0);
      });
      finalizeStub = sandbox.stub(ZipWriter.prototype, 'finalize').resolves();
      sandbox.stub(Connection.prototype, 'deploy').callsFake((): any => {
        return Promise.resolve({
          id: '1',
        });
      });
      sandbox.stub(ZipWriter.prototype, 'buffer').get(() => {
        return 'mybuffer';
      });
      getUsernameStub = sandbox.stub(scratchOrg, 'getUsername').returns(adminTestData.username);
      getConnectionStub = sandbox.stub(scratchOrg, 'getConnection').callsFake(() => {
        return {
          setApiVersion: (apiVersion: string) => {
            expect(apiVersion).to.be.a('string').and.length.to.be.greaterThan(0);
            expect(sfdc.validateApiVersion(apiVersion)).to.not.be.undefined;
          },
          deploy: (zipInput: Buffer) => {
            expect(zipInput).to.have.property('length').and.to.be.greaterThan(0);
            return {
              id: deployId,
            };
          },
          metadata: {
            checkDeployStatus: (id: string) => {
              expect(id).to.equal(deployId).to.have.property('length').and.to.be.greaterThan(0);
              return {
                status: 'Succeeded',
              };
            },
          },
        } as unknown as Connection;
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('deploys the settings to the org', async () => {
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        settings: {
          lightningExperienceSettings: {
            enableS1DesktopEnabled: true,
          },
          mobileSettings: {
            enableS1EncryptedStoragePref2: false,
          },
        },
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      await settings.createDeploy();
      await settings.deploySettingsViaFolder(scratchOrg, '53.0');
      expect(getUsernameStub.callCount).to.equal(1);
      expect(getConnectionStub.callCount).to.equal(1);
      expect(addToZipStub.callCount).to.equal(3);
      expect(addToZipStub.firstCall.firstArg).to.be.a('string').and.length.to.be.greaterThan(0);
      expect(addToZipStub.secondCall.firstArg).to.be.a('string').and.length.to.be.greaterThan(0);
      expect(finalizeStub.callCount).to.equal(1);
    });
  });
});
