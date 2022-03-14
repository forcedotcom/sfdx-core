/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Global, Mode } from '../../src/global';

describe('Global', () => {
  describe('environmentMode', () => {
    const sfdxEnv = process.env.SFDX_ENV;

    after(() => {
      process.env.SFDX_ENV = sfdxEnv;
    });

    it('uses SFDX_ENV mode', () => {
      process.env.SFDX_ENV = 'development';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });

    it('is production by default', () => {
      delete process.env.SFDX_ENV;
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });
  });
});
