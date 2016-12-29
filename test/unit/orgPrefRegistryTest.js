'use strict';
const path = require('path');
const expect = require('chai').expect;

const OrgPrefRegistry = require(path.join(__dirname, '..', '..', 'lib', 'orgs', 'orgPrefRegistry'));

/**
 * Test cases for the orgPrefRegistry
 */
describe('OrgPrefRegistry', () => {
    describe('whichApi', () => {
        describe('when passed in the EnableOrders org pref', () => {
            it('should return the OrderSettingsApi', () => {
                const orgPrefAPI = OrgPrefRegistry.whichApi('IsOrdersEnabled');
                expect(orgPrefAPI)
                    .to
                    .equal(OrgPrefRegistry.ORDER_SETTINGS_API);
            });
        });
        describe('when passed in the ChatterEnabled org pref', () => {
            it('should return the OrganizationSettingsDetailApi', () => {
                const orgPrefAPI = OrgPrefRegistry.whichApi('ChatterEnabled');
                expect(orgPrefAPI)
                    .to
                    .equal(OrgPrefRegistry.ORGANIZATION_SETTINGS_DETAIL_API);
            });
        });
        describe('when passed in an unsupported pref', () => {
            it('should return undefined', () => {
                const orgPrefApi = OrgPrefRegistry.whichApi('UnsupportedOrgPref');
                expect(orgPrefApi)
                    .to
                    .be
                    .undefined;
            });
        });
    });
});
