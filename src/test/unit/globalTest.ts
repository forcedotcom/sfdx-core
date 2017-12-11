/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';

import { Global, Mode } from '../../lib/global';

describe('Global', () => {
    const sfdx_env = process.env.SFDX_ENV;

    after(() => {
        process.env.SFDX_ENV = sfdx_env;
        Global.setEnvironmentMode('test');
    });

    describe('environmentMode', () => {
        it('uses SFDX_ENV mode', () => {
            process.env.SFDX_ENV = 'development';
            expect(Global.getEnvironmentMode()['isDevelopment']()).to.be.true;
            expect(Global.getEnvironmentMode()['isProduction']()).to.be.false;
            expect(Global.getEnvironmentMode()['isTest']()).to.be.false;
        });

        it('is production by default', () => {
            Global.setEnvironmentMode(null);
            expect(Global.getEnvironmentMode()['isProduction']()).to.be.true;
            expect(Global.getEnvironmentMode()['isDevelopment']()).to.be.false;
            expect(Global.getEnvironmentMode()['isTest']()).to.be.false;
        });

        it('can be changed via setEnvironmentMode', () => {
            Global.setEnvironmentMode('test');
            expect(Global.getEnvironmentMode()['isDevelopment']()).to.be.false;
            expect(Global.getEnvironmentMode()['isProduction']()).to.be.false;
            expect(Global.getEnvironmentMode()['isTest']()).to.be.true;
        });

        it('can be a custom Mode', () => {
            const customMode = new Mode('foo', ['foo', 'bar', 'baz']);
            Global.setEnvironmentMode(customMode);
            expect(Global.getEnvironmentMode()['isBar']()).to.be.false;
            expect(Global.getEnvironmentMode()['isBaz']()).to.be.false;
            expect(Global.getEnvironmentMode()['isFoo']()).to.be.true;
        });
    });
});