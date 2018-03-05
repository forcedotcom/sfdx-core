/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { randomBytes } from 'crypto';
import { sandbox as sinonSandbox } from 'sinon';
import { forEach, isBoolean, once } from 'lodash';
import { Logger } from '../lib/logger';
import { Messages } from '../lib/messages';
import { Crypto } from '../lib/crypto';
import { ConfigFile } from '../lib/config/configFile';
import { join as pathJoin } from 'path';
import { tmpdir as osTmpdir } from 'os';
import { ConfigContents } from '../lib/config/configStore';

/**
 * Different parts of the system that are mocked out. They can be restored for
 * individual tests. Test's stubs should always go on the DEFAULT which is exposed
 * on the TestContext.
 */
export interface SandboxTypes {
    DEFAULT: any;
    CRYPTO: any;
    CONFIG: any;
}

export interface ConfigStub {
    readFn?: () => Promise<ConfigContents>;
    writeFn?: () => Promise<void>;
    // Used for read and write. Useful between config instances
    contents?: object;
    // Useful to override to conditionally get based on the config instance.
    retrieveContents?: () => Promise<object>;
    // Useful to override to conditionally set based on the config instance.
    updateContents?: () => Promise<object>;
}

/**
 * Different configuration options when running before each
 */
export interface TestContext {
    SANDBOX: any;
    SANDBOXES: SandboxTypes;
    TEST_LOGGER: Logger;
    id: string;
    uniqid: () => string;
    configStubs: { [configName: string]: ConfigStub };
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

/**
 * @module testSetup
 */
/**
 * Different hooks into {@link ConfigFile} used for testing instead of doing file IO.
 * @typedef {object} TestContext
 * @property {function} readFn A function `() => Promise<ConfigContents>;` that controls
 * all aspect of {@link ConfigFile.read}. For example, it won't set the contents unless
 * explicitly done. Only use this if you know what you are doing. Use retrieveContents
 * instead.
 * @property {function} writeFn A function `() => Promise<void>;` that controls all aspects
 * of {@link ConfigFile.write}. For example, it won't read the contents unless explicitly
 * done. Only use this if you know what you are doing. Use updateContents instead.
 * @property {object} contents The contents that are used when @{link ConfigFile.read} unless
 * retrieveContents is set. This will also contain the new config when @{link ConfigFile.write}
 * is called. This will persist through config instances, such as {@link Alias.update} and
 * {@link Alias.fetch}.
 * @property {function} retrieveContents A function `() => Promise<object>;` to conditionally
 * read based on the config instance. The `this` value will be the config instance.
 * @property {function} updateContents A function `() => Promise<object>;` to conditionally
 * set based on the config instance. The `this` value will be the config instance.
 */
/**
 * Different configuration options when running before each.
 * @typedef {object} TestContext
 * @property {sinon.sandbox} SANDBOX The default sandbox is cleared out before
 * each test run. See [sinon sandbox]{@link http://sinonjs.org/releases/v1.17.7/sandbox/}.
 * @property {SandboxTypes} SANDBOXES An object of different sandboxes. Used when
 * needing to restore parts of the system for customized testing.
 * @property {Logger} TEST_LOGGER The test logger that is used when {@link Logger.child}
 * is used anywhere. It uses memory logging.
 * @property {string} id A unique id for the test run.
 * @property {function} uniqid A function `() => string` that returns unique strings.
 * @property {object} configStubs An object of `[configName: string]: ConfigStub` used in test that interact with config files.
 * names to {@link ConfigStubs} that contain properties used when reading and writing
 * to config files.
 * @property {function} localPathRetriever A function `(uid: string) => Promise<string>;`
 * used when resolving the local path.
 * @property {function} globalPathRetriever A function `(uid: string) => Promise<string>;`
 * used when resolving the global path.
 * @property {function} rootPathRetriever: A function `(isGlobal: boolean, uid?: string) => Promise<string>;`
 * used then resolving paths. Calls localPathRetriever and globalPathRetriever.
 */

/**
 * Use to mock out different pieces of sfdx-core to make testing easier. This will mock out
 * logging to a file, config file reading and writing, local and global path resolution, and
 * *http request using connection (soon)*.
 * @function testSetup
 * @returns {TestContext}
 *
 * @example
 * // In a mocha tests
 * import testSetup from 'sfdx-core/dist/test/testSetup';
 *
 * const $$ = testSetup();
 *
 * describe(() => {
 *  it('test', () => {
 *    // Stub out your own method
 *    $$.SANDBOX.stub(MyClass.prototype, 'myMethod').returnsFake(() => {});
 *
 *    // Set the contents that is used when aliases are read. Same for all config files.
 *    $$.configStubs['Aliases'].content = { 'myTestAlias': 'user@company.com' };
 *
 *    // Will use the contents set above.
 *    const username = Aliases.fetch('myTestAlias');
 *    expect(username).to.equal('user@company.com');
 *  });
 * });
 */
export const testSetup = once(() => {
    // Import all the messages files in the sfdx-core messages dir.
    Messages.importMessagesDirectory(pathJoin(__dirname, '..', '..'));

    // Create a global sinon sandbox and a test logger instance for use within tests.
    const defaultSandbox = sinonSandbox.create();
    const testContext: TestContext = {
        SANDBOX: defaultSandbox,
        SANDBOXES: {
            DEFAULT: defaultSandbox,
            CONFIG: sinonSandbox.create(),
            CRYPTO: sinonSandbox.create()
        },
        TEST_LOGGER: new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging(),
        id: _uniqid(),
        uniqid: _uniqid,
        configStubs: {},
        localPathRetriever: getTestLocalPath,
        globalPathRetriever: getTestGlobalPath,
        rootPathRetriever: retrieveRootPath
    };

    beforeEach(() => {
        // Most core files create a child logger so stub this to return our test logger.
        testContext.SANDBOX.stub(Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));

        testContext.SANDBOXES.CONFIG.stub(ConfigFile, 'resolveRootFolder').callsFake((isGlobal) => testContext.rootPathRetriever(isGlobal, testContext.id));

        // Mock out all config file IO for all tests. They can restore individually if they need original functionality.
        testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'read').callsFake(async function() {
            const stub = testContext.configStubs[this.constructor.name] || {};

            if (stub.readFn) {
                return await stub.readFn.call(this);
            }

            let contents = stub.contents || {};
            if (stub.retrieveContents) {
                contents = await stub.retrieveContents.call(this);
            }

            this.setContentsFromObject(contents);
            return Promise.resolve(this.getContents());
        });
        testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'write').callsFake(async function(newContents) {
            if (!testContext.configStubs[this.constructor.name]) {
                testContext.configStubs[this.constructor.name] = {};
            }
            const stub =  testContext.configStubs[this.constructor.name];

            if (stub.writeFn) {
                return await stub.writeFn.call(this, newContents);
            }

            let contents = newContents || this.getContents();

            if (stub.updateContents) {
                contents = await stub.updateContents.call(this);
            }
            this.setContents(contents);
            testContext.configStubs[this.constructor.name].contents = this.toObject();
            return Promise.resolve();
        });

        testContext.SANDBOXES.CRYPTO.stub(Crypto.prototype, 'getKeyChain').callsFake(() => Promise.resolve({
            setPassword: () => Promise.resolve(),
            getPassword: (data, cb) => cb(undefined, '12345678901234567890123456789012')
        }));
    });

    afterEach(() => {
        testContext.SANDBOX.restore();
        forEach(testContext.SANDBOXES, (sandbox) => sandbox.restore());
        testContext.configStubs = {};
    });

    return testContext;
});
