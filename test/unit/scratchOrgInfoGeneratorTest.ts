/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import { AnyJson } from '@salesforce/ts-types';
import { Org } from '../../src/org';
import { Connection } from '../../src/connection';
// import { ScratchOrgInfo } from '../../src/scratchOrgInfoApi';
import { ScratchOrgInfoPayload, getAncestorIds } from '../../src/scratchOrgInfoGenerator';
import { SfdxProjectJson } from '../../src/sfdxProject';

describe('scratchOrgInfoGenerator deprecated', () => {
  const SfdxProjectJsonStub = sinon.createStubInstance(SfdxProjectJson);

  it('getAncestorIds deprecated package2AncestorIds', async () => {
    const hubOrg = new Org({});
    const scratchOrgInfoPayload = {
      package2AncestorIds: 'pkg',
    } as unknown as ScratchOrgInfoPayload;
    try {
      await getAncestorIds(scratchOrgInfoPayload, SfdxProjectJsonStub, hubOrg);
      assert.fail('Expected an error to be thrown.');
    } catch (error) {
      expect(error).to.have.property('name', 'DeprecationError');
    }
  });
});

describe('scratchOrgInfoGenerator empty', () => {
  const SfdxProjectJsonStub = sinon.createStubInstance(SfdxProjectJson);
  SfdxProjectJsonStub.getPackageDirectories.resolves([]);

  it('getAncestorIds empty', async () => {
    const hubOrg = new Org({});
    const scratchOrgInfoPayload = {} as unknown as ScratchOrgInfoPayload;
    const ancestorIds = await getAncestorIds(scratchOrgInfoPayload, SfdxProjectJsonStub, hubOrg);
    expect(ancestorIds).to.equal('');
  });
});

describe('scratchOrgInfoGenerator has ancestorId', () => {
  const sandbox: sinon.SinonSandbox = sinon.createSandbox();
  const hubOrgStub = sinon.createStubInstance(Org);
  const SfdxProjectJsonStub = sinon.createStubInstance(SfdxProjectJson);
  SfdxProjectJsonStub.getPackageDirectories.resolves([
    // Example using the ancestorId number
    {
      path: 'util',
      package: 'Expense Manager - Util',
      versionNumber: '4.7.0.NEXT',
      ancestorId: '04tB0000000cWwnIAE',
    },
    // Example using the ancestorVersion number
    {
      path: 'util',
      package: 'Expense Manager - Util',
      versionNumber: '4.7.0.NEXT',
      ancestorVersion: '4.6.0.1',
    },
    // Example using the package alias
    {
      path: 'util',
      package: 'Expense Manager - Util',
      versionNumber: '4.7.0.NEXT',
      ancestorId: 'expense-manager@4.6.0.1',
    },
  ]);
  SfdxProjectJsonStub.get.callsFake((key: string): AnyJson => {
    switch (key) {
      case 'packageAliases': {
        return {
          'expense-manager@4.6.0.1': 'my-package',
        };
      }
    }
  });
  hubOrgStub.getConnection.returns({
    singleRecordQuery: sinon.stub().callsFake((query, options) => {
      expect(query).to.be.a('string').and.to.have.length.greaterThan(0);
      expect(options).to.have.property('tooling').and.to.equal(true);
      return {
        Id: '04tB0000000cWwnIAE',
      };
    }),
  } as unknown as Connection);

  afterEach(() => {
    sandbox.restore();
  });

  it('getAncestorIds has ancestorId', async () => {
    const scratchOrgInfoPayload = {} as unknown as ScratchOrgInfoPayload;
    const ancestorIds = await getAncestorIds(scratchOrgInfoPayload, SfdxProjectJsonStub, hubOrgStub);
    expect(ancestorIds)
      .to.be.a('string')
      .and.to.have.length.greaterThan(0)
      .and.to.equal('04tB0000000cWwnIAE;my-package');
  });
});
