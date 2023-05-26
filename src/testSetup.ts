/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import * as fs from 'node:fs';
import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import { tmpdir as osTmpdir } from 'os';
import { basename, join as pathJoin, dirname } from 'path';
import * as util from 'util';
import { SinonSandbox, SinonStatic, SinonStub } from 'sinon';

import { stubMethod } from '@salesforce/ts-sinon';
import {
  AnyFunction,
  AnyJson,
  Dictionary,
  ensureAnyJson,
  ensureJsonMap,
  ensureString,
  isJsonMap,
  JsonMap,
  Nullable,
  Optional,
} from '@salesforce/ts-types';
import { ConfigAggregator } from './config/configAggregator';
import { ConfigFile } from './config/configFile';
import { ConfigContents } from './config/configStore';
import { Connection } from './org/connection';
import { Crypto } from './crypto/crypto';
import { Logger } from './logger';
import { Messages } from './messages';
import { SfError } from './sfError';
import { SfProject, SfProjectJson } from './sfProject';
import * as aliasAccessorEntireFile from './stateAggregator/accessors/aliasAccessor';
import { CometClient, CometSubscription, Message, StreamingExtension } from './status/streamingClient';
import { OrgAccessor, StateAggregator } from './stateAggregator';
import { AuthFields, Org, SandboxFields, User, UserFields } from './org';
import { SandboxAccessor } from './stateAggregator/accessors/sandboxAccessor';
import { Global } from './global';

/**
 * Different parts of the system that are mocked out. They can be restored for
 * individual tests. Test's stubs should always go on the DEFAULT which is exposed
 * on the TestContext.
 */
export interface SandboxTypes {
  DEFAULT: SinonSandbox;
  CRYPTO: SinonSandbox;
  CONFIG: SinonSandbox;
  PROJECT: SinonSandbox;
  CONNECTION: SinonSandbox;
  FS: SinonSandbox;
  ORGS: SinonSandbox;
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
 * Instantiate a @salesforce/core test context.
 */
export class TestContext {
  /**
   * The default sandbox is cleared out before each test run.
   *
   * **See** [sinon sandbox]{@link https://sinonjs.org/releases/v14/sandbox/}.
   */
  public SANDBOX: SinonSandbox;
  /**
   * An object of different sandboxes. Used when
   * needing to restore parts of the system for customized testing.
   */
  public SANDBOXES: SandboxTypes;
  /**
   * The test logger that is used when {@link Logger.child} is used anywhere. It uses memory logging.
   */
  public TEST_LOGGER: Logger;
  /**
   * id A unique id for the test run.
   */
  public id = uniqid();
  /**
   * An object used in tests that interact with config files.
   */
  public configStubs: {
    [configName: string]: Optional<ConfigStub>;
    AuthInfoConfig?: ConfigStub;
    Config?: ConfigStub;
    SfProjectJson?: ConfigStub;
    TokensConfig?: ConfigStub;
    OrgUsersConfig?: ConfigStub;
  } = {};
  /**
   * A record of stubs created during instantiation.
   */
  public stubs: Record<string, SinonStub> = {};

  public constructor(options: { sinon?: SinonStatic; sandbox?: SinonSandbox; setup?: boolean } = {}) {
    const opts = { setup: true, ...options };
    const sinon = this.requireSinon(opts.sinon);
    // Import all the messages files in the sfdx-core messages dir.
    Messages.importMessagesDirectory(pathJoin(__dirname));
    // Create a global sinon sandbox and a test logger instance for use within tests.
    this.SANDBOX = opts.sandbox ?? sinon.createSandbox();
    this.SANDBOXES = {
      DEFAULT: this.SANDBOX,
      CONFIG: sinon.createSandbox(),
      PROJECT: sinon.createSandbox(),
      CRYPTO: sinon.createSandbox(),
      CONNECTION: sinon.createSandbox(),
      FS: sinon.createSandbox(),
      ORGS: sinon.createSandbox(),
    };

    this.TEST_LOGGER = new Logger({ name: 'SFDX_Core_Test_Logger' }).useMemoryLogging();

    if (opts.setup) {
      this.setup();
    }
  }

