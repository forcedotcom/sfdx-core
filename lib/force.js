/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Thirdparty
const Promise = require('bluebird');
const jsforce = require('jsforce');
const jwt = require('jsonwebtoken');
const optional = require('optional-js');

const fsReadFile = Promise.promisify(fs.readFile);

// Local
const workspace = require(path.join(__dirname, 'workspace'));

const logger = require(path.join('..', 'lib', 'logApi'));
const jwtAudience = require(path.join('..', 'lib', 'jwtAudienceUrl'));
const almError = require(path.join(__dirname, 'almError'));
const messages = require(path.join(__dirname, 'messages'));

const AppCloudCLIClientId = 'appcloud toolbelt';
const ToolbeltHeaders = { 'content-type': 'application/json', 'user-agent': AppCloudCLIClientId };

const _parseIdUrl = function (idUrl) {
    const idUrls = idUrl.split('/');
    const userId = idUrls.pop();
    const orgId = idUrls.pop();

    return {
        id: userId,
        organizationId: orgId,
        url: idUrl
    };
};

const _jwtAuthorize = function (token, orgInstanceAuthority) {
    // Extend OAuth2 to add JWT Bearer Token Flow support.
    const JwtOAuth2 = function () {
        return Object.assign(Object.create(jsforce.OAuth2), {
            jwtAuthorize (innerToken, callback) {
                return this.prototype._postParams({
                    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                    assertion: innerToken
                }, callback);
            }
        });
    };
    const oauth2 = new JwtOAuth2();
    oauth2.prototype.constructor({ loginUrl : orgInstanceAuthority });

    // Authenticate using JWT, then build and return a connection
    // containing the instanceUrl and accessToken information.
    let connection;
    return oauth2.jwtAuthorize(token)
        .then((response) => {
            connection = new jsforce.Connection({
                instanceUrl: response.instance_url,
                accessToken: response.access_token,
                userInfo: _parseIdUrl(response.id)
            });
            return connection;
        })
        .then((localConnection) =>
            localConnection.sobject('User').retrieve(connection.userInfo.id))
        .then((user) => ({
            orgId: connection.userInfo.organizationId,
            username: user.Username,
            accessToken: connection.accessToken,
            instanceUrl: connection.instanceUrl
        }));
};

const _create = function(sobjectName, sobjectData, connection) {
    const sobject = connection.sobject(sobjectName);
    return sobject.describe()
        .then(() => sobject.create(sobjectData))
        .catch((err) => {
            if (err.errorCode === 'NOT_FOUND') {
                const locale = this.config.getLocale();
                err.message = messages(locale).getMessage('createOrgCommandUnauthorized', sobjectName);
                err.name = 'ACCESS_DENIED';
                Promise.reject(err);
            }
            throw err;
        });
};

class Force {
    constructor(orgApi, childLogger) {
        this.logger = (childLogger || logger).child('force');
        this.logger.setConfig('org', orgApi.getName());
        this.orgApi = orgApi;
    }

    static authorize(oauthConfig) {
        const oauth2 = new jsforce.OAuth2(oauthConfig);
        const connection = new jsforce.Connection({ oauth2 });
        return Promise.resolve(connection.authorize(oauthConfig.authCode))
            .then(
                () => connection.sobject('User').retrieve(connection.userInfo.id)
            )
            .then((user) => ({
                    orgId: connection.userInfo.organizationId,
                    username: user.Username,
                    accessToken: connection.accessToken,
                    instanceUrl: connection.instanceUrl,
                    refreshToken: connection.refreshToken
                })
            );
    }

    static jwtAuthorize(oauthConfig) {
        return fsReadFile(oauthConfig.privateKeyFile, 'utf8')
            .then((privateKey) => {
                const audienceUrl = jwtAudience.getJwtAudienceUrl(oauthConfig, this.config);

                return jwt.sign(
                    {
                        iss: oauthConfig.clientId,
                        sub: oauthConfig.username,
                        aud: audienceUrl,
                        exp: new Date().getTime() + 300
                    },
                    privateKey,
                    {
                        algorithm: 'RS256'
                    }
                );
            })
            .then((token) => Promise.resolve(_jwtAuthorize(token, oauthConfig.loginUrl)));
    }

