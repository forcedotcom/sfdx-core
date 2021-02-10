/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import * as sinonType from 'sinon';

import { once, set } from '@salesforce/kit';
import { stubMethod } from '@salesforce/ts-sinon';
import {
  AnyFunction,
  AnyJson,
  Dictionary,
  ensureAnyJson,
  ensureJsonMap,
  ensureString,
  getBoolean,
  isJsonMap,
  JsonMap,
  Optional,
} from '@salesforce/ts-types';
import { ConfigAggregator } from './config/configAggregator';
import { ConfigFile } from './config/configFile';
import { ConfigContents } from './config/configStore';
import { Connection } from './connection';
import { Crypto } from './crypto';
import { Logger } from './logger';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { SfdxProject, SfdxProjectJson } from './sfdxProject';
import { CometClient, CometSubscription, StreamingExtension } from './status/streamingClient';

/**
 * Different parts of the system that are mocked out. They can be restored for
 * individual tests. Test's stubs should always go on the DEFAULT which is exposed
 * on the TestContext.
 */
export interface SandboxTypes {
  DEFAULT: sinon.SinonSandbox;
  CRYPTO: sinon.SinonSandbox;
  CONFIG: sinon.SinonSandbox;
  PROJECT: sinon.SinonSandbox;
  CONNECTION: sinon.SinonSandbox;
}

/**
 * Different hooks into {@link ConfigFile} used for testing instead of doing file IO.
 */
export interface ConfigStub {
  /**
   * readFn A function that controls all aspect of {@link ConfigFile.read}. For example, it won't set the contents
   * unless explicitly done. Only use this if you know what you are doing. Use retrieveContents
   * instead.
   */
  readFn?: () => Promise<ConfigContents>;
  /**
   * A function that controls all aspects of {@link ConfigFile.write}. For example, it won't read the contents unless
   * explicitly done. Only use this if you know what you are doing. Use updateContents instead.
   */
  writeFn?: (contents?: AnyJson) => Promise<void>;
  /**
   * The contents that are used with @{link ConfigFile.readSync} and @{link ConfigFile.read}. If retrieveContents is set,
   * it will use that instead of @{link ConfigFile.read} but NOT @{link ConfigFile.readSync}. This will also contain the
   * new config when @{link ConfigFile.write} or @{link ConfigFile.writeSync} is called. This will persist through config instances,
   * such as {@link Alias.update} and {@link Alias.fetch}.
   */
  contents?: ConfigContents;
  /**
   * A function to conditionally read based on the config instance. The `this` value will be the config instance.
   */
  retrieveContents?: () => Promise<JsonMap>;
  /**
   * A function to conditionally set based on the config instance. The `this` value will be the config instance.
   */
  updateContents?: () => Promise<JsonMap>;
}

/**
 * Different configuration options when running before each
 */
export interface TestContext {
  /**
   * The default sandbox is cleared out before each test run.
   *
   * **See** [sinon sandbox]{@link http://sinonjs.org/releases/v1.17.7/sandbox/}.
   */
  SANDBOX: sinonType.SinonSandbox;
  /**
   * An object of different sandboxes. Used when
   * needing to restore parts of the system for customized testing.
   */
  SANDBOXES: SandboxTypes;
  /**
   * The test logger that is used when {@link Logger.child} is used anywhere. It uses memory logging.
   */
  TEST_LOGGER: Logger;
  /**
   * id A unique id for the test run.
   */
  id: string;
  /**
   * A function that returns unique strings.
   */
  uniqid: () => string;
  /**
   * An object used in tests that interact with config files.
   */
  configStubs: {
    [configName: string]: Optional<ConfigStub>;
    AuthInfoConfig?: ConfigStub;
    Aliases?: ConfigStub;
    SfdxProjectJson?: ConfigStub;
    SfdxConfig?: ConfigStub;
  };
  /**
   * A function used when resolving the local path. Calls localPathResolverSync by default.
   *
   * @param uid Unique id.
   */
  localPathRetriever: (uid: string) => Promise<string>;
  /**
   * A function used when resolving the local path.
   *
   * @param uid Unique id.
   */
  localPathRetrieverSync: (uid: string) => string;
  /**
   * A function used when resolving the global path. Calls globalPathResolverSync by default.
   *
   * @param uid Unique id.
   */
  globalPathRetriever: (uid: string) => Promise<string>;
  /**
   * A function used when resolving the global path.
   *
   * @param uid Unique id.
   */
  globalPathRetrieverSync: (uid: string) => string;
  /**
   * A function used for resolving paths. Calls localPathRetriever and globalPathRetriever.
   *
   * @param isGlobal `true` if the config is global.
   * @param uid user id.
   */
  rootPathRetriever: (isGlobal: boolean, uid?: string) => Promise<string>;
  /**
   * A function used for resolving paths. Calls localPathRetrieverSync and globalPathRetrieverSync.
   *
   * @param isGlobal `true` if the config is global.
   * @param uid user id.
   */
  rootPathRetrieverSync: (isGlobal: boolean, uid?: string) => string;
  /**
   * Used to mock http request to Salesforce.
   *
   * @param request An HttpRequest.
   * @param options Additional options.
   *
   * **See** {@link Connection.request}
   */
  fakeConnectionRequest: (request: AnyJson, options?: AnyJson) => Promise<AnyJson>;
  /**
   * Gets a config stub contents by name.
   *
   * @param name The name of the config.
   * @param group If the config supports groups.
   */
  getConfigStubContents(name: string, group?: string): ConfigContents;
  /**
   * Sets a config stub contents by name
   *
   * @param name The name of the config stub.
   * @param value The actual stub contents. The Mock data.
   */
  setConfigStubContents(name: string, value: ConfigContents): void;
  inProject(inProject: boolean): void;
}

