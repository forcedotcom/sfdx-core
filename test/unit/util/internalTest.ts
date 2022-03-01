/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import { createSandbox } from 'sinon';
import { Messages } from '../../../src/messages';
import { resolveProjectPath, resolveProjectPathSync, traverse } from '../../../src/util/internal';

Messages.importMessagesDirectory(__dirname);

describe('util/internal', () => {
  const sandbox = createSandbox();
  afterEach(() => {
    sandbox.restore();
  });
  describe('resolveProjectPath', () => {
    it('finds path', async () => {
      sandbox.stub(traverse, 'forFile').resolves('/path');
      expect(await resolveProjectPath()).to.equal('/path');
    });
    it('throws when no path is found', async () => {
      sandbox.stub(traverse, 'forFile').resolves(undefined);
      try {
        await resolveProjectPath();
        assert(false, 'should throw');
      } catch (e) {
        expect(e.name).to.equal('InvalidProjectWorkspaceError');
      }
    });
  });

  describe('resolveProjectPathSync', () => {
    it('finds path', () => {
      sandbox.stub(traverse, 'forFileSync').returns('/path');
      expect(resolveProjectPathSync()).to.equal('/path');
    });
    it('throws when no path is found', () => {
      sandbox.stub(traverse, 'forFileSync').returns(undefined);
      try {
        resolveProjectPathSync();
        assert(false, 'should throw');
      } catch (e) {
        expect(e.name).to.equal('InvalidProjectWorkspaceError');
      }
    });
  });
});
