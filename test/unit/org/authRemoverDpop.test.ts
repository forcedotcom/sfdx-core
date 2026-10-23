/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect } from 'chai';
import { SinonStub } from 'sinon';
import { AuthFields } from '../../../src/org/authInfo';
import { AuthRemover } from '../../../src/org/authRemover';
import { DpopKey } from '../../../src/crypto/dpop';
import { OrgAccessor } from '../../../src/stateAggregator/accessors/orgAccessor';
import { MockTestOrgData, TestContext } from '../../../src/testSetup';

const KEY_REFERENCE = '3b12f1df-5232-4804-897e-917bf397618a';

class DpopOrg extends MockTestOrgData {
  public async getConfig(): Promise<AuthFields> {
    return { ...(await super.getConfig()), clientId: 'SfDpopProbe', dpopKeyReference: KEY_REFERENCE };
  }
}

describe('AuthRemover DPoP', () => {
  const $$ = new TestContext();
  let deleteKeyStub: SinonStub;
  let removeFileStub: SinonStub;

  beforeEach(() => {
    deleteKeyStub = $$.SANDBOX.stub(DpopKey, 'delete').resolves();
    // TestContext already stubs OrgAccessor.prototype.remove; record calls through that stub.
    removeFileStub = OrgAccessor.prototype.remove as SinonStub;
  });

  it('deletes the DPoP keychain item before deleting the auth file', async () => {
    const org = new DpopOrg('00Dxx0000000001EAA', { username: 'dpop@example.com' });
    await $$.stubAuths(org);

    const remover = await AuthRemover.create();
    await remover.removeAuth(org.username);

    expect(deleteKeyStub.calledOnce).to.be.true;
    expect(deleteKeyStub.firstCall.args[0]).to.equal(KEY_REFERENCE);
    expect(removeFileStub.calledOnce).to.be.true;
    expect(removeFileStub.firstCall.args[0]).to.equal(org.username);
    expect(deleteKeyStub.calledBefore(removeFileStub)).to.be.true;
  });

  it('does not touch the keychain for an authorization without a DPoP key', async () => {
    const org = new MockTestOrgData('00Dxx0000000002EAA', { username: 'bearer@example.com' });
    await $$.stubAuths(org);

    const remover = await AuthRemover.create();
    await remover.removeAuth(org.username);

    expect(deleteKeyStub.called).to.be.false;
    expect(removeFileStub.calledOnce).to.be.true;
  });

  it('keeps a DPoP key that another authorization also uses', async () => {
    const org = new DpopOrg('00Dxx0000000003EAA', { username: 'dpop@example.com' });
    const sharer = new DpopOrg('00Dxx0000000004EAA', { username: 'sharer@example.com' });
    await $$.stubAuths(org, sharer);

    const remover = await AuthRemover.create();
    await remover.removeAuth(org.username);

    expect(deleteKeyStub.called).to.be.false;
    expect(removeFileStub.calledOnce).to.be.true;
    expect(removeFileStub.firstCall.args[0]).to.equal(org.username);
  });

  it('deletes a shared DPoP key along with the last authorization that uses it', async () => {
    const org = new DpopOrg('00Dxx0000000003EAA', { username: 'dpop@example.com' });
    const sharer = new DpopOrg('00Dxx0000000004EAA', { username: 'sharer@example.com' });
    await $$.stubAuths(org, sharer);
    // Drop each removed auth from the cache, as the real OrgAccessor.remove does.
    removeFileStub.callsFake(function (this: OrgAccessor, username: string): Promise<void> {
      // @ts-expect-error because private member
      this.configs.delete(username);
      // @ts-expect-error because private member
      this.contents.delete(username);
      return Promise.resolve();
    });

    const remover = await AuthRemover.create();
    await remover.removeAllAuths();

    expect(removeFileStub.calledTwice).to.be.true;
    expect(deleteKeyStub.calledOnce).to.be.true;
    expect(deleteKeyStub.firstCall.args[0]).to.equal(KEY_REFERENCE);
    expect(deleteKeyStub.firstCall.calledAfter(removeFileStub.firstCall)).to.be.true;
    expect(deleteKeyStub.firstCall.calledBefore(removeFileStub.secondCall)).to.be.true;
  });
});
