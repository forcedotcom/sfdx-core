/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
const path = require('path');

// Thirdparty
const chai = require('chai');

// Constants
const projectRoot = path.join(__dirname, '..', '..');

// Local
const orgTypes = require(path.join(projectRoot, 'lib', 'orgs', 'orgTypes'));

describe('OrgTypes', () => {
    it('scratch type', () => chai.expect(orgTypes.hasOrgType(orgTypes.SCRATCH)).is.ok);

    it('hub type', () => chai.expect(orgTypes.hasOrgType(orgTypes.HUB)).is.ok);

    it('test type', () => chai.expect(orgTypes.hasOrgType(orgTypes.TEST)).is.ok);

    it('wrong type by case', () => chai.expect(orgTypes.hasOrgType('SCRATCH')).is.not.ok);

    it('wrong type null', () => chai.expect(orgTypes.hasOrgType(null)).is.not.ok);

    it('wrong type undefined', () => chai.expect(orgTypes.hasOrgType(undefined)).is.not.ok);

    it('wrong type empty string', () => chai.expect(orgTypes.hasOrgType('')).is.not.ok);

    it('wrong type completely', () => chai.expect(orgTypes.hasOrgType('EgonSpengler')).is.not.ok);
});
