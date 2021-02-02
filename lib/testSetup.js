'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index$1 = require('./index-aea73a28.js');
var index = require('./index-ffe6ca9f.js');
var crypto = require('crypto');
var events = require('events');
var os = require('os');
var path = require('path');
var config_configFile = require('./config/configFile.js');
var connection = require('./connection-44f077f0.js');
var crypto$1 = require('./crypto.js');
var logger = require('./logger.js');
var messages = require('./messages.js');
var sfdxError = require('./sfdxError.js');
var status_streamingClient = require('./status/streamingClient.js');
require('./_commonjsHelpers-49936489.js');
require('fs');
require('./global.js');
require('./util/fs.js');
require('constants');
require('stream');
require('util');
require('assert');
require('./util/internal.js');
require('./config/configStore.js');
require('./index-e6d82ffe.js');
require('tty');
require('./driver-39f7bd00.js');
require('net');
require('url');
require('punycode');
require('tls');
require('http');
require('https');
require('domain');
require('buffer');
require('querystring');
require('zlib');
require('string_decoder');
require('timers');
require('./config/configAggregator.js');
require('./config/config.js');
require('./util/sfdc.js');
require('./keyChain.js');
require('./keyChainImpl.js');
require('child_process');
require('./config/keychainConfig.js');
require('./secureBuffer.js');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * Provides the ability to stub methods on object instances and prototypes. More it specifically provides a mechanism
 * for stubbing private functions.
 * @param sandbox The Sinon sandbox in which to perform the relevant stubbing.
 * @param target The target object of the stubbing operation.
 * @param method The method name of the stub.
 */
function stubMethod(sandbox, target, method) {
  // force method to keyof T to allow stubbing private, protected, and methods otherwise not exposed in typings
  return sandbox.stub(target, method);
}
var stubMethod_1 = stubMethod;

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
const _uniqid = () => {
  return crypto.randomBytes(16).toString('hex');
};
function getTestLocalPath(uid) {
  return Promise.resolve(path.join(os.tmpdir(), uid, 'sfdx_core', 'local'));
}
function getTestGlobalPath(uid) {
  return Promise.resolve(path.join(os.tmpdir(), uid, 'sfdx_core', 'global'));
}
async function retrieveRootPath(isGlobal, uid = _uniqid()) {
  return isGlobal ? await getTestGlobalPath(uid) : await getTestLocalPath(uid);
}
function defaultFakeConnectionRequest() {
  return Promise.resolve(index.lib.ensureAnyJson({ records: [] }));
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
const instantiateContext = sinon => {
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
  messages.Messages.importMessagesDirectory(path.join(__dirname));
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
    TEST_LOGGER: new logger.Logger({
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
          return index.lib.ensureJsonMap(stub.contents[group]);
        } else {
          return stub.contents;
        }
      }
      return {};
    },
    setConfigStubContents(name, value) {
      if (index.lib.ensureString(name) && index.lib.isJsonMap(value)) {
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
const stubContext = testContext => {
  // Most core files create a child logger so stub this to return our test logger.
  stubMethod_1(testContext.SANDBOX, logger.Logger, 'child').returns(Promise.resolve(testContext.TEST_LOGGER));
  testContext.SANDBOXES.CONFIG.stub(config_configFile.ConfigFile, 'resolveRootFolder').callsFake(isGlobal =>
    testContext.rootPathRetriever(isGlobal, testContext.id)
  );
  // Mock out all config file IO for all tests. They can restore individually if they need original functionality.
  testContext.SANDBOXES.CONFIG.stub(config_configFile.ConfigFile.prototype, 'read').callsFake(async function() {
    const stub = testContext.configStubs[this.constructor.name] || {};
    // @ts-ignore set this to true to avoid an infinite loop in tests when reading config files.
    this.hasRead = true;
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
  testContext.SANDBOXES.CONFIG.stub(config_configFile.ConfigFile.prototype, 'write').callsFake(async function(
    newContents
  ) {
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
  testContext.SANDBOXES.CRYPTO.stub(crypto$1.Crypto.prototype, 'getKeyChain').callsFake(() =>
    Promise.resolve({
      setPassword: () => Promise.resolve(),
      getPassword: (data, cb) => cb(undefined, '12345678901234567890123456789012')
    })
  );
  testContext.SANDBOXES.CONNECTION.stub(connection.Connection.prototype, 'request').callsFake(function(
    request,
    options
  ) {
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
const restoreContext = testContext => {
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
const testSetup = index$1.lib.once(_testSetup);
/**
 * A pre-canned error for try/catch testing.
 *
 * **See** {@link shouldThrow}
 */
const unexpectedResult = new sfdxError.SfdxError('This code was expected to fail', 'UnexpectedResult');
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
async function shouldThrow(f) {
  await f;
  throw unexpectedResult;
}
(function(StreamingMockSubscriptionCall) {
  StreamingMockSubscriptionCall[(StreamingMockSubscriptionCall['CALLBACK'] = 0)] = 'CALLBACK';
  StreamingMockSubscriptionCall[(StreamingMockSubscriptionCall['ERRORBACK'] = 1)] = 'ERRORBACK';
})(exports.StreamingMockSubscriptionCall || (exports.StreamingMockSubscriptionCall = {}));
/**
 * Simulates a comet subscription to a streaming channel.
 */
class StreamingMockCometSubscription extends events.EventEmitter {
  constructor(options) {
    super();
    this.options = options;
  }
  /**
   * Sets up a streaming subscription callback to occur after the setTimeout event loop phase.
   * @param callback The function to invoke.
   */
  callback(callback) {
    if (this.options.subscriptionCall === exports.StreamingMockSubscriptionCall.CALLBACK) {
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
    if (this.options.subscriptionCall === exports.StreamingMockSubscriptionCall.ERRORBACK) {
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
class StreamingMockCometClient extends status_streamingClient.CometClient {
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
class MockTestOrgData {
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
    index$1.lib.set(this, 'isDevHub', true);
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
    const crypto = await crypto$1.Crypto.create();
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
    const isDevHub = index.lib.getBoolean(this, 'isDevHub');
    if (isDevHub) {
      config.isDevHub = isDevHub;
    }
    return config;
  }
}

exports.MockTestOrgData = MockTestOrgData;
exports.StreamingMockCometClient = StreamingMockCometClient;
exports.StreamingMockCometSubscription = StreamingMockCometSubscription;
exports.instantiateContext = instantiateContext;
exports.restoreContext = restoreContext;
exports.shouldThrow = shouldThrow;
exports.stubContext = stubContext;
exports.testSetup = testSetup;
exports.unexpectedResult = unexpectedResult;
//# sourceMappingURL=testSetup.js.map