  /**
   * Generate unique string.
   */
  public uniqid(): string {
    return uniqid();
  }

  /**
   * A function used when resolving the local path. Calls localPathResolverSync by default.
   *
   * @param uid Unique id.
   */
  public async localPathRetriever(uid: string): Promise<string> {
    return Promise.resolve(getTestLocalPath(uid));
  }

  /**
   * A function used when resolving the local path.
   *
   * @param uid Unique id.
   */
  public localPathRetrieverSync(uid: string): string {
    return getTestLocalPath(uid);
  }

  /**
   * A function used when resolving the global path. Calls globalPathResolverSync by default.
   *
   * @param uid Unique id.
   */
  public async globalPathRetriever(uid: string): Promise<string> {
    return Promise.resolve(getTestGlobalPath(uid));
  }

  /**
   * A function used when resolving the global path.
   *
   * @param uid Unique id.
   */
  public globalPathRetrieverSync(uid: string): string {
    return getTestGlobalPath(uid);
  }

  /**
   * A function used for resolving paths. Calls localPathRetriever and globalPathRetriever.
   *
   * @param isGlobal `true` if the config is global.
   * @param uid user id.
   */
  public async rootPathRetriever(isGlobal: boolean, uid?: string): Promise<string> {
    return retrieveRootPath(isGlobal, uid);
  }

  /**
   * A function used for resolving paths. Calls localPathRetrieverSync and globalPathRetrieverSync.
   *
   * @param isGlobal `true` if the config is global.
   * @param uid user id.
   */
  public rootPathRetrieverSync(isGlobal: boolean, uid?: string): string {
    return retrieveRootPathSync(isGlobal, uid);
  }

  /**
   * Used to mock http request to Salesforce.
   *
   * @param request An HttpRequest.
   * @param options Additional options.
   *
   * **See** {@link Connection.request}
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async fakeConnectionRequest(request: AnyJson, options?: AnyJson): Promise<AnyJson> {
    return defaultFakeConnectionRequest();
  }

  /**
   * Gets a config stub contents by name.
   *
   * @param name The name of the config.
   * @param group If the config supports groups.
   */
  public getConfigStubContents(name: string, group?: string): ConfigContents {
    const stub: Optional<ConfigStub> = this.configStubs[name];
    if (stub?.contents) {
      if (group && stub.contents[group]) {
        return ensureJsonMap(stub.contents[group]);
      } else {
        return stub.contents;
      }
    }
    return {};
  }

  /**
   * Sets a config stub contents by name
   *
   * @param name The name of the config stub.
   * @param value The actual stub contents. The Mock data.
   */
  public setConfigStubContents(name: string, value: ConfigContents): void {
    if (ensureString(name) && isJsonMap(value)) {
      this.configStubs[name] = value;
    }
  }

  /**
   * Set stubs for working in the context of a SfProject
   */
  public inProject(inProject = true): void {
    this.SANDBOXES.PROJECT.restore();
    if (inProject) {
      this.SANDBOXES.PROJECT.stub(SfProject, 'resolveProjectPath').callsFake(() => this.localPathRetriever(this.id));
      this.SANDBOXES.PROJECT.stub(SfProject, 'resolveProjectPathSync').callsFake(() =>
        this.localPathRetrieverSync(this.id)
      );
    } else {
      this.SANDBOXES.PROJECT.stub(SfProject, 'resolveProjectPath').rejects(
        new SfError('', 'InvalidProjectWorkspaceError')
      );
      this.SANDBOXES.PROJECT.stub(SfProject, 'resolveProjectPathSync').throws(
        new SfError('', 'InvalidProjectWorkspaceError')
      );
    }
  }

