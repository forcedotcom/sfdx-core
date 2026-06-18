/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { isString } from '@salesforce/ts-types';
import { Global, Mode } from '../../src/global';

describe('Global', () => {
  describe('isWeb', () => {
    it('returns false in Node.js (no document/window)', () => {
      expect(Global.isWeb).to.be.false;
    });

    it('returns false when only self is in globalThis (Bun-like)', () => {
      (globalThis as Record<string, unknown>).self = globalThis;
      try {
        expect(Global.isWeb).to.be.false;
      } finally {
        delete (globalThis as Record<string, unknown>).self;
      }
    });

    it('returns true when both window and document exist (browser-like)', () => {
      (globalThis as Record<string, unknown>).window = {};
      (globalThis as Record<string, unknown>).document = {};
      try {
        expect(Global.isWeb).to.be.true;
      } finally {
        delete (globalThis as Record<string, unknown>).window;
        delete (globalThis as Record<string, unknown>).document;
      }
    });

    it('returns false when only window exists without document', () => {
      (globalThis as Record<string, unknown>).window = {};
      try {
        expect(Global.isWeb).to.be.false;
      } finally {
        delete (globalThis as Record<string, unknown>).window;
      }
    });
  });

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
});
