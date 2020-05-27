/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect } from 'chai';
import { sep as pathSep } from 'path';

import { env } from '@salesforce/kit';
import { SfdxProject, SfdxProjectJson } from '../../src/sfdxProject';
import { shouldThrow, testSetup } from '../../src/testSetup';
import * as internal from '../../src/util/internal';

// Setup the test environment.
const $$ = testSetup();

describe('SfdxProject', async () => {
  let projectPath;

  beforeEach(async () => {
    projectPath = await $$.localPathRetriever($$.id);
    // @ts-ignore  SfdxProject.instances is private so override for testing.
    SfdxProject.instances.clear();
  });

  describe('json', async () => {
    it('allows uppercase packaging aliases on write', async () => {
      const json = await SfdxProjectJson.create({});
      await json.write({ packageAliases: { MyName: 'somePackage' } });
      expect($$.getConfigStubContents('SfdxProjectJson').packageAliases['MyName']).to.equal('somePackage');
    });
    it('allows uppercase packaging aliases on read', async () => {
      $$.setConfigStubContents('SfdxProjectJson', { contents: { packageAliases: { MyName: 'somePackage' } } });
      const json = await SfdxProjectJson.create({});
      expect(json.get('packageAliases')['MyName']).to.equal('somePackage');
    });
    it('read calls schemaValidate', async () => {
      const defaultOptions = SfdxProjectJson.getDefaultOptions();
      const sfdxProjectJson = new SfdxProjectJson(defaultOptions);
      const schemaValidateStub = $$.SANDBOX.stub(sfdxProjectJson, 'schemaValidate');
      schemaValidateStub.returns(Promise.resolve());
      await sfdxProjectJson.read();
      expect(schemaValidateStub.calledOnce).to.be.true;
    });
    it('write calls schemaValidate', async () => {
      const defaultOptions = SfdxProjectJson.getDefaultOptions();
      const sfdxProjectJson = new SfdxProjectJson(defaultOptions);
      const schemaValidateStub = $$.SANDBOX.stub(sfdxProjectJson, 'schemaValidate');
      schemaValidateStub.returns(Promise.resolve());
      await sfdxProjectJson.write();
      expect(schemaValidateStub.calledOnce).to.be.true;
    });
    it('getPackageDirectories should transform packageDir paths to have path separators that match the OS', async () => {
      let defaultPP: string;
      let transformedDefaultPP: string;
      let otherPP: string;
      let transformedOtherPP: string;

      if (pathSep === '/') {
        // posix test
        defaultPP = 'default\\foo';
        transformedDefaultPP = 'default/foo';
        otherPP = 'other\\bar';
        transformedOtherPP = 'other/bar';
      } else {
        // windows test
        defaultPP = 'default/foo';
        transformedDefaultPP = 'default\\foo';
        otherPP = 'other/bar';
        transformedOtherPP = 'other\\bar';
      }

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: defaultPP, default: true }, { path: otherPP, default: false }]
        }
      });
      const sfdxProjectJson = await SfdxProjectJson.create({});
      const packageDirs = await sfdxProjectJson.getPackageDirectories();

      expect(packageDirs).to.deep.equal([
        { path: transformedDefaultPP, default: true },
        { path: transformedOtherPP, default: false }
      ]);
    });
    it('schemaValidate validates sfdx-project.json', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }, { path: 'common', default: false }],
          namespace: 'test_ns',
          sourceApiVersion: '48.0'
        }
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      // create() calls read() which calls schemaValidate()
      await SfdxProjectJson.create({});
      expect(loggerSpy.called).to.be.false;
    });
    it('schemaValidate throws when SFDX_SCHEMA_VALIDATE=true and invalid file', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar'
        }
      });
      $$.SANDBOX.stub(env, 'getBoolean').callsFake(envVarName => envVarName === 'SFDX_SCHEMA_VALIDATE');
      const expectedError = "Validation errors:\n should NOT have additional properties 'foo'";
      try {
        // create() calls read() which calls schemaValidate()
        await shouldThrow(SfdxProjectJson.create({}));
      } catch (e) {
        expect(e.name).to.equal('SfdxSchemaValidationError');
        expect(e.message).to.equal(expectedError);
      }
    });
    it('schemaValidate warns when SFDX_SCHEMA_VALIDATE=false and invalid file', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar'
        }
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      // create() calls read() which calls schemaValidate()
      await SfdxProjectJson.create({});
      expect(loggerSpy.calledOnce).to.be.true;
      expect(loggerSpy.calledWithMatch('sfdx-project.json is not schema valid')).to.be.true;
    });
  });

  describe('resolve', () => {
    it('caches the sfdx-project.json per path', async () => {
      // @ts-ignore  SfdxProject.instances is private so override for testing.
      const instanceSetSpy = $$.SANDBOX.spy(SfdxProject.instances, 'set');
      $$.SANDBOX.stub(internal, 'resolveProjectPath').callsFake(() => projectPath);
      const project1 = await SfdxProject.resolve('foo');
      expect(instanceSetSpy.calledOnce).to.be.true;
      const project2 = await SfdxProject.resolve('foo');
      expect(instanceSetSpy.calledOnce).to.be.true;
      expect(project1).to.equal(project2);
    });
    it('with working directory', async () => {
      $$.SANDBOX.stub(internal, 'resolveProjectPath').callsFake(() => projectPath);
      const project = await SfdxProject.resolve();
      expect(project.getPath()).to.equal(projectPath);
      const sfdxProject = await project.retrieveSfdxProjectJson();
      expect(sfdxProject.getPath()).to.equal(`${projectPath}/${SfdxProjectJson.getFileName()}`);
    });
    it('with working directory throws with no sfdx-project.json', async () => {
      $$.SANDBOX.stub(internal, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspace'));
      try {
        await SfdxProject.resolve();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspace');
      }
    });
    it('with path', async () => {
      $$.SANDBOX.stub(internal, 'resolveProjectPath').callsFake(() => '/path');
      const project = await SfdxProject.resolve('/path');
      expect(project.getPath()).to.equal('/path');
      const sfdxProject = await project.retrieveSfdxProjectJson();
      expect(sfdxProject.getPath()).to.equal(`/path/${SfdxProjectJson.getFileName()}`);
    });
    it('with path throws with no sfdx-project.json', async () => {
      $$.SANDBOX.stub(internal, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspace'));
      try {
        await SfdxProject.resolve();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspace');
      }
    });
  });

  describe('resolveProjectConfig', () => {
    beforeEach(() => {
      $$.SANDBOX.stub(internal, 'resolveProjectPath').callsFake(() => projectPath);
      delete process.env.FORCE_SFDC_LOGIN_URL;
    });
    it('gets default login url', async () => {
      $$.configStubs.SfdxProjectJson = { contents: {} };
      const project = await SfdxProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('https://login.salesforce.com');
    });
    it('gets global overrides default', async () => {
      const read = async function() {
        if (this.isGlobal()) {
          return { sfdcLoginUrl: 'globalUrl' };
        } else {
          return {};
        }
      };
      $$.configStubs.SfdxProjectJson = { retrieveContents: read };
      const project = await SfdxProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('globalUrl');
    });
    it('gets local overrides global', async () => {
      const read = async function() {
        if (this.isGlobal()) {
          return { sfdcLoginUrl: 'globalUrl' };
        } else {
          return { sfdcLoginUrl: 'localUrl' };
        }
      };
      $$.configStubs.SfdxProjectJson = { retrieveContents: read };
      const project = await SfdxProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('localUrl');
    });
    it('gets env overrides local', async () => {
      process.env.FORCE_SFDC_LOGIN_URL = 'envarUrl';
      const read = async function() {
        if (this.isGlobal()) {
          return { sfdcLoginUrl: 'globalUrl' };
        } else {
          return { sfdcLoginUrl: 'localUrl' };
        }
      };
      $$.configStubs.SfdxProjectJson = { retrieveContents: read };
      const project = await SfdxProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('envarUrl');
    });
    it('gets config overrides local', async () => {
      const read = async function() {
        if (this.isGlobal()) {
          return { apiVersion: 38.0 };
        } else {
          return { apiVersion: 39.0 };
        }
      };
      $$.configStubs.SfdxProjectJson = { retrieveContents: read };
      $$.configStubs.Config = { contents: { apiVersion: 40.0 } };
      const project = await SfdxProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['apiVersion']).to.equal(40.0);
    });
  });
});