  /**
   * Stub salesforce org authorizations.
   */
  public async stubAuths(...orgs: MockTestOrgData[]): Promise<void> {
    const entries = await Promise.all(
      orgs.map(async (org): Promise<[string, AuthFields]> => [org.username, await org.getConfig()])
    );
    const orgMap = new Map(entries);

    stubMethod(this.SANDBOX, OrgAccessor.prototype, 'getAllFiles').resolves([...orgMap.keys()].map((o) => `${o}.json`));

    stubMethod(this.SANDBOX, OrgAccessor.prototype, 'hasFile').callsFake((username: string) => orgMap.has(username));

    const retrieveContents = async function (this: { path: string }): Promise<AuthFields> {
      const username = basename(this.path.replace('.json', ''));
      return Promise.resolve(orgMap.get(username) ?? {});
    };

    this.configStubs.AuthInfoConfig = { retrieveContents };
  }

  /**
   * Stub salesforce user authorizations.
   *
   * @param users The users to stub.
   * The key is the username of the admin user and it must be included in the users array in order to obtain the orgId key for the remaining users.
   * The admin user is excluded from the users array.
   *
   */
  public stubUsers(users: Record<string, MockTestOrgData[]>): void {
    const mockUsers = Object.values(users).flatMap((orgUsers) =>
      orgUsers.map((user) => {
        const userInfo = user.getMockUserInfo();
        return {
          alias: userInfo.Alias ?? '',
          email: userInfo.Email ?? '',
          emailEncodingKey: userInfo.EmailEncodingKey ?? '',
          id: userInfo.Id ?? '',
          languageLocaleKey: userInfo.LanguageLocaleKey ?? '',
          lastName: userInfo.LastName ?? '',
          localeSidKey: userInfo.LocaleSidKey ?? '',
          profileId: userInfo.ProfileId ?? '',
          timeZoneSidKey: userInfo.TimeZoneSidKey ?? '',
          username: userInfo.Username ?? '',
        };
      })
    );
    const userOrgsMap = new Map(
      Object.entries(users).map(([adminUsername, orgs]) => {
        const adminOrg = orgs.find((org) => org.username === adminUsername);
        return adminOrg
          ? [adminOrg.orgId, { usernames: orgs.filter((org) => org.username !== adminUsername) }]
          : [undefined, undefined];
      })
    );

    stubMethod(this.SANDBOX, User.prototype, 'retrieve').callsFake(
      (username): Promise<UserFields | undefined> => Promise.resolve(mockUsers.find((org) => org.username === username))
    );

    const retrieveContents = async function (this: { path: string }): Promise<{ usernames?: string[] }> {
      const orgId = basename(this.path.replace('.json', ''));
      return Promise.resolve(userOrgsMap.get(orgId) ?? {});
    };

    this.configStubs.OrgUsersConfig = { retrieveContents };
  }

  /**
   * Stub salesforce sandbox authorizations.
   */
  public async stubSandboxes(...sandboxes: MockTestSandboxData[]): Promise<void> {
    const entries = (await Promise.all(
      sandboxes.map(async (sandbox) => [sandbox.username, await sandbox.getConfig()])
    )) as Array<[string, SandboxFields]>;
    const sandboxMap = new Map(entries);

    stubMethod(this.SANDBOX, SandboxAccessor.prototype, 'getAllFiles').resolves(
      [...sandboxMap.keys()].map((o) => `${o}.sandbox.json`)
    );

    const retrieveContents = async function (this: { path: string }): Promise<SandboxFields> {
      const username = basename(this.path.replace('.sandbox.json', ''));
      return Promise.resolve(sandboxMap.get(username) ?? ({} as SandboxFields));
    };

    this.configStubs.SandboxOrgConfig = { retrieveContents };
  }

  /**
   * Stub the aliases in the global aliases config file.
   */
  public stubAliases(aliases: Record<string, string>, group = aliasAccessorEntireFile.DEFAULT_GROUP): void {
    // we don't really "stub" these since they don't use configFile.
    // write the fileContents to location
    fs.mkdirSync(dirname(getAliasFileLocation()), { recursive: true });
    fs.writeFileSync(getAliasFileLocation(), JSON.stringify({ [group]: aliases }));
  }

