import { testSetup } from '@salesforce/core/lib/testSetup';
import { stubMethod } from '@salesforce/ts-sinon';
import { strictEqual } from 'assert';
import * as os from 'os';

const $$ = testSetup();

describe('Using the built in Sinon sandbox.', () => {
  it('example', async () => {
    const unsupportedOS = 'LEO';
    stubMethod($$.SANDBOX, os, 'platform').returns(unsupportedOS);
    strictEqual(os.platform(), unsupportedOS);
  });
});
