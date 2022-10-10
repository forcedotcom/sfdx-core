/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { get } from '@salesforce/ts-types';

import { expect } from 'chai';
import { fromStub, StubbedType, stubInterface, stubMethod } from '@salesforce/ts-sinon';
import { Duration } from '@salesforce/kit';
import { Connection as JSForceConnection, HttpRequest } from 'jsforce';
import { AuthInfo } from '../../../src/org';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';
import { Connection, DNS_ERROR_NAME, SFDX_HTTP_HEADERS, SingleRecordQueryErrors } from '../../../src/org/connection';
import { shouldThrow, shouldThrowSync, testSetup } from '../../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();
const TEST_IP = '1.1.1.1';

describe('Connection', () => {
  const testConnectionOptions = { loginUrl: 'connectionTest/loginUrl' };
  let requestMock: sinon.SinonStub;

  let testAuthInfo: StubbedType<AuthInfo>;
  let testAuthInfoWithDomain: StubbedType<AuthInfo>;

  beforeEach(() => {
    $$.SANDBOXES.CONNECTION.restore();
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves(TEST_IP);

    requestMock = $$.SANDBOX.stub(JSForceConnection.prototype, 'request')
      .onFirstCall()
      .resolves([{ version: '50.0' }]);

    // Create proxied instances of AuthInfo
    testAuthInfo = stubInterface<AuthInfo>($$.SANDBOX, {
      isOauth: () => true,
      getFields: () => ({}),
      getConnectionOptions: () => testConnectionOptions,
    });

    testAuthInfoWithDomain = stubInterface<AuthInfo>($$.SANDBOX, {
      isOauth: () => true,
      getFields: () => ({}),
      getConnectionOptions: () => ({
        ...testConnectionOptions,
        instanceUrl: 'https://connectionTest/instanceUrl',
      }),
    });
  });

  it('throws error when no valid API version', async () => {
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfoWithDomain) });

    $$.SANDBOX.restore();
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').resolves(TEST_IP);
    $$.SANDBOX.stub(conn, 'isResolvable').resolves(true);
    $$.SANDBOX.stub(JSForceConnection.prototype, 'request').resolves('');

    try {
      await shouldThrow(conn.retrieveMaxApiVersion());
    } catch (e) {
      expect(e).to.have.property('name', 'NoApiVersionsError');
    }
  });

  it('create() should throw on DNS errors', async () => {
    $$.SANDBOX.restore();
    $$.SANDBOX.stub(MyDomainResolver.prototype, 'resolve').rejects({ name: DNS_ERROR_NAME });

    try {
      await shouldThrow(Connection.create({ authInfo: fromStub(testAuthInfoWithDomain) }));
    } catch (e) {
      expect(e).to.have.property('name', DNS_ERROR_NAME);
    }
  });

  it('create() should create a connection using AuthInfo and SFDX options', async () => {
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfo) });

    expect(conn.request).to.exist;
    expect(conn['oauth2']).to.be.an('object');
    expect(get(conn, 'options.authInfo')).to.exist;
    expect(conn.loginUrl).to.equal(testConnectionOptions.loginUrl);
    // eslint-disable-next-line no-underscore-dangle
    expect(conn._callOptions.client).to.contain('sfdx toolbelt:');
  });

  it('create() should create a connection with the latest API version', async () => {
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfo) });
    expect(conn.getApiVersion()).to.equal('50.0');
  });

  it('create() should create a connection with the provided API version', async () => {
    const conn = await Connection.create({
      authInfo: fromStub(testAuthInfo),
      connectionOptions: { version: '50.0' },
    });
    expect(conn.getApiVersion()).to.equal('50.0');
  });

  it('create() should create a connection with the cached API version', async () => {
    testAuthInfo.getFields.returns({
      instanceApiVersionLastRetrieved: new Date(Date.now() - Duration.hours(10).milliseconds).toLocaleString(),
      instanceApiVersion: '51.0',
    });
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfo) });
    expect(conn.getApiVersion()).to.equal('51.0');
  });

  it('create() should create a connection with the cached API version updated with latest', async () => {
    testAuthInfo.getFields.returns({
      instanceApiVersionLastRetrieved: 123,
      instanceApiVersion: '40.0',
    });

    const conn = await Connection.create({ authInfo: fromStub(testAuthInfo) });
    expect(conn.getApiVersion()).to.equal('50.0');
    expect(testAuthInfo.save.called).to.be.true;
  });

  it('setApiVersion() should throw with invalid version', async () => {
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfo) });

    try {
      shouldThrowSync(() => conn.setApiVersion('v23.0'));
    } catch (e) {
      if (!(e instanceof Error)) {
        expect.fail('Expected an error');
      }
      expect(e.message).to.contain('Invalid API version v23.0.');
    }
  });

  it('request() should add SFDX headers and call super() for a URL arg', async () => {
    const testResponse = { success: true };
    requestMock.onSecondCall().returns(Promise.resolve(testResponse));
    const testUrl = 'connectionTest/request/url';
    const expectedRequestInfo = {
      method: 'GET',
      url: testUrl,
      headers: SFDX_HTTP_HEADERS,
    };

    const conn = await Connection.create({
      authInfo: fromStub(testAuthInfoWithDomain),
    });
    // Test passing a string to conn.request()
    const response1 = await conn.request(testUrl);
    expect(requestMock.called).to.be.true;
    expect(requestMock.secondCall.args[0]).to.deep.equal(expectedRequestInfo);
    expect(requestMock.secondCall.args[1]).to.be.undefined;
    expect(response1).to.deep.equal(testResponse);
  });

  it('request() should add SFDX headers and call super() for a RequestInfo and options arg', async () => {
    const testResponse = { success: true };
    requestMock.onSecondCall().returns(Promise.resolve(testResponse));
    const testUrl = 'connectionTest/request/url/describe';

    const conn = await Connection.create({
      authInfo: fromStub(testAuthInfoWithDomain),
    });

    // Test passing a HttpRequest object and options to conn.request()
    const requestInfo: HttpRequest = { method: 'POST', url: testUrl };
    const expectedRequestInfo = Object.assign({}, requestInfo, {
      headers: SFDX_HTTP_HEADERS,
    });
    const httpOptions = { responseType: 'json' };
    const response = await conn.request(requestInfo, httpOptions);
    expect(requestMock.called).to.be.true;
    expect(requestMock.secondCall.args[0]).to.deep.equal(expectedRequestInfo);
    expect(requestMock.secondCall.args[1]).to.equal(httpOptions);
    expect(response).to.deep.equal(testResponse);
  });

  it('request() should add SFDX headers and call super() for a tooling request', async () => {
    const testResponse = { success: true };
    requestMock.onSecondCall().returns(Promise.resolve(testResponse));

    const conn = await Connection.create({
      authInfo: fromStub(testAuthInfoWithDomain),
    });

    const testUrl = 'https://connectionTest/instanceUrl/services/data/v50.0/tooling/sobjects';
    const requestInfo = { method: 'GET', url: testUrl };
    const expectedRequestInfo = Object.assign({}, requestInfo, {
      headers: SFDX_HTTP_HEADERS,
    });

    const response = await conn.tooling.describeGlobal();

    expect(requestMock.called).to.be.true;
    expect(requestMock.secondCall.args[0]).to.deep.equal(expectedRequestInfo);
    expect(response).to.deep.equal(testResponse);
  });

  describe('deploy', () => {
    it('deploy() will work with SOAP', async () => {
      const conn = await Connection.create({
        authInfo: fromStub(testAuthInfoWithDomain),
      });
      const soapDeployStub = $$.SANDBOX.stub(conn.metadata, 'deploy').resolves();

      await conn.deploy(new Buffer('test data'), { rest: false });
      expect(soapDeployStub.callCount).to.equal(1);
    });
  });

  it('autoFetchQuery() should call this.query with proper args', async () => {
    const records = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
    const queryResponse = { totalSize: records.length, done: true, records };
    const querySpy = $$.SANDBOX.spy(JSForceConnection.prototype, 'query');
    const soql = 'TEST_SOQL';

    const conn = await Connection.create({ authInfo: fromStub(testAuthInfo) });

    stubMethod($$.SANDBOX, conn, 'request').resolves(queryResponse);
    const queryResults = await conn.autoFetchQuery(soql);

    expect(queryResults).to.deep.equal({
      done: true,
      totalSize: 6,
      records: [...records],
    });
    expect(querySpy.firstCall.args[0]).to.equal(soql);
    expect(querySpy.firstCall.args[1]).to.have.property('autoFetch', true);
  });
  it('autoFetchQuery() with tooling enabled should call this.query with proper args', async () => {
    const records = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }];
    const queryResponse = { totalSize: records.length, done: true, records };
    const soql = 'TEST_SOQL';

    const conn = await Connection.create({ authInfo: fromStub(testAuthInfo) });
    stubMethod($$.SANDBOX, conn, 'request').resolves(queryResponse);
    const toolingQuerySpy = $$.SANDBOX.spy(conn.tooling, 'query');
    const queryResults = await conn.autoFetchQuery(soql, { tooling: true });
    expect(queryResults).to.deep.equal({
      done: true,
      totalSize: 6,
      records: [...records],
    });
    expect(toolingQuerySpy.firstCall.args[0]).to.equal(soql);
  });

  it('autoFetch() should reject the promise upon query error', async () => {
    const errorMsg = 'QueryFailed';
    requestMock.onSecondCall().throws(new Error(errorMsg));
    const conn = await Connection.create({
      authInfo: fromStub(testAuthInfoWithDomain),
    });

    try {
      await shouldThrow(conn.autoFetchQuery('TEST_SOQL'));
    } catch (e) {
      if (!(e instanceof Error)) {
        expect.fail('Expected an error');
      }
      expect(e.message).to.equal(errorMsg);
    }
  });

  it('singleRecordQuery returns single-record result properly', async () => {
    const mockSingleRecord = {
      id: '123',
      name: 'testName',
    };
    const soql = 'TEST_SOQL';

    const conn = await Connection.create({ authInfo: fromStub(testAuthInfoWithDomain) });

    stubMethod($$.SANDBOX, conn, 'request').resolves({ totalSize: 1, records: [mockSingleRecord] });

    const queryResult = await conn.singleRecordQuery(soql);
    expect(queryResult).to.deep.equal({
      ...mockSingleRecord,
    });
  });

  it('singleRecordQuery throws on no-records', async () => {
    requestMock.resolves({ totalSize: 0, records: [] });
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfoWithDomain) });
    stubMethod($$.SANDBOX, conn, 'request').resolves({ totalSize: 0, records: [] });
    try {
      await shouldThrow(conn.singleRecordQuery('TEST_SOQL'));
    } catch (e) {
      if (!(e instanceof Error)) {
        expect.fail('Expected an error');
      }
      expect(e.name).to.equal(SingleRecordQueryErrors.NoRecords);
    }
  });

  it('singleRecordQuery throws on multiple records', async () => {
    requestMock.resolves({ totalSize: 2, records: [{ id: 1 }, { id: 2 }] });
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfoWithDomain) });

    try {
      await shouldThrow(conn.singleRecordQuery('TEST_SOQL'));
    } catch (e) {
      if (!(e instanceof Error)) {
        expect.fail('Expected an error');
      }
      expect(e.name).to.equal(SingleRecordQueryErrors.MultipleRecords);
    }
  });

  it('singleRecordQuery throws on multiple records with options', async () => {
    requestMock.resolves({ totalSize: 2, records: [{ id: 1 }, { id: 2 }] });
    const conn = await Connection.create({ authInfo: fromStub(testAuthInfoWithDomain) });

    try {
      await shouldThrow(conn.singleRecordQuery('TEST_SOQL', { returnChoicesOnMultiple: true, choiceField: 'id' }));
    } catch (e) {
      if (!(e instanceof Error)) {
        expect.fail('Expected an error');
      }
      expect(e.name).to.equal(SingleRecordQueryErrors.MultipleRecords);
      expect(e.message).to.include('1,2');
    }
  });

  it('singleRecordQuery handles tooling api flag', async () => {
    const mockSingleRecord = {
      id: '123',
      name: 'testName',
    };
    requestMock.resolves({ totalSize: 1, records: [mockSingleRecord] });
    const soql = 'TEST_SOQL';

    const conn = await Connection.create({ authInfo: fromStub(testAuthInfoWithDomain) });
    const toolingQuerySpy = $$.SANDBOX.spy(conn.tooling, 'query');
    const queryResults = await conn.singleRecordQuery(soql, { tooling: true });
    expect(queryResults).to.deep.equal({
      ...mockSingleRecord,
    });
    expect(toolingQuerySpy.firstCall.args[0]).to.equal(soql);
  });
});
