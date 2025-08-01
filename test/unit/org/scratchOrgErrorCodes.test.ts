/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { Duration } from '@salesforce/kit';
import { stubMethod } from '@salesforce/ts-sinon';
import { SfError } from '../../../src/sfError';
import { ScratchOrgInfo } from '../../../src/org/scratchOrgTypes';
import { checkScratchOrgInfoForErrors, validateScratchOrgInfoForResume } from '../../../src/org/scratchOrgErrorCodes';
import { shouldThrow } from '../../../src/testSetup';
import { ScratchOrgCache } from '../../../src/org/scratchOrgCache';
import { Org } from '../../../src/org/org';
import * as scratchOrgInfoApi from '../../../src/org/scratchOrgInfoApi';
import { TestContext } from '../../../src/testSetup';
import { PollingClient } from '../../../src/status/pollingClient';
import { Messages } from '../../../src/messages';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'scratchOrgErrorCodes');

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

describe('validateScratchOrgInfoForResume - timeout validation', () => {
  const $$ = new TestContext();
  it('should throw StillInProgressError when timeout is 0 minutes and status is New', async () => {
    const scratchOrgInfo = { ...baseOrgInfo, Status: 'New', Id: 'test-job-id' };

    // Mock the API call to return an org in 'New' status
    stubMethod($$.SANDBOX, scratchOrgInfoApi, 'queryScratchOrgInfo').resolves(scratchOrgInfo);

    try {
      await shouldThrow(
        validateScratchOrgInfoForResume({
          jobId: 'test-job-id',
          hubOrg: {} as Org,
          cache: {} as ScratchOrgCache,
          hubUsername: 'hub@test.com',
          timeout: Duration.minutes(0),
        })
      );
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err.name).to.equal('StillInProgressError');
      expect(err.message).to.equal(messages.getMessage('StillInProgressError', ['New']));
    }
  });

  it('should throw StillInProgressError when timeout is 0 minutes and status is Creating', async () => {
    const scratchOrgInfo = { ...baseOrgInfo, Status: 'Creating', Id: 'test-job-id' };

    // Mock the API call to return an org in 'Creating' status
    stubMethod($$.SANDBOX, scratchOrgInfoApi, 'queryScratchOrgInfo').resolves(scratchOrgInfo);

    try {
      await shouldThrow(
        validateScratchOrgInfoForResume({
          jobId: 'test-job-id',
          hubOrg: {} as Org,
          cache: {} as ScratchOrgCache,
          hubUsername: 'hub@test.com',
          timeout: Duration.minutes(0),
        })
      );
    } catch (err) {
      if (!(err instanceof SfError)) {
        expect.fail('should have thrown SfError');
      }
      expect(err.name).to.equal('StillInProgressError');
      expect(err.message).to.equal(messages.getMessage('StillInProgressError', ['Creating']));
    }
  });

  it('should proceed with polling when timeout is greater than 0 minutes', async () => {
    const scratchOrgInfo = { ...baseOrgInfo, Status: 'Creating', Id: 'test-job-id' };
    stubMethod($$.SANDBOX, scratchOrgInfoApi, 'queryScratchOrgInfo').resolves(scratchOrgInfo);

    // Mock PollingClient to simulate immediate failure (not timeout)
    const pollingError = new Error('Polling failed');
    pollingError.name = 'PollingError';
    const mockPollingClient = {
      subscribe: $$.SANDBOX.stub().rejects(pollingError),
    };
    stubMethod($$.SANDBOX, PollingClient, 'create').resolves(mockPollingClient);

    try {
      await shouldThrow(
        validateScratchOrgInfoForResume({
          jobId: 'test-job-id',
          hubOrg: {} as Org,
          cache: {} as ScratchOrgCache,
          hubUsername: 'hub@test.com',
          timeout: Duration.minutes(1),
        })
      );
    } catch (err) {
      // We expect some error due to polling failure, but it should NOT be StillInProgressError
      if (err instanceof SfError && err.name === 'StillInProgressError') {
        expect.fail('Should not throw StillInProgressError when timeout > 0');
      }
      expect((err as Error).name).to.equal('PollingError');
      expect((err as Error).message).to.not.include('Last known Status');
    }
  });

  it('should enhance timeout error message with last known status', async () => {
    const scratchOrgInfo = { ...baseOrgInfo, Status: 'Creating', Id: 'test-job-id' };
    stubMethod($$.SANDBOX, scratchOrgInfoApi, 'queryScratchOrgInfo').resolves(scratchOrgInfo);

    // Create a mock polling client that will throw the timeout error
    const timeoutError = new Error('Polling client timed out.');
    timeoutError.name = 'ScratchOrgResumeTimeOutError';
    const mockPollingClient = {
      subscribe: $$.SANDBOX.stub().rejects(timeoutError),
    };
    stubMethod($$.SANDBOX, PollingClient, 'create').resolves(mockPollingClient);

    try {
      await shouldThrow(
        validateScratchOrgInfoForResume({
          jobId: 'test-job-id',
          hubOrg: {} as Org,
          cache: {} as ScratchOrgCache,
          hubUsername: 'hub@test.com',
          timeout: Duration.minutes(1), // Use a timeout > 0 to trigger polling
        })
      );
    } catch (error) {
      if (!(error instanceof Error)) {
        expect.fail('should have thrown Error');
      }
      // Verify that the error name is still the timeout error
      expect(error.name).to.equal('ScratchOrgResumeTimeOutError');
      // Verify that the error message has been enhanced with the last known status
      expect(error.message).to.equal('Polling client timed out. (Last known Status: Creating)');
    }
  });
});

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
