/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'node:os';
import * as path from 'node:path';
import { expect } from 'chai';
import { isString } from '@salesforce/ts-types';
import { Global, Mode } from '../../src/global';

describe('Global', () => {
  describe('environmentMode', () => {
    const originalEnv = { SFDX_ENV: process.env.SFDX_ENV, SF_ENV: process.env.SF_ENV };
    const cleanEnv = () => Object.keys(originalEnv).map((key) => delete process.env[key]);

    beforeEach(() => {
      cleanEnv();
    });

    after(() => {
      cleanEnv();
      Object.entries(originalEnv)
        .filter(([, value]) => isString(value))
        .map(([key, value]) => {
          process.env[key] = value;
        });
    });

    it('uses SFDX_ENV mode alone', () => {
      process.env.SFDX_ENV = 'development';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });

    it('uses SF_ENV mode alone', () => {
      process.env.SF_ENV = 'development';
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

    it('defaults to production when invalid values are specified (SFDX)', () => {
      process.env.SFDX_ENV = 'notARealMode';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });

    it('defaults to production when invalid values are specified (SF)', () => {
      process.env.SF_ENV = 'notARealMode';
      expect(Global.getEnvironmentMode() === Mode.DEVELOPMENT).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.PRODUCTION).to.be.true;
      expect(Global.getEnvironmentMode() === Mode.DEMO).to.be.false;
      expect(Global.getEnvironmentMode() === Mode.TEST).to.be.false;
    });
  });

  describe('directory getters', () => {
    const originalSfHome = process.env.SF_HOME;
    const originalSfdxHome = process.env.SFDX_HOME;

    beforeEach(() => {
      delete process.env.SF_HOME;
      delete process.env.SFDX_HOME;
    });

    after(() => {
      if (isString(originalSfHome)) {
        process.env.SF_HOME = originalSfHome;
      } else {
        delete process.env.SF_HOME;
      }
      if (isString(originalSfdxHome)) {
        process.env.SFDX_HOME = originalSfdxHome;
      } else {
        delete process.env.SFDX_HOME;
      }
    });

    it('SF_DIR defaults to ~/.sf', () => {
      expect(Global.SF_DIR).to.equal(path.join(os.homedir(), Global.SF_STATE_FOLDER));
    });

    it('SF_DIR respects SF_HOME', () => {
      process.env.SF_HOME = '/tmp/sf-test';
      expect(Global.SF_DIR).to.equal('/tmp/sf-test');
    });

    it('SFDX_DIR defaults to ~/.sfdx', () => {
      expect(Global.SFDX_DIR).to.equal(path.join(os.homedir(), Global.SFDX_STATE_FOLDER));
    });

    it('SFDX_DIR respects SFDX_HOME', () => {
      process.env.SFDX_HOME = '/tmp/sfdx-test';
      expect(Global.SFDX_DIR).to.equal('/tmp/sfdx-test');
    });

    it('DIR respects SFDX_HOME', () => {
      process.env.SFDX_HOME = '/tmp/sfdx-test';
      expect(Global.DIR).to.equal('/tmp/sfdx-test');
    });
  });
});
