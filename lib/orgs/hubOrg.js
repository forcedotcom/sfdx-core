/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

// Node
const path = require('path');

// Local
const Org = require(path.join(__dirname, 'org'));

const HUB_ORG_FILE = 'hubOrg.json';

class HubOrg extends Org {
    getFileName() {
        return HUB_ORG_FILE;
    }
}

module.exports = HubOrg;
