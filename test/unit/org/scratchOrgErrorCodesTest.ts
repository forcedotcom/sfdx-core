/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { assert } from 'sinon';
import { Logger } from '../../../src/logger';
import { SfdxError } from '../../../src/sfdxError';
import { ScratchOrgInfo } from '../../../src/org/scratchOrgInfoApi';
import { checkScratchOrgInfoForErrors } from '../../../src/org/scratchOrgErrorCodes';

const testUsername = 'foo';
const logger = Logger.childFromRoot('test');
const baseOrgInfo: ScratchOrgInfo = {
  SignupEmail: '',
  SignupUsername: '',
  SignupInstance: '',
  Username: '',
  LoginUrl: '',
  AuthCode: '',
  Status: 'Error',
  Snapshot: '',
  OrgName: '00D123456789012345',
  Id: '2SR123456789012345',
};
describe('getHumanErrorMessage', () => {
  it('test get message by regex format W-DDDD', () => {
    const ErrorCode = 'T-0002';
    try {
      checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode }, testUsername, logger);
      assert.fail('the above should throw an error');
    } catch (err) {
      expect(err).to.be.an.instanceof(SfdxError);
      expect(err.message).to.include('couldn’t find a');
      expect(err.message).to.not.include('%s');
      expect(err.actions[0]).to.include('information on error code');
      expect(err.actions[0]).to.include(ErrorCode);
      expect(err.actions[0]).to.not.include('%s');
    }
  });

  it('test get message by regex format WW-DDDD', () => {
    const ErrorCode = 'SH-0002';
    try {
      checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode }, testUsername, logger);
      assert.fail('the above should throw an error');
    } catch (err) {
      expect(err).to.be.an.instanceof(SfdxError);
      expect(err.message).to.include('create scratch org');
      expect(err.message).to.not.include('%s');
      expect(err.actions[0]).to.include('information on error code');
      expect(err.actions[0]).to.include(ErrorCode);
      expect(err.actions[0]).to.not.include('%s');
    }
  });

  it('test get default message for unexpected error code.', () => {
    const ErrorCode = 'B-1717';
    try {
      checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode }, testUsername, logger);
      assert.fail('the above should throw an error');
    } catch (err) {
      expect(err).to.be.an.instanceof(SfdxError);
      expect(err.message).to.equal('The request to create a scratch org failed with error code: B-1717.');
      expect(err.message).to.not.include('%s');
      expect(err.actions).to.be.undefined;
    }
  });

  it('test get default message for undefined error code.', () => {
    try {
      checkScratchOrgInfoForErrors({ ...baseOrgInfo }, testUsername, logger);
      assert.fail('the above should throw an error');
    } catch (err) {
      expect(err).to.be.an.instanceof(SfdxError);
      expect(err.message).to.include('An unknown server error occurred');
      expect(err.message).to.include(baseOrgInfo.Id);
      expect(err.message).to.not.include('%s');
      expect(err.actions).to.be.undefined;
    }
  });

  it('test get default message for undefined error code.', () => {
    try {
      checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode: null }, testUsername, logger);
      assert.fail('the above should throw an error');
    } catch (err) {
      expect(err).to.be.an.instanceof(SfdxError);
      expect(err.message).to.include('An unknown server error occurred');
      expect(err.message).to.include(baseOrgInfo.Id);
      expect(err.message).to.not.include('%s');
      expect(err.actions).to.be.undefined;
    }
  });

  it('Throws generic error for undefined status', () => {
    try {
      checkScratchOrgInfoForErrors({ ...baseOrgInfo, Status: undefined }, testUsername, logger);
      assert.fail('the above should throw an error');
    } catch (err) {
      expect(err).to.be.an.instanceof(SfdxError);
      expect(err.message).to.include('unexpected status');
      expect(err.actions).to.be.undefined;
    }
  });

  it('Passes for non errors', () => {
    const successOrgInfo: ScratchOrgInfo = { ...baseOrgInfo, Status: 'Active' };
    expect(checkScratchOrgInfoForErrors(successOrgInfo, testUsername, logger)).to.deep.equal(successOrgInfo);
  });
});
