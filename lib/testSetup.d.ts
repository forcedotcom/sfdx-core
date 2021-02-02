import * as sinonType from 'sinon';
import { AnyJson, JsonMap, Optional } from '@salesforce/ts-types';
import { EventEmitter } from 'events';
import { ConfigContents } from './config/configStore';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { CometClient, CometSubscription, StreamingExtension } from './status/streamingClient';
/**
 * Different parts of the system that are mocked out. They can be restored for
 * individual tests. Test's stubs should always go on the DEFAULT which is exposed
 * on the TestContext.
 */
export interface SandboxTypes {
  DEFAULT: any;
  CRYPTO: any;
  CONFIG: any;
  CONNECTION: any;
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
  writeFn?: (contents: AnyJson) => Promise<void>;
  /**
   * The contents that are used when @{link ConfigFile.read} unless retrieveContents is set. This will also contain the
   * new config when @{link ConfigFile.write} is called. This will persist through config instances,
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
   * A function used when resolving the local path.
   * @param uid Unique id.
   */
  localPathRetriever: (uid: string) => Promise<string>;
  /**
   * A function used when resolving the global path.
   * @param uid Unique id.
   */
  globalPathRetriever: (uid: string) => Promise<string>;
  /**
   * A function used for resolving paths. Calls localPathRetriever and globalPathRetriever.
   * @param isGlobal `true` if the config is global.
   * @param uid user id.
   */
  rootPathRetriever: (isGlobal: boolean, uid?: string) => Promise<string>;
  /**
   * Used to mock http request to Salesforce.
   * @param request An HttpRequest.
   * @param options Additional options.
   *
   * **See** {@link Connection.request}
   */
  fakeConnectionRequest: (request: AnyJson, options?: AnyJson) => Promise<AnyJson>;
  /**
   * Gets a config stub contents by name.
   * @param name The name of the config.
   * @param group If the config supports groups.
   */
  getConfigStubContents(name: string, group?: string): ConfigContents;
  /**
   * Sets a config stub contents by name
   * @param name The name of the config stub.
   * @param value The actual stub contents. The Mock data.
   */
  setConfigStubContents(name: string, value: ConfigContents): void;
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
export declare const instantiateContext: (sinon?: any) => TestContext;
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
export declare const stubContext: (testContext: TestContext) => void;
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
export declare const restoreContext: (testContext: TestContext) => void;
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
export declare const testSetup: (sinon?: any) => TestContext;
/**
 * A pre-canned error for try/catch testing.
 *
 * **See** {@link shouldThrow}
 */
export declare const unexpectedResult: SfdxError;
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
 * @param f The async function that is expected to throw.
 */
export declare function shouldThrow(f: Promise<unknown>): Promise<never>;
/**
 * A helper to determine if a subscription will use callback or errorback.
 * Enable errback to simulate a subscription failure.
 */
export declare enum StreamingMockSubscriptionCall {
  CALLBACK = 0,
  ERRORBACK = 1
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
export declare class StreamingMockCometSubscription extends EventEmitter implements CometSubscription {
  static SUBSCRIPTION_COMPLETE: string;
  static SUBSCRIPTION_FAILED: string;
  private options;
  constructor(options: StreamingMockCometSubscriptionOptions);
  /**
   * Sets up a streaming subscription callback to occur after the setTimeout event loop phase.
   * @param callback The function to invoke.
   */
  callback(callback: () => void): void;
  /**
   * Sets up a streaming subscription errback to occur after the setTimeout event loop phase.
   * @param callback The function to invoke.
   */
  errback(callback: (error: Error) => void): void;
}
/**
 * Simulates a comet client. To the core streaming client this mocks the internal comet impl.
 * The uses setTimeout(0ms) event loop phase just so the client can simulate actual streaming without the response
 * latency.
 */
export declare class StreamingMockCometClient extends CometClient {
  private readonly options;
  /**
   * Constructor
   * @param {StreamingMockCometSubscriptionOptions} options Extends the StreamingClient options.
   */
  constructor(options: StreamingMockCometSubscriptionOptions);
  /**
   * Fake addExtension. Does nothing.
   */
  addExtension(extension: StreamingExtension): void;
  /**
   * Fake disable. Does nothing.
   */
  disable(label: string): void;
  /**
   * Fake handshake that invoke callback after the setTimeout event phase.
   * @param callback The function to invoke.
   */
  handshake(callback: () => void): void;
  /**
   * Fake setHeader. Does nothing,
   */
  setHeader(name: string, value: string): void;
  /**
   * Fake subscription that completed after the setTimout event phase.
   * @param channel The streaming channel.
   * @param callback The function to invoke after the subscription completes.
   */
  subscribe(channel: string, callback: (message: JsonMap) => void): CometSubscription;
  /**
   * Fake disconnect. Does Nothing.
   */
  disconnect(): Promise<void>;
}
/**
 * Mock class for OrgData.
 */
export declare class MockTestOrgData {
  testId: string;
  alias?: string;
  username: string;
  devHubUsername?: string;
  orgId: string;
  loginUrl: string;
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  authcode: string;
  accessToken: string;
  refreshToken: string;
  userId: string;
  redirectUri: string;
  constructor(id?: string);
  createDevHubUsername(username: string): void;
  makeDevHub(): void;
  createUser(user: string): MockTestOrgData;
  getMockUserInfo(): JsonMap;
  getConfig(): Promise<ConfigContents>;
}
