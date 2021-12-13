/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { /* assert, */ expect } from 'chai';
import { stubMethod } from '@salesforce/ts-sinon';
import { AnyJson } from '@salesforce/ts-types';
import { Org } from '../../src/org';
import { sfdc } from '../../src/util/sfdc';
import { AuthInfo } from '../../src/authInfo';
import { Connection } from '../../src/connection';
import { ZipWriter } from '../../src/util/zipWriter';
import { ScratchOrgInfo } from '../../src/scratchOrgInfoApi';
import SettingsGenerator from '../../src/scratchOrgSettingsGenerator';
import { MockTestOrgData, testSetup } from '../../src/testSetup';
// import { generateScratchOrgInfo, getScratchOrgInfoPayload } from '../../scratchOrgInfoGenerator';

const $$ = testSetup();
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

  describe.skip('deploySettingsViaFolder', () => {
    let adminTestData: MockTestOrgData;
    // const scratchOrg = new Org({});
    let scratchOrg;
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;
    // const connection = sinon.createStubInstance(Connection);

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      scratchOrg = await Org.create({
        connection: await Connection.create({
          authInfo: await AuthInfo.create({ username: adminTestData.username }),
        }),
      });
      $$.fakeConnectionRequest = (): Promise<AnyJson> => {
        return Promise.resolve({});
      };
      // const connection = await Connection.create({
      //   authInfo: await AuthInfo.create({ username: adminTestData.username }),
      // });
      addToZipStub = sandbox.stub(ZipWriter.prototype, 'addToZip').callsFake((contents: string, path: string) => {
        expect(contents).to.be.a('string').and.to.have.length.greaterThan(0);
        expect(path).to.be.a('string').and.to.have.length.greaterThan(0);
      });
      finalizeStub = sandbox.stub(ZipWriter.prototype, 'finalize').resolves();
      stubMethod($$.SANDBOX, Connection.prototype, 'query').callsFake((query: string) => {
        if (query.includes(adminTestData.username)) {
          return {
            records: [adminTestData.getMockUserInfo()],
            totalSize: 1,
          };
        }
      });
      stubMethod($$.SANDBOX, AuthInfo.prototype, 'buildRefreshTokenConfig').callsFake(() => {
        return {};
      });
      // stubMethod($$.SANDBOX, Connection.prototype, 'deploy').resolves({ id: '123' });
      sandbox.stub(Connection.prototype, 'deploy').callsFake((): any => {
        return Promise.resolve({
          id: '1',
        });
      });
      stubMethod($$.SANDBOX, Org.prototype, 'refreshAuth').resolves({});
      // getUsernameStub = sandbox.stub(scratchOrg, 'getUsername').returns(adminTestData.username);
      // getConnectionStub = sandbox.stub(scratchOrg, 'getConnection').returns(connection);
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
      expect(addToZipStub.callCount).to.equal(2);
      expect(addToZipStub.firstCall.firstArg).to.be.a('string').and.length.to.be.greaterThan(0);
      expect(addToZipStub.secondCall.firstArg).to.be.a('string').and.length.to.be.greaterThan(0);
      expect(finalizeStub.callCount).to.equal(2);
    });
  });

  describe('deploySettingsViaFolder', () => {
    let adminTestData: MockTestOrgData;
    const scratchOrg = new Org({});
    const deployId = '12345678';
    // let scratchOrg;
    const sandbox: sinon.SinonSandbox = sinon.createSandbox();
    let addToZipStub: sinon.SinonStub;
    let finalizeStub: sinon.SinonStub;
    let getUsernameStub: sinon.SinonStub;
    let getConnectionStub: sinon.SinonStub;
    // const connection = sinon.createStubInstance(Connection);

    beforeEach(async () => {
      adminTestData = new MockTestOrgData();
      // scratchOrg = await Org.create({
      //   connection: await Connection.create({
      //     authInfo: await AuthInfo.create({ username: adminTestData.username }),
      //   }),
      // });
      $$.fakeConnectionRequest = (): Promise<AnyJson> => {
        return Promise.resolve({});
      };
      // const connection = await Connection.create({
      //   authInfo: await AuthInfo.create({ username: adminTestData.username }),
      // });
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

  // describe('createDeployDir', () => {
  //   const version = 'MYVERSION';
  //   const mdapiTempDirOrig = process.env.SFDX_MDAPI_TEMP_DIR;
  //   let writeFileStub: sinon.SinonStub;
  //   let mkdirpStub: sinon.SinonStub;

  //   beforeEach(() => {
  //     writeFileStub = sandbox.stub(fs, 'writeFile').callsFake(() => Promise.resolve(null));
  //     sandbox.stub(fs, 'access').throws('Already exists');
  //     mkdirpStub = sandbox.stub(fs, 'mkdirp').callsFake(() => Promise.resolve(''));
  //     settings.settingData = {};
  //   });

  //   afterEach(() => {
  //     if (mdapiTempDir_orig) {
  //       process.env.SFDX_MDAPI_TEMP_DIR = mdapiTempDir_orig;
  //     } else {
  //       delete process.env.SFDX_MDAPI_TEMP_DIR;
  //     }
  //   });

  //   it('should create temp dir', async () => {
  //     await settings.createDeployDir();
  //     chai.expect(mkdirpStub.calledOnce).to.equal(true);

  //     const args: any[] = mkdirpStub.getCall(0).args;

  //     chai.expect(args[0]).to.be.equal(path.join(os.tmpdir(), 'shape', 'settings'));
  //   });

  //   it('should generate all settings files', async () => {
  //     const contents = 'The File Stuff';
  //     const subSettings = { s: true };
  //     settings.settingData = {
  //       abc: subSettings,
  //     };

  //     sandbox.stub(settings, '_createSettingsFileContent').callsFake(() => contents);

  //     await settings.createDeployDir(version);
  //     // Make sure we generated the file
  //     chai.expect(settings._createSettingsFileContent.calledOnce).to.equals(true);
  //     const genArgs = settings._createSettingsFileContent.getCall(0).args;
  //     chai.expect(genArgs[0]).to.equals('Abc'); // setting name
  //     chai.expect(genArgs[1]).to.equals(subSettings); // setting json

  //     // Make sure we write the file (note, writeFile is also called to write package.xml)
  //     chai.expect(writeFileStub.callCount, 'Did not write file').to.equal(2);
  //     const writeArgs = writeFileStub.getCall(0).args;
  //     chai.expect(writeArgs[0]).to.be.equal(path.join(os.tmpdir(), 'shape', 'settings', 'Abc.settings'));
  //     chai.expect(writeArgs[1]).to.be.equal(contents);
  //   });

  //   it('should generate all object settings files', async () => {
  //     const contents = 'The File Stuff';
  //     const singleSubObjSetting = { sharingModel: 'sm', defaultRecordType: 'drt' };
  //     const subObjSettings = { obj: singleSubObjSetting };
  //     settings.objectSettingsData = subObjSettings;

  //     sandbox.stub(settings, '_createObjectFileContent').callsFake(() => contents);

  //     await settings.createDeployDir(version);
  //     // Make sure we generated the file
  //     chai.expect(settings._createObjectFileContent.calledOnce).to.equals(true);
  //     const genArgs = settings._createObjectFileContent.getCall(0).args;
  //     chai.expect(genArgs[0]).to.equals('Obj');
  //     chai.expect(genArgs[1]).to.equals(singleSubObjSetting);

  //     // make sure we write the file (note, writeFile is also called to write package.xml)
  //     chai.expect(writeFileStub.callCount, 'Did not write file').to.equal(2);
  //     const writeArgs = writeFileStub.getCall(0).args;
  //     chai.expect(writeArgs[0]).to.be.equal(path.join(os.tmpdir(), 'shape', 'objects', 'Obj.object'));
  //     chai.expect(writeArgs[1]).to.be.equal(contents);
  //   });

  //   it('should respect the SFDX_MDAPI_TEMP_DIR env var', async () => {
  //     const mdapiTempDir = path.join(__dirname, 'so_settings_generator_test_dir');
  //     process.env.SFDX_MDAPI_TEMP_DIR = mdapiTempDir;

  //     const contents = 'The File Stuff';
  //     const subSettings = { s: true };
  //     settings.settingData = {
  //       abc: subSettings,
  //     };

  //     sandbox.stub(settings, '_createSettingsFileContent').callsFake(() => contents);

  //     await settings.createDeployDir(version);
  //     // Make sure we generated the file
  //     chai.expect(settings._createSettingsFileContent.calledOnce).to.equals(true);
  //     const genArgs = settings._createSettingsFileContent.getCall(0).args;
  //     chai.expect(genArgs[0]).to.equals('Abc'); // setting name
  //     chai.expect(genArgs[1]).to.equals(subSettings); // setting json

  //     // Make sure we write the file (note, writeFile is also called to write package.xml)
  //     chai.expect(writeFileStub.callCount, 'Did not write file').to.equal(2);
  //     const writeArgs = writeFileStub.getCall(0).args;
  //     chai.expect(writeArgs[0]).to.be.equal(path.join(mdapiTempDir, 'shape', 'settings', 'Abc.settings'));
  //     chai.expect(writeArgs[1]).to.be.equal(contents);
  //   });

  //   it('should generate package.xml', async () => {
  //     settings.settingData = {
  //       abcSettings: true,
  //     };
  //     settings.objectSettingsData = {
  //       noRecTypeObj: {
  //         sharingModel: 'private',
  //       },
  //       recTypeNoBpObj: {
  //         defaultRecordType: 'default1',
  //       },
  //       // Opportunity is one of the objects whose record types require business processes
  //       Opportunity: {
  //         defaultRecordType: 'default2',
  //       },
  //     };

  //     await settings.createDeployDir(version);
  //     // Make sure we wrote the correct package.xml
  //     chai.expect(writeFileStub.callCount, 'Did not call write file').to.equal(5);
  //     const writeArgs = writeFileStub.getCall(4).args;

  //     chai
  //       .expect(writeArgs[0], 'Did not specify correct path')
  //       .to.be.equal(path.join(os.tmpdir(), 'shape', 'package.xml'));
  //     // Not going to test the entire file content, just that we inserted the version string
  //     chai.expect(writeArgs[1], 'did not specify the correct version').to.contain(version);
  //     // And we added the members
  //     chai.expect(writeArgs[1], 'did not specify the correct Settings member').to.contain('<members>Abc</members>');
  //     chai
  //       .expect(writeArgs[1], 'did not specify the right CustomObject members')
  //       .to.contain('<members>NoRecTypeObj</members>');
  //     chai
  //       .expect(writeArgs[1], 'did not specify the right RecordType members')
  //       .to.contain('<members>RecTypeNoBpObj.Default1</members>');
  //     chai
  //       .expect(writeArgs[1], 'did not specity the right BusinessProcess members')
  //       .to.contain('<members>Opportunity.Default2Process</members>');
  //   });
  // });

//   describe.skip('createSettingsFileContent', () => {
//     const settings = new SettingsGenerator();
//     it('not OrgPreference', () => {
//       const json = { anExample: true };
//       expect(settings._createSettingsFileContent('MySettings', json)).to.be.equal(
//         `<?xml version='1.0'?>
// <MySettings>
//     <anExample>true</anExample>
// </MySettings>`
//       );
//     });

//     it('OrgPreference', () => {
//       const json = { anExample: true };
//       expect(settings._createSettingsFileContent('OrgPreferenceSettings', json)).to.be.equal(
//         `<?xml version="1.0" encoding="UTF-8"?>
// <OrgPreferenceSettings xmlns="http://soap.sforce.com/2006/04/metadata">
//     <preferences>
//         <settingName>AnExample</settingName>
//         <settingValue>true</settingValue>
//     </preferences>
// </OrgPreferenceSettings>`
//       );
//     });
//   });

  //   describe('createObjectFileContent', () => {
  //     const settings = new SettingsGenerator();

  //     it('sharing model', () => {
  //       const json = { sharingModel: 'default' };
  //       chai.expect(settings._createObjectFileContent('ObjWithSharing', json)).to.be.equal(
  //         `<?xml version="1.0" encoding="UTF-8"?>
  // <Object xmlns="http://soap.sforce.com/2006/04/metadata">
  //     <sharingModel>Default</sharingModel>
  // </Object>`
  //       );
  //     });
  //     it('rec type with no bp needed', () => {
  //       const json = { defaultRecordType: 'recTypeName' };
  //       const allRecTypes = [];
  //       chai.expect(settings._createObjectFileContent('NonBpObjectWithRecType', json, allRecTypes)).to.be.equal(
  //         `<?xml version="1.0" encoding="UTF-8"?>
  // <Object xmlns="http://soap.sforce.com/2006/04/metadata">
  //     <recordTypes>
  //         <fullName>RecTypeName</fullName>
  //         <label>RecTypeName</label>
  //         <active>true</active>
  //     </recordTypes>
  // </Object>`
  //       );
  //       chai.expect(allRecTypes[0]).to.be.equal('NonBpObjectWithRecType.RecTypeName');
  //     });
  //     it('rec type with bp required', () => {
  //       const json = { defaultRecordType: 'recTypeName' };
  //       const allRecTypes = [];
  //       const allBps = [];
  //       chai
  //         // Case requires a business process for its record types
  //         .expect(settings._createObjectFileContent('Case', json, allRecTypes, allBps))
  //         .to.be.equal(
  //           `<?xml version="1.0" encoding="UTF-8"?>
  // <Object xmlns="http://soap.sforce.com/2006/04/metadata">
  //     <recordTypes>
  //         <fullName>RecTypeName</fullName>
  //         <label>RecTypeName</label>
  //         <active>true</active>
  //         <businessProcess>RecTypeNameProcess</businessProcess>
  //     </recordTypes>
  //     <businessProcesses>
  //         <fullName>RecTypeNameProcess</fullName>
  //         <isActive>true</isActive>
  //         <values>
  //             <fullName>New</fullName>
  //             <default>true</default>
  //         </values>
  //     </businessProcesses>
  // </Object>`
  //         );
  //       chai.expect(allRecTypes[0]).to.be.equal('Case.RecTypeName');
  //       chai.expect(allBps[0]).to.be.equal('Case.RecTypeNameProcess');
  //     });
  //     it('rec type with bp required and no default', () => {
  //       const json = { defaultRecordType: 'recTypeName' };
  //       const allRecTypes = [];
  //       const allBps = [];
  //       chai
  //         // Opportunity requires a business process for its record types without the default set
  //         .expect(settings._createObjectFileContent('Opportunity', json, allRecTypes, allBps))
  //         .to.be.equal(
  //           `<?xml version="1.0" encoding="UTF-8"?>
  // <Object xmlns="http://soap.sforce.com/2006/04/metadata">
  //     <recordTypes>
  //         <fullName>RecTypeName</fullName>
  //         <label>RecTypeName</label>
  //         <active>true</active>
  //         <businessProcess>RecTypeNameProcess</businessProcess>
  //     </recordTypes>
  //     <businessProcesses>
  //         <fullName>RecTypeNameProcess</fullName>
  //         <isActive>true</isActive>
  //         <values>
  //             <fullName>Prospecting</fullName>
  //         </values>
  //     </businessProcesses>
  // </Object>`
  //         );
  //       chai.expect(allRecTypes[0]).to.be.equal('Opportunity.RecTypeName');
  //       chai.expect(allBps[0]).to.be.equal('Opportunity.RecTypeNameProcess');
  //     });
  //   });
});
