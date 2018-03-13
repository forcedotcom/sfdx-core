/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, assert } from 'chai';

import { Project, SfdxProjectJson } from '../../lib/project';
import { SfdxUtil } from '../../lib/util';
import { Messages } from '../../lib/messages';
import { testSetup } from '../testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('Project', async () => {
    let projectPath;

    beforeEach(async () => {
        projectPath = await $$.localPathRetriever($$.id);
    });
    describe('resolve', () => {
        it('with working directory', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'resolveProjectPath').callsFake(() => projectPath);
            const project = await Project.resolve();
            expect(project.getPath()).to.equal(projectPath);
            const sfdxProject = await project.retrieveSfdxProjectJson();
            expect(sfdxProject.getPath()).to.equal(`${projectPath}/${SfdxProjectJson.getFileName()}`);
        });
        it('with working directory throws with no sfdx-project.json', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspace'));
            try {
                await Project.resolve();
                assert.fail();
            } catch (e) {
                expect(e.message).to.equal('InvalidProjectWorkspace');
            }
        });
        it('with path', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'resolveProjectPath').callsFake(() => '/path');
            const project = await Project.resolve('/path');
            expect(project.getPath()).to.equal('/path');
            const sfdxProject = await project.retrieveSfdxProjectJson();
            expect(sfdxProject.getPath()).to.equal(`/path/${SfdxProjectJson.getFileName()}`);
        });
        it('with path throws with no sfdx-project.json', async () => {
            $$.SANDBOX.stub(SfdxUtil, 'resolveProjectPath').throws(new Error('InvalidProjectWorkspace'));
            try {
                await Project.resolve();
                assert.fail();
            } catch (e) {
                expect(e.message).to.equal('InvalidProjectWorkspace');
            }
        });
    });

    describe('resolveProjectConfig', () => {
        beforeEach(() => {
            $$.SANDBOX.stub(SfdxUtil, 'resolveProjectPath').callsFake(() => projectPath);
            delete process.env.FORCE_SFDC_LOGIN_URL;
        });
        it('gets default login url', async () => {
            $$.configStubs['SfdxProjectJson'] = { contents: {} };
            const project = await Project.resolve();
            const config: any = await project.resolveProjectConfig();
            expect(config.sfdcLoginUrl).to.equal('https://login.salesforce.com');
        });
        it('gets global overrides default', async () => {
            const read = async function() {
                if (this.isGlobal()) {
                    return { sfdcLoginUrl: 'globalUrl' };
                } else {
                    return {};
                }
            };
            $$.configStubs['SfdxProjectJson'] = { retrieveContents: read };
            const project = await Project.resolve();
            const config: any = await project.resolveProjectConfig();
            expect(config.sfdcLoginUrl).to.equal('globalUrl');
        });
        it('gets local overrides global', async () => {
            const read = async function() {
                if (this.isGlobal()) {
                    return { sfdcLoginUrl: 'globalUrl' };
                } else {
                    return { sfdcLoginUrl: 'localUrl' };
                }
            };
            $$.configStubs['SfdxProjectJson'] = { retrieveContents: read };
            const project = await Project.resolve();
            const config: any = await project.resolveProjectConfig();
            expect(config.sfdcLoginUrl).to.equal('localUrl');
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
            $$.configStubs['SfdxProjectJson'] = { retrieveContents: read };
            const project = await Project.resolve();
            const config: any = await project.resolveProjectConfig();
            expect(config.sfdcLoginUrl).to.equal('envarUrl');
        });
        it('gets config overrides local', async () => {
            const read = async function() {
                if (this.isGlobal()) {
                    return { apiVersion: 38.0 };
                } else {
                    return { apiVersion: 39.0 };
                }
            };
            $$.configStubs['SfdxProjectJson'] = { retrieveContents: read };
            $$.configStubs['SfdxConfig'] = { contents: { apiVersion: 40.0 } };
            const project = await Project.resolve();
            const config: any = await project.resolveProjectConfig();
            expect(config.apiVersion).to.equal(40.0);
        });
    });
});
