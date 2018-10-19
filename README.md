**As a beta feature, Salesforce Core Libraries is a preview and isn’t part of the “Services” under your master
subscription agreement with Salesforce. Use this feature at your sole discretion, and make your purchase decisions only
on the basis of generally available products and features. Salesforce doesn’t guarantee general availability of this
feature within any particular time frame or at all, and we can discontinue it at any time. This feature is for
evaluation purposes only, not for production use. It’s offered as is and isn’t supported, and Salesforce has no
liability for any harm or damage arising out of or in connection with it. All restrictions, Salesforce reservation of
rights, obligations concerning the Services, and terms for related Non-Salesforce Applications and Content apply equally
to your use of this feature.**
# Salesforce DX Core Library (Beta)
This library provides client-side management of Salesforce DX projects, org authentication, connections to Salesforce APIs, and other various utilities.

See the [API documentation](https://developer.salesforce.com/media/salesforce-cli/docs/@salesforce/core/index.html).

# Using TestSetup


The Salesforce DX Core Library provides a unit testing utility to help with mocking and sand-boxing core components.
This feature allows unit tests to execute without needing to make API calls to salesforce.com.

### Mocking AuthInfo

Here you can mock authorization for a Salesforce scratch org.

```
import * as assert from 'assert';

import { MockTestOrgData, testSetup} from '@salesforce/core/lib/testSetup';
import { AuthInfo } from '@salesforce/core';

const $$ = testSetup();

describe('Mocking Auth data', () => {
    it ('example', async () => {
        const testData = new MockTestOrgData();
        $$.configStubs.AuthInfoConfig = { contents: await testData.getConfig() };
        const auth: AuthInfo = await AuthInfo.create(testData.username);
        assert.equal(auth.getUsername(), testData.username);
    });
});

```
After having a valid AuthInfo object you can then create fake connections to a Salesforce.com scratch org. This allows
for writing test that can validate result responses for SOQL queries and REST endpoints.
```
import * as assert from 'assert';

import { AnyJson } from '@salesforce/ts-types';
import { QueryResult } from 'jsforce';

import { MockTestOrgData, testSetup} from '@salesforce/core/lib/testSetup';
import { AuthInfo, Connection, SfdxError } from '@salesforce/core';

const $$ = testSetup();

describe('Mocking a force server call', () => {
    it ('example', async () => {
        const records: AnyJson = { records: ['123456', '234567'] };
        const testData = new MockTestOrgData();
        $$.configStubs.AuthInfoConfig = { contents: await testData.getConfig() };
        $$.fakeConnectionRequest = (request: AnyJson): Promise<AnyJson> => {
            if (request.url.includes('Account')) {
                return Promise.resolve(records);
            } else {
                return Promise.reject(new SfdxError(`Unexpected request: ${request.url}`));
            }
        };
        const connection: Connection = await Connection.create(await AuthInfo.create(testData.username));
        const result: QueryResult<{}> = await connection.query('select Id From Account');
        assert.deepEqual(result, records);
    });
});

```
### Using the Builtin Sinon Sandboxes

sfdx-core uses Sinon as it's underlying mocking system. If you're unfamiliar with Sinon and it's sand-boxing concept you
can find more information here:

https://sinonjs.org/

Sinon stubs and spys must be cleaned up after test invocations. To ease the use of Sinon with sfdx core we've exposed our
sandbox in TestSetup. After adding your own stubs and/or spys they will automatically be cleaned up after each test
using mocha's afterEach method.
```
import * as assert from 'assert';

import { testSetup } from '@salesforce/core/lib/testSetup';
import * as os from "os";

const $$ = testSetup();

describe('Using the built in Sinon sandbox.', () => {
    it ('example', async () => {
        const unsupportedOS = 'LEO';
        $$.SANDBOX.stub(os, 'platform').returns(unsupportedOS);
        assert.equal(os.platform(), unsupportedOS);
    });
});

```
### Testing Expected Failures

It's important to have negative tests that ensure proper error handling. With *shouldThrow* it's easy to test for expected
async rejections.
```
import * as assert from 'assert';

import { shouldThrow } from '@salesforce/core/lib/testSetup';
import { SfdxError } from '@salesforce/core';


class TestObject {
    public async method() {
        throw new SfdxError('Error', 'ExpectedError');
    }
}

describe('Testing for expected errors', () => {
    it ('example', async () => {
        try {
            const obj = new TestObject();
            await shouldThrow(obj.method());
        } catch (e: SfdxError) {
            assert.equal(e.name, 'ExpectedError');
        }
    });
});

```
### Testing Log Lines

It's also useful to check expected values and content from log lines. TestSetup configures the sfdx-core logger to use an
in memory LogLine storage structure. These can be easily accessed from tests.
```
import * as assert from 'assert';

import { Logger, LogLine } from '@salesforce/core';
import { testSetup } from '@salesforce/core/lib/testSetup';

const $$ = testSetup();

const TEST_STRING = 'foo was here';

class TestObject {
    constructor(private logger: Logger) {
        this.logger = logger.child('TestObject');
    }

    method() {
        this.logger.error(TEST_STRING);
    }
}

describe('Testing log lines', () => {
    it ('example', async () => {
        const obj: TestObject = new TestObject($$.TEST_LOGGER);
        obj.method();
        const records: LogLine[] = $$.TEST_LOGGER.getBufferedRecords();
        assert.equal(records.length, 1);
        assert.equal(records[0].msg, TEST_STRING);
    });
});

```
