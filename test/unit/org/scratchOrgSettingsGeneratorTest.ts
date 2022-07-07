/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as sinon from 'sinon';
import { expect } from 'chai';
import { Org, Connection } from '../../../src/org';
import { sfdc } from '../../../src/util/sfdc';
import { ZipWriter } from '../../../src/util/zipWriter';
import { ScratchOrgInfo } from '../../../src/org/scratchOrgTypes';
import SettingsGenerator, {
  createObjectFileContent,
  createRecordTypeAndBusinessProcessFileContent,
} from '../../../src/org/scratchOrgSettingsGenerator';
import { MockTestOrgData, shouldThrow } from '../../../src/testSetup';

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

const fakeConnection = (
  sandbox: sinon.SinonSandbox,
  scratchOrg: Org,
  deployId = '12345',
  deployStatus: string | Array<string | Error> | Error = 'Succeeded'
): sinon.SinonStub => {
  const fakeConnectionMock = (status: string | Array<string | Error> | Error) => {
    const checkDeployStatusStub = (statusResult: string | Array<string | Error> | Error): sinon.SinonStub => {
      const stub: sinon.SinonStub = sinon.stub();
      const fakeResult = (result: string) => (id: string) => {
        expect(id).to.equal(deployId).to.have.property('length').and.to.be.greaterThan(0);
        return {
          status: result,
          details: {
            // should only be present for failures, but it's only read when the status != 'Succeeded'
            componentFailures: {
              problem: 'settings/True.settings is not a valid metadata object. Check the name and casing of the file',
            },
          },
        };
      };
      if (Array.isArray(deployStatus)) {
        deployStatus.forEach((result, index) => {
          if (result instanceof Error) {
            stub.onCall(index).rejects(result);
          } else {
            stub.onCall(index).callsFake(fakeResult(result));
          }
        });
      } else if (typeof statusResult === 'string') {
        stub.callsFake(fakeResult(statusResult));
      } else if (statusResult instanceof Error) {
        stub.rejects(statusResult);
      }
      return stub;
    };

    return () =>
      ({
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
          checkDeployStatus: checkDeployStatusStub(status),
        },
      } as unknown as Connection);
  };
  return sandbox.stub(scratchOrg, 'getConnection').callsFake(fakeConnectionMock(deployStatus));
};

let adminTestData: MockTestOrgData;
const scratchOrg = new Org({});
const sandbox: sinon.SinonSandbox = sinon.createSandbox();
let addToZipStub: sinon.SinonStub;
let finalizeStub: sinon.SinonStub;
let getUsernameStub: sinon.SinonStub;
let getConnectionStub: sinon.SinonStub;
const deployId = '12345';

function createStubs() {
  adminTestData = new MockTestOrgData();
  addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToStore').callsFake((contents: string, filepath: string) => {
    expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
    expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
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
}

