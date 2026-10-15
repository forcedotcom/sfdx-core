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
import type { Stats } from 'node:fs';
import * as path from 'node:path';
import { assert, expect } from 'chai';
import { createSandbox, type SinonStub } from 'sinon';
import { fs, setFs } from '../../../src/fs/fs';
import type { VirtualFs } from '../../../src/fs/types';
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

  describe('traverse', () => {
    const file = 'sfdx-project.json';
    const enoent = Object.assign(new Error('not found'), { code: 'ENOENT' });
    let statSyncStub: SinonStub<[filePath: string], Stats>;
    let originalFs: VirtualFs;

    beforeEach(() => {
      originalFs = fs;
      statSyncStub = sandbox.stub<[filePath: string], Stats>().throws(enoent);
      setFs({ ...originalFs, statSync: statSyncStub } as unknown as VirtualFs);
    });

    afterEach(() => {
      setFs(originalFs);
    });

    it('does not probe when a relative start cannot be made absolute', async () => {
      sandbox.stub(process, 'cwd').returns('');

      expect(await traverse.forFile('relative/project', file)).to.be.undefined;
      expect(traverse.forFileSync('relative/project', file)).to.be.undefined;
      expect(statSyncStub.called).to.be.false;
    });

    it('searches an absolute start when cwd is empty', async () => {
      const projectDir = path.join(path.parse(process.cwd()).root, 'dx-project');
      sandbox.stub(process, 'cwd').returns('');
      statSyncStub.withArgs(path.join(projectDir, file)).returns({} as Stats);

      expect(await traverse.forFile(projectDir, file)).to.equal(projectDir);
      expect(statSyncStub.calledOnce).to.be.true;
    });

    it('normalizes a relative start against a valid cwd', async () => {
      const cwd = path.join(path.parse(process.cwd()).root, 'workspace', 'project');
      const relativeStart = path.join('..', 'src');
      const startDir = path.normalize(path.join(cwd, relativeStart));
      const projectDir = path.dirname(startDir);
      sandbox.stub(process, 'cwd').returns(cwd);
      statSyncStub.withArgs(path.join(startDir, file)).throws(enoent);
      statSyncStub.withArgs(path.join(projectDir, file)).returns({} as Stats);

      expect(await traverse.forFile(relativeStart, file)).to.equal(projectDir);
      expect(statSyncStub.callCount).to.equal(2);
    });

    it('checks the platform root only once', () => {
      const root = path.parse(process.cwd()).root;

      expect(traverse.forFileSync(root, file)).to.be.undefined;
      expect(statSyncStub.calledOnceWithExactly(path.join(root, file))).to.be.true;
    });

    it('stops at a UNC share root on Windows', function () {
      if (path.sep !== '\\') {
        this.skip();
      }
      const uncRoot = '\\\\server\\share\\';

      expect(traverse.forFileSync(uncRoot, file)).to.be.undefined;
      expect(statSyncStub.calledOnceWithExactly(path.join(uncRoot, file))).to.be.true;
    });

    it('walks deep paths without recursive calls', () => {
      const root = path.parse(process.cwd()).root;
      const directories = Array.from({ length: 10000 }, () => 'd');
      const startDir = path.join(root, ...directories);

      expect(traverse.forFileSync(startDir, file)).to.be.undefined;
      expect(statSyncStub.callCount).to.equal(directories.length + 1);
    });
  });
});
