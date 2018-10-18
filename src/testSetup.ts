/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { get, once, set } from '@salesforce/kit';
import {
    AnyFunction,
    AnyJson,
    Dictionary, ensureJsonMap,
    ensureString, isJsonMap,
    JsonMap,
    Optional
} from '@salesforce/ts-types';
import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import { ConfigFile } from './config/configFile';
import { ConfigContents, ConfigValue } from './config/configStore';
import { Connection } from './connection';
import { Crypto } from './crypto';
import { Logger } from './logger';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { CometClient, CometSubscription } from './status/streamingClient';

/**
 * Different parts of the system that are mocked out. They can be restored for
 * individual tests. Test's stubs should always go on the DEFAULT which is exposed
 * on the TestContext.
 */
export interface SandboxTypes {
    DEFAULT: any; // tslint:disable-line:no-any
    CRYPTO: any; // tslint:disable-line:no-any
    CONFIG: any; // tslint:disable-line:no-any
    CONNECTION: any; // tslint:disable-line:no-any
}

export interface ConfigStub {
    readFn?: () => Promise<ConfigContents>;
    writeFn?: () => Promise<void>;
    // Used for read and write. Useful between config instances
    contents?: ConfigContents;
    // Useful to override to conditionally get based on the config instance.
    retrieveContents?: () => Promise<JsonMap>;
    // Useful to override to conditionally set based on the config instance.
    updateContents?: () => Promise<JsonMap>;
}

/**
 * Different configuration options when running before each
 */
