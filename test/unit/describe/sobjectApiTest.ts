/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect } from 'chai';
import { RequestInfo } from 'jsforce';
import { createSandbox, SinonSandbox } from 'sinon';
import { AuthInfo } from '../../../src/authInfo';
import { Connection } from '../../../src/connection';
import { BatchRequest, BatchResponse, SObjectDescribeAPI } from '../../../src/describe/sobjectApi';
import { DescribeSObjectResult } from '../../../src/describe/sobjectTypes';
import { MockTestOrgData, testSetup } from '../../../src/testSetup';
import { SObjectTestData } from './testData';

const $$ = testSetup();

// wrap protected functions as public for testing
class SObjectDescribeAPITestWrap extends SObjectDescribeAPI {
  public doBuildSObjectDescribeURL(sObjectName: string, fullUrl?: boolean): string {
    return this.buildSObjectDescribeURL(sObjectName, fullUrl);
  }

  public doBuildBatchRequestURL(): string {
    return this.buildBatchRequestURL();
  }

  public doBuildBatchRequestBody(types: string[], nextToProcess: number): BatchRequest {
    return this.buildBatchRequestBody(types, nextToProcess);
  }

  public doBuildSingleXHROptions(sObjectName: string, lastRefreshDate?: string): RequestInfo {
    return this.buildSingleXHROptions(sObjectName, lastRefreshDate);
  }

  public doBuildBatchXHROptions(types: string[], nextToProcess: number): RequestInfo {
    return this.buildBatchXHROptions(types, nextToProcess);
  }
  public doGetVersion(): string {
    return this.getVersion();
  }
}

