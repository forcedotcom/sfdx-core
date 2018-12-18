import { set } from '@salesforce/kit';
import { stubMethod } from '@salesforce/ts-sinon';
import { expect } from 'chai';
import { AuthInfoConfig } from '../../../src/config/authInfoConfig';
import { ConfigFile } from '../../../src/config/configFile';
import { SfdxError } from '../../../src/sfdxError';
import { shouldThrow, testSetup } from '../../../src/testSetup';
import { fs } from '../../../src/util/fs';
import { ErrnoException } from '../helpers';

// Setup the test environment.
const $$ = testSetup();

describe('AuthInfoConfigTest', () => {
  const username = 'foo@example.com';
  let options: ConfigFile.Options;
  beforeEach(() => {
    $$.SANDBOXES.CONFIG.restore();
    stubMethod($$.SANDBOX, ConfigFile.prototype, 'write').callsFake(async () => {
      const error = new SfdxError('Test error', 'testError');
      set(error, 'code', 'ENOENT');
      return Promise.reject(error);
    });
    options = AuthInfoConfig.getOptions(username);
  });

  afterEach(() => {
    $$.SANDBOX.restore();
  });

  it('init should throw', async () => {
    $$.SANDBOX.stub(fs, 'readJsonMap').throws(new ErrnoException('File not found', { code: 'ENOENT' }));
    options.throwOnNotFound = true;
    try {
      await shouldThrow(AuthInfoConfig.create(options));
    } catch (e) {
      expect(e).to.have.property('code', 'ENOENT');
    }
  });

  it('init should throw on undefined', async () => {
    const authInfoConfig = await AuthInfoConfig.create(options);
    expect(authInfoConfig.getPath()).to.include('foo@example.com');
  });

  it("init shouldn't throw", async () => {
    options.throwOnNotFound = false;
    const authInfoConfig = await AuthInfoConfig.create(options);
    expect(authInfoConfig.getPath()).to.include('foo@example.com');
  });
});