const uniqid = (): string => {
  return randomBytes(16).toString('hex');
};

function getTestLocalPath(uid: string): string {
  return pathJoin(osTmpdir(), uid, 'sfdx_core', 'local');
}

function getTestGlobalPath(uid: string): string {
  return pathJoin(osTmpdir(), uid, 'sfdx_core', 'global');
}

function retrieveRootPathSync(isGlobal: boolean, uid: string = uniqid()): string {
  return isGlobal ? getTestGlobalPath(uid) : getTestLocalPath(uid);
}

// eslint-disable-next-line @typescript-eslint/require-await
async function retrieveRootPath(isGlobal: boolean, uid: string = uniqid()): Promise<string> {
  return retrieveRootPathSync(isGlobal, uid);
}

function defaultFakeConnectionRequest(): Promise<AnyJson> {
  return Promise.resolve(ensureAnyJson({ records: [] }));
}

/**
 * Instantiate a @salesforce/core test context. This is automatically created by `const $$ = testSetup()`
 * but is useful if you don't want to have a global stub of @salesforce/core and you want to isolate it to
 * a single describe.
 *
 * **Note:** Call `stubContext` in your beforeEach to have clean stubs of @salesforce/core every test run.
 *
 * @example
 * ```
 * const $$ = instantiateContext();
 *
 * beforeEach(() => {
 *   stubContext($$);
 * });
 *
 * afterEach(() => {
 *   restoreContext($$);
 * });
 * ```
 * @param sinon
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const instantiateContext = (sinon?: any) => {
  if (!sinon) {
    try {
      sinon = require('sinon');
    } catch (e) {
      throw new Error(
        'The package sinon was not found. Add it to your package.json and pass it in to testSetup(sinon.sandbox)'
      );
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
      PROJECT: sinon.createSandbox(),
      CRYPTO: sinon.createSandbox(),
      CONNECTION: sinon.createSandbox(),
    },
    TEST_LOGGER: new Logger({
      name: 'SFDX_Core_Test_Logger',
    }).useMemoryLogging(),
    id: uniqid(),
    uniqid,
    configStubs: {},
    // eslint-disable-next-line @typescript-eslint/require-await
    localPathRetriever: async (uid: string) => getTestLocalPath(uid),
    localPathRetrieverSync: getTestLocalPath,
    // eslint-disable-next-line @typescript-eslint/require-await
    globalPathRetriever: async (uid: string) => getTestGlobalPath(uid),
    globalPathRetrieverSync: getTestGlobalPath,
    rootPathRetriever: retrieveRootPath,
    rootPathRetrieverSync: retrieveRootPathSync,
    fakeConnectionRequest: defaultFakeConnectionRequest,
    getConfigStubContents(name: string, group?: string): ConfigContents {
      const stub: Optional<ConfigStub> = this.configStubs[name];
      if (stub && stub.contents) {
        if (group && stub.contents[group]) {
          return ensureJsonMap(stub.contents[group]);
        } else {
          return stub.contents;
        }
      }
      return {};
    },

    setConfigStubContents(name: string, value: ConfigContents) {
      if (ensureString(name) && isJsonMap(value)) {
        this.configStubs[name] = value;
      }
    },
    inProject(inProject = true) {
      testContext.SANDBOXES.PROJECT.restore();
      if (inProject) {
        testContext.SANDBOXES.PROJECT.stub(SfdxProject, 'resolveProjectPath').callsFake(() =>
          testContext.localPathRetriever(testContext.id)
        );
        testContext.SANDBOXES.PROJECT.stub(SfdxProject, 'resolveProjectPathSync').callsFake(() =>
          testContext.localPathRetrieverSync(testContext.id)
        );
      } else {
        testContext.SANDBOXES.PROJECT.stub(SfdxProject, 'resolveProjectPath').rejects(
          new SfdxError('InvalidProjectWorkspace')
        );
        testContext.SANDBOXES.PROJECT.stub(SfdxProject, 'resolveProjectPathSync').throws(
          new SfdxError('InvalidProjectWorkspace')
        );
      }
    },
  };
  return testContext;
};

/**
 * Stub a @salesforce/core test context. This will mock out logging to a file, config file reading and writing,
 * local and global path resolution, and http request using connection (soon)*.
 *
 * This is automatically stubbed in the global beforeEach created by
 * `const $$ = testSetup()` but is useful if you don't want to have a global stub of @salesforce/core and you
 * want to isolate it to a single describe.
 *
 * **Note:** Always call `restoreContext` in your afterEach.
 *
 * @example
 * ```
 * const $$ = instantiateContext();
 *
 * beforeEach(() => {
 *   stubContext($$);
 * });
 *
 * afterEach(() => {
 *   restoreContext($$);
 * });
 * ```
 * @param testContext
 */
