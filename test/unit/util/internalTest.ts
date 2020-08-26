/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import { createSandbox } from 'sinon';
import { Messages } from '../../../src/messages';
import { fs } from '../../../src/util/fs';
import { resolveProjectPath, resolveProjectPathSync } from '../../../src/util/internal';

Messages.importMessagesDirectory(__dirname);

describe('util/internal', () => {
  const sandbox = createSandbox();
  afterEach(() => {
    sandbox.restore();
  });
  describe('resolveProjectPath', () => {
    it('finds path', async () => {
      sandbox.stub(fs, 'traverseForFile').resolves('/path');
      expect(await resolveProjectPath()).to.equal('/path');
    });
    it('throws when no path is found', async () => {
      sandbox.stub(fs, 'traverseForFile').resolves(undefined);
      try {
        await resolveProjectPath();
        assert(false, 'should throw');
      } catch (e) {
        expect(e.name).to.equal('InvalidProjectWorkspace');
      }
    });
  });

  describe('resolveProjectPathSync', () => {
    it('finds path', () => {
      sandbox.stub(fs, 'traverseForFileSync').returns('/path');
      expect(resolveProjectPathSync()).to.equal('/path');
    });
    it('throws when no path is found', () => {
      sandbox.stub(fs, 'traverseForFileSync').returns(undefined);
      try {
        resolveProjectPathSync();
        assert(false, 'should throw');
      } catch (e) {
        expect(e.name).to.equal('InvalidProjectWorkspace');
      }
    });
  });
});
