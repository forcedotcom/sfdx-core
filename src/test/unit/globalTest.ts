/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import * as path from 'path';

import { Global, Mode, Modes } from '../../lib/global';
import { SfdxUtil } from '../../lib/util';

describe('Global', () => {

    const sandbox = sinon.sandbox.create();

    afterEach(() => {
        sandbox.restore();
    });

    describe('environmentMode', () => {
        const sfdxEnv = process.env.SFDX_ENV;

        after(() => {
            process.env.SFDX_ENV = sfdxEnv;
        });

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

    describe('fetchConfigInfo', () => {
        it('should call SfdxUtil.readJSON in the global dir', async () => {
            const testJSON = { username: 'globalTest_fetchConfigInfo' };
            sandbox.stub(SfdxUtil, 'readJSON').returns(Promise.resolve(testJSON));
            const fileName = 'globalTest_fileName1';
            const myJSON = await Global.fetchConfigInfo(fileName);

            expect(SfdxUtil.readJSON['called']).to.be.true;
            expect(SfdxUtil.readJSON['firstCall'].args[0]).to.equal(path.join(Global.DIR, fileName));
            expect(myJSON).to.equal(testJSON);
        });
    });

    describe('saveConfigInfo', () => {
        it('should call SfdxUtil.writeJSON in the global dir', async () => {
            const testJSON = { username: 'globalTest_saveConfigInfo' };
            sandbox.stub(SfdxUtil, 'writeJSON').returns(Promise.resolve());
            const fileName = 'globalTest_fileName1';
            await Global.saveConfigInfo(fileName, testJSON);

            expect(SfdxUtil.writeJSON['called']).to.be.true;
            expect(SfdxUtil.writeJSON['firstCall'].args[0]).to.equal(path.join(Global.DIR, fileName));
            expect(SfdxUtil.writeJSON['firstCall'].args[1]).to.equal(testJSON);
        });
    });
});
