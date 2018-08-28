/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import * as jsforce from 'jsforce';
import { AuthInfo } from '../../src/authInfo';
import { Connection, SFDX_HTTP_HEADERS } from '../../src/connection';
import { testSetup } from '../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('Connection', () => {

    const testConnectionOptions = { loginUrl: 'connectionTest/loginUrl' };
    let requestMock;

    const testAuthInfo = {
        isOauth: () => true,
        getConnectionOptions: () => testConnectionOptions
    };

    beforeEach(() => {
        $$.SANDBOXES.CONNECTION.restore();
        $$.SANDBOX.stub(jsforce.Connection.prototype, 'initialize').returns({});
        requestMock = $$.SANDBOX.stub(jsforce.Connection.prototype, 'request').onFirstCall().returns(Promise.resolve([{ version: '42.0' }]));
    });

    it('create() should create a connection using AuthInfo and SFDX options', async () => {
        const conn = await Connection.create(testAuthInfo as AuthInfo);

        expect(conn.request).to.exist;
        expect(conn['oauth2']).to.be.an('object');
        expect(conn['authInfo']).to.exist;
        expect(conn['loginUrl']).to.equal(testConnectionOptions.loginUrl);
        expect(conn['callOptions'].client).to.contain('sfdx toolbelt:');
        expect(jsforce.Connection.prototype.initialize['called']).to.be.true;
    });

    it('create() should create a connection with the latest API version', async () => {
        const conn = await Connection.create(testAuthInfo as AuthInfo);
        expect(conn.getApiVersion()).to.equal('42.0');
    });

    it('setApiVersion() should throw with invalid version', async () => {
        const conn = await Connection.create(testAuthInfo as AuthInfo);

        try {
            conn.setApiVersion('v23.0');
            assert.fail();
        } catch (e) {}
    });

    it('request() should add SFDX headers and call super() for a URL arg', async () => {
        const testResponse = { success: true };
        requestMock.onSecondCall().returns(Promise.resolve(testResponse));
        const testUrl = 'connectionTest/request/url';
        const expectedRequestInfo = { method: 'GET', url: testUrl, headers: SFDX_HTTP_HEADERS };

        const conn = await Connection.create(testAuthInfo as AuthInfo);

        // Test passing a string to conn.request()
        const response1 = await conn.request(testUrl);
        expect(jsforce.Connection.prototype.request['called']).to.be.true;
        expect(jsforce.Connection.prototype.request['secondCall'].args[0]).to.deep.equal(expectedRequestInfo);
        expect(jsforce.Connection.prototype.request['secondCall'].args[1]).to.be.undefined;
        expect(response1).to.deep.equal(testResponse);
    });

    it('request() should add SFDX headers and call super() for a RequestInfo and options arg', async () => {
        const testResponse = { success: true };
        requestMock.onSecondCall().returns(Promise.resolve(testResponse));
        const testUrl = 'connectionTest/request/url/describe';

        const conn = await Connection.create(testAuthInfo as AuthInfo);

        // Test passing a RequestInfo object and options to conn.request()
        const requestInfo = { method: 'POST', url: testUrl };
        const expectedRequestInfo = Object.assign({}, requestInfo, { headers: SFDX_HTTP_HEADERS });
        const httpOptions = { responseType: 'json' };
        const response = await conn.request(requestInfo, httpOptions);
        expect(jsforce.Connection.prototype.request['called']).to.be.true;
        expect(jsforce.Connection.prototype.request['secondCall'].args[0]).to.deep.equal(expectedRequestInfo);
        expect(jsforce.Connection.prototype.request['secondCall'].args[1]).to.equal(httpOptions);
        expect(response).to.deep.equal(testResponse);
    });

    it('request() should add SFDX headers and call super() for a tooling request', async () => {
        const testResponse = { success: true };
        requestMock.onSecondCall().returns(Promise.resolve(testResponse));

        const conn = await Connection.create(testAuthInfo as AuthInfo);

        const testUrl = '/services/data/v42.0/tooling/sobjects';
        const requestInfo = { method: 'GET', url: testUrl };
        const expectedRequestInfo = Object.assign({}, requestInfo, { headers: SFDX_HTTP_HEADERS });

        const response = await conn.tooling.describeGlobal();

        expect(jsforce.Connection.prototype.request['called']).to.be.true;
        expect(jsforce.Connection.prototype.request['secondCall'].args[0]).to.deep.equal(expectedRequestInfo);
        expect(response).to.deep.equal(testResponse);
    });

    it('autoFetchQuery() should call this.query with proper args', async () => {
        const records1 = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const records2 = [{ id: 4 }, { id: 5 }, { id: 6 }];
        const queryResponse1 = { totalSize: 3, done: false, records: records1 };
        const queryResponse2 = { totalSize: 3, done: true, records: records2 };
        requestMock.onSecondCall().returns(Promise.resolve(queryResponse1));
        requestMock.onThirdCall().returns(Promise.resolve(queryResponse2));
        const querySpy = $$.SANDBOX.spy(jsforce.Connection.prototype, 'query');
        const soql = 'TEST_SOQL';

        const conn = await Connection.create(testAuthInfo as AuthInfo);
        const queryResults = await conn.autoFetchQuery(soql);

        expect(queryResults).to.deep.equal({
            done: true,
            totalSize: 6,
            records: [...records1, ...records2]
        });
        expect(querySpy.firstCall.args[0]).to.equal(soql);
        expect(querySpy.firstCall.args[1]).to.have.property('autoFetch', true);
    });

    it('tooling.autoFetchQuery() should call this.query with proper args', async () => {
        const records1 = [{ id: 7 }, { id: 8 }, { id: 9 }];
        const records2 = [{ id: 10 }, { id: 11 }, { id: 12 }];
        const queryResponse1 = { totalSize: 3, done: false, records: records1 };
        const queryResponse2 = { totalSize: 3, done: true, records: records2 };
        requestMock.onSecondCall().returns(Promise.resolve(queryResponse1));
        requestMock.onThirdCall().returns(Promise.resolve(queryResponse2));
        const soql = 'TEST_SOQL';

        const conn = await Connection.create(testAuthInfo as AuthInfo);
        const toolingQuerySpy = $$.SANDBOX.spy(conn.tooling, 'query');
        const queryResults = await conn.tooling.autoFetchQuery(soql);

        expect(queryResults).to.deep.equal({
            done: true,
            totalSize: 6,
            records: [...records1, ...records2]
        });
        expect(toolingQuerySpy.firstCall.args[0]).to.equal(soql);
        expect(toolingQuerySpy.firstCall.args[1]).to.have.property('autoFetch', true);
    });

    it('autoFetch() should reject the promise upon query error', async () => {
        const errorMsg = 'QueryFailed';
        requestMock.onSecondCall().throws(new Error(errorMsg));
        const conn = await Connection.create(testAuthInfo as AuthInfo);

        try {
            await conn.autoFetchQuery('TEST_SOQL');
            assert.fail('autoFetch query should have errored.');
        } catch (err) {
            expect(err.message).to.equal(errorMsg);
        }
    });
});