export interface TestContext {
    SANDBOX: any; // tslint:disable-line:no-any
    SANDBOXES: SandboxTypes;
    TEST_LOGGER: Logger;
    id: string;
    uniqid: () => string;
    configStubs: {
        [configName: string]: Optional<ConfigStub>,
        AuthInfoConfig?: ConfigStub,
        Aliases?: ConfigStub,
        SfdxProjectJson?: ConfigStub,
        SfdxConfig?: ConfigStub
    };
    localPathRetriever: (uid: string) => Promise<string>;
    globalPathRetriever: (uid: string) => Promise<string>;
    rootPathRetriever: (isGlobal: boolean, uid?: string) => Promise<string>;
    fakeConnectionRequest: (request: AnyJson, options?: AnyJson) => Promise<AnyJson>;
    getConfigStubContents(name: string, group: string): ConfigContents;
    setConfigStubContents(name: string, value: ConfigContents): void;
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

function defaultFakeConnectionRequest(request: AnyJson, options?: AnyJson): Promise<AnyJson> {
    return Promise.resolve({ records: [] });
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
 * import testSetup from '@salesforce/core/lib/testSetup';
 *
 * const $$ = testSetup();
 *
 * describe(() => {
 *  it('test', () => {
 *    // Stub out your own method
 *    $$.SANDBOX.stub(MyClass.prototype, 'myMethod').returnsFake(() => {});
 *
 *    // Set the contents that is used when aliases are read. Same for all config files.
 *    $$.configStubs.Aliases = { contents: { 'myTestAlias': 'user@company.com' } };
 *
 *    // Will use the contents set above.
 *    const username = Aliases.fetch('myTestAlias');
 *    expect(username).to.equal('user@company.com');
 *  });
 * });
 */
export const testSetup = once((sinon?) => {
    if (!sinon) {
        try {
            sinon = require('sinon');
        } catch (e) {
            throw new Error('The package sinon was not found. Add it to your package.json and pass it in to testSetup(sinon.sandbox)');
        }
    }

    // Import all the messages files in the sfdx-core messages dir.
    // Messages.importMessagesDirectory(pathJoin(__dirname, '..', '..'));
    Messages.importMessagesDirectory(pathJoin(__dirname));
    // Create a global sinon sandbox and a test logger instance for use within tests.
    const defaultSandbox = sinon.createSandbox();
    const testContext: TestContext = {
        SANDBOX: defaultSandbox,
        SANDBOXES: {
            DEFAULT: defaultSandbox,
            CONFIG: sinon.createSandbox(),
            CRYPTO: sinon.createSandbox(),
            CONNECTION: sinon.createSandbox()
        },
        TEST_LOGGER: new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging(),
        id: _uniqid(),
        uniqid: _uniqid,
        configStubs: {},
        localPathRetriever: getTestLocalPath,
        globalPathRetriever: getTestGlobalPath,
        rootPathRetriever: retrieveRootPath,
        fakeConnectionRequest: defaultFakeConnectionRequest,
        getConfigStubContents(name: string, group: Optional<string>): ConfigContents {
            const _group = group || 'default';
            const stub: Optional<ConfigStub> = this.configStubs[name];
            if (stub && stub.contents && stub.contents[_group]) {
                return ensureJsonMap(stub.contents[_group]);
            }
            return {};
        },

        setConfigStubContents(name: string, value: ConfigContents) {
            if (ensureString(name) && isJsonMap(value)) {
                const configStub: Optional<ConfigStub> = this.configStubs[name] || {};

                const valueContents = new Map<string, ConfigValue>(Object.entries(value.contents || {}));
                Array.from(valueContents.entries()).forEach(([groupKey, groupContents]) => {
                    if (groupContents) {

                        if (!get(configStub, `contents.${groupKey}`)) {
                            set(configStub || {}, `contents.${groupKey}`, {});
                        }

                        const group: ConfigContents = get(configStub, `contents.${groupKey}`) as ConfigContents;
                        Object.entries(groupContents).forEach(([contentKey, contentValue]) => {
                            if (groupContents) {
                                set(group, contentKey, contentValue);
                            }
                        });
                    }
                });

                this.configStubs[name] = configStub;
            }
        }
    };

    beforeEach(() => {
        // Most core files create a child logger so stub this to return our test logger.
        testContext.SANDBOX.stub(Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));

        testContext.SANDBOXES.CONFIG.stub(ConfigFile, 'resolveRootFolder').callsFake((isGlobal: boolean) => testContext.rootPathRetriever(isGlobal, testContext.id));

        // Mock out all config file IO for all tests. They can restore individually if they need original functionality.
        testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'read').callsFake(async function(this: ConfigFile) {
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
        testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'write').callsFake(async function(this: ConfigFile, newContents: ConfigContents) {
            if (!testContext.configStubs[this.constructor.name]) {
                testContext.configStubs[this.constructor.name] = {};
            }
            const stub = testContext.configStubs[this.constructor.name];
            if (!stub) return;

            if (stub.writeFn) {
                return await stub.writeFn.call(this, newContents);
            }

            let contents = newContents || this.getContents();

            if (stub.updateContents) {
                contents = await stub.updateContents.call(this);
            }
            this.setContents(contents);
            stub.contents = this.toObject();
        });

        testContext.SANDBOXES.CRYPTO.stub(Crypto.prototype, 'getKeyChain').callsFake(() => Promise.resolve({
            setPassword: () => Promise.resolve(),
            getPassword: (data: object, cb: AnyFunction) => cb(undefined, '12345678901234567890123456789012')
        }));

        testContext.SANDBOXES.CONNECTION.stub(Connection.prototype, 'request').callsFake(function(this: Connection, request: string, options?: Dictionary) {
            if (request === `${this.instanceUrl}/services/data`) {
                return Promise.resolve([{ version: '42.0' }]);
            }
            return testContext.fakeConnectionRequest.call(this, request, options);
        });
    });

    afterEach(() => {
        testContext.SANDBOX.restore();
        Object.values(testContext.SANDBOXES).forEach(theSandbox => theSandbox.restore());
        testContext.configStubs = {};
    });

    return testContext;
});

/**
 * A pre-canned error for try/catch testing.
 * @see shouldThrow
 * @type {SfdxError}
 */
export const unexpectedResult: SfdxError = new SfdxError('This code was expected to failed',
    'UnexpectedResult');

/**
 * Use for this testing pattern:
 *
 *  try {
 *      await call()
 *      assert.fail('this should never happen');
 *  } catch (e) {
 *  ...
 *  }
 *
 *  Just do this
 *
 *  try {
 *      await shouldThrow(call()); // If this succeeds unexpectedResultError is thrown.
 *  } catch(e) {
 *  ...
 *  }
 *
 * @param {Promise<AnyJson>} f The async function that is expected to throw.
 * @returns {Promise<void>}
 */
export async function shouldThrow(f: Promise<any>): Promise<never> {// tslint:disable-line:no-any
    await f;
    throw unexpectedResult;
}

/**
 * A helper to determine if a subscription will use callback or errorback.
 * Enable errback to simulate a subscription failure.
 */
export enum StreamingMockSubscriptionCall {
    CALLBACK,
    ERRORBACK
}

/**
 * Additional subscription options for the StreamingMock.
 */
export interface StreamingMockCometSubscriptionOptions {
    // Target URL
    url: string;
    // Simple id to associate with this instance.
    id: string;
    // What is the subscription outcome a successful callback or an error?
    subscriptionCall: StreamingMockSubscriptionCall;
    // If it's an error that states what that error should be.
    subscriptionErrbackError?: SfdxError;
    // A list of messages to playback for the client. One message per process tick.
    messagePlaylist?: JsonMap[];
}

/**
 * Simulates a comet subscription to a streaming channel.
 */
export class StreamingMockCometSubscription extends EventEmitter implements CometSubscription {
    public static SUBSCRIPTION_COMPLETE: string = 'subscriptionComplete';
    public static SUBSCRIPTION_FAILED: string = 'subscriptionFailed';
    private options: StreamingMockCometSubscriptionOptions;

    constructor(options: StreamingMockCometSubscriptionOptions) {
        super();
        this.options = options;
    }

    public callback(callback: () => void): void {
        if (this.options.subscriptionCall === StreamingMockSubscriptionCall.CALLBACK) {
            setTimeout(() => {
                callback();
                super.emit(StreamingMockCometSubscription.SUBSCRIPTION_COMPLETE);
            }, 0);
        }
    }

