/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';

import { Global, Mode, Modes } from '../../lib/global';

describe('Global', () => {
    const sfdxEnv = process.env.SFDX_ENV;

    after(() => {
        process.env.SFDX_ENV = sfdxEnv;
    });

    describe('environmentMode', () => {
        it('uses SFDX_ENV mode', () => {
            process.env.SFDX_ENV = 'development';
            expect(Global.getEnvironmentMode().is(Modes.DEVELOPMENT)).to.be.true;
            expect(Global.getEnvironmentMode().is(Modes.PRODUCTION)).to.be.false;
            expect(Global.getEnvironmentMode().is(Modes.TEST)).to.be.false;
        });

        it('is production by default', () => {
            process.env.SFDX_ENV = null;
            expect(Global.getEnvironmentMode().is(Modes.DEVELOPMENT)).to.be.false;
            expect(Global.getEnvironmentMode().is(Modes.PRODUCTION)).to.be.true;
            expect(Global.getEnvironmentMode().is(Modes.TEST)).to.be.false;
        });
    });
});
