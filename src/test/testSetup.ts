/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { randomBytes } from 'crypto';
import { sandbox as sinonSandbox } from 'sinon';
import { isBoolean, once } from 'lodash';
import { Logger } from '../lib/logger';
import { Messages } from '../lib/messages';
import { ConfigFile } from '../lib/config/configFile';
import { join as pathJoin } from 'path';
import { tmpdir as osTmpdir } from 'os';

export interface TestContext {
    SANDBOX: any;
    TEST_LOGGER: Logger;
    id: string;
    uniqid: () => string;
    configs: object;
    localPathRetriever: (uid: string) => Promise<string>;
    globalPathRetriever: (uid: string) => Promise<string>;
    rootPathRetriever: (isGlobal: boolean, uid?: string) => Promise<string>;
}

const _uniqid = () => {
    return randomBytes(16).toString('hex');
};

function getTestLocalPath(uid: string): Promise<string> {
    return Promise.resolve(pathJoin(osTmpdir(), uid, 'sfdx_core', 'local'));
}

function getTestGlobalPath(uid: string): Promise<string> {
    return Promise.resolve(pathJoin(osTmpdir(), uid, 'sfdx_core', 'global'));
}

async function retrieveRootPath(isGlobal: boolean, uid: string = _uniqid()): Promise<string> {
    return isGlobal ? await getTestGlobalPath(uid) : await getTestLocalPath(uid);
}

export interface SetupConfig {
    /**
     * Mocks out `ConfigFile.resolveRootFolder` as well as `read` and `write` instance methods.
     * Any test methods that call `read` and `write` (directly or indirectly) can get or set the
     * values on `$$.configs[configClassName]`.
     */
    includeConfigMocks?: boolean;
}

export const testSetup = once((config: SetupConfig = {}) => {
    // Import all the messages files in the sfdx-core messages dir.
    Messages.importMessagesDirectory(pathJoin(__dirname, '..', '..'));

    // Create a global sinon sandbox and a test logger instance for use within tests.
    const testContext: TestContext = {
        SANDBOX: sinonSandbox.create(),
        TEST_LOGGER: new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging(),
        id: _uniqid(),
        uniqid: _uniqid,
        configs: {},
        localPathRetriever: getTestLocalPath,
        globalPathRetriever: getTestGlobalPath,
        rootPathRetriever: retrieveRootPath
    };

    beforeEach(() => {
        // Most core files create a child logger so stub this to return our test logger.
        testContext.SANDBOX.stub(Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));

        if (!isBoolean(config.includeConfigMocks) || config.includeConfigMocks) {
            testContext.SANDBOX.stub(ConfigFile, 'resolveRootFolder').callsFake((isGlobal) => testContext.rootPathRetriever(isGlobal, testContext.id));
            // Mock out all config file IO.
            testContext.SANDBOX.stub(ConfigFile.prototype, 'read').callsFake(async function() {
                this.setContentsFromObject(testContext.configs[this.constructor.name]);
                return Promise.resolve(this.getContents());
            });
            testContext.SANDBOX.stub(ConfigFile.prototype, 'write').callsFake(async function(contents) {
                this.setContents(contents || this.getContents());
                testContext.configs[this.constructor.name] = this.toObject();
                return Promise.resolve();
            });
        }
    });

    afterEach(() => {
        testContext.SANDBOX.restore();
        testContext.configs = {};
    });

    return testContext;
});