    static getAuthorizationUrl(oauthConfig) {
        const oauth2 = new jsforce.OAuth2(oauthConfig);
        const state = crypto.randomBytes(Math.ceil(6)).toString('hex');
        const params = {
            state,
            prompt: 'login',
            response_type: 'code',
            scope: 'refresh_token api web'
        };

        return oauth2.getAuthorizationUrl(params);
    }

    static login(creds, oauth2) {
        const auth = {
            oauth2
        };
        auth.oauth2.loginUrl = workspace.getConfig().SfdcLoginUrl;

        const connection = new jsforce.Connection(auth);
        return connection.login(creds.username, creds.password).then(() => ({
            accessToken: connection.accessToken,
            instanceUrl: connection.instanceUrl,
            refreshToken: connection.refreshToken
        }));
    }

    /**
     * Authenticates into an org via either the jwt flow or the web server oauth flow
     * and saves the resulting config to disk
     * (checks for the jwt flow first)
     * @param oauthConfig
     * @param type - the org type e.g. hub, workspace, test, etc.
     * @returns {json} - the org api values with encrypted secrets. Call get config to decrypt.
     */
     authorizeAndSave(oauthConfig, type) {
        let promise;
        let isJwt = true;

        if (!util.isNullOrUndefined(oauthConfig.privateKeyFile)) {
            promise = this.jwtAuthorize(oauthConfig);
        } else {
            isJwt = false;
            promise = this.authorize(oauthConfig);
        }

        return promise.then((authObject) => {
            this.logger.debug(
                `Authenticated new org: ${authObject.orgId} for user ${authObject.username} with authcode.`);
            const orgSaveData =  authObject;
            orgSaveData.clientId = oauthConfig.clientId;
            orgSaveData.type = type;
            orgSaveData.createdOrgInstance = oauthConfig.createdOrgInstance;

            if (isJwt) {
                orgSaveData.privateKey = oauthConfig.privateKeyFile;
            } else {
                orgSaveData.clientSecret = oauthConfig.clientSecret;
            }
            return this.orgApi.saveConfig(orgSaveData);
        });
    }

    instantiateConnection() {
        return this.orgApi.readConfig().then((org) => {
            let connection;

            if (util.isNullOrUndefined(org.refreshToken)) {
                const refreshFn = (conn, callback) => {
                    this.logger.info('Access token has expired. Updating...');
                    const oauthConfig = {
                        clientId: org.clientId,
                        loginUrl: org.instanceUrl,
                        username: org.username,
                        privateKeyFile: org.privateKey,
                        createdOrgInstance: org.createdOrgInstance
                    };
                    this.orgApi.force.authorizeAndSave(oauthConfig, org.type)
                        .then(() => this.orgApi.readConfig())
                        .then((orgData) => callback(null, orgData.accessToken));
                };

                // JWT bearer token OAuth flow
                const connectData = {
                    refreshFn,
                    instanceUrl: org.instanceUrl,
                    accessToken: org.accessToken,
                    version: workspace.getConfig().ApiVersion,
                    callOptions: {
                        client: AppCloudCLIClientId
                    }
                };
                connection = new jsforce.Connection(connectData);
                connection._logger = this.logger;
                connection.tooling._logger = this.logger;
                this._connection = connection;
            }
            else {
                // Web Server OAuth flow
                const connectData = {
                    oauth2: {
                        loginUrl: optional.ofNullable(org.instanceUrl).orElse(workspace.getConfig().SfdcLoginUrl),
                        clientId: org.clientId,
                        clientSecret: org.clientSecret,
                        redirectUri: workspace.getOauthCallbackUrl()
                    },
                    instanceUrl: org.instanceUrl,
                    accessToken: org.accessToken,
                    refreshToken: org.refreshToken,
                    version: workspace.getConfig().ApiVersion,
                    callOptions: {
                        client: AppCloudCLIClientId
                    }
                };

                connection = new jsforce.Connection(connectData);
                connection._logger = this.logger;
                connection.tooling._logger = this.logger;
                connection.on('refresh', accessToken => {
                    this.orgApi.readConfig().then((orgData) => {
                        this.logger.info('Access token has expired. Updating...');
                        orgData.accessToken = accessToken;
                        return this.orgApi.saveConfig(orgData);
                    });
                });
                this._connection = connection;
            }

            return connection;
        });
    }

