/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
const util = require('util');
const path = require('path');

// Local
const sfdx = require(path.join(__dirname, 'sfdxUtil'));

module.exports.getJwtAudienceUrl = function (oauthConfig, config) {
    // default audience must be...
    let audienceUrl = sfdx.urls.production;

    // This is for internal developers when just doing authorize;
    if (sfdx.isInternalUrl(config.getAppConfig().SfdcLoginUrl)) {

        audienceUrl = config.getAppConfig().SfdcLoginUrl;
    } else if (!util.isNullOrUndefined(oauthConfig.createdOrgInstance)) {
        const instance = oauthConfig.createdOrgInstance.trim().toLowerCase();
        if (instance.startsWith('cs')) {
            audienceUrl = sfdx.urls.sandbox;
        } else if (instance.startsWith('gs1')) {
            audienceUrl = 'https://gs1.salesforce.com';
        }
    }

    return audienceUrl;
};