export const stubContext = (testContext: TestContext) => {
  // Most core files create a child logger so stub this to return our test logger.
  stubMethod(testContext.SANDBOX, Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));
  stubMethod(testContext.SANDBOX, Logger, 'childFromRoot').returns(testContext.TEST_LOGGER);
  testContext.inProject(true);
  testContext.SANDBOXES.CONFIG.stub(ConfigFile, 'resolveRootFolder').callsFake((isGlobal: boolean) =>
    testContext.rootPathRetriever(isGlobal, testContext.id)
  );
  testContext.SANDBOXES.CONFIG.stub(ConfigFile, 'resolveRootFolderSync').callsFake((isGlobal: boolean) =>
    testContext.rootPathRetrieverSync(isGlobal, testContext.id)
  );

  stubMethod(testContext.SANDBOXES.PROJECT, SfdxProjectJson.prototype, 'doesPackageExist').callsFake(() => true);

  const initStubForRead = (configFile: ConfigFile<ConfigFile.Options>): ConfigStub => {
    const stub: ConfigStub = testContext.configStubs[configFile.constructor.name] || {};
    // init calls read calls getPath which sets the path on the config file the first time.
    // Since read is now stubbed, make sure to call getPath to initialize it.
    configFile.getPath();

    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore set this to true to avoid an infinite loop in tests when reading config files.
    configFile.hasRead = true;
    return stub;
  };

  const readSync = function (this: ConfigFile<ConfigFile.Options>, newContents?: JsonMap): JsonMap {
    const stub = initStubForRead(this);
    this.setContentsFromObject(newContents || stub.contents || {});
    return this.getContents();
  };

  const read = async function (this: ConfigFile<ConfigFile.Options>): Promise<JsonMap> {
    const stub = initStubForRead(this);

    if (stub.readFn) {
      return await stub.readFn.call(this);
    }

    if (stub.retrieveContents) {
      return readSync.call(this, await stub.retrieveContents.call(this));
    } else {
      return readSync.call(this);
    }
  };

  // Mock out all config file IO for all tests. They can restore individually if they need original functionality.
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'readSync').callsFake(readSync);
  testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'read').callsFake(read);

  const writeSync = function (this: ConfigFile<ConfigFile.Options>, newContents?: ConfigContents): void {
    if (!testContext.configStubs[this.constructor.name]) {
      testContext.configStubs[this.constructor.name] = {};
    }
    const stub = testContext.configStubs[this.constructor.name];
    if (!stub) return;

    this.setContents(newContents || this.getContents());
    stub.contents = this.toObject();
  };

  const write = async function (this: ConfigFile<ConfigFile.Options>, newContents?: ConfigContents): Promise<void> {
    if (!testContext.configStubs[this.constructor.name]) {
      testContext.configStubs[this.constructor.name] = {};
    }
    const stub = testContext.configStubs[this.constructor.name];
    if (!stub) return;

    if (stub.writeFn) {
      return await stub.writeFn.call(this, newContents);
    }

    if (stub.updateContents) {
      writeSync.call(this, await stub.updateContents.call(this));
    } else {
      writeSync.call(this);
    }
  };

  stubMethod(testContext.SANDBOXES.CONFIG, ConfigFile.prototype, 'writeSync').callsFake(writeSync);

  stubMethod(testContext.SANDBOXES.CONFIG, ConfigFile.prototype, 'write').callsFake(write);

  stubMethod(testContext.SANDBOXES.CRYPTO, Crypto.prototype, 'getKeyChain').callsFake(() =>
    Promise.resolve({
      setPassword: () => Promise.resolve(),
      getPassword: (data: object, cb: AnyFunction) => cb(undefined, '12345678901234567890123456789012'),
    })
  );

  stubMethod(testContext.SANDBOXES.CONNECTION, Connection.prototype, 'isResolvable').resolves(true);

  stubMethod(testContext.SANDBOXES.CONNECTION, Connection.prototype, 'request').callsFake(function (
    this: Connection,
    request: string,
    options?: Dictionary
  ) {
    if (request === `${this.instanceUrl}/services/data`) {
      return Promise.resolve([{ version: '42.0' }]);
    }
    return testContext.fakeConnectionRequest.call(this, request, options as AnyJson);
  });

  // Always start with the default and tests beforeEach or it methods can override it.
  testContext.fakeConnectionRequest = defaultFakeConnectionRequest;
};

