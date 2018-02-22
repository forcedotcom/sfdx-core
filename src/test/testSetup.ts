/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { randomBytes } from 'crypto';
import { sandbox as sinonSandbox } from 'sinon';
import { once } from 'lodash';
import { Logger } from '../lib/logger';
import { Messages } from '../lib/messages';
import { join as pathJoin } from 'path';
import { tmpdir as osTmpdir } from 'os';

export interface TestContext {
    SANDBOX: any;
    TEST_LOGGER: Logger;
    uniqid: () => string;
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

export const testSetup = once(() => {
    // Import all the messages files in the sfdx-core messages dir.
    Messages.importMessagesDirectory(pathJoin(__dirname, '..', '..'));

    // Create a global sinon sandbox and a test logger instance for use within tests.
    const testContext: TestContext = {
        SANDBOX: sinonSandbox.create(),
        TEST_LOGGER: new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging(),
        uniqid: () => _uniqid(),
        localPathRetriever: getTestLocalPath,
        globalPathRetriever: getTestGlobalPath,
        rootPathRetriever: retrieveRootPath
    };

    beforeEach(() => {
        // Most core files create a child logger so stub this to return our test logger.
        testContext.SANDBOX.stub(Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));
    });

    afterEach(() => {
        testContext.SANDBOX.restore();
    });

    return testContext;
});
