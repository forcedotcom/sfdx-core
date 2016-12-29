/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
const path = require('path');

// Thirdparty
const chai = require('chai');

// Local
const projectRoot = path.join(__dirname, '..', '..');
const jwtAudience = require(path.join(projectRoot, 'lib', 'jwtAudienceUrl'));
const { urls } = require(path.join(projectRoot, 'lib', 'sfdxUtil'));

describe('getJwtAudienceUrl', () => {

    it('default', () => {
        const config = {
            getAppConfig() {
                return { SfdcLoginUrl: 'http://my.domain.salesforce.com' };
            }
        };
        chai.expect(jwtAudience.getJwtAudienceUrl({}, config)).to.equal(urls.production);
    });

    it('internal url', () => {
        const internalUrl = 'http://foo.internal.salesforce.com';
        const config = {
            getAppConfig() {
                return { SfdcLoginUrl: internalUrl };
            }
        };
        chai.expect(jwtAudience.getJwtAudienceUrl({}, config)).to.equal(internalUrl);
    });

    it('vpod url', () => {
        const internalUrl = 'http://foo.vpod.salesforce.com';
        const config = {
            getAppConfig() {
                return { SfdcLoginUrl: internalUrl };
            }
        };
        chai.expect(jwtAudience.getJwtAudienceUrl({}, config)).to.equal(internalUrl);
    });

    it('sandbox url', () => {
        const internalUrl = 'http://my.domain.salesforce.com';
        const config = {
            getAppConfig() {
                return { SfdcLoginUrl: internalUrl };
            }
        };
        const oauthConfig = { createdOrgInstance: ' cS45.salesforce.com' };
        chai.expect(jwtAudience.getJwtAudienceUrl(oauthConfig, config)).to.equal(urls.sandbox);
    });
});
