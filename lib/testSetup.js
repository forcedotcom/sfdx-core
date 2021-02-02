/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { once, set } from '@salesforce/kit';
import { stubMethod } from '@salesforce/ts-sinon';
import { ensureAnyJson, ensureJsonMap, ensureString, getBoolean, isJsonMap } from '@salesforce/ts-types';
import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import { ConfigFile } from './config/configFile';
import { Connection } from './connection';
import { Crypto } from './crypto';
import { Logger } from './logger';
import { Messages } from './messages';
import { SfdxError } from './sfdxError';
import { CometClient } from './status/streamingClient';
const _uniqid = () => {
  return randomBytes(16).toString('hex');
};
function getTestLocalPath(uid) {
  return Promise.resolve(pathJoin(osTmpdir(), uid, 'sfdx_core', 'local'));
}
function getTestGlobalPath(uid) {
  return Promise.resolve(pathJoin(osTmpdir(), uid, 'sfdx_core', 'global'));
}
async function retrieveRootPath(isGlobal, uid = _uniqid()) {
  return isGlobal ? await getTestGlobalPath(uid) : await getTestLocalPath(uid);
}
function defaultFakeConnectionRequest() {
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
// tslint:disable-next-line: no-any
export const instantiateContext = sinon => {
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
  const testContext = {
    SANDBOX: defaultSandbox,
    SANDBOXES: {
      DEFAULT: defaultSandbox,
      CONFIG: sinon.createSandbox(),
      CRYPTO: sinon.createSandbox(),
      CONNECTION: sinon.createSandbox()
    },
    TEST_LOGGER: new Logger({
      name: 'SFDX_Core_Test_Logger'
    }).useMemoryLogging(),
    id: _uniqid(),
    uniqid: _uniqid,
    configStubs: {},
    localPathRetriever: getTestLocalPath,
    globalPathRetriever: getTestGlobalPath,
    rootPathRetriever: retrieveRootPath,
    fakeConnectionRequest: defaultFakeConnectionRequest,
    getConfigStubContents(name, group) {
      const stub = this.configStubs[name];
      if (stub && stub.contents) {
        if (group && stub.contents[group]) {
          return ensureJsonMap(stub.contents[group]);
        } else {
          return stub.contents;
        }
      }
      return {};
    },
    setConfigStubContents(name, value) {
      if (ensureString(name) && isJsonMap(value)) {
        this.configStubs[name] = value;
      }
    }
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
export const stubContext = testContext => {
  // Most core files create a child logger so stub this to return our test logger.
  stubMethod(testContext.SANDBOX, Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));
  testContext.SANDBOXES.CONFIG.stub(ConfigFile, 'resolveRootFolder').callsFake(isGlobal =>
    testContext.rootPathRetriever(isGlobal, testContext.id)
  );
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
  testContext.SANDBOXES.CRYPTO.stub(Crypto.prototype, 'getKeyChain').callsFake(() =>
    Promise.resolve({
      setPassword: () => Promise.resolve(),
      getPassword: (data, cb) => cb(undefined, '12345678901234567890123456789012')
    })
  );
  testContext.SANDBOXES.CONNECTION.stub(Connection.prototype, 'request').callsFake(function(request, options) {
    if (request === `${this.instanceUrl}/services/data`) {
      return Promise.resolve([{ version: '42.0' }]);
    }
    return testContext.fakeConnectionRequest.call(this, request, options);
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
export const restoreContext = testContext => {
  testContext.SANDBOX.restore();
  Object.values(testContext.SANDBOXES).forEach(theSandbox => theSandbox.restore());
  testContext.configStubs = {};
};
// tslint:disable-next-line:no-any
const _testSetup = sinon => {
  const testContext = instantiateContext(sinon);
  beforeEach(() => {
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
export const unexpectedResult = new SfdxError('This code was expected to fail', 'UnexpectedResult');
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
export async function shouldThrow(f) {
  await f;
  throw unexpectedResult;
}
/**
 * A helper to determine if a subscription will use callback or errorback.
 * Enable errback to simulate a subscription failure.
 */
export var StreamingMockSubscriptionCall;
(function(StreamingMockSubscriptionCall) {
  StreamingMockSubscriptionCall[(StreamingMockSubscriptionCall['CALLBACK'] = 0)] = 'CALLBACK';
  StreamingMockSubscriptionCall[(StreamingMockSubscriptionCall['ERRORBACK'] = 1)] = 'ERRORBACK';
})(StreamingMockSubscriptionCall || (StreamingMockSubscriptionCall = {}));
/**
 * Simulates a comet subscription to a streaming channel.
 */
export class StreamingMockCometSubscription extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
  }
  /**
   * Sets up a streaming subscription callback to occur after the setTimeout event loop phase.
   * @param callback The function to invoke.
   */
  callback(callback) {
    if (this.options.subscriptionCall === StreamingMockSubscriptionCall.CALLBACK) {
      setTimeout(() => {
        callback();
        super.emit(StreamingMockCometSubscription.SUBSCRIPTION_COMPLETE);
      }, 0);
    }
  }
  /**
   * Sets up a streaming subscription errback to occur after the setTimeout event loop phase.
   * @param callback The function to invoke.
   */
  errback(callback) {
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
StreamingMockCometSubscription.SUBSCRIPTION_COMPLETE = 'subscriptionComplete';
StreamingMockCometSubscription.SUBSCRIPTION_FAILED = 'subscriptionFailed';
/**
 * Simulates a comet client. To the core streaming client this mocks the internal comet impl.
 * The uses setTimeout(0ms) event loop phase just so the client can simulate actual streaming without the response
 * latency.
 */
export class StreamingMockCometClient extends CometClient {
  /**
   * Constructor
   * @param {StreamingMockCometSubscriptionOptions} options Extends the StreamingClient options.
   */
  constructor(options) {
    super();
    this.options = options;
    if (!this.options.messagePlaylist) {
      this.options.messagePlaylist = [{ id: this.options.id }];
    }
  }
  /**
   * Fake addExtension. Does nothing.
   */
  addExtension(extension) {}
  /**
   * Fake disable. Does nothing.
   */
  disable(label) {}
  /**
   * Fake handshake that invoke callback after the setTimeout event phase.
   * @param callback The function to invoke.
   */
  handshake(callback) {
    setTimeout(() => {
      callback();
    }, 0);
  }
  /**
   * Fake setHeader. Does nothing,
   */
  setHeader(name, value) {}
  /**
   * Fake subscription that completed after the setTimout event phase.
   * @param channel The streaming channel.
   * @param callback The function to invoke after the subscription completes.
   */
  subscribe(channel, callback) {
    const subscription = new StreamingMockCometSubscription(this.options);
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
  /**
   * Fake disconnect. Does Nothing.
   */
  disconnect() {
    return Promise.resolve();
  }
}
/**
 * Mock class for OrgData.
 */
export class MockTestOrgData {
  constructor(id = _uniqid()) {
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
  createDevHubUsername(username) {
    this.devHubUsername = username;
  }
  makeDevHub() {
    set(this, 'isDevHub', true);
  }
  createUser(user) {
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
  getMockUserInfo() {
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
      Email: `user_email@${this.testId}.com`
    };
  }
  async getConfig() {
    const crypto = await Crypto.create();
    const config = {};
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
//# sourceMappingURL=testSetup.js.map
