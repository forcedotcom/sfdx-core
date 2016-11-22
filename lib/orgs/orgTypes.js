/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const util = require('util');

const ORG_TYPES = {

    TEST: 'test',
    HUB: 'hub',
    WORKSPACE: 'workspace',
    UAT: 'uat',

    hasOrgType (type) {
        if (util.isNullOrUndefined(type)) {
            return false;
        }

        const typeUpper = type.toUpperCase();
        return {}.hasOwnProperty.call(ORG_TYPES, typeUpper) &&
            typeof ORG_TYPES[typeUpper] === 'string' &&
            ORG_TYPES[typeUpper] === type;
    },

    creatableTypes () {
        // The string '*' is appended to the default
        return [ORG_TYPES.TEST, ORG_TYPES.UAT, `${ORG_TYPES.WORKSPACE}*`];
    }
};

module.exports = ORG_TYPES;