    resolveConnection() {
        return this._connection ? Promise.resolve(this._connection) : this.instantiateConnection();
    }

    getOrgFrontDoor() {
        // Calling a simple describe on the data API so the access token can be updated if needed.
        return this.describeData()
            .then(() => this.resolveConnection())
            .then(() => this.orgApi.readConfig())
            .then((orgData) => `${orgData.instanceUrl}/secur/frontdoor.jsp?sid=${orgData.accessToken}`);
    }



    describeData() {
        return this.resolveConnection()
            .then((connection) => connection.requestGet(connection._baseUrl()));
    }


    create(sobjectName, sobject) {
        this.logger.debug(`create: ${sobjectName}`, { sobject });

        return this.resolveConnection()
            .then((connection) => _create(sobjectName, sobject, connection));
    }

    update(sobjectName, sobject, id) {
        this.logger.debug(`update: ${sobjectName}, ${sobject}`);

        return this.resolveConnection()
            .then((connection) => connection.sobject(sobjectName).update(sobject, id));
    }

    describe(sobjectName) {
        this.logger.debug(`describe: ${sobjectName}`);

        return this.resolveConnection()
            .then((connection) => connection.sobject(sobjectName).describe());
    }

    find(sobjectName, conditions, fields, options) {
        return this.resolveConnection()
            .then((connection) =>
                connection.sobject(sobjectName).find(conditions, fields, options));
    }

    query(query) {
        this.logger.debug(`query: ${query}`);

        return this.resolveConnection()
            .then((connection) => connection.query(query));
    }

    retrieve(sobjectName, id) {
        this.logger.debug(`toolingRetrieve: ${sobjectName}, ${id}`);

        return this._getConnection()
            .then((connection) => connection.sobject(sobjectName).retrieve(id));
    }


    runTestsAsynchronous(data) {
        return this.resolveConnection()
            .then((connection) => {
                const url = `${connection.tooling._baseUrl()}/runTestsAsynchronous`;
                const request = {
                    method: 'POST',
                    url,
                    body: JSON.stringify(data),
                    headers: { 'content-type': 'application/json' }
                };
                return connection.tooling.request(request);
            }
        );
    }

    getAsyncJob(testRunId) {
        const query =
            `SELECT Id, Status, JobItemsProcessed, TotalJobItems, NumberOfErrors
            FROM AsyncApexJob
            WHERE ID = '${testRunId}'`;
        return this.toolingQuery(query);
    }

    getAsyncTestStatus(testRunId) {
        const query =  `SELECT Id, Status, ApexClassId, TestRunResultID FROM ApexTestQueueItem WHERE ParentJobId = '${testRunId}'`;
        return this.toolingQuery(query);
    }

    getAsyncTestResults(apexTestQueueItemIds) {
        const soqlIds = `'${apexTestQueueItemIds.join("','")}'`;
        const query = `SELECT Id, QueueItemId, StackTrace, Message, AsyncApexJobId, MethodName, Outcome, ApexClass.Id, ApexClass.Name, ApexClass.NamespacePrefix, RunTime
            FROM ApexTestResult WHERE QueueItemId IN (${soqlIds})`;
        return this.toolingQuery(query);
    }

    getApexTestRunResult(testRunId) {
        const query =
            `SELECT AsyncApexJobId, Status, ClassesCompleted, ClassesEnqueued, MethodsEnqueued, StartTime, EndTime, TestTime, UserId
            FROM ApexTestRunResult
            WHERE AsyncApexJobId = '${testRunId}'`;
        return this.toolingQuery(query);
    }

    getApexCodeCoverage() {
        const query =
            `SELECT ApexTestClass.Id, ApexTestClass.Name, Coverage, TestMethodName, NumLinesCovered,
                ApexClassOrTrigger.Id, ApexClassOrTrigger.Name, NumLinesUncovered
            FROM ApexCodeCoverage`;

        return this.toolingQuery(query);
    }