    public errback(callback: (error: Error) => void): void {
        if (this.options.subscriptionCall === StreamingMockSubscriptionCall.ERRORBACK) {
            const error = this.options.subscriptionErrbackError;
            if (!error) return;
            setTimeout(() => {
                callback(error);
                super.emit(StreamingMockCometSubscription.SUBSCRIPTION_FAILED);
            }, 0);
        }
    }
}

/**
 * Simulates a comet client. To the core streaming client this mocks the internal comet impl.
 * The uses setTimeout(0ms) event loop phase just so the client can simulate actual streaming without the response
 * latency.
 */
export class StreamingMockCometClient extends CometClient {
    private readonly options: StreamingMockCometSubscriptionOptions;

    /**
     * Constructor
     * @param {StreamingMockCometSubscriptionOptions} options Extends the StreamingClient options.
     */
    constructor(options: StreamingMockCometSubscriptionOptions) {
        super();
        this.options = options;
        if (!this.options.messagePlaylist) {
            this.options.messagePlaylist = [{ id:  this.options.id }];
        }
    }

    public addExtension(extension: JsonMap): void {}

    public disable(label: string): void {}

    public handshake(callback: () => void): void {
        setTimeout(() => { callback(); }, 0);
    }

    public setHeader(name: string, value: string): void {}

    public subscribe(channel: string, callback: (message: JsonMap) => void): CometSubscription {
        const subscription: StreamingMockCometSubscription = new StreamingMockCometSubscription(this.options);
        subscription.on('subscriptionComplete', () => {
            if (!this.options.messagePlaylist) return;
            Object.values(this.options.messagePlaylist).forEach(message => {
                setTimeout(() => {
                    callback(message);
                }, 0);
            });
        });
        return subscription;
    }

    public disconnect(): Promise<void> {
        return Promise.resolve();
    }
}

/**
 * Mock class for OrgData.
 */
export class MockTestOrgData {
    public testId: string;
    public alias?: string;
    public username: string;
    public devHubUsername?: string;
    public orgId: string;
    public loginUrl: string;
    public instanceUrl: string;
    public clientId: string;
    public clientSecret: string;
    public authcode: string;
    public accessToken: string;
    public refreshToken: string;
    public userId: string;

    constructor(id: string = _uniqid()) {
        this.testId = id;
        this.userId = `user_id_${this.testId}`;
        this.orgId = `${this.testId}`;
        this.username = `admin_${this.testId}@gb.org`;
        this.loginUrl = `http://login.${this.testId}.salesforce.com`;
        this.instanceUrl = `http://instance.${this.testId}.salesforce.com`;
        this.clientId = `${this.testId}/client_id`;
        this.clientSecret = `${this.testId}/client_secret`;
        this.authcode = `${this.testId}/authcode`;
        this.accessToken = `${this.testId}/accessToken`;
        this.refreshToken =  `${this.testId}/refreshToken`;
    }

    public createDevHubUsername(username: string): void {
        this.devHubUsername = username;
    }

    public makeDevHub(): void {
        set(this, 'isDevHub', true);
    }

    public createUser(user: string): MockTestOrgData {
        const userMock = new MockTestOrgData();
        userMock.username = user;
        userMock.alias = this.alias;
        userMock.devHubUsername = this.devHubUsername;
        userMock.orgId = this.orgId;
        userMock.loginUrl = this.loginUrl;
        userMock.instanceUrl = this.instanceUrl;
        userMock.clientId = this.clientId;
        userMock.clientSecret = this.clientSecret;
        return userMock;
    }

    public getMockUserInfo(): JsonMap {
        return {
            Id: this.userId,
            Username: this.username,
            LastName: `user_lastname_${this.testId}`,
            Alias: this.alias,
            TimeZoneSidKey: `user_timezonesidkey_${this.testId}`,
            LocaleSidKey: `user_localesidkey_${this.testId}`,
            EmailEncodingKey: `user_emailencodingkey_${this.testId}`,
            ProfileId: `user_profileid_${this.testId}`,
            LanguageLocaleKey: `user_languagelocalekey_${this.testId}`,
            Email: `user_email@${this.testId}.com`
        };
    }

    public async getConfig(): Promise<ConfigContents> {
        const crypto = await Crypto.create();
        const config: Dictionary<AnyJson> = {};
        config.orgId  = this.orgId;

        const accessToken = crypto.encrypt(this.accessToken);
        if (accessToken) {
            config.accessToken = accessToken;
        }

        const refreshToken = crypto.encrypt(this.refreshToken);
        if (refreshToken) {
            config.refreshToken = refreshToken;
        }

        config.instanceUrl = this.instanceUrl;
        config.loginUrl = this.loginUrl;
        config.username = this.username;
        config.createdOrgInstance = 'CS1';
        config.created = '1519163543003';
        config.userId = this.userId;
        // config.devHubUsername = 'tn@su-blitz.org';

        if (this.devHubUsername) {
            config.devHubUsername = this.devHubUsername;
        }

        const isDevHub = get(this, 'isDevHub');
        if (isDevHub) {
            config.isDevHub = isDevHub;
        }

        return config;
    }
}
