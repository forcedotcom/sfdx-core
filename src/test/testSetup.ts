/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { once } from 'lodash';
import { Logger } from '../lib/logger';

export interface TestContext {
    SANDBOX: any;
    TEST_LOGGER: Logger;
}

export const testSetup = once(() => {
    const testContext: TestContext = {
        SANDBOX: sinon.sandbox.create(),
        TEST_LOGGER: new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging()
    };

    beforeEach(() => {
        testContext.SANDBOX.stub(Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));
    });

    afterEach(() => {
        testContext.SANDBOX.restore();
    });

    return testContext;
});
