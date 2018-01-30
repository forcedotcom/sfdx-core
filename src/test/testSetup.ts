/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { randomBytes } from 'crypto';
import * as sinon from 'sinon';
import { once } from 'lodash';
import { Logger } from '../lib/logger';
import Messages from '../lib/messages';

export interface TestContext {
    SANDBOX: any;
    TEST_LOGGER: Logger;
    uniqid: () => string;
}

export const testSetup = once(() => {

    // Import all the messages files in the sfdx-core messages dir.
    Messages.importMessagesDirectory(__dirname);

    // Create a global sinon sandbox and a test logger instance for use within tests.
    const testContext: TestContext = {
        SANDBOX: sinon.sandbox.create(),
        TEST_LOGGER: new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging(),
        uniqid: () => randomBytes(16).toString('hex')
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
