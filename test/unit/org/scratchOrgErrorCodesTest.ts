/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { SfError } from '../../../src/sfError';
import { ScratchOrgInfo } from '../../../src/org/scratch/scratchOrgTypes';
import { checkScratchOrgInfoForErrors } from '../../../src/org/scratch/scratchOrgErrorCodes';
import { shouldThrow } from '../../../src/testSetup';

const testUsername = 'foo';
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
  it('test get message by regex format W-DDDD', async () => {
    const ErrorCode = 'T-0002';
    try {
      await shouldThrow(checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode }, testUsername));
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err).to.be.an.instanceof(SfError);
      expect(err.message).to.include('couldn’t find a');
      expect(err.message).to.not.include('%s');
      if (err.actions) {
        expect(err.actions[0]).to.include('information on error code');
        expect(err.actions[0]).to.include(ErrorCode);
        expect(err.actions[0]).to.not.include('%s');
      } else {
        expect.fail('should have actions');
      }
    }
  });

  it('test get message by regex format WW-DDDD', async () => {
    const ErrorCode = 'SH-0002';
    try {
      await shouldThrow(checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode }, testUsername));
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err).to.be.an.instanceof(SfError);
      expect(err.message).to.include('create scratch org');
      expect(err.message).to.not.include('%s');
      if (err.actions) {
        expect(err.actions[0]).to.include('information on error code');
        expect(err.actions[0]).to.include(ErrorCode);
        expect(err.actions[0]).to.not.include('%s');
      } else {
        expect.fail('should have actions');
      }
    }
  });

  it('test get default message for unexpected error code.', async () => {
    const ErrorCode = 'B-1717';
    try {
      await shouldThrow(checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode }, testUsername));
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err.message).to.equal('The request to create a scratch org failed with error code: B-1717.');
      expect(err.message).to.not.include('%s');
      expect(err.actions).to.be.undefined;
    }
  });

  it('test get default message for undefined error code.', async () => {
    try {
      await shouldThrow(checkScratchOrgInfoForErrors({ ...baseOrgInfo }, testUsername));
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err.message).to.include('An unknown server error occurred');
      expect(err.message).to.include(baseOrgInfo.Id);
      expect(err.message).to.not.include('%s');
      expect(err.actions).to.be.undefined;
    }
  });

  it('test get default message for undefined error code.', async () => {
    try {
      // @ts-expect-error: testing for undefined ErrorCode
      await shouldThrow(checkScratchOrgInfoForErrors({ ...baseOrgInfo, ErrorCode: null }, testUsername));
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err.message).to.include('An unknown server error occurred');
      expect(err.message).to.include(baseOrgInfo.Id);
      expect(err.message).to.not.include('%s');
      expect(err.actions).to.be.undefined;
    }
  });

  it('Throws generic error for undefined status', async () => {
    try {
      // @ts-expect-error: testing undefined status
      await shouldThrow(checkScratchOrgInfoForErrors({ ...baseOrgInfo, Status: undefined }, testUsername));
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err.message).to.include('unexpected status');
      expect(err.actions).to.be.undefined;
    }
  });

  it('Passes for non errors', async () => {
    const successOrgInfo: ScratchOrgInfo = { ...baseOrgInfo, Status: 'Active' };
    expect(await checkScratchOrgInfoForErrors(successOrgInfo, testUsername)).to.deep.equal(successOrgInfo);
  });
});