/**
 * Restore a @salesforce/core test context. This is automatically stubbed in the global beforeEach created by
 * `const $$ = testSetup()` but is useful if you don't want to have a global stub of @salesforce/core and you
 * want to isolate it to a single describe.
 *
 * @example
 * ```
 * const $$ = instantiateContext();
 *
 * beforeEach(() => {
 *   stubContext($$);
 * });
 *
 * afterEach(() => {
 *   restoreContext($$);
 * });
 * ```
 * @param testContext
 */
export const restoreContext = (testContext: TestContext) => {
  testContext.SANDBOX.restore();
  Object.values(testContext.SANDBOXES).forEach((theSandbox) => theSandbox.restore());
  testContext.configStubs = {};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _testSetup = (sinon?: any) => {
  const testContext = instantiateContext(sinon);

  beforeEach(() => {
    // Allow each test to have their own config aggregator
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore clear for testing.
    delete ConfigAggregator.instance;

    stubContext(testContext);
  });

  afterEach(() => {
    restoreContext(testContext);
  });

  return testContext;
};

/**
 * Use to mock out different pieces of sfdx-core to make testing easier. This will mock out
 * logging to a file, config file reading and writing, local and global path resolution, and
 * *http request using connection (soon)*.
 *
 * **Note:** The testSetup should be outside of the describe. If you need to stub per test, use
 * `instantiateContext`, `stubContext`, and `restoreContext`.
 * ```
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
 * ```
 */
export const testSetup = once(_testSetup);

/**
 * A pre-canned error for try/catch testing.
 *
 * **See** {@link shouldThrow}
 */
export const unexpectedResult: SfdxError = new SfdxError('This code was expected to fail', 'UnexpectedResult');

/**
 * Use for this testing pattern:
 * ```
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
 * ```
 *
 * @param f The async function that is expected to throw.
 */
export async function shouldThrow(f: Promise<unknown>): Promise<never> {
  await f;
  throw unexpectedResult;
}

/**
 * A helper to determine if a subscription will use callback or errorback.
 * Enable errback to simulate a subscription failure.
 */
export enum StreamingMockSubscriptionCall {
  CALLBACK,
  ERRORBACK,
}

/**
 * Additional subscription options for the StreamingMock.
 */
export interface StreamingMockCometSubscriptionOptions {
  /**
   * Target URL.
   */
  url: string;
  /**
   * Simple id to associate with this instance.
   */
  id: string;
  /**
   * What is the subscription outcome a successful callback or an error?.
   */
  subscriptionCall: StreamingMockSubscriptionCall;
  /**
   * If it's an error that states what that error should be.
   */
  subscriptionErrbackError?: SfdxError;
  /**
   * A list of messages to playback for the client. One message per process tick.
   */
  messagePlaylist?: JsonMap[];
}

/**
 * Simulates a comet subscription to a streaming channel.
 */
export class StreamingMockCometSubscription extends EventEmitter implements CometSubscription {
  public static SUBSCRIPTION_COMPLETE = 'subscriptionComplete';
  public static SUBSCRIPTION_FAILED = 'subscriptionFailed';
  private options: StreamingMockCometSubscriptionOptions;

  public constructor(options: StreamingMockCometSubscriptionOptions) {
    super();
    this.options = options;
  }

  /**
   * Sets up a streaming subscription callback to occur after the setTimeout event loop phase.
   *
   * @param callback The function to invoke.
   */
  public callback(callback: () => void): void {
    if (this.options.subscriptionCall === StreamingMockSubscriptionCall.CALLBACK) {
      setTimeout(() => {
        callback();
        super.emit(StreamingMockCometSubscription.SUBSCRIPTION_COMPLETE);
      }, 0);
    }
  }

  /**
   * Sets up a streaming subscription errback to occur after the setTimeout event loop phase.
   *
   * @param callback The function to invoke.
   */
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
   *
   * @param {StreamingMockCometSubscriptionOptions} options Extends the StreamingClient options.
   */
  public constructor(options: StreamingMockCometSubscriptionOptions) {
    super();
    this.options = options;
    if (!this.options.messagePlaylist) {
      this.options.messagePlaylist = [{ id: this.options.id }];
    }
  }

  /**
   * Fake addExtension. Does nothing.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  public addExtension(extension: StreamingExtension): void {}

  /**
   * Fake disable. Does nothing.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  public disable(label: string): void {}

  /**
   * Fake handshake that invoke callback after the setTimeout event phase.
   *
   * @param callback The function to invoke.
   */
  public handshake(callback: () => void): void {
    setTimeout(() => {
      callback();
    }, 0);
  }

  /**
   * Fake setHeader. Does nothing,
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
  public setHeader(name: string, value: string): void {}

  /**
   * Fake subscription that completed after the setTimout event phase.
   *
   * @param channel The streaming channel.
   * @param callback The function to invoke after the subscription completes.
   */
  public subscribe(channel: string, callback: (message: JsonMap) => void): CometSubscription {
    const subscription: StreamingMockCometSubscription = new StreamingMockCometSubscription(this.options);
    subscription.on('subscriptionComplete', () => {
      if (!this.options.messagePlaylist) return;
      Object.values(this.options.messagePlaylist).forEach((message) => {
        setTimeout(() => {
          callback(message);
        }, 0);
      });
    });
    return subscription;
  }

  /**
   * Fake disconnect. Does Nothing.
   */
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
  public redirectUri: string;

  public constructor(id: string = uniqid()) {
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
    this.refreshToken = `${this.testId}/refreshToken`;
    this.redirectUri = `http://${this.testId}/localhost:1717/OauthRedirect`;
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
    userMock.redirectUri = this.redirectUri;
    return userMock;
  }

  public getMockUserInfo(): JsonMap {
    return {
      Id: this.userId,
      Username: this.username,
      LastName: `user_lastname_${this.testId}`,
      Alias: this.alias || 'user_alias_blah',
      TimeZoneSidKey: `user_timezonesidkey_${this.testId}`,
      LocaleSidKey: `user_localesidkey_${this.testId}`,
      EmailEncodingKey: `user_emailencodingkey_${this.testId}`,
      ProfileId: `user_profileid_${this.testId}`,
      LanguageLocaleKey: `user_languagelocalekey_${this.testId}`,
      Email: `user_email@${this.testId}.com`,
    };
  }

  public async getConfig(): Promise<ConfigContents> {
    const crypto = await Crypto.create();
    const config: JsonMap = {};
    config.orgId = this.orgId;

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

    const isDevHub = getBoolean(this, 'isDevHub');
    if (isDevHub) {
      config.isDevHub = isDevHub;
    }

    return config;
  }
}
