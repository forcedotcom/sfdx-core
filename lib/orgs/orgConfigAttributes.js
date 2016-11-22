/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */

// Fields the scratch org config object is expected to have
module.exports = {
    ORG_ID: { name: 'orgId' },
    ACCESS_TOKEN: { name: 'accessToken', secret: true },
    REFRESH_TOKEN: { name: 'refreshToken', secret: true, required: false },
    INSTANCE_URL: { name: 'instanceUrl' },
    USERNAME: { name: 'username' },
    CLIENT_ID: { name: 'clientId' },
    PRIVATE_KEY: { name: 'privateKey', required: false },
    CLIENT_SECRET: { name: 'clientSecret', secret: true, required: false },
    TYPE: { name: 'type', required: true },
    CREATED_ORG_INSTANCE: { name: 'createdOrgInstance', required: false }
};