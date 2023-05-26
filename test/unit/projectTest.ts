/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { join, sep } from 'path';
import { expect } from 'chai';

import { env } from '@salesforce/kit';
import { Messages, NamedPackageDir } from '../../src/exported';
import { SfProject, SfProjectJson } from '../../src/sfProject';
import { shouldThrow, shouldThrowSync, TestContext } from '../../src/testSetup';

describe('SfProject', () => {
  const $$ = new TestContext();
  let projectPath: string;

  beforeEach(async () => {
    projectPath = await $$.localPathRetriever($$.id);
    // @ts-expect-error private method
    SfProject.instances.clear();
  });

  describe('json', () => {
    it('allows uppercase packaging aliases on write', async () => {
      const json = await SfProjectJson.create();
      await json.write({ packageAliases: { MyName: 'somePackage' } });
      // @ts-expect-error possibly undefined
      expect($$.getConfigStubContents('SfProjectJson').packageAliases['MyName']).to.equal('somePackage');
    });
    it('allows uppercase packaging aliases on read', async () => {
      $$.setConfigStubContents('SfProjectJson', { contents: { packageAliases: { MyName: 'somePackage' } } });
      const json = await SfProjectJson.create();
      // @ts-expect-error possibly undefined
      expect(json.get('packageAliases')['MyName']).to.equal('somePackage');
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
      const expectedError = "Validation errors:\n#/additionalProperties: must NOT have additional properties 'foo'";
      try {
        const project = new SfProjectJson({});
        await shouldThrow(project.schemaValidate());
      } catch (e) {
        if (!(e instanceof Error)) {
          expect.fail('Expected error to be an instance of Error');
        }
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
      // @ts-expect-error  SfProject.instances is private so override for testing.
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
        await shouldThrow(SfProject.resolve());
      } catch (e) {
        if (!(e instanceof Error)) {
          expect.fail('Expected error to be an instance of Error');
        }
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
        await shouldThrow(SfProject.resolve());
      } catch (e) {
        if (!(e instanceof Error)) {
          expect.fail('Expected error to be an instance of Error');
        }
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
        shouldThrowSync(() => SfProject.getInstance());
      } catch (e) {
        if (!(e instanceof Error)) {
          expect.fail('Expected error to be an instance of Error');
        }
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
        // @ts-expect-error this is any
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
        // @ts-expect-error this is any
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
        // @ts-expect-error this is any
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
    it('gets config org-instance-url sets sfdcLoginUrl when there is none elsewhere', async () => {
      const read = async function () {
        // @ts-expect-error this is any
        if (this.isGlobal()) {
          return { 'org-api-version': 38.0 };
        } else {
          return { 'org-api-version': 39.0 };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      $$.configStubs.Config = {
        contents: { 'org-api-version': 40.0, 'org-instance-url': 'https://usethis.my.salesforce.com' },
      };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('https://usethis.my.salesforce.com');
    });
    it('config instanceUrl defers to sfdcLoginUrl in files', async () => {
      const read = async function () {
        // @ts-expect-error this is any
        if (this.isGlobal()) {
          return { 'org-api-version': 38.0, sfdcLoginUrl: 'https://fromfiles.com' };
        } else {
          return { 'org-api-version': 39.0, sfdcLoginUrl: 'https://fromfiles.com' };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      $$.configStubs.Config = {
        contents: { 'org-api-version': 40.0, 'org-instance-url': 'https://dontusethis.my.salesforce.com' },
      };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['sfdcLoginUrl']).to.equal('https://fromfiles.com');
    });
    it('gets config overrides local', async () => {
      const read = async function () {
        // @ts-expect-error this is any
        if (this.isGlobal()) {
          return { 'org-api-version': 38.0 };
        } else {
          return { 'org-api-version': 39.0 };
        }
      };
      $$.configStubs.SfProjectJson = { retrieveContents: read };
      $$.configStubs.Config = { contents: { 'org-api-version': 40.0 } };
      const project = await SfProject.resolve();
      const config = await project.resolveProjectConfig();
      expect(config['org-api-version']).to.equal(40.0);
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
        shouldThrowSync(() => project.getPackageDirectories());
      } catch (e) {
        expect((e as Error).message).to.equal(
          Messages.loadMessages('@salesforce/core', 'config').getMessage('singleNonDefaultPackage')
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
              { path: expectedPackage, default: true },
              { path: expectedNestedPackage, default: false },
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
      it('should return correct package name when the package has a nested path and given path equal package full path', () => {
        const actual = SfProject.getInstance().getPackageNameFromPath(join(projectPath, expectedNestedPackage));
        expect(actual).to.equal(expectedNestedPackage);
      });
      it('should return correct package name when the package has a nested path and given relative path', () => {
        $$.SANDBOX.stub(process, 'cwd').returns(projectPath);
        const actual = SfProject.getInstance().getPackageNameFromPath(expectedNestedPackage);
        expect(actual).to.equal(expectedNestedPackage);
      });
      it(`should return correct package name when the package has a nested path and given relative dir with leading sep .${sep}foodir`, () => {
        $$.SANDBOX.stub(process, 'cwd').returns(projectPath);
        const actual = SfProject.getInstance().getPackageNameFromPath(`.${sep}${expectedNestedPackage}`);
        expect(actual).to.equal(expectedNestedPackage);
      });
      it(`should return correct package name when the package has a nested path and given relative dir trailing sep foodir${sep}`, () => {
        $$.SANDBOX.stub(process, 'cwd').returns(projectPath);
        const actual = SfProject.getInstance().getPackageNameFromPath(`${expectedNestedPackage}${sep}`);
        expect(actual).to.equal(expectedNestedPackage);
      });
      it(`should return correct package name when the package has a nested path and given relative dir with leading and trailing sep .${sep}foodir${sep}`, () => {
        $$.SANDBOX.stub(process, 'cwd').returns(projectPath);
        const actual = SfProject.getInstance().getPackageNameFromPath(`.${sep}${expectedNestedPackage}${sep}`);
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
        expect(SfProject.getInstance().getActivePackage()?.name).to.equal(expectedPackage);
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
    describe('addPackageDirectory', () => {
      it('should add a new package directory when no package dirs exist', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [],
          },
        });

        const project = SfProject.getInstance();
        project
          .getSfProjectJson()
          .addPackageDirectory({ path: './force-app', package: 'p1', default: true } as NamedPackageDir);

        expect(SfProject.getInstance().hasMultiplePackages()).to.equal(false);
      });
      it('should add a new package directory to existing package dirs', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [{ path: './force-app', package: 'p1', default: true }],
          },
        });

        const project = SfProject.getInstance();
        project
          .getSfProjectJson()
          .addPackageDirectory({ path: './force-app', name: 'p2', default: false } as NamedPackageDir);

        expect(SfProject.getInstance().hasMultiplePackages()).to.equal(true);
      });
      it('should merge to an existing existing package dir', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageDirectories: [{ path: './force-app', package: 'p1', default: true }],
          },
        });

        const project = SfProject.getInstance();
        project.getSfProjectJson().addPackageDirectory({
          path: './force-app',
          package: 'p1',
          default: true,
          ancestorId: '04txxxxxxxxxxxxxxx',
        } as NamedPackageDir);

        expect(project.hasMultiplePackages()).to.equal(false);
        expect(project.getSfProjectJson().getPackageDirectoriesSync()[0]).to.have.property(
          'ancestorId',
          '04txxxxxxxxxxxxxxx'
        );
      });
    });
  });
  describe('packageAliases', () => {
    describe('sfproject aliases', () => {
      it('should return an undefined object if no aliases are defined', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {},
        });

        const project = SfProject.getInstance();
        expect(project.getPackageAliases()).to.not.be.ok;
      });
      it('should return false no aliases are defined', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {},
        });

        const project = SfProject.getInstance();
        expect(project.hasPackageAliases()).to.not.be.false;
      });
      it('should return true when at least one alias is defined', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        expect(project.hasPackageAliases()).to.not.be.true;
      });
      it('should return the defined package aliases', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        expect(project.getPackageAliases()).to.deep.equal({
          alias1: '04txxxxxxxxxxxxxxx',
        });
      });
      it('should not find id of alias by name when name not in aliases collection', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        expect(project.getPackageIdFromAlias('alias1')).to.equal('04txxxxxxxxxxxxxxx');
      });
      it('should find id of alias by name', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        expect(project.getPackageIdFromAlias('alias2')).to.not.be.ok;
      });
      it('should find alias by id', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        expect(project.getAliasesFromPackageId('04txxxxxxxxxxxxxxx')).to.deep.equal(['alias1']);
      });
      it('should not find alias by id using id not in aliases collection', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        expect(project.getAliasesFromPackageId('04tyyyyyyyyyyyy')).to.deep.equal([]);
      });
      it('should find alias using 15 char id', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        expect(project.getAliasesFromPackageId('04txxxxxxxxxxxx')).to.deep.equal(['alias1']);
      });
      it('should add a new alias', () => {
        $$.setConfigStubContents('SfProjectJson', {
          contents: {
            packageAliases: {
              alias1: '04txxxxxxxxxxxxxxx',
            },
          },
        });

        const project = SfProject.getInstance();
        project.getSfProjectJson().addPackageAlias('alias2', '04tyyyyyyyyyyyyyyy');
        expect(project.getAliasesFromPackageId('04tyyyyyyyyyyyyyyy')).to.deep.equal(['alias2']);
      });
    });
  });
  describe('findPackage', () => {
    it('should find package', () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app1', default: true }],
        },
      });

      const project = SfProject.getInstance();
      expect(project.findPackage((pd) => pd.path === 'force-app1')).to.be.ok;
    });
    it('should not find package', () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [{ path: 'force-app1', default: true }],
        },
      });

      const project = SfProject.getInstance();
      expect(project.findPackage((pd) => pd.path === 'foo')).to.not.be.ok;
    });
    it('should find first instance when predicate could match more than one', () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: 'force-app1', default: true },
            { path: 'force-app1', default: false },
          ],
        },
      });

      const project = SfProject.getInstance();
      const foundPkg = project.findPackage((pd) => pd.path === 'force-app1');
      expect(foundPkg).to.be.ok;
      expect(foundPkg?.default).to.be.true;
    });
    it('should find second instance when predicate is specific to a single entry', () => {
      $$.setConfigStubContents('SfProjectJson', {
        contents: {
          packageDirectories: [
            { path: 'force-app1', default: true },
            { path: 'force-app1', default: false },
          ],
        },
      });

      const project = SfProject.getInstance();
      const foundPkg = project.findPackage((pd) => pd.path === 'force-app1' && pd.default === false);
      expect(foundPkg).to.be.ok;
      expect(foundPkg?.default).to.be.false;
    });
  });
});
