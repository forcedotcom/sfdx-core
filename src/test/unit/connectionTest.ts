/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect, assert } from 'chai';

import { Connection, SFDX_HTTP_HEADERS } from '../../lib/connection';
import { AuthInfo } from '../../lib/authInfo';
import { AnyJson } from '../../lib/types';
import * as jsforce from 'jsforce';
import { testSetup } from '../testSetup';

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
});
