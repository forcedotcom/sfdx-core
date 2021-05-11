[![NPM](https://img.shields.io/npm/v/@salesforce/core.svg)](https://www.npmjs.com/package/@salesforce/core)
[![CircleCI](https://circleci.com/gh/forcedotcom/sfdx-core.svg?style=svg&circle-token=2377ca31221869e9d13448313620486da80e595f)](https://circleci.com/gh/forcedotcom/sfdx-core)

# Description

The @salesforce/core library provides client-side management of Salesforce DX projects, org authentication, connections to Salesforce APIs, and other utilities. Much of the core functionality that powers the Salesforcedx plug-ins comes from this library. You can use this functionality in your plug-ins too.

# Usage

See the [API documentation](https://forcedotcom.github.io/sfdx-core/).

## Contributing

If you are interested in contributing, please take a look at the [CONTRIBUTING](CONTRIBUTING.md) guide.

# Related Docs and Repositories

- [@salesforce/command](https://github.com/forcedotcom/cli-packages/tree/main/packages/command) - Contains base Salesforce CLI command, `SfdxCommand`.
- [@salesforce/plugin-generator](https://github.com/forcedotcom/sfdx-plugin-generate) - The generator plug-in for building plug-ins for Salesforce CLI.

# Using TestSetup

The Salesforce DX Core Library provides a unit testing utility to help with mocking and sand-boxing core components. This feature allows unit tests to execute without needing to make API calls to salesforce.com.

## Mocking AuthInfo

Here you can mock authorization for a Salesforce scratch org.

```typescript
import { strictEqual } from 'assert';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { AuthInfo } from '@salesforce/core';

const $$ = testSetup();

describe('Mocking Auth data', () => {
  it('example', async () => {
    const testData = new MockTestOrgData();
    $$.setConfigStubContents('AuthInfoConfig', {
      contents: await testData.getConfig(),
    });
    const auth: AuthInfo = await AuthInfo.create({ username: testData.username });
    strictEqual(auth.getUsername(), testData.username);
  });
});
```

After having a valid AuthInfo object you can then create fake connections to a Salesforce.com scratch org. This allows for writing tests that can validate result responses for SOQL queries and REST endpoints.

```typescript
import { AuthInfo, Connection, SfdxError } from '@salesforce/core';
import { MockTestOrgData, testSetup } from '@salesforce/core/lib/testSetup';
import { AnyJson, ensureJsonMap, JsonMap } from '@salesforce/ts-types';
import { ensureString } from '@salesforce/ts-types';
import { deepStrictEqual } from 'assert';
import { QueryResult } from 'jsforce';

const $$ = testSetup();

describe('Mocking a force server call', () => {
  it('example', async () => {
    const records: AnyJson = { records: ['123456', '234567'] };
    const testData = new MockTestOrgData();
    $$.setConfigStubContents('AuthInfoConfig', {
      contents: await testData.getConfig(),
    });
    $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
      const _request: JsonMap = ensureJsonMap(request);
      if (request && ensureString(_request.url).includes('Account')) {
        return Promise.resolve(records);
      } else {
        return Promise.reject(new SfdxError(`Unexpected request: ${_request.url}`));
      }
    };
    const connection: Connection = await Connection.create({
      authInfo: await AuthInfo.create({ username: testData.username }),
    });
    const result: QueryResult<{}> = await connection.query('select Id From Account');
    deepStrictEqual(result, records);
  });
});
```

## Using the Built-in Sinon Sandboxes

sfdx-core uses Sinon as its underlying mocking system. If you're unfamiliar with Sinon and it's sandboxing concept you can find more information here:
https://sinonjs.org/
Sinon `stub`s and `spy`s must be cleaned up after test invocations. To ease the use of Sinon with sfdx core we've exposed our sandbox in TestSetup. After adding your own `stub`s and/or `spy`s they will automatically be cleaned up after each test using mocha's afterEach method.

```typescript
import { strictEqual } from 'assert';

import { testSetup } from '@salesforce/core/lib/testSetup';
import * as os from 'os';

const $$ = testSetup();

describe('Using the built in Sinon sandbox.', () => {
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
import { SfdxError } from '@salesforce/core';
import { shouldThrow } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

class TestObject {
  public static async method() {
    throw new SfdxError('Error', 'ExpectedError');
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

## Testing Log Lines

It's also useful to check expected values and content from log lines. TestSetup configures the sfdx-core logger to use an in memory LogLine storage structure. These can be easily accessed from tests.

```typescript
import { Logger, LogLine } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';
import { strictEqual } from 'assert';

const $$ = testSetup();

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
  it('example', async () => {
    const obj: TestObject = new TestObject($$.TEST_LOGGER);
    obj.method();
    const records: LogLine[] = $$.TEST_LOGGER.getBufferedRecords();
    strictEqual(records.length, 1);
    strictEqual(records[0].msg, TEST_STRING);
  });
});
```
