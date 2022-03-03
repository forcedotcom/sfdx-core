/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join, sep } from 'path';
import { assert, expect } from 'chai';

import { env } from '@salesforce/kit';
import { Messages } from '../../src/exported';
import { SfProject, SfProjectJson } from '../../src/sfProject';
import { shouldThrow, testSetup } from '../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('SfProject', () => {
  let projectPath;

  beforeEach(async () => {
    projectPath = await $$.localPathRetriever($$.id);
    // @ts-ignore private method
    SfProject.instances.clear();
  });

  describe('json', () => {
    it('allows uppercase packaging aliases on write', async () => {
      const json = await SfProjectJson.create();
      await json.write({ packageAliases: { MyName: 'somePackage' } });
      expect($$.getConfigStubContents('SfProjectJson').packageAliases['MyName']).to.equal('somePackage');
    });
    it('allows uppercase packaging aliases on read', async () => {
      $$.setConfigStubContents('SfProjectJson', { contents: { packageAliases: { MyName: 'somePackage' } } });
      const json = await SfProjectJson.create();
      expect(json.get('packageAliases')['MyName']).to.equal('somePackage');
    });
    it('read calls schemaValidate', async () => {
      const defaultOptions = SfProjectJson.getDefaultOptions();
      const sfProjectJson = new SfProjectJson(defaultOptions);
      const schemaValidateStub = $$.SANDBOX.stub(sfProjectJson, 'schemaValidate');
      schemaValidateStub.returns(Promise.resolve());
      await sfProjectJson.read();
      expect(schemaValidateStub.calledOnce).to.be.true;
    });
    it('write calls schemaValidate', async () => {
      const defaultOptions = SfProjectJson.getDefaultOptions();
      const sfProjectJson = new SfProjectJson(defaultOptions);
      const schemaValidateStub = $$.SANDBOX.stub(sfProjectJson, 'schemaValidate');
      schemaValidateStub.returns(Promise.resolve());
      await sfProjectJson.write();
      expect(schemaValidateStub.calledOnce).to.be.true;
    });
    it('getPackageDirectories should transform packageDir paths to have path separators that match the OS', async () => {
      let defaultPP: string;
      let transformedDefaultPP: string;
      let otherPP: string;
      let transformedOtherPP: string;

      if (sep === '/') {
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

      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: defaultPP, default: true },
            { path: otherPP, default: false },
          ],
        },
      });
      const sfProjectJson = await SfProjectJson.create();
      const packageDirs = await sfProjectJson.getPackageDirectories();

      expect(packageDirs).to.deep.equal([
        {
          path: transformedDefaultPP,
          fullPath: `${join(projectPath, transformedDefaultPP)}${sep}`,
          name: transformedDefaultPP,
          default: true,
        },
        {
          path: transformedOtherPP,
          fullPath: `${join(projectPath, transformedOtherPP)}${sep}`,
          name: transformedOtherPP,
          default: false,
        },
      ]);
    });
    it('schemaValidate validates sfdx-project.json', async () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: 'force-app', default: true },
            { path: 'common', default: false },
          ],
          namespace: 'test_ns',
          sourceApiVersion: '48.0',
        },
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      // create() calls read() which calls schemaValidate()
      await SfProjectJson.create();
      expect(loggerSpy.called).to.be.false;
    });
    it('schemaValidate throws when SFDX_PROJECT_JSON_VALIDATION=true and invalid file', async () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      $$.SANDBOX.stub(env, 'getBoolean').callsFake((envVarName) => envVarName === 'SFDX_PROJECT_JSON_VALIDATION');
      const expectedError = "Validation errors:\n should NOT have additional properties 'foo'";
      try {
        // create() calls read() which calls schemaValidate()
        await shouldThrow(SfProjectJson.create());
      } catch (e) {
        expect(e.name).to.equal('SchemaValidationError');
        expect(e.message).to.contain(expectedError);
      }
    });
    it('schemaValidate warns when SFDX_PROJECT_JSON_VALIDATION=false and invalid file', async () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      // create() calls read() which calls schemaValidate()
      await SfProjectJson.create();
      expect(loggerSpy.calledOnce).to.be.true;
      expect(loggerSpy.args[0][0]).to.contains('is not schema valid');
    });
  });

  describe('schemaValidate', () => {
    it('validates sfdx-project.json', async () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: 'force-app', default: true },
            { path: 'common', default: false },
          ],
          namespace: 'test_ns',
          sourceApiVersion: '48.0',
        },
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      const project = new SfProjectJson({});
      await project.schemaValidate();
      expect(loggerSpy.called).to.be.false;
    });
    it('throws when SFDX_PROJECT_JSON_VALIDATION=true and invalid file', async () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      $$.SANDBOX.stub(env, 'getBoolean').callsFake((envVarName) => envVarName === 'SFDX_PROJECT_JSON_VALIDATION');
      const expectedError = "Validation errors:\n should NOT have additional properties 'foo'";
      try {
        const project = new SfProjectJson({});
        await project.schemaValidate();
        assert(false, 'should throw');
      } catch (e) {
        expect(e.name).to.equal('SchemaValidationError');
        expect(e.message).to.contain(expectedError);
      }
    });
    it('warns when SFDX_PROJECT_JSON_VALIDATION=false and invalid file', async () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      const project = new SfProjectJson({});
      await project.schemaValidate();
      expect(loggerSpy.calledOnce).to.be.true;
      expect(loggerSpy.args[0][0]).to.contain('is not schema valid');
    });
  });

  describe('resolve', () => {
    it('caches the sfdx-project.json per path', async () => {
      // @ts-ignore  SfProject.instances is private so override for testing.
      const instanceSetSpy = $$.SANDBOX.spy(SfProject.instances, 'set');
      const project1 = await SfProject.resolve('foo');
      expect(instanceSetSpy.calledOnce).to.be.true;
      const project2 = await SfProject.resolve('foo');
      expect(instanceSetSpy.calledOnce).to.be.true;
      expect(project1).to.equal(project2);
    });
    it('with working directory', async () => {
      const project = await SfProject.resolve();
      expect(project.getPath()).to.equal(projectPath);
      const sfProject = await project.retrieveSfProjectJson();
      expect(sfProject.getPath()).to.equal(`${projectPath}${sep}${SfProjectJson.getFileName()}`);
    });
    it('with working directory throws with no sfdx-project.json', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfProject, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspaceError'));
      try {
        await SfProject.resolve();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspaceError');
      }
    });
    it('with path', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfProject, 'resolveProjectPath').resolves(projectPath);
      const project = await SfProject.resolve(projectPath);
      expect(project.getPath()).to.equal(projectPath);
      const sfProject = await project.retrieveSfProjectJson();
      expect(sfProject.getPath()).to.equal(`${projectPath}${sep}${SfProjectJson.getFileName()}`);
    });
    it('with path in project', async () => {
      $$.SANDBOXES.PROJECT.restore();
      const resolveStub = $$.SANDBOX.stub(SfProject, 'resolveProjectPath');
      resolveStub.onFirstCall().resolves('/path');
      resolveStub.onSecondCall().resolves('/path');
      const project1 = await SfProject.resolve('/path');
      const project2 = await SfProject.resolve('/path/in/side/project');
      expect(project2.getPath()).to.equal('/path');
      expect(project1).to.equal(project2);
    });
    it('with path throws with no sfdx-project.json', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfProject, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspaceError'));
      try {
        await SfProject.resolve();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspaceError');
      }
    });
  });

  describe('getInstance', () => {
    it('with path', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfProject, 'resolveProjectPathSync').returns(projectPath);
      const project = SfProject.getInstance(projectPath);
      expect(project.getPath()).to.equal(projectPath);
      const sfProject = await project.retrieveSfProjectJson();
      expect(sfProject.getPath()).to.equal(`${projectPath}${sep}${SfProjectJson.getFileName()}`);
    });
    it('with path in project', async () => {
      $$.SANDBOXES.PROJECT.restore();
      const resolveStub = $$.SANDBOX.stub(SfProject, 'resolveProjectPathSync');
      resolveStub.onFirstCall().returns('/path');
      resolveStub.onSecondCall().returns('/path');
      const project1 = SfProject.getInstance('/path');
      const project2 = SfProject.getInstance('/path/in/side/project');
      expect(project2.getPath()).to.equal('/path');
      expect(project1).to.equal(project2);
    });
    it('with path throws with no sfdx-project.json', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfProject, 'resolveProjectPathSync').throws(new Error('InvalidProjectWorkspaceError'));
      try {
        SfProject.getInstance();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspaceError');
      }
    });
  });

  describe('resolveProjectConfig', () => {
    beforeEach(() => {
      delete process.env.FORCE_SFDC_LOGIN_URL;
      delete process.env.SFDX_SCRATCH_ORG_CREATION_LOGIN_URL;
    });
    it('gets default login url', async () => {
      $$.configStubs.SfProjectJson = { contents: {} };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('https://login.salesforce.com');
    });
    it('gets global overrides default', async () => {
      const read = async function () {
        if (this.isGlobal()) {
          return { sfdcLoginUrl: 'globalUrl' };
        } else {
          return {};
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('globalUrl');
    });
    it('gets local overrides global', async () => {
      const read = async function () {
        if (this.isGlobal()) {
          return { sfdcLoginUrl: 'globalUrl' };
        } else {
          return { sfdcLoginUrl: 'localUrl' };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('localUrl');
    });
    it('gets env overrides local and config', async () => {
      process.env.FORCE_SFDC_LOGIN_URL = 'envarUrl';
      const read = async function () {
        if (this.isGlobal()) {
          return { sfdcLoginUrl: 'globalUrl' };
        } else {
          return { sfdcLoginUrl: 'localUrl' };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      $$.configStubs.Config = { contents: { instanceUrl: 'https://dontusethis.my.salesforce.com' } };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('envarUrl');
    });
    it('gets signupTargetLoginUrl local', async () => {
      const read = async function () {
        return { signupTargetLoginUrl: 'localUrl' };
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['signupTargetLoginUrl']).to.equal('localUrl');
    });
    it('gets SFDX_SCRATCH_ORG_CREATION_LOGIN_URL env overrides config', async () => {
      process.env.SFDX_SCRATCH_ORG_CREATION_LOGIN_URL = 'envarUrl';
      const read = async function () {
        return { signupTargetLoginUrl: 'localUrl' };
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['signupTargetLoginUrl']).to.equal('envarUrl');
    });
    it('gets config instanceUrl sets sfdcLoginUrl when there is none elsewhere', async () => {
      const read = async function () {
        if (this.isGlobal()) {
          return { apiVersion: 38.0 };
        } else {
          return { apiVersion: 39.0 };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      $$.configStubs.Config = { contents: { apiVersion: 40.0, instanceUrl: 'https://usethis.my.salesforce.com' } };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('https://usethis.my.salesforce.com');
    });
    it('config instanceUrl defers to sfdcLoginUrl in files', async () => {
      const read = async function () {
        if (this.isGlobal()) {
          return { apiVersion: 38.0, sfdcLoginUrl: 'https://fromfiles.com' };
        } else {
          return { apiVersion: 39.0, sfdcLoginUrl: 'https://fromfiles.com' };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      $$.configStubs.Config = { contents: { apiVersion: 40.0, instanceUrl: 'https://dontusethis.my.salesforce.com' } };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('https://fromfiles.com');
    });
    it('gets config overrides local', async () => {
      const read = async function () {
        if (this.isGlobal()) {
          return { apiVersion: 38.0 };
        } else {
          return { apiVersion: 39.0 };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      $$.configStubs.Config = { contents: { apiVersion: 40.0 } };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['apiVersion']).to.equal(40.0);
    });
  });

  describe('packageDirectories', () => {
    it('should maintain a list of package configs', async () => {
      const expectedPackage1 = 'foo';
      const expectedPackage2 = 'bar';

      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: expectedPackage1, default: true },
            { path: expectedPackage2, default: false },
          ],
        },
      });
      const project = await SfProject.resolve();
      const packageDirs = project.getPackageDirectories();

      expect(packageDirs.length).to.equal(2);
      const expected = [
        {
          path: expectedPackage1,
          fullPath: join(projectPath, expectedPackage1, sep),
          name: expectedPackage1,
          default: true,
        },
        {
          path: expectedPackage2,
          fullPath: join(projectPath, expectedPackage2, sep),
          name: expectedPackage2,
          default: false,
        },
      ];
      expect(packageDirs).to.deep.equal(expected);
    });

    it('should get the default package config', async () => {
      const expectedPackage1 = 'foo';
      const expectedPackage2 = 'bar';

      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: expectedPackage1, default: true },
            { path: expectedPackage2, default: false },
          ],
        },
      });
      const project = await SfProject.resolve();
      const actual = project.getDefaultPackage();
      const expected = {
        path: expectedPackage1,
        fullPath: join(projectPath, expectedPackage1, sep),
        name: expectedPackage1,
        default: true,
      };
      expect(actual).to.deep.equal(expected);
    });

    it('should set the a single package entry as default', async () => {
      const expectedPackage1 = 'foo';

      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: expectedPackage1 }],
        },
      });
      const project = await SfProject.resolve();
      const actual = project.getDefaultPackage();
      const expected = {
        path: expectedPackage1,
        fullPath: join(projectPath, expectedPackage1, sep),
        name: expectedPackage1,
        default: true,
      };
      expect(actual).to.deep.equal(expected);
    });

    it('should error when one package is defined and set to default=false', async () => {
      const expectedPackage1 = 'foo';

      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: expectedPackage1, default: false }],
        },
      });
      const project = await SfProject.resolve();

      try {
        project.getPackageDirectories();
        assert.fail('the above should throw an error');
      } catch (e) {
        expect(e.message).to.equal(
          Messages.load('@salesforce/core', 'config', ['singleNonDefaultPackage']).getMessage('singleNonDefaultPackage')
        );
      }
    });

    it('should expand ./ to full path on package paths', () => {
      const expectedName = 'force-app';
      const expectedPackage = `.${sep}${expectedName}${sep}`;

      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: expectedPackage, default: true }],
        },
      });

      const project = SfProject.getInstance();
      const actual = project.getDefaultPackage();
      const expected = {
        fullPath: join(projectPath, expectedPackage, sep),
        path: expectedPackage,
        name: expectedName,
        default: true,
      };
      expect(actual).to.deep.equal(expected);
    });

    it('should filter based on package path', async () => {
      const expectedPackage1 = 'force-app';

      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: expectedPackage1, default: true },
            { path: expectedPackage1, default: false },
          ],
        },
      });
      const project = await SfProject.resolve();

      expect(project.getPackageDirectories().length).to.equal(2);
      expect(project.getUniquePackageDirectories().length).to.equal(1);
    });

    describe('getPackageNameFromSourcePath', () => {
      const expectedPackage = 'force-app';
      const expectedContainedPackage = 'force-app-two';
      const expectedNestedPackage = join('force-app-two', 'nested');

      beforeEach(() => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              { path: expectedNestedPackage, default: false },
              { path: expectedPackage, default: true },
              { path: expectedContainedPackage, default: false },
            ],
          },
        });
      });

      it('should return the package that a source path belongs to', () => {
        const actual = SfProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedPackage, 'main', 'apex', 'apecClass.cls')
        );
        expect(actual).to.equal(expectedPackage);
      });

      it('should return correct package name when the file name includes package name', () => {
        const actual = SfProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedPackage, 'main', 'apex', `${expectedPackage}apecClass.cls`)
        );
        expect(actual).to.equal(expectedPackage);
      });

      it('should return correct package name when the file path includes a different package name', () => {
        const actual = SfProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedContainedPackage, 'main', 'apex', 'apecClass.cls')
        );
        expect(actual).to.equal(expectedContainedPackage);
      });

      it('should return correct package name when the package has a nested path', () => {
        const actual = SfProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedNestedPackage, 'main', 'apex', 'apecClass.cls')
        );
        expect(actual).to.equal(expectedNestedPackage);
      });
    });

    describe('getPackagePath', () => {
      const expectedPackage = 'force-app';

      beforeEach(() => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [{ path: expectedPackage, default: true }],
          },
        });
      });

      it('should return the package path given a package name', () => {
        const expectedPath = join(projectPath, expectedPackage, sep);
        expect(SfProject.getInstance().getPackagePath(expectedPackage)).to.equal(expectedPath);
      });

      it('should return null when not matched', () => {
        expect(SfProject.getInstance().getPackagePath('nonexistant')).to.equal(undefined);
      });
    });

    describe('set/get ActivePackage', () => {
      const expectedPackage = 'force-app';

      beforeEach(() => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [{ path: expectedPackage, default: true }],
          },
        });
      });

      it('should set/get a null package', () => {
        SfProject.getInstance().setActivePackage(null);
        expect(SfProject.getInstance().getActivePackage()).to.equal(null);
      });

      it('should set/get a nonexistent package', () => {
        SfProject.getInstance().setActivePackage('force-app-?');
        expect(SfProject.getInstance().getActivePackage()).to.equal(undefined);
      });

      it('should set/get an existing package', () => {
        SfProject.getInstance().setActivePackage(expectedPackage);
        expect(SfProject.getInstance().getActivePackage().name).to.equal(expectedPackage);
      });
    });

    describe('hasMultiplePackages', () => {
      it('should return true if the project has multiple packages', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [
              { path: 'force-app1', default: true },
              { path: 'force-app2', default: true },
            ],
          },
        });

        expect(SfProject.getInstance().hasMultiplePackages()).to.equal(true);
      });

      it('should return false if the project does not have multiple packages', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [{ path: 'force-app', default: true }],
          },
        });

        expect(SfProject.getInstance().hasMultiplePackages()).to.equal(false);
      });
    });
  });
});