  /**
   * Stub contents in the config file.
   */
  public async stubConfig(config: Record<string, string>): Promise<void> {
    this.configStubs.Config = { contents: config };
    // configAggregator may have already loaded an instance.  We're not sure why this happens.
    // This seems to solve the problem by forcing a load of the new stubbed config.
    await ConfigAggregator.create();
  }

  /**
   * Stub the tokens in the global token config file.
   */
  public stubTokens(tokens: Record<string, string>): void {
    this.configStubs.TokensConfig = { contents: tokens };
  }

  public restore(): void {
    restoreContext(this);
  }

  public init(): void {
    this.stubs = stubContext(this);
  }

  /**
   * Add beforeEach and afterEach hooks to init the stubs and restore them.
   * This is called automatically when the class is instantiated unless the setup option is set to false.
   */
  public setup(): void {
    beforeEach(() => {
      this.init();
    });

    afterEach(() => {
      this.restore();
    });
  }

  private requireSinon(sinon: Nullable<SinonStatic>): SinonStatic {
    if (sinon) return sinon;
    try {
      sinon = require('sinon');
    } catch (e) {
      throw new Error(
        'The package sinon was not found. Add it to your package.json and pass it in to new TestContext({sinon})'
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return sinon!;
  }
}

/**
 * A function to generate a unique id and return it in the context of a template, if supplied.
 *
 * A template is a string that can contain `${%s}` to be replaced with a unique id.
 * If the template contains the "%s" placeholder, it will be replaced with the unique id otherwise the id will be appended to the template.
 *
 * @param options an object with the following properties:
 * - template: a template string.
 * - length: the length of the unique id as presented in hexadecimal.
 */
export function uniqid(options?: { template?: string; length?: number }): string {
  const uniqueString = randomBytes(Math.ceil((options?.length ?? 32) / 2.0))
    .toString('hex')
    .slice(0, options?.length ?? 32);
  if (!options?.template) {
    return uniqueString;
  }
  return options.template.includes('%s')
    ? util.format(options.template, uniqueString)
    : `${options.template}${uniqueString}`;
}

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
 *   $$.init()
 * });
 *
 * afterEach(() => {
 *   $$.restore();
 * });
 * ```
 * @param sinon
 */
export const instantiateContext = (sinon?: SinonStatic): TestContext => new TestContext({ sinon, setup: false });

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
 *   $$.init()
 * });
 *
 * afterEach(() => {
 *   $$.restore();
 * });
 * ```
 * @param testContext
 */
export const stubContext = (testContext: TestContext): Record<string, SinonStub> => {
  // Turn off the interoperability feature so that we don't have to mock
  // the old .sfdx config files
  Global.SFDX_INTEROPERABILITY = false;
  const stubs: Record<string, SinonStub> = {};

  // Most core files create a child logger so stub this to return our test logger.
  stubMethod(testContext.SANDBOX, Logger, 'child').resolves(testContext.TEST_LOGGER);
  stubMethod(testContext.SANDBOX, Logger, 'childFromRoot').returns(testContext.TEST_LOGGER);
  testContext.inProject(true);
  testContext.SANDBOXES.CONFIG.stub(ConfigFile, 'resolveRootFolder').callsFake((isGlobal: boolean) =>
    testContext.rootPathRetriever(isGlobal, testContext.id)
  );
  testContext.SANDBOXES.CONFIG.stub(ConfigFile, 'resolveRootFolderSync').callsFake((isGlobal: boolean) =>
    testContext.rootPathRetrieverSync(isGlobal, testContext.id)
  );

  stubMethod(testContext.SANDBOXES.PROJECT, SfProjectJson.prototype, 'doesPackageExist').callsFake(() => true);

  const initStubForRead = (configFile: ConfigFile<ConfigFile.Options>): ConfigStub => {
    const stub: ConfigStub = testContext.configStubs[configFile.constructor.name] ?? {};
    // init calls read calls getPath which sets the path on the config file the first time.
    // Since read is now stubbed, make sure to call getPath to initialize it.
    configFile.getPath();

    // @ts-expect-error: set this to true to avoid an infinite loop in tests when reading config files.
    configFile.hasRead = true;
    return stub;
  };

  const readSync = function (this: ConfigFile<ConfigFile.Options>, newContents?: JsonMap): JsonMap {
    const stub = initStubForRead(this);
    this.setContentsFromObject(newContents ?? stub.contents ?? {});
    return this.getContents();
  };

  const read = async function (this: ConfigFile<ConfigFile.Options>): Promise<JsonMap> {
    const stub = initStubForRead(this);

    if (stub.readFn) {
      return stub.readFn.call(this);
    }

    if (stub.retrieveContents) {
      return readSync.call(this, await stub.retrieveContents.call(this));
    } else {
      return readSync.call(this);
    }
  };

  // Mock out all config file IO for all tests. They can restore individually if they need original functionality.
  stubs.configRead = testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'read').callsFake(read);
  // @ts-expect-error: muting exact type match for stub readSync
  stubs.configReadSync = testContext.SANDBOXES.CONFIG.stub(ConfigFile.prototype, 'readSync').callsFake(readSync);

