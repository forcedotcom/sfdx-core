/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { assert, expect } from 'chai';
import { createSandbox, SinonSandbox } from 'sinon';
import { AuthInfo } from '../../../src/authInfo';
import { Connection } from '../../../src/connection';
import { DescribeSObjectResult, SObjectDescribeAPI } from '../../../src/describe/sobjectApi';
import { SObjectService, SObjectType } from '../../../src/describe/sobjectService';
import { MockTestOrgData, testSetup } from '../../../src/testSetup';
import { SObjectTestData } from './testData';

const $$ = testSetup();

describe('SObjectService', () => {
  let mockConnection: Connection;
  let sObjectService: SObjectService;
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
    sObjectService = new SObjectService(mockConnection);
  });

  afterEach(() => {
    sandboxStub.restore();
  });

  it('should retrieve all object names when object type is ALL', async () => {
    sandboxStub.stub(sObjectService.connection, 'describeGlobal').returns(Promise.resolve(SObjectTestData.globalDesc));
    const expectedValue = ['Simon', 'Garfunkel'];
    const actualValue = await sObjectService.retrieveSObjectNames(SObjectType.ALL);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should retrieve standard object names when object type is STANDARD', async () => {
    sandboxStub.stub(sObjectService.connection, 'describeGlobal').returns(Promise.resolve(SObjectTestData.globalDesc));
    const expectedValue = ['Simon'];
    const actualValue = await sObjectService.retrieveSObjectNames(SObjectType.STANDARD);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should retrieve custom object names when object type is CUSTOM', async () => {
    sandboxStub.stub(sObjectService.connection, 'describeGlobal').returns(Promise.resolve(SObjectTestData.globalDesc));
    const expectedValue = ['Garfunkel'];
    const actualValue = await sObjectService.retrieveSObjectNames(SObjectType.CUSTOM);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should reject when getting object names fails', async () => {
    sandboxStub.stub(sObjectService.connection, 'describeGlobal').rejects();
    try {
      await sObjectService.retrieveSObjectNames();
      assert.fail('retrieveSObjectNames should have errored');
    } catch (err) {
      assert.ok(true);
    }
  });

  it('should return sobject description when single request succeeds', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const result: DescribeSObjectResult = {
      sObjectName,
      result: SObjectTestData.customSObject,
      timestamp
    };
    sandboxStub.stub(SObjectDescribeAPI.prototype, 'describeSObject').returns(Promise.resolve(result));
    const expectedValue = SObjectTestData.customSObject;
    const actualValue = await sObjectService.describeSObject(sObjectName);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should reject when describing an object fails', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    sandboxStub.stub(SObjectDescribeAPI.prototype, 'describeSObject').rejects('ERROR');
    try {
      await sObjectService.describeSObject(sObjectName);
      assert.fail('describeSObject should have errored');
    } catch (err) {
      assert.ok(true);
    }
  });

  it('should return sobject description array when batch request succeeds', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    const timestamp = 'Fri, 07 Aug 2020 12:00:00 GMT';
    const result: DescribeSObjectResult[] = [
      {
        sObjectName,
        result: SObjectTestData.customSObject,
        timestamp
      }
    ];
    sandboxStub.stub(SObjectDescribeAPI.prototype, 'describeSObjectBatch').returns(Promise.resolve(result));
    const expectedValue = [SObjectTestData.customSObject];
    const actualValue = await sObjectService.describeSObjects([sObjectName]);
    expect(actualValue).deep.equals(expectedValue);
  });

  it('should reject when batch describing objects fails', async () => {
    const sObjectName = SObjectTestData.customSObject.name;
    sandboxStub.stub(SObjectDescribeAPI.prototype, 'describeSObjectBatch').rejects('ERROR');
    try {
      await sObjectService.describeSObjects([sObjectName]);
      assert.fail('describeSObjects should have errored');
    } catch (err) {
      assert.ok(true);
    }
  });
});
