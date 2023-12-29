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
    const original = { SFDX_ENV: process.env.SFDX_ENV, SF_ENV: process.env.SF_ENV };

    beforeEach(() => {
      delete process.env.SFDX_ENV;
      delete process.env.SF_ENV;
    });

    after(() => {
      process.env.SFDX_ENV = original.SFDX_ENV;
      process.env.SF_ENV = original.SF_ENV;
    });

    it('uses SFDX_ENV mode', () => {
      process.env.SFDX_ENV = 'development';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });

    it('prefers SF_ENV mode', () => {
      process.env.SF_ENV = 'test';
      process.env.SFDX_ENV = 'development';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.true;
    });

    it('finds uppercase', () => {
      process.env.SF_ENV = 'TEST';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.true;
    });

    it('finds lowercase', () => {
      process.env.SF_ENV = 'demo';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });

    it('finds mixed case', () => {
      process.env.SF_ENV = 'dEvelOpment';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });

    it('is production by default', () => {
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });

    it('defaults to production when invalid values are specified', () => {
      process.env.SFDX_ENV = 'notARealMode';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });
  });
});