  const writeSync = function (this: ConfigFile<ConfigFile.Options>, newContents?: ConfigContents): void {
    if (!testContext.configStubs[this.constructor.name]) {
      testContext.configStubs[this.constructor.name] = {};
    }
    const stub = testContext.configStubs[this.constructor.name];
    if (!stub) return;

    this.setContents(newContents ?? this.getContents());
    stub.contents = this.toObject();
  };

  const write = async function (this: ConfigFile<ConfigFile.Options>, newContents?: ConfigContents): Promise<void> {
    if (!testContext.configStubs[this.constructor.name]) {
      testContext.configStubs[this.constructor.name] = {};
    }
    const stub = testContext.configStubs[this.constructor.name];
    if (!stub) return;

    if (stub.writeFn) {
      return stub.writeFn.call(this, newContents);
    }

    if (stub.updateContents) {
      writeSync.call(this, await stub.updateContents.call(this));
    } else {
      writeSync.call(this);
    }
  };

  stubs.configWriteSync = stubMethod(testContext.SANDBOXES.CONFIG, ConfigFile.prototype, 'writeSync').callsFake(
    writeSync
  );

  stubs.configWrite = stubMethod(testContext.SANDBOXES.CONFIG, ConfigFile.prototype, 'write').callsFake(write);

