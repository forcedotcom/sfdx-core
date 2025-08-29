/*
 * Copyright 2025, Salesforce, Inc.
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
        expect((e as Error).name).to.equal('InvalidProjectWorkspaceError');
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
        expect((e as Error).name).to.equal('InvalidProjectWorkspaceError');
      }
    });
  });
});