describe('scratchOrgSettingsGenerator', () => {
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
    beforeEach(() => {
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToStore').callsFake((contents: string, filepath: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
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
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<LightningExperienceSettings>')
        .and.to.include('<enableS1DesktopEnabled>true</enableS1DesktopEnabled>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('settings', 'LightningExperience.settings'));
      expect(addToZipStub.secondCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<MobileSettings>')
        .and.to.include('<enableS1EncryptedStoragePref2>false</enableS1EncryptedStoragePref2>');
      expect(addToZipStub.secondCall.args[1]).to.include(path.join('settings', 'Mobile.settings'));
    });
  });

  describe('deploySettingsViaFolder', () => {
    beforeEach(async () => {
      createStubs();
      getConnectionStub = fakeConnection(sandbox, scratchOrg);
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
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<LightningExperienceSettings>')
        .and.to.include('<enableS1DesktopEnabled>true</enableS1DesktopEnabled>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('settings', 'LightningExperience.settings'));
      expect(addToZipStub.secondCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<MobileSettings>')
        .and.to.include('<enableS1EncryptedStoragePref2>false</enableS1EncryptedStoragePref2>');
      expect(finalizeStub.callCount).to.equal(1);
      expect(addToZipStub.secondCall.args[1]).to.include(path.join('settings', 'Mobile.settings'));
    });
  });

  describe('deploySettingsViaFolder succeeded partial', () => {
    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToStore').callsFake((contents: string, filepath: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
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
      getConnectionStub = fakeConnection(sandbox, scratchOrg, deployId, 'SucceededPartial');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('tries to deploy the settings to the org but deploy status is SucceededPartial', async () => {
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
      try {
        await shouldThrow(settings.deploySettingsViaFolder(scratchOrg, '53.0'));
      } catch (error) {
        expect(error).to.have.property('name', 'ProblemDeployingSettings');
        expect(error.message).to.include(
          'settings/True.settings is not a valid metadata object. Check the name and casing of the file'
        );
        expect(error)
          .to.have.property('data')
          .that.deep.equals({
            status: 'SucceededPartial',
            details: {
              componentFailures: {
                problem: 'settings/True.settings is not a valid metadata object. Check the name and casing of the file',
              },
            },
          });
      }
    });
  });

  describe('deploySettingsViaFolder fails', () => {
    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToStore').callsFake((contents: string, filepath: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
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
      getConnectionStub = fakeConnection(sandbox, scratchOrg, deployId, 'Failed');
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('tries to deploy the settings to the org but fails', async () => {
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
      try {
        await shouldThrow(settings.deploySettingsViaFolder(scratchOrg, '53.0'));
      } catch (error) {
        expect(error).to.have.property('name', 'ProblemDeployingSettings');
        expect(error.message).to.include(
          'settings/True.settings is not a valid metadata object. Check the name and casing of the file'
        );
        expect(error)
          .to.have.property('data')
          .that.deep.equals({
            status: 'Failed',
            details: {
              componentFailures: {
                problem: 'settings/True.settings is not a valid metadata object. Check the name and casing of the file',
              },
            },
          });
      }
    });
  });

  describe('deploySettingsViaFolder pools', () => {
    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToStore').callsFake((contents: string, filepath: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
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
      getConnectionStub = fakeConnection(sandbox, scratchOrg, deployId, ['InProgress', 'Succeeded']);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('tries to deploy the settings to the org pools untill succeded', async () => {
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
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<LightningExperienceSettings>')
        .and.to.include('<enableS1DesktopEnabled>true</enableS1DesktopEnabled>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('settings', 'LightningExperience.settings'));
      expect(addToZipStub.secondCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<MobileSettings>')
        .and.to.include('<enableS1EncryptedStoragePref2>false</enableS1EncryptedStoragePref2>');
      expect(finalizeStub.callCount).to.equal(1);
      expect(addToZipStub.secondCall.args[1]).to.include(path.join('settings', 'Mobile.settings'));
    });

    it('should tolerate network errors', async () => {
      getConnectionStub.restore();
      getConnectionStub = fakeConnection(sandbox, scratchOrg, deployId, [
        'InProgress',
        new Error('ETIMEDOUT'),
        'InProgress',
        new Error('ENOTFOUND'),
        'Succeeded',
      ]);
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
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<LightningExperienceSettings>')
        .and.to.include('<enableS1DesktopEnabled>true</enableS1DesktopEnabled>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('settings', 'LightningExperience.settings'));
      expect(addToZipStub.secondCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<MobileSettings>')
        .and.to.include('<enableS1EncryptedStoragePref2>false</enableS1EncryptedStoragePref2>');
      expect(finalizeStub.callCount).to.equal(1);
      expect(addToZipStub.secondCall.args[1]).to.include(path.join('settings', 'Mobile.settings'));
    });
  });

  describe('deploySettingsViaFolder pools timeouts', () => {
    let clock: sinon.SinonFakeTimers;

    beforeEach(async () => {
      clock = sandbox.useFakeTimers();
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToStore').callsFake((contents: string, filepath: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
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
      getConnectionStub = fakeConnection(sandbox, scratchOrg, deployId, 'InProgress');
    });

    afterEach(() => {
      clock.restore();
      sandbox.restore();
    });

    it('tries to deploy the settings to the org pools untill timeouts', async () => {
      const timeout = 10 * 60 * 1000; // 10 minutes
      const frequency = 1000;
      const settings = new SettingsGenerator();
      const promise = settings.deploySettingsViaFolder(scratchOrg, '53.0');
      for (let i = 0; i <= timeout / frequency; i++) {
        await clock.nextAsync();
      }
      try {
        await shouldThrow(promise);
      } catch (error) {
        expect(error).to.have.property('name', 'DeployingSettingsTimeoutError');
      }
    });
  });

  describe('writeObjectSettingsIfNeeded', () => {
    beforeEach(() => {
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToStore').callsFake((contents: string, filepath: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('calls writeObjectSettingsIfNeeded', async () => {
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        objectSettings: {
          myObject: {
            sharingModel: 'my-sharing-model',
            defaultRecordType: 'my-record-type',
          },
        },
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      await settings.createDeploy();
      expect(addToZipStub.callCount).to.equal(1);
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<sharingModel>My-sharing-model</sharingModel>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'MyObject.object'));
    });

    it('calls writeObjectSettingsIfNeeded without sharingModel', async () => {
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        objectSettings: {
          myObject: {
            defaultRecordType: 'my-record-type',
          },
        },
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      await settings.createDeploy();
      expect(addToZipStub.callCount).to.equal(1);
      expect(addToZipStub.firstCall.firstArg).to.be.a('string').and.length.to.be.greaterThan(0);
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'MyObject.object'));
    });

    it('calls writeObjectSettingsIfNeeded without defaultRecordType', async () => {
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        objectSettings: {
          myObject: {
            sharingModel: 'my-sharing-model',
          },
        },
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      await settings.createDeploy();
      expect(addToZipStub.callCount).to.equal(1);
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<sharingModel>My-sharing-model</sharingModel>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'MyObject.object'));
    });

    it('deploys the object settings to the org with businessProcess', async () => {
      const scratchDef = {
        ...TEMPLATE_SCRATCH_ORG_INFO,
        objectSettings: {
          opportunity: {
            sharingModel: 'my-sharing-model',
            defaultRecordType: 'my-record-type',
          },
        },
      };
      const settings = new SettingsGenerator();
      await settings.extract(scratchDef);
      await settings.createDeploy();
      expect(addToZipStub.callCount).to.equal(1);
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<sharingModel>My-sharing-model</sharingModel>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'Opportunity.object'));
    });
  });

  describe('createRecordTypeAndBusinessProcessFileContent', () => {
    const objectSettingsData = {
      account: {
        defaultRecordType: 'PersonAccount',
      },
      opportunity: {
        defaultRecordType: 'default',
        sharingModel: 'private',
      },
      case: {
        defaultRecordType: 'default',
        sharingModel: 'private',
      },
    };

    it('createRecordTypeAndBusinessProcessFileContent with account type', () => {
      const allRecordTypes = [];
      const allbusinessProcesses = [];
      const recordTypeAndBusinessProcessFileContent = createRecordTypeAndBusinessProcessFileContent(
        'account',
        objectSettingsData.account,
        allRecordTypes,
        allbusinessProcesses
      );
      expect(recordTypeAndBusinessProcessFileContent).to.deep.equal({
        '@': { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
        recordTypes: { fullName: 'PersonAccount', label: 'PersonAccount', active: true },
      });
      expect(allRecordTypes).to.deep.equal(['Account.PersonAccount']);
      expect(allbusinessProcesses).to.deep.equal([]);
    });

    it('createRecordTypeAndBusinessProcessFileContent with opportunity values', () => {
      const allRecordTypes = [];
      const allbusinessProcesses = [];
      const recordTypeAndBusinessProcessFileContent = createRecordTypeAndBusinessProcessFileContent(
        'opportunity',
        objectSettingsData.opportunity,
        allRecordTypes,
        allbusinessProcesses
      );
      expect(recordTypeAndBusinessProcessFileContent).to.deep.equal({
        '@': { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
        sharingModel: 'Private',
        recordTypes: {
          fullName: 'Default',
          label: 'Default',
          active: true,
          businessProcess: 'DefaultProcess',
        },
        businessProcesses: {
          fullName: 'DefaultProcess',
          isActive: true,
          values: {
            fullName: 'Prospecting',
          },
        },
      });
      expect(allRecordTypes).to.deep.equal(['Opportunity.Default']);
      expect(allbusinessProcesses).to.deep.equal(['Opportunity.DefaultProcess']);
    });

    it('createRecordTypeAndBusinessProcessFileContent with case values', () => {
      const allRecordTypes = [];
      const allbusinessProcesses = [];
      const recordTypeAndBusinessProcessFileContent = createRecordTypeAndBusinessProcessFileContent(
        'case',
        objectSettingsData.case,
        allRecordTypes,
        allbusinessProcesses
      );
      expect(recordTypeAndBusinessProcessFileContent).to.deep.equal({
        '@': { xmlns: 'http://soap.sforce.com/2006/04/metadata' },
        sharingModel: 'Private',
        recordTypes: {
          fullName: 'Default',
          label: 'Default',
          active: true,
          businessProcess: 'DefaultProcess',
        },
        businessProcesses: {
          fullName: 'DefaultProcess',
          isActive: true,
          values: {
            fullName: 'New',
            default: true,
          },
        },
      });
      expect(allRecordTypes).to.deep.equal(['Case.Default']);
      expect(allbusinessProcesses).to.deep.equal(['Case.DefaultProcess']);
    });
  });

  describe('createObjectFileContent', () => {
    const settingData = {
      accountSettings: {
        enableRelateContactToMultipleAccounts: true,
        enableAccountHistoryTracking: true,
      },
      emailAdministrationSettings: {
        enableEnhancedEmailEnabled: true,
      },
      experienceBundleSettings: {
        enableExperienceBundleMetadata: true,
      },
      lightningExperienceSettings: {
        enableS1DesktopEnabled: true,
      },
      chatterSettings: {
        enableChatter: true,
      },
      communitiesSettings: {
        enableNetworksEnabled: true,
      },
      industriesSettings: {
        enableAccessToMasterListOfCoverageTypes: true,
      },
    };
    const objectSettingsData = {
      account: {
        defaultRecordType: 'PersonAccount',
      },
      opportunity: {
        sharingModel: 'private',
      },
      case: {
        sharingModel: 'private',
      },
    };

    const allRecordTypes = ['Account.PersonAccount', 'Customer.CustomerAccount'];
    const allbusinessProcesses = ['Account.Process', 'Customer.Process'];

    it('createObjectFileContent takes no setting or object settings', () => {
      const packageFile = createObjectFileContent({ apiVersion: '54' });
      expect(packageFile).to.deep.equal({
        '@': {
          xmlns: 'http://soap.sforce.com/2006/04/metadata',
        },
        types: [],
        version: '54',
      });
    });
    it('createObjectFileContent writes settings object', () => {
      const packageFile = createObjectFileContent({ apiVersion: '54', settingData });
      expect(packageFile).to.deep.equal({
        '@': {
          xmlns: 'http://soap.sforce.com/2006/04/metadata',
        },
        types: [
          {
            members: [
              'Account',
              'EmailAdministration',
              'ExperienceBundle',
              'LightningExperience',
              'Chatter',
              'Communities',
              'Industries',
            ],
            name: 'Settings',
          },
        ],
        version: '54',
      });
    });
    it('createObjectFileContent writes object settings object', () => {
      const packageFile = createObjectFileContent({ apiVersion: '54', settingData, objectSettingsData });
      expect(packageFile).to.deep.equal({
        '@': {
          xmlns: 'http://soap.sforce.com/2006/04/metadata',
        },
        types: [
          {
            members: [
              'Account',
              'EmailAdministration',
              'ExperienceBundle',
              'LightningExperience',
              'Chatter',
              'Communities',
              'Industries',
            ],
            name: 'Settings',
          },
          {
            members: ['Account', 'Opportunity', 'Case'],
            name: 'CustomObject',
          },
        ],
        version: '54',
      });
    });
    it('createObjectFileContent writes record types', () => {
      const packageFile = createObjectFileContent({
        apiVersion: '54',
        allRecordTypes,
        settingData,
        objectSettingsData,
      });

      expect(packageFile).to.deep.equal({
        '@': {
          xmlns: 'http://soap.sforce.com/2006/04/metadata',
        },
        types: [
          {
            members: [
              'Account',
              'EmailAdministration',
              'ExperienceBundle',
              'LightningExperience',
              'Chatter',
              'Communities',
              'Industries',
            ],
            name: 'Settings',
          },
          {
            members: ['Account', 'Opportunity', 'Case'],
            name: 'CustomObject',
          },
          {
            members: ['Account.PersonAccount', 'Customer.CustomerAccount'],
            name: 'RecordType',
          },
        ],
        version: '54',
      });
    });
    it('createObjectFileContent writes business process', () => {
      const packageFile = createObjectFileContent({
        apiVersion: '54',
        allBusinessProcesses: allbusinessProcesses,
        settingData,
        objectSettingsData,
      });

      expect(packageFile).to.deep.equal({
        '@': {
          xmlns: 'http://soap.sforce.com/2006/04/metadata',
        },
        types: [
          {
            members: [
              'Account',
              'EmailAdministration',
              'ExperienceBundle',
              'LightningExperience',
              'Chatter',
              'Communities',
              'Industries',
            ],
            name: 'Settings',
          },
          {
            members: ['Account', 'Opportunity', 'Case'],
            name: 'CustomObject',
          },
          {
            members: ['Account.Process', 'Customer.Process'],
            name: 'BusinessProcess',
          },
        ],
        version: '54',
      });
    });
  });
});