    assignPermissionSet(permSetName) {
        const query = `SELECT Id FROM PermissionSet WHERE Name='${permSetName}'`;

        return this.resolveConnection()
            .then(connection => Promise.join(
                connection.requestGet(connection._baseUrl()),
                connection.query(query),
                (describeResponse, permSets) => {
                    if (!permSets.records || permSets.records.length !== 1) {
                        throw almError('assignCommandPermissionSetNotFoundError', [permSetName]);
                    }

                    const sobject = {
                        'AssigneeId': describeResponse.identity.split('/').slice(-1).pop(),
                        'PermissionSetId': permSets.records[0].Id
                    };

                    return _create('PermissionSetAssignment', sobject, connection);
                })
                .catch((err) => {
                    if (err.errorCode === 'DUPLICATE_VALUE') {
                        this.logger.info(err.message);
                        return Promise.resolve();
                    }
                    throw err;
                })
            );
    }

    setPassword(password) {
        return Promise.join(this.resolveConnection(), this.orgApi.readConfig(),
            (_connection, orgData) => _connection.sobject('User').find({ 'Username': orgData.username })
                .then((results) => _connection.soap.setPassword(results[0].Id, password)));
    }

    toolingCreate(sobjectName, sobject) {
        this.logger.debug(`toolingCreate: ${sobjectName}`, { sobject });

        return this.resolveConnection()
            .then((connection) => connection.tooling.sobject(sobjectName).create(sobject));
    }

    toolingFind(sobjectName, conditions, fields, options) {
        return this.resolveConnection()
            .then((connection) =>
                connection.tooling.sobject(sobjectName).find(conditions, fields, options));
    }

    toolingQuery(query) {
        this.logger.debug(`toolingQuery: ${query}`);

        return this.resolveConnection()
            .then((connection) => connection.tooling.query(query));
    }

    toolingRetrieve(sobjectName, id) {
        this.logger.debug(`toolingRetrieve: ${sobjectName}, ${id}`);

        return this.resolveConnection()
            .then((connection) => connection.tooling.sobject(sobjectName).retrieve(id));
    }

    // generic request to given URL w/ body and headers
    request(method, url, headers, body) {
        this.logger.debug(`request: ${url}`);
        if (util.isNullOrUndefined(headers)) {
            headers = ToolbeltHeaders;
        }
        return this.resolveConnection()
            .then((connection) => {
                if (connection.accessToken) {
                    headers.Authorization = `Bearer ${connection.accessToken}`;
                }

                const _request = Promise.promisify(connection.request).bind(connection);
                return _request({
                    method,
                    url,
                    body,
                    headers
                });
            });
    }

    requestStreamUrl(url, stream) {
        this.logger.debug(`requestStreamUrl: ${url}`);

        const _callback = (err) => {
            if (!util.isNullOrUndefined(err)) {
                return Promise.reject(err);
            }
            return Promise.resolve(undefined);
        };

        return this.resolveConnection()
            .then((connection) => {
                const headers = {};
                if (connection.accessToken) {
                    headers.Authorization = `Bearer ${connection.accessToken}`;
                }
                const resp = connection.request({ url, headers }, _callback);
                resp.stream().pipe(stream); // resp.stream() waits for the promise to be resolved.
                return resp; // but this will be unresolved almost certainly, and will block any caller mapping.
            });
    }

    // metadata api deploy
    mdapiDeploy(zipStream, options, pollTimeoutMs, pollIntervalMs) {
        return this.resolveConnection()
            .then((connection) => {
                connection.metadata.pollTimeout = pollTimeoutMs || this.config.getAppConfig().DefaultMdapiPollTimeout;
                connection.metadata.pollInterval = pollIntervalMs || this.config.getAppConfig().DefaultMdapiPollInterval;

                return connection.metadata.deploy(zipStream, options || {})
                    .complete({ details: true });
            });
    }

    // metadata api retrieve; options contains what to retrieve
    mdapiRetrieve(orgApi, options, pollTimeoutMs, pollIntervalMs) {
        return this.resolveConnection().then((connection) => {
            connection.metadata.pollTimeout = pollTimeoutMs || this.config.getAppConfig().DefaultMdapiPollTimeout;
            connection.metadata.pollInterval = pollIntervalMs || this.config.getAppConfig().DefaultMdapiPollInterval;

            return connection.metadata.retrieve(options)
                .complete({ details: true });
        });
    }

    mdapiDescribe(apiVersion) {
        return this.resolveConnection()
            .then((connection) => connection.metadata.describe(apiVersion));
    }
}


module.exports = Force;