describe('SObjectDescribeAPI', () => {
  let mockConnection: Connection;
  let sObjectAPI: SObjectDescribeAPITestWrap;
  let sandboxStub: SinonSandbox;
  const testData = new MockTestOrgData();

  beforeEach(async () => {
    sandboxStub = createSandbox();
    $$.setConfigStubContents('AuthInfoConfig', {
      contents: await testData.getConfig()
    });
    mockConnection = await Connection.create({
      authInfo: await AuthInfo.create({
        username: testData.username
      })
    });
    sObjectAPI = new SObjectDescribeAPITestWrap(mockConnection);
  });

  afterEach(() => {
    sandboxStub.restore();
  });

  it('should return correct api version', () => {
    const expectedValue = 'v49.0';
    const actualValue = sObjectAPI.doGetVersion();
    expect(actualValue).equals(expectedValue);
  });

  it('should create the correct partial URL for an sobject', () => {
    const sObjectName = 'Paul';
    const expectedValue = `${sObjectAPI.doGetVersion()}/sobjects/${sObjectName}/describe`;
    const actualValue = sObjectAPI.doBuildSObjectDescribeURL(sObjectName);
    expect(actualValue).equals(expectedValue);
  });

  it('should create the correct full URL for an sobject', () => {
    const sObjectName = 'John';
    const expectedValue = `${
      mockConnection.instanceUrl
    }/services/data/${sObjectAPI.doGetVersion()}/sobjects/${sObjectName}/describe`;
    const actualValue = sObjectAPI.doBuildSObjectDescribeURL(sObjectName, true);
    expect(actualValue).equals(expectedValue);
  });

  it('should create the correct batch URL', () => {
    const expectedValue = `${mockConnection.instanceUrl}/services/data/${sObjectAPI.doGetVersion()}/composite/batch`;
    const actualValue = sObjectAPI.doBuildBatchRequestURL();
    expect(actualValue).equals(expectedValue);
  });

  it('should create the correct sobject describe request (when last refresh date not specified)', () => {
    const sObjectName = 'George';
    const expectedValue = {
      method: 'GET',
      url: sObjectAPI.doBuildSObjectDescribeURL(sObjectName, true),
      headers: {
        'Sforce-Call-Options': 'client=sfdx-vscode',
        'User-Agent': 'salesforcedx-extension'
      }
    };
    const actualValue = sObjectAPI.doBuildSingleXHROptions(sObjectName);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should create the correct sobject describe request (when last refresh date specified)', () => {
    const sObjectName = 'Ringo';
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const expectedValue = {
      method: 'GET',
      url: sObjectAPI.doBuildSObjectDescribeURL(sObjectName, true),
      headers: {
        'If-Modified-Since': timestamp,
        'Sforce-Call-Options': 'client=sfdx-vscode',
        'User-Agent': 'salesforcedx-extension'
      }
    };
    const actualValue = sObjectAPI.doBuildSingleXHROptions(sObjectName, timestamp);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should craete the correct batch request body', () => {
    const sObjectNames = ['Paul', 'John', 'George', 'Ringo'];
    const expectedValue: BatchRequest = {
      batchRequests: [
        { method: 'GET', url: sObjectAPI.doBuildSObjectDescribeURL('Paul') },
        { method: 'GET', url: sObjectAPI.doBuildSObjectDescribeURL('John') },
        { method: 'GET', url: sObjectAPI.doBuildSObjectDescribeURL('George') },
        { method: 'GET', url: sObjectAPI.doBuildSObjectDescribeURL('Ringo') }
      ]
    };
    const actualValue = sObjectAPI.doBuildBatchRequestBody(sObjectNames, 0);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should create the correct batch request', () => {
    const sObjectNames = ['Paul', 'John', 'George', 'Ringo'];
    const expectedValue = {
      method: 'POST',
      url: sObjectAPI.doBuildBatchRequestURL(),
      headers: {
        'Sforce-Call-Options': 'client=sfdx-vscode',
        'User-Agent': 'salesforcedx-extension'
      },
      body: JSON.stringify(sObjectAPI.doBuildBatchRequestBody(sObjectNames, 0))
    };
    const actualValue = sObjectAPI.doBuildBatchXHROptions(sObjectNames, 0);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should return sobject description array when batch request is successful', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const batchResp: BatchResponse = {
      hasErrors: false,
      results: [
        {
          statusCode: 200,
          result: SObjectTestData.customSObject
        }
      ]
    };
    const resp = {
      status: 200,
      body: JSON.stringify(batchResp),
      headers: {
        date: timestamp
      }
    };
    sandboxStub.stub(mockConnection, 'requestRaw').returns(Promise.resolve(resp));
    const expectedValue: DescribeSObjectResult[] = [{ sObjectName, result: SObjectTestData.customSObject, timestamp }];
    const actualValue = await sObjectAPI.describeSObjectBatch([sObjectName], 0);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should return sobject description when request is successful', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const resp = {
      status: 200,
      body: JSON.stringify(SObjectTestData.customSObject),
      headers: {
        date: timestamp
      }
    };
    sandboxStub.stub(mockConnection, 'requestRaw').returns(Promise.resolve(resp));
    const expectedValue: DescribeSObjectResult = {
      sObjectName,
      result: SObjectTestData.customSObject,
      timestamp
    };
    const actualValue = await sObjectAPI.describeSObject(sObjectName);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should return empty sobject description when refresh unneeded and request is successful', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const resp = {
      status: 304,
      responseText: '',
      headers: {
        date: timestamp
      }
    };
    sandboxStub.stub(mockConnection, 'requestRaw').returns(Promise.resolve(resp));
    const expectedValue: DescribeSObjectResult = {
      sObjectName,
      result: undefined,
      timestamp
    };
    const actualValue = await sObjectAPI.describeSObject(sObjectName, timestamp);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should reject when batch request fails', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const resp500 = {
      status: 500,
      responseText: 'ERROR',
      headers: {
        date: timestamp
      }
    };
    sandboxStub.stub(mockConnection, 'requestRaw').returns(Promise.reject(resp500));
    try {
      await sObjectAPI.describeSObjectBatch([sObjectName], 0);
      assert.fail('describeSObjectBatch should have errored');
    } catch (err) {
      expect(err).to.equal(resp500.responseText);
    }
  });

  it('should reject when request fails', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const resp500 = {
      status: 500,
      responseText: 'ERROR',
      headers: {
        date: timestamp
      }
    };
    sandboxStub.stub(mockConnection, 'requestRaw').returns(Promise.reject(resp500));
    try {
      await sObjectAPI.describeSObject(sObjectName);
      assert.fail('describeSObjectBatch should have errored');
    } catch (err) {
      expect(err).to.equal(resp500.responseText);
    }
  });
});
