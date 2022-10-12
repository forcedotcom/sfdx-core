[![NPM](https://img.shields.io/npm/v/@salesforce/core.svg)](https://www.npmjs.com/package/@salesforce/core)
[![CircleCI](https://circleci.com/gh/forcedotcom/sfdx-core.svg?style=svg&circle-token=2377ca31221869e9d13448313620486da80e595f)](https://circleci.com/gh/forcedotcom/sfdx-core)

- [Description](#description)
- [Usage](#usage)
  - [Contributing](#contributing)
- [Using TestSetup](#using-testsetup)
  - [Mocking Authorizations](#mocking-authorizations)
  - [Mocking Config Files](#mocking-config-files)
  - [Using the Built-in Sinon Sandboxes](#using-the-built-in-sinon-sandboxes)
  - [Testing Expected Failures](#testing-expected-failures)
  - [Testing Log Lines](#testing-log-lines)

# Description

The @salesforce/core library provides client-side management of Salesforce DX projects, org authentication, connections to Salesforce APIs, and other utilities. Much of the core functionality that powers the Salesforce CLI plugins comes from this library. You can use this functionality in your plugins too.

# Usage

See the [API documentation](https://forcedotcom.github.io/sfdx-core/).

## Contributing

If you are interested in contributing, please take a look at the [CONTRIBUTING](CONTRIBUTING.md) guide.

# Using TestSetup

The Salesforce DX Core Library provides a unit testing utility to help with mocking and sand-boxing core components. This feature allows unit tests to execute without needing to make API calls to salesforce.com.

## Mocking Authorizations

Here you can mock authorization for a Salesforce scratch org.

```typescript
import { strictEqual } from 'assert';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { AuthInfo } from '@salesforce/core';

describe('Mocking Auth data', () => {
  const $$ = new TestContext();
  it('example', async () => {
    const testData = new MockTestOrgData();
    await $$.stubAuths(testData);
    const auth = await AuthInfo.create({ username: testData.username });
    strictEqual(auth.getUsername(), testData.username);
  });
});
```

After having a valid AuthInfo object you can then create fake connections to a Salesforce.com scratch org. This allows for writing tests that can validate result responses for SOQL queries and REST endpoints.

```typescript
import { AuthInfo, Connection, SfError } from '@salesforce/core';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { AnyJson, ensureJsonMap, JsonMap } from '@salesforce/ts-types';
import { ensureString } from '@salesforce/ts-types';
import { deepStrictEqual } from 'assert';
import { QueryResult } from 'jsforce';

describe('Mocking a force server call', () => {
  const $$ = new TestContext();
  it('example', async () => {
    const records: AnyJson = { records: ['123456', '234567'] };
    const testData = new MockTestOrgData();
    await $$.stubAuths(testData);
    $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
      const _request = ensureJsonMap(request);
      if (request && ensureString(_request.url).includes('Account')) {
        return Promise.resolve(records);
      } else {
        return Promise.reject(new SfError(`Unexpected request: ${_request.url}`));
      }
    };
    const connection = await Connection.create({
      authInfo: await AuthInfo.create({ username: testData.username }),
    });
    const result = await connection.query('select Id From Account');
    deepStrictEqual(result, records);
  });
});
```

## Mocking Config Files

You can mock the contents of various config files

```typescript
import { strictEqual } from 'assert';
import { MockTestOrgData, TestContext } from '@salesforce/core/lib/testSetup';
import { StateAggregator, OrgConfigProperties } from '@salesforce/core';

describe('Mocking Aliases', () => {
  const $$ = new TestContext();
  it('example', async () => {
    const testData = new MockTestOrgData();
    await $$.stubAliases({ myAlias: testData.username });
    const alias = (await StateAggregator.getInstance()).aliases.get(testData.username);
    strictEqual(alias, 'myAlais');
  });
});

describe('Mocking Config', () => {
  it('example', async () => {
    const testData = new MockTestOrgData();
    await $$.stubConfig({ [OrgConfigProperties.TARGET_ORG]: testData.username });
    const { value } = (await ConfigAggregator.create()).getInfo(OrgConfigProperties.TARGET_ORG);
    strictEqual(value, testData.username);
  });
});

describe('Mocking Arbitrary Config Files', () => {
  it('example', async () => {
    // MyConfigFile must extend the ConfigFile class in order for this to work properly.
    $$.setConfigStubContents('MyConfigFile', { contents: { foo: 'bar' } });
  });
});
```

## Using the Built-in Sinon Sandboxes

sfdx-core uses Sinon as its underlying mocking system. If you're unfamiliar with Sinon and its sandboxing concept you can find more information here:
https://sinonjs.org/
Sinon `stub`s and `spy`s must be cleaned up after test invocations. To ease the use of Sinon with sfdx core we've exposed our sandbox in TestSetup. After adding your own `stub`s and/or `spy`s they will automatically be cleaned up after each test using mocha's afterEach method.

```typescript
import { strictEqual } from 'assert';

import { TestContext } from '@salesforce/core/lib/testSetup';
import * as os from 'os';

describe('Using the built in Sinon sandbox.', () => {
  const $$ = new TestContext();
  it('example', async () => {
    const unsupportedOS = 'LEO';
    $$.SANDBOX.stub(os, 'platform').returns(unsupportedOS);
    strictEqual(os.platform(), unsupportedOS);
  });
});
```

## Testing Expected Failures

It's important to have negative tests that ensure proper error handling. With `shouldThrow` it's easy to test for expected async rejections.

```typescript
import { SfError } from '@salesforce/core';
import { shouldThrow } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

class TestObject {
  public static async method() {
    throw new SfError('Error', 'ExpectedError');
  }
}

describe('Testing for expected errors', () => {
  it('example', async () => {
    try {
      await shouldThrow(TestObject.method());
    } catch (e) {
      strictEqual(e.name, 'ExpectedError');
    }
  });
});
```

You can also use `shouldThrowSync` for syncrhonous functions you expect to fail

```typescript
import { SfError } from '@salesforce/core';
import { shouldThrowSync } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

class TestObject {
  public static method() {
    throw new SfError('Error', 'ExpectedError');
  }
}

describe('Testing for expected errors', () => {
  it('example', async () => {
    try {
      shouldThrowSync(() => TestObject.method());
    } catch (e) {
      strictEqual(e.name, 'ExpectedError');
    }
  });
});
```

## Testing Log Lines

It's also useful to check expected values and content from log lines. TestSetup configures the sfdx-core logger to use an in memory LogLine storage structure. These can be easily accessed from tests.

```typescript
import { Logger, LogLine } from '@salesforce/core';
import { TestContext } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

const TEST_STRING = 'foo was here';

class TestObject {
  constructor(private logger: Logger) {
    this.logger = logger.child('TestObject');
  }

  public method() {
    this.logger.error(TEST_STRING);
  }
}

describe('Testing log lines', () => {
  const $$ = new TestContext();
  it('example', async () => {
    const obj = new TestObject($$.TEST_LOGGER);
    obj.method();
    const records = $$.TEST_LOGGER.getBufferedRecords();
    strictEqual(records.length, 1);
    strictEqual(records[0].msg, TEST_STRING);
  });
});
```