  stubMethod(testContext.SANDBOXES.CRYPTO, Crypto.prototype, 'getKeyChain').callsFake(() =>
    Promise.resolve({
      setPassword: () => Promise.resolve(),
      getPassword: (data: Record<string, unknown>, cb: AnyFunction) =>
        cb(undefined, '12345678901234567890123456789012'),
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

  stubMethod(testContext.SANDBOX, aliasAccessorEntireFile, 'getFileLocation').returns(getAliasFileLocation());

  stubs.configExists = stubMethod(testContext.SANDBOXES.ORGS, OrgAccessor.prototype, 'exists').callsFake(
    async function (this: OrgAccessor, username: string): Promise<boolean | undefined> {
      // @ts-expect-error because private member
      if ([...this.contents.keys()].includes(username)) return Promise.resolve(true);
      else return Promise.resolve(false);
    }
  );

  stubs.configRemove = stubMethod(testContext.SANDBOXES.ORGS, OrgAccessor.prototype, 'remove').callsFake(
    async function (this: OrgAccessor, username: string): Promise<boolean | undefined> {
      // @ts-expect-error because private member
      if ([...this.contents.keys()].includes(username)) return Promise.resolve(true);
      else return Promise.resolve(false);
    }
  );

  // Always start with the default and tests beforeEach or it methods can override it.
  testContext.fakeConnectionRequest = defaultFakeConnectionRequest;

  testContext.stubs = stubs;

  return stubs;
};

const getAliasFileLocation = (): string =>
  pathJoin(osTmpdir(), Global.SFDX_STATE_FOLDER, aliasAccessorEntireFile.FILENAME);
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
 *   $$.init()
 * });
 *
 * afterEach(() => {
 *   $$.restore();
 * });
 * ```
 * @param testContext
 */
export const restoreContext = (testContext: TestContext): void => {
  // Restore the default value for this setting on restore.
  Global.SFDX_INTEROPERABILITY = true;
  testContext.SANDBOX.restore();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  Object.values(testContext.SANDBOXES).forEach((theSandbox) => theSandbox.restore());
  testContext.configStubs = {};
  // Give each test run a clean StateAggregator
  StateAggregator.clearInstance();
  // Allow each test to have their own config aggregator
  // @ts-ignore clear for testing.
  delete ConfigAggregator.instance;
};

/**
 * A pre-canned error for try/catch testing.
 *
 * **See** {@link shouldThrow}
 */
export const unexpectedResult = new SfError('This code was expected to fail', 'UnexpectedResult');

/**
 * Use for this testing pattern:
 * ```
 *  try {
 *      await call()
 *      assert.fail("this should never happen");
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
export async function shouldThrow(f: Promise<unknown>, message?: string): Promise<never> {
  await f;
  if (message) {
    throw new SfError(message, 'UnexpectedResult');
  } else {
    throw unexpectedResult;
  }
}

/**
 * Use for this testing pattern:
 * ```
 *  try {
 *      call()
 *      assert.fail("this should never happen");
 *  } catch (e) {
 *  ...
 *  }
 *
 *  Just do this
 *
 *  try {
 *      shouldThrowSync(call); // If this succeeds unexpectedResultError is thrown.
 *  } catch(e) {
 *  ...
 *  }
 * ```
 *
 * @param f The function that is expected to throw.
 */
export function shouldThrowSync(f: () => unknown, message?: string): never {
  f();
  if (message) {
    throw new SfError(message, 'UnexpectedResult');
  } else {
    throw unexpectedResult;
  }
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
  subscriptionErrbackError?: SfError;
  /**
   * A list of messages to playback for the client. One message per process tick.
   */
  messagePlaylist?: Message[];
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
  public subscribe(channel: string, callback: (message: Message) => void): CometSubscription {
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

type MockUserInfo = {
  Id: string;
  Username: string;
  LastName: string;
  Alias: string;
  Configs: string[] | undefined;
  TimeZoneSidKey: string;
  LocaleSidKey: string;
  EmailEncodingKey: string;
  ProfileId: string;
  LanguageLocaleKey: string;
  Email: string;
};

/**
 * Mock class for Salesforce Orgs.
 *
 * @example
 * ```
 * const testOrg = new MockTestOrgData();
 * await $$.stubAuths(testOrg)
 * ```
 */
export class MockTestOrgData {
  public testId: string;
  public aliases?: string[];
  public configs?: string[];
  public username: string;
  public devHubUsername?: string;
  public orgId: string;
  public loginUrl: string;
  public instanceUrl: string;
  public clientId: string;
  public clientSecret: string;
  public authcode: string;
  public accessToken: string;
  public refreshToken: string | undefined;
  public tracksSource: boolean | undefined;
  public userId: string;
  public redirectUri: string;
  public isDevHub?: boolean;
  public isScratchOrg?: boolean;
  public isExpired?: boolean | 'unknown';
  public password?: string;

  public constructor(id: string = uniqid(), options?: { username: string }) {
    this.testId = id;
    this.userId = `user_id_${this.testId}`;
    this.orgId = `${this.testId}`;
    this.username = options?.username ?? `admin_${this.testId}@gb.org`;
    this.loginUrl = `https://login.${this.testId}.salesforce.com`;
    this.instanceUrl = `https://instance.${this.testId}.salesforce.com`;
    this.clientId = `${this.testId}/client_id`;
    this.clientSecret = `${this.testId}/client_secret`;
    this.authcode = `${this.testId}/authcode`;
    this.accessToken = `${this.testId}/accessToken`;
    this.refreshToken = `${this.testId}/refreshToken`;
    this.redirectUri = 'http://localhost:1717/OauthRedirect';
  }

  /**
   * Add devhub username to properties.
   */
  public createDevHubUsername(username: string): void {
    this.devHubUsername = username;
  }

  /**
   * Mark this org as a devhub.
   */
  public makeDevHub(): void {
    this.isDevHub = true;
  }

  /**
   * Returns a MockTestOrgData that represents a user created in the org.
   */
  public createUser(user: string): MockTestOrgData {
    const userMock = new MockTestOrgData();
    userMock.username = user;
    userMock.aliases = this.aliases;
    userMock.configs = this.configs;
    userMock.devHubUsername = this.devHubUsername;
    userMock.orgId = this.orgId;
    userMock.loginUrl = this.loginUrl;
    userMock.instanceUrl = this.instanceUrl;
    userMock.clientId = this.clientId;
    userMock.clientSecret = this.clientSecret;
    userMock.redirectUri = this.redirectUri;
    userMock.isDevHub = this.isDevHub;
    userMock.isScratchOrg = this.isScratchOrg;
    userMock.isExpired = this.isExpired;
    userMock.password = this.password;
    userMock.accessToken = this.accessToken;
    return userMock;
  }

  /**
   * Return mock user information based on this org.
   */
  public getMockUserInfo(): MockUserInfo {
    return {
      Id: this.userId,
      Username: this.username,
      LastName: `user_lastname_${this.testId}`,
      Alias: this.aliases ? this.aliases[0] : 'user_alias_blah',
      Configs: this.configs,
      TimeZoneSidKey: `user_timezonesidkey_${this.testId}`,
      LocaleSidKey: `user_localesidkey_${this.testId}`,
      EmailEncodingKey: `user_emailencodingkey_${this.testId}`,
      ProfileId: `user_profileid_${this.testId}`,
      LanguageLocaleKey: `user_languagelocalekey_${this.testId}`,
      Email: `user_email@${this.testId}.com`,
    };
  }

  /**
   * Return the auth config file contents.
   */
  public async getConfig(): Promise<AuthFields> {
    const crypto = await Crypto.create();
    const config: JsonMap = {};
    config.orgId = this.orgId;
    config.clientId = this.clientId;

    const accessToken = crypto.encrypt(this.accessToken);
    if (accessToken) {
      config.accessToken = accessToken;
    }

    if (this.refreshToken) {
      config.refreshToken = crypto.encrypt(this.refreshToken);
    }

    config.instanceUrl = this.instanceUrl;
    config.loginUrl = this.loginUrl;
    config.username = this.username;
    config.createdOrgInstance = 'CS1';
    config.created = '1519163543003';
    config.userId = this.userId;
    config.tracksSource = this.tracksSource;

    if (this.devHubUsername) {
      config.devHubUsername = this.devHubUsername;
    }

    config.isDevHub = this.isDevHub;

    if (this.password) {
      config.password = crypto.encrypt(this.password);
    }

    return config as AuthFields;
  }

  /**
   * Return the Connection for the org.
   */
  public async getConnection(): Promise<Connection> {
    return (await Org.create({ aliasOrUsername: this.username })).getConnection();
  }
}

/**
 * Mock class for Salesforce Sandboxes.
 *
 * @example
 * ```
 * const testOrg = new MockTestSandboxData();
 * await $$.stubSandboxes(testOrg)
 * ```
 */
export class MockTestSandboxData {
  public sandboxOrgId: string;
  public prodOrgUsername: string;
  public sandboxName?: string;
  public username?: string;

  public constructor(
    public id: string = uniqid(),
    options?: Partial<{ prodOrgUsername: string; name: string; username: string }>
  ) {
    this.sandboxOrgId = id;
    this.prodOrgUsername = options?.prodOrgUsername ?? `admin_${id}@gb.org`;
    this.sandboxName = options?.name ?? `sandbox_${id}`;
    this.username = options?.username ?? `${this.prodOrgUsername}.sandbox`;
  }

  /**
   * Return the auth config file contents.
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  public async getConfig(): Promise<SandboxFields> {
    return {
      sandboxOrgId: this.sandboxOrgId,
      prodOrgUsername: this.prodOrgUsername,
      sandboxName: this.sandboxName,
      sandboxUsername: this.username,
    };
  }
}
