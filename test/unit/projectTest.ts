/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join, sep } from 'path';
import { assert, expect } from 'chai';

import { env } from '@salesforce/kit';
import { SfdxError } from '../../src/exported';
import { SfdxProject, SfdxProjectJson } from '../../src/sfdxProject';
import { shouldThrow, testSetup } from '../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('SfdxProject', () => {
  let projectPath;

  beforeEach(async () => {
    projectPath = await $$.localPathRetriever($$.id);
    // @ts-ignore
    SfdxProject.instances.clear();
  });

  describe('json', () => {
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

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [
            { path: defaultPP, default: true },
            { path: otherPP, default: false },
          ],
        },
      });
      const sfdxProjectJson = await SfdxProjectJson.create({});
      const packageDirs = await sfdxProjectJson.getPackageDirectories();

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
      $$.setConfigStubContents('SfdxProjectJson', {
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
      await SfdxProjectJson.create({});
      expect(loggerSpy.called).to.be.false;
    });
    it('schemaValidate throws when SFDX_PROJECT_JSON_VALIDATION=true and invalid file', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      $$.SANDBOX.stub(env, 'getBoolean').callsFake((envVarName) => envVarName === 'SFDX_PROJECT_JSON_VALIDATION');
      const expectedError = "Validation errors:\n should NOT have additional properties 'foo'";
      try {
        // create() calls read() which calls schemaValidate()
        await shouldThrow(SfdxProjectJson.create({}));
      } catch (e) {
        expect(e.name).to.equal('SfdxSchemaValidationError');
        expect(e.message).to.equal(expectedError);
      }
    });
    it('schemaValidate warns when SFDX_PROJECT_JSON_VALIDATION=false and invalid file', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      // create() calls read() which calls schemaValidate()
      await SfdxProjectJson.create({});
      expect(loggerSpy.calledOnce).to.be.true;
      expect(loggerSpy.calledWithMatch('sfdx-project.json is not schema valid')).to.be.true;
    });
  });

  describe('schemaValidate', () => {
    it('validates sfdx-project.json', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
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
      const project = new SfdxProjectJson({});
      await project.schemaValidate();
      expect(loggerSpy.called).to.be.false;
    });
    it('throws when SFDX_PROJECT_JSON_VALIDATION=true and invalid file', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      $$.SANDBOX.stub(env, 'getBoolean').callsFake((envVarName) => envVarName === 'SFDX_PROJECT_JSON_VALIDATION');
      const expectedError = "Validation errors:\n should NOT have additional properties 'foo'";
      try {
        const project = new SfdxProjectJson({});
        await project.schemaValidate();
        assert(false, 'should throw');
      } catch (e) {
        expect(e.name).to.equal('SfdxSchemaValidationError');
        expect(e.message).to.equal(expectedError);
      }
    });
    it('warns when SFDX_PROJECT_JSON_VALIDATION=false and invalid file', async () => {
      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app', default: true }],
          foo: 'bar',
        },
      });
      const loggerSpy = $$.SANDBOX.spy($$.TEST_LOGGER, 'warn');
      const project = new SfdxProjectJson({});
      await project.schemaValidate();
      expect(loggerSpy.calledOnce).to.be.true;
      expect(loggerSpy.calledWithMatch('sfdx-project.json is not schema valid')).to.be.true;
    });
  });

  describe('resolve', () => {
    it('caches the sfdx-project.json per path', async () => {
      // @ts-ignore  SfdxProject.instances is private so override for testing.
      const instanceSetSpy = $$.SANDBOX.spy(SfdxProject.instances, 'set');
      const project1 = await SfdxProject.resolve('foo');
      expect(instanceSetSpy.calledOnce).to.be.true;
      const project2 = await SfdxProject.resolve('foo');
      expect(instanceSetSpy.calledOnce).to.be.true;
      expect(project1).to.equal(project2);
    });
    it('with working directory', async () => {
      const project = await SfdxProject.resolve();
      expect(project.getPath()).to.equal(projectPath);
      const sfdxProject = await project.retrieveSfdxProjectJson();
      expect(sfdxProject.getPath()).to.equal(`${projectPath}/${SfdxProjectJson.getFileName()}`);
    });
    it('with working directory throws with no sfdx-project.json', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfdxProject, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspace'));
      try {
        await SfdxProject.resolve();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspace');
      }
    });
    it('with path', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfdxProject, 'resolveProjectPath').resolves('/path');
      const project = await SfdxProject.resolve('/path');
      expect(project.getPath()).to.equal('/path');
      const sfdxProject = await project.retrieveSfdxProjectJson();
      expect(sfdxProject.getPath()).to.equal(`/path/${SfdxProjectJson.getFileName()}`);
    });
    it('with path in project', async () => {
      $$.SANDBOXES.PROJECT.restore();
      const resolveStub = $$.SANDBOX.stub(SfdxProject, 'resolveProjectPath');
      resolveStub.onFirstCall().resolves('/path');
      resolveStub.onSecondCall().resolves('/path');
      const project1 = await SfdxProject.resolve('/path');
      const project2 = await SfdxProject.resolve('/path/in/side/project');
      expect(project2.getPath()).to.equal('/path');
      expect(project1).to.equal(project2);
    });
    it('with path throws with no sfdx-project.json', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfdxProject, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspace'));
      try {
        await SfdxProject.resolve();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspace');
      }
    });
  });

  describe('getInstance', () => {
    it('with path', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfdxProject, 'resolveProjectPathSync').returns('/path');
      const project = SfdxProject.getInstance('/path');
      expect(project.getPath()).to.equal('/path');
      const sfdxProject = await project.retrieveSfdxProjectJson();
      expect(sfdxProject.getPath()).to.equal(`/path/${SfdxProjectJson.getFileName()}`);
    });
    it('with path in project', async () => {
      $$.SANDBOXES.PROJECT.restore();
      const resolveStub = $$.SANDBOX.stub(SfdxProject, 'resolveProjectPathSync');
      resolveStub.onFirstCall().returns('/path');
      resolveStub.onSecondCall().returns('/path');
      const project1 = SfdxProject.getInstance('/path');
      const project2 = SfdxProject.getInstance('/path/in/side/project');
      expect(project2.getPath()).to.equal('/path');
      expect(project1).to.equal(project2);
    });
    it('with path throws with no sfdx-project.json', async () => {
      $$.SANDBOXES.PROJECT.restore();
      $$.SANDBOX.stub(SfdxProject, 'resolveProjectPathSync').throws(new Error('InvalidProjectWorkspace'));
      try {
        SfdxProject.getInstance();
        assert.fail();
      } catch (e) {
        expect(e.message).to.equal('InvalidProjectWorkspace');
      }
    });
  });

  describe('resolveProjectConfig', () => {
    beforeEach(() => {
      delete process.env.FORCE_SFDC_LOGIN_URL;
    });
    it('gets default login url', async () => {
      $$.configStubs.SfdxProjectJson = { contents: {} };
      const project = await SfdxProject.resolve();
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
      $$.configStubs.SfdxProjectJson = { retrieveContents: read };
      const project = await SfdxProject.resolve();
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
      $$.configStubs.SfdxProjectJson = { retrieveContents: read };
      const project = await SfdxProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('localUrl');
    });
    it('gets env overrides local', async () => {
      process.env.FORCE_SFDC_LOGIN_URL = 'envarUrl';
      const read = async function () {
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
      const read = async function () {
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

  describe('packageDirectories', () => {
    it('should maintain a list of package configs', async () => {
      const expectedPackage1 = 'foo';
      const expectedPackage2 = 'bar';

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [
            { path: expectedPackage1, default: true },
            { path: expectedPackage2, default: false },
          ],
        },
      });
      const project = await SfdxProject.resolve();
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

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [
            { path: expectedPackage1, default: true },
            { path: expectedPackage2, default: false },
          ],
        },
      });
      const project = await SfdxProject.resolve();
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

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: expectedPackage1 }],
        },
      });
      const project = await SfdxProject.resolve();
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

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: expectedPackage1, default: false }],
        },
      });
      const project = await SfdxProject.resolve();

      try {
        project.getPackageDirectories();
        assert.fail('the above should throw an error');
      } catch (e) {
        expect(e.message).to.equal(SfdxError.create('@salesforce/core', 'config', 'SingleNonDefaultPackage').message);
      }
    });

    it('should expand ./ to full path on package paths', () => {
      const expectedName = 'force-app';
      const expectedPackage = `.${sep}${expectedName}${sep}`;

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [{ path: expectedPackage, default: true }],
        },
      });

      const project = SfdxProject.getInstance();
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

      $$.setConfigStubContents('SfdxProjectJson', {
        contents: {
          packageDirectories: [
            { path: expectedPackage1, default: true },
            { path: expectedPackage1, default: false },
          ],
        },
      });
      const project = await SfdxProject.resolve();

      expect(project.getPackageDirectories().length).to.equal(2);
      expect(project.getUniquePackageDirectories().length).to.equal(1);
    });

    describe('getPackageNameFromSourcePath', () => {
      const expectedPackage = 'force-app';
      const expectedContainedPackage = 'force-app-two';
      const expectedNestedPackage = join('force-app-two', 'nested');

      beforeEach(() => {
        $$.setConfigStubContents('SfdxProjectJson', {
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
        const actual = SfdxProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedPackage, 'main', 'apex', 'apecClass.cls')
        );
        expect(actual).to.equal(expectedPackage);
      });

      it('should return correct package name when the file name includes package name', () => {
        const actual = SfdxProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedPackage, 'main', 'apex', `${expectedPackage}apecClass.cls`)
        );
        expect(actual).to.equal(expectedPackage);
      });

      it('should return correct package name when the file path includes a different package name', () => {
        const actual = SfdxProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedContainedPackage, 'main', 'apex', 'apecClass.cls')
        );
        expect(actual).to.equal(expectedContainedPackage);
      });

      it('should return correct package name when the package has a nested path', () => {
        const actual = SfdxProject.getInstance().getPackageNameFromPath(
          join(projectPath, expectedNestedPackage, 'main', 'apex', 'apecClass.cls')
        );
        expect(actual).to.equal(expectedNestedPackage);
      });
    });

    describe('getPackagePath', () => {
      const expectedPackage = 'force-app';

      beforeEach(() => {
        $$.setConfigStubContents('SfdxProjectJson', {
          contents: {
            packageDirectories: [{ path: expectedPackage, default: true }],
          },
        });
      });

      it('should return the package path given a package name', () => {
        const expectedPath = join(projectPath, expectedPackage, sep);
        expect(SfdxProject.getInstance().getPackagePath(expectedPackage)).to.equal(expectedPath);
      });

      it('should return null when not matched', () => {
        expect(SfdxProject.getInstance().getPackagePath('nonexistant')).to.equal(undefined);
      });
    });

    describe('set/get ActivePackage', () => {
      const expectedPackage = 'force-app';

      beforeEach(() => {
        $$.setConfigStubContents('SfdxProjectJson', {
          contents: {
            packageDirectories: [{ path: expectedPackage, default: true }],
          },
        });
      });

      it('should set/get a null package', () => {
        SfdxProject.getInstance().setActivePackage(null);
        expect(SfdxProject.getInstance().getActivePackage()).to.equal(null);
      });

      it('should set/get a nonexistent package', () => {
        SfdxProject.getInstance().setActivePackage('force-app-?');
        expect(SfdxProject.getInstance().getActivePackage()).to.equal(undefined);
      });

      it('should set/get an existing package', () => {
        SfdxProject.getInstance().setActivePackage(expectedPackage);
        expect(SfdxProject.getInstance().getActivePackage().name).to.equal(expectedPackage);
      });
    });

    describe('hasMultiplePackages', () => {
      it('should return true if the project has multiple packages', () => {
        $$.setConfigStubContents('SfdxProjectJson', {
          contents: {
            packageDirectories: [
              { path: 'force-app1', default: true },
              { path: 'force-app2', default: true },
            ],
          },
        });

        expect(SfdxProject.getInstance().hasMultiplePackages()).to.equal(true);
      });

      it('should return false if the project does not have multiple packages', () => {
        $$.setConfigStubContents('SfdxProjectJson', {
          contents: {
            packageDirectories: [{ path: 'force-app', default: true }],
          },
        });

        expect(SfdxProject.getInstance().hasMultiplePackages()).to.equal(false);
      });
    });
  });
});
