/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { Org } from '../../src/org';
import { sfdc } from '../../src/util/sfdc';
import { Connection } from '../../src/connection';
import { ZipWriter } from '../../src/util/zipWriter';
import { ScratchOrgInfo } from '../../src/scratchOrgInfoApi';
import SettingsGenerator from '../../src/scratchOrgSettingsGenerator';
import { MockTestOrgData } from '../../src/testSetup';

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
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;

    beforeEach(() => {
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, filepath: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(filepath).to.be.a('string').and.to.have.length.greaterThan(0);
      });
    });

    afterEach(() => {
      addToZipStub.restore();
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
    let adminTestData: MockTestOrgData;
    const scratchOrg = new Org({});
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, filepath: string) => {
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
      getConnectionStub = fakeConnection(sandbox, scratchOrg);
    });

    afterEach(() => {
      addToZipStub.restore();
      finalizeStub.restore();
      getUsernameStub.restore();
      getConnectionStub.restore();
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
    let adminTestData: MockTestOrgData;
    const scratchOrg = new Org({});
    const deployId = '12345';
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, filepath: string) => {
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
      addToZipStub.restore();
      finalizeStub.restore();
      getUsernameStub.restore();
      getConnectionStub.restore();
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
        await settings.deploySettingsViaFolder(scratchOrg, '53.0');
        assert.fail('Expected an error to be thrown.');
      } catch (error) {
        expect(error).to.have.property('name', 'ProblemDeployingSettings');
        expect(error).to.have.property('data').that.deep.equals({ status: 'SucceededPartial' });
      }
    });
  });

  describe('deploySettingsViaFolder fails', () => {
    let adminTestData: MockTestOrgData;
    const scratchOrg = new Org({});
    const deployId = '12345';
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, filepath: string) => {
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
      addToZipStub.restore();
      finalizeStub.restore();
      getUsernameStub.restore();
      getConnectionStub.restore();
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
        await settings.deploySettingsViaFolder(scratchOrg, '53.0');
        assert.fail('Expected an error to be thrown.');
      } catch (error) {
        expect(error).to.have.property('name', 'ProblemDeployingSettings');
        expect(error).to.have.property('data').that.deep.equals({ status: 'Failed' });
      }
    });
  });

  describe('deploySettingsViaFolder pools', () => {
    let adminTestData: MockTestOrgData;
    const scratchOrg = new Org({});
    const deployId = '12345';
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, filepath: string) => {
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
      addToZipStub.restore();
      finalizeStub.restore();
      getUsernameStub.restore();
      getConnectionStub.restore();
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
    let adminTestData: MockTestOrgData;
    const scratchOrg = new Org({});
    const deployId = '12345';
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;

    beforeEach(async () => {
      clock = sandbox.useFakeTimers();
      adminTestData = new MockTestOrgData();
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, filepath: string) => {
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
      addToZipStub.restore();
      finalizeStub.restore();
      getUsernameStub.restore();
      getConnectionStub.restore();
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
        await promise;
        assert.fail('Expected an error to be thrown.');
      } catch (error) {
        expect(error).to.have.property('name', 'DeployingSettingsTimeoutError');
      }
    });
  });

  describe('writeObjectSettingsIfNeeded', () => {
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;

    beforeEach(() => {
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, filepath: string) => {
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
      expect(addToZipStub.callCount).to.equal(2);
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<RecordType>')
        .and.to.include('<sharingModel>My-sharing-model</sharingModel>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'MyObject', 'MyObject.object'));
      expect(addToZipStub.secondCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<RecordType>')
        .and.to.include('<fullName>My-record-type</fullName>')
        .and.to.include('<label>My-record-type</label>')
        .and.to.include('<active>true</active>');
      expect(addToZipStub.secondCall.args[1]).to.include(
        path.join('objects', 'MyObject', 'recordTypes', 'My-record-type.recordType')
      );
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
      expect(addToZipStub.callCount).to.equal(2);
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<RecordType/>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'MyObject', 'MyObject.object'));
      expect(addToZipStub.secondCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<RecordType>')
        .and.to.include('<fullName>My-record-type</fullName>')
        .and.to.include('<label>My-record-type</label>')
        .and.to.include('<active>true</active>');
      expect(addToZipStub.secondCall.args[1]).to.include(
        path.join('objects', 'MyObject', 'recordTypes', 'My-record-type.recordType')
      );
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
        .and.to.include('<RecordType>')
        .and.to.include('<sharingModel>My-sharing-model</sharingModel>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'MyObject', 'MyObject.object'));
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
      expect(addToZipStub.callCount).to.equal(3);
      expect(addToZipStub.firstCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<RecordType>')
        .and.to.include('<sharingModel>My-sharing-model</sharingModel>');
      expect(addToZipStub.firstCall.args[1]).to.include(path.join('objects', 'Opportunity', 'Opportunity.object'));
      expect(addToZipStub.secondCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<RecordType>')
        .and.to.include('<fullName>My-record-type</fullName>')
        .and.to.include('<label>My-record-type</label>')
        .and.to.include('<active>true</active>');
      expect(addToZipStub.secondCall.args[1]).to.include(
        path.join('objects', 'Opportunity', 'recordTypes', 'My-record-type.recordType')
      );
      expect(addToZipStub.thirdCall.firstArg)
        .to.be.a('string')
        .and.length.to.be.greaterThan(0)
        .and.to.include('<BusinessProcess>')
        .and.to.include('<fullName>My-record-typeProcess</fullName>')
        .and.to.include('<isActive>true</isActive>')
        .and.to.include('<fullName>Prospecting</fullName>');
      expect(addToZipStub.thirdCall.args[1]).to.include(
        path.join('objects', 'Opportunity', 'businessProcesses', 'My-record-typeProcess.businessProcess')
      );
    });
  });
});
