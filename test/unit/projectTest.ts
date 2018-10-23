/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect } from 'chai';

import { SfdxProject, SfdxProjectJson } from '../../src/sfdxProject';
import { testSetup } from '../../src/testSetup';
import * as internal from '../../src/util/internal';

// Setup the test environment.
const $$ = testSetup();

describe('SfdxProject', async () => {
    let projectPath;

    beforeEach(async () => {
        projectPath = await $$.localPathRetriever($$.id);
    });
    describe('resolve', () => {
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
