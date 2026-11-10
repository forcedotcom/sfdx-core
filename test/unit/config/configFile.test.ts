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
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import Path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { expect } from 'chai';

import { assert } from '@salesforce/ts-types';
import lockfileLib from 'proper-lockfile';
import { ConfigFile } from '../../../src/config/configFile';
import { SfError } from '../../../src';
import { shouldThrow, TestContext } from '../../../src/testSetup';

describe('Config', () => {
  const $$ = new TestContext();

  class TestConfig extends ConfigFile<ConfigFile.Options> {
    private static testId = $$.uniqid();

    public static getTestLocalPath() {
      return $$.localPathRetrieverSync(TestConfig.testId);
    }

    public static getOptions(
      filename: string,
      isGlobal: boolean,
      isState?: boolean,
      filePath?: string
    ): ConfigFile.Options {
      return {
        rootFolder: $$.rootPathRetrieverSync(isGlobal, TestConfig.testId),
        filename,
        isGlobal,
        isState,
        filePath,
      };
    }

    public static getFileName() {
      return 'testFileName';
    }
  }

  describe('instantiation', () => {
    it('not using global has project dir', () => {
      const config = new TestConfig(TestConfig.getOptions('test', false));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
    });
    it('using global does not have project dir', () => {
      const config = new TestConfig(TestConfig.getOptions('test', true));
      expect(config.getPath()).to.not.contain(TestConfig.getTestLocalPath());
    });
    it('using state folder for global even when state is set to false', () => {
      const config = new TestConfig(TestConfig.getOptions('test', true, false));
      expect(config.getPath()).to.not.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.contain('.sf');
    });
    it('using local state folder', () => {
      const config = new TestConfig(TestConfig.getOptions('test', false, true));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.contain('.sf');
    });
    it('using local file', () => {
      const config = new TestConfig(TestConfig.getOptions('test', false, false));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.not.contain('.sf');
    });
    it('using local custom folder', () => {
      const config = new TestConfig(TestConfig.getOptions('test', false, false, Path.join('my', 'path')));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.not.contain('.sf');
      expect(config.getPath()).to.contain(Path.join('my', 'path', 'test'));
    });
  });
  describe('creation', () => {
    it('not using global has project dir', async () => {
      const config = await TestConfig.create(TestConfig.getOptions('test', false));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
    });
    it('using global does not have project dir', async () => {
      const config = await TestConfig.create(TestConfig.getOptions('test', true));
      expect(config.getPath()).to.not.contain(TestConfig.getTestLocalPath());
    });
    it('using state folder for global even when state is set to false', async () => {
      const config = await TestConfig.create(TestConfig.getOptions('test', true, false));
      expect(config.getPath()).to.not.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.contain('.sf');
    });
    it('using local state folder', async () => {
      const config = await TestConfig.create(TestConfig.getOptions('test', false, true));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.contain('.sf');
    });
    it('using local file', async () => {
      const config = await TestConfig.create(TestConfig.getOptions('test', false, false));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.not.contain('.sf');
    });
    it('using local custom folder', async () => {
      const config = await TestConfig.create(TestConfig.getOptions('test', false, false, Path.join('my', 'path')));
      expect(config.getPath()).to.contain(TestConfig.getTestLocalPath());
      expect(config.getPath()).to.not.contain('.sf');
      expect(config.getPath()).to.contain(Path.join('my', 'path', 'test'));
    });
  });

  describe('default options', () => {
    it('get applied with passed in options', async () => {
      // Pass in custom options
      const config = await TestConfig.create({ isState: true });
      // Creation doesn't fail with missing file name
      expect(config.getPath()).contains('testFileName');
    });
  });

  describe('fs wrapper methods', () => {
    it('access uses the current path', async () => {
      const accessStub = $$.SANDBOX.stub(fs.promises, 'access');
      const config = await TestConfig.create({ isGlobal: true });
      expect(await config.access()).to.be.true;
      expect(await config.exists()).to.be.true;
      expect(accessStub.calledWith(config.getPath())).to.be.true;
    });
    it('access throws', async () => {
      $$.SANDBOX.stub(fs, 'access').rejects();
      const config = await TestConfig.create({ isGlobal: true });
      expect(await config.access()).to.be.false;
      expect(await config.exists()).to.be.false;
    });
    it('accessSync uses the current path', async () => {
      const accessSyncStub = $$.SANDBOX.stub(fs, 'accessSync');
      const config = await TestConfig.create({ isGlobal: true });
      expect(config.accessSync()).to.be.true;
      expect(config.existsSync()).to.be.true;
      expect(accessSyncStub.calledWith(config.getPath())).to.be.true;
    });
    it('accessSync throws', async () => {
      $$.SANDBOX.stub(fs, 'accessSync').throws();
      const config = await TestConfig.create({ isGlobal: true });
      expect(config.accessSync()).to.be.false;
      expect(config.existsSync()).to.be.false;
    });

    it('stat uses the current path', async () => {
      const statStub = $$.SANDBOX.stub(fs.promises, 'stat');
      const config = await TestConfig.create({ isGlobal: true });
      await config.stat();
      expect(statStub.calledWith(config.getPath())).to.be.true;
    });
    it('stat sync uses the current path', async () => {
      const statSyncStub = $$.SANDBOX.stub(fs, 'statSync');
      const config = await TestConfig.create({ isGlobal: true });
      config.statSync();
      expect(statSyncStub.calledWith(config.getPath())).to.be.true;
    });

    it('unlink uses the current path', async () => {
      const unlinkStub = $$.SANDBOX.stub(fs.promises, 'unlink');
      const config = await TestConfig.create({ isGlobal: true });
      $$.SANDBOX.stub(config, 'exists').resolves(true);
      await config.unlink();
      expect(unlinkStub.calledWith(config.getPath())).to.be.true;
    });
    it('unlink throws if not exist', async () => {
      $$.SANDBOX.stub(fs, 'unlink');
      const config = await TestConfig.create({ isGlobal: true });
      $$.SANDBOX.stub(config, 'exists').resolves(false);
      try {
        await config.unlink();
        assert(false, 'should throw');
      } catch (e) {
        if (!(e instanceof Error)) {
          expect.fail('Expected error to be an instance of Error');
        }
        expect(e.name).to.equal('TargetFileNotFound');
      }
    });
    it('unlink sync uses the current path', async () => {
      const unlinkSyncStub = $$.SANDBOX.stub(fs, 'unlinkSync');
      const config = await TestConfig.create({ isGlobal: true });
      $$.SANDBOX.stub(config, 'existsSync').returns(true);
      config.unlinkSync();
      expect(unlinkSyncStub.calledWith(config.getPath())).to.be.true;
    });
    it('unlinkSync throws if not exist', async () => {
      $$.SANDBOX.stub(fs, 'unlinkSync');
      const config = await TestConfig.create({ isGlobal: true });
      $$.SANDBOX.stub(config, 'existsSync').returns(false);
      try {
        config.unlinkSync();
        assert(false, 'should throw');
      } catch (e) {
        expect((e as Error).name).to.equal('TargetFileNotFound');
      }
    });
  });

  describe('write', () => {
    beforeEach(() => {
      $$.SANDBOXES.CONFIG.restore();
    });
    it('uses passed in contents', async () => {
      $$.SANDBOX.stub(fs.promises, 'readFile').resolves('{}');
      // @ts-expect-error --> we're only mocking on prop of many
      $$.SANDBOX.stub(fs.promises, 'stat').resolves({ mtimeNs: BigInt(Date.now() - 1000 * 60 * 5) });
      $$.SANDBOX.stub(fs.promises, 'mkdir').resolves();
      const lockStub = $$.SANDBOX.stub(lockfileLib, 'lock').resolves(() => Promise.resolve());

      const writeJson = $$.SANDBOX.stub(fs.promises, 'writeFile');

      const config = await TestConfig.create({ isGlobal: true });

      const expected = { test: 'test' };
      config.set('test', 'test');
      const actual = await config.write();
      expect(lockStub.callCount).to.equal(1);
      expect(expected).to.deep.equal(actual);
      expect(expected).to.deep.equal(config.getContents());
      // // expect(mkdirpStub.called).to.be.true;
      expect(writeJson.called).to.be.true;
    });
    it('sync uses passed in contents', async () => {
      $$.SANDBOX.stub(fs, 'readFileSync').returns('{}');
      // @ts-expect-error --> we're only mocking on prop of many
      $$.SANDBOX.stub(fs, 'statSync').returns({ mtimeNs: BigInt(Date.now() - 1000 * 60 * 5) });
      const lockStub = $$.SANDBOX.stub(lockfileLib, 'lockSync').returns(() => undefined);

      const mkdirpStub = $$.SANDBOX.stub(fs, 'mkdirSync');
      const writeJson = $$.SANDBOX.stub(fs, 'writeFileSync');

      const config = await TestConfig.create({ isGlobal: true });

      const expected = { test: 'test' };
      config.set('test', 'test');
      const actual = config.writeSync();
      expect(lockStub.callCount).to.equal(1);
      expect(expected).to.deep.equal(actual);
      expect(expected).to.deep.equal(config.getContents());
      expect(mkdirpStub.called).to.be.true;
      expect(writeJson.called).to.be.true;
    });
  });

  // Regression guard: config-write-loss after the OS sleeps (W-24580998, surfaces as forcedotcom/cli#3667
  // and salesforcedx-vscode#8470: a refresh-token-rotation auth loop / "login rate exceeded" lockout).
  //
  // The bug lived in the OLD nowBigInt(), which was built on globalThis.performance.now() + timeOrigin,
  // a MONOTONIC clock that freezes while the OS is suspended. A process that was asleep stamped its
  // in-memory set() with a timestamp lagging real wall time. ConfigFile.write() reads the on-disk file's
  // real-clock mtimeNs, builds an LWWMap at that timestamp, and merges it into memory. LWWRegister.merge
  // keeps the incoming (file) value whenever its timestamp is strictly greater, so the slept process's
  // fresh value (e.g. a just-refreshed access token) lost to the stale on-disk value and was silently
  // dropped: the next request 401s, refreshes, and the loss repeats until the org locks the user out.
  //
  // The fix moved nowBigInt() onto Date.now() (real wall clock, the same domain as mtimeNs), so the
  // current code never calls performance.now(). These tests therefore GUARD AGAINST A REVERT to the
  // performance.now() implementation: freezing performance.now() ~1h in the past recreates the pre-fix
  // failure, while the file keeps a real-wall-clock mtimeNs. Against the current Date.now()-based code
  // that stub is inert (Date.now() is never stubbed), so these pass. Revert nowBigInt() to the
  // performance.now() version and they go red. No real OS suspend, no flakiness.
  describe('write - frozen performance-clock after OS sleep (W-24580998 regression)', () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    // The file on disk carries a real-wall-clock mtime from ~1s ago (its last legitimate write).
    const realClockMtimeNs = () => BigInt(Date.now() - 1000) * 1_000_000n;

    beforeEach(() => {
      $$.SANDBOXES.CONFIG.restore();
      // Freeze performance.now() ~1h behind real wall time: recreates the pre-fix failure mode if
      // nowBigInt() still used performance.now(). Inert against the current Date.now()-based code.
      $$.SANDBOX.stub(globalThis.performance, 'now').returns(-ONE_HOUR_MS);
    });

    it('does not drop a slept process in-memory write (async)', async () => {
      $$.SANDBOX.stub(fs.promises, 'readFile').resolves('{"token":"old-stale"}');
      // @ts-expect-error we're only mocking one prop of many
      $$.SANDBOX.stub(fs.promises, 'stat').resolves({ mtimeNs: realClockMtimeNs() });
      $$.SANDBOX.stub(fs.promises, 'mkdir').resolves();
      $$.SANDBOX.stub(lockfileLib, 'lock').resolves(() => Promise.resolve());
      $$.SANDBOX.stub(fs.promises, 'writeFile');

      const config = await TestConfig.create({ isGlobal: true });
      config.set('token', 'refreshed'); // the token a slept process just refreshed
      const actual = await config.write();

      // The refreshed value must survive the merge, not revert to the stale on-disk value.
      expect(actual).to.deep.equal({ token: 'refreshed' });
      expect(config.getContents()).to.deep.equal({ token: 'refreshed' });
    });

    it('does not drop a slept process in-memory write (sync)', async () => {
      $$.SANDBOX.stub(fs, 'readFileSync').returns('{"token":"old-stale"}');
      // @ts-expect-error we're only mocking one prop of many
      $$.SANDBOX.stub(fs, 'statSync').returns({ mtimeNs: realClockMtimeNs() });
      $$.SANDBOX.stub(fs, 'mkdirSync');
      $$.SANDBOX.stub(lockfileLib, 'lockSync').returns(() => undefined);
      $$.SANDBOX.stub(fs, 'writeFileSync');

      const config = await TestConfig.create({ isGlobal: true });
      config.set('token', 'refreshed');
      const actual = config.writeSync();

      expect(actual).to.deep.equal({ token: 'refreshed' });
      expect(config.getContents()).to.deep.equal({ token: 'refreshed' });
    });
  });

  // Higher-fidelity companion to the stubbed unit tests above: exercises the REAL filesystem
  // (real file, real stat/mtimeNs, real proper-lockfile, real JSON round-trip). Same revert guard as
  // above: performance.now() is frozen to recreate the pre-fix failure mode, so this stays green on the
  // current Date.now()-based code and goes red only if nowBigInt() reverts to performance.now().
  describe('write - frozen performance-clock after OS sleep, real filesystem (W-24580998 regression)', () => {
    const ONE_HOUR_MS = 60 * 60 * 1000;
    let tmpDir: string;

    beforeEach(async () => {
      $$.SANDBOXES.CONFIG.restore();
      tmpDir = await fs.promises.mkdtemp(Path.join(os.tmpdir(), 'w24580998-'));
      // Frozen performance.now() (see the guard note above), inert against the current Date.now() code.
      $$.SANDBOX.stub(globalThis.performance, 'now').returns(-ONE_HOUR_MS);
    });

    afterEach(async () => {
      await fs.promises.rm(tmpDir, { recursive: true, force: true });
    });

    it('round-trips through a real file without dropping the slept process write', async () => {
      const filename = 'w24580998.json';
      const filePath = Path.join(tmpDir, filename);
      await fs.promises.writeFile(filePath, JSON.stringify({ token: 'old-stale' }));
      // Stamp the file's mtime on the real wall clock, ~1s ago (its last legitimate write).
      const aSecondAgo = new Date(Date.now() - 1000);
      await fs.promises.utimes(filePath, aSecondAgo, aSecondAgo);

      const config = await TestConfig.create({ rootFolder: tmpDir, filename, isGlobal: false, isState: false });
      expect(config.getPath()).to.equal(filePath);

      config.set('token', 'refreshed');
      await config.write();

      const onDisk = JSON.parse(await fs.promises.readFile(filePath, 'utf8')) as Record<string, unknown>;
      expect(onDisk).to.deep.equal({ token: 'refreshed' });
      expect(config.getContents()).to.deep.equal({ token: 'refreshed' });
    });
  });

  describe('read', () => {
    const testFileContentsString = '{"foo":"bar"}';
    const testFileContentsJson = { foo: 'bar' };

    describe('read()', () => {
      let readFileStub: any;
      let config: TestConfig;

      beforeEach(async () => {
        $$.SANDBOXES.CONFIG.restore();
        readFileStub = $$.SANDBOX.stub(fs.promises, 'readFile');
        // @ts-expect-error --> we're only mocking on prop of many
        $$.SANDBOX.stub(fs.promises, 'stat').resolves({ mtimeNs: BigInt(Date.now() - 1000 * 60 * 5) });
      });

      it('caches file contents', async () => {
        readFileStub.resolves(testFileContentsString);
        // TestConfig.create() calls read()
        config = await TestConfig.create(TestConfig.getOptions('test', false, true));
        expect(readFileStub.calledOnce).to.be.true;

        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(config.hasRead).to.be.true;
        expect(config.getContents()).to.deep.equal(testFileContentsJson);

        // Read again.  Stub should still only be called once.
        const contents2 = await config.read(false, false);
        expect(readFileStub.calledOnce).to.be.true;
        expect(contents2).to.deep.equal(testFileContentsJson);
      });

      it('sets contents as empty object when file does not exist', async () => {
        const err = SfError.wrap(new Error());
        err.code = 'ENOENT';
        readFileStub.throws(err);

        config = await TestConfig.create(TestConfig.getOptions('test', false, true));
        expect(readFileStub.calledOnce).to.be.true;

        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(config.hasRead).to.be.true;
        expect(config.getContents()).to.deep.equal({});
      });

      it('throws when file does not exist and throwOnNotFound=true', async () => {
        const err = new Error('not here');
        err.name = 'FileNotFound';
        (err as any).code = 'ENOENT';
        readFileStub.throws(SfError.wrap(err));

        const configOptions = {
          filename: 'test',
          isGlobal: true,
          throwOnNotFound: true,
        };

        try {
          await shouldThrow(TestConfig.create(configOptions));
        } catch (e) {
          expect(e).to.have.property('name', 'FileNotFound');
        }
      });

      it('sets hasRead=false by default', async () => {
        const configOptions = TestConfig.getOptions('test', false, true);
        const testConfig = new TestConfig(configOptions);
        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(testConfig.hasRead).to.be.false;
      });

      it('forces another read of the config file with force=true', async () => {
        readFileStub.resolves(testFileContentsString);
        // TestConfig.create() calls read()
        config = await TestConfig.create(TestConfig.getOptions('test', false, true));
        expect(readFileStub.calledOnce).to.be.true;

        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(config.hasRead).to.be.true;
        expect(config.getContents()).to.deep.equal(testFileContentsJson);

        // Read again.  Stub should now be called twice.
        const contents2 = await config.read(false, true);
        expect(readFileStub.calledTwice).to.be.true;
        expect(contents2).to.deep.equal(testFileContentsJson);
      });
    });

    describe('readSync()', () => {
      let readFileStub: any;
      let config: TestConfig;

      beforeEach(async () => {
        $$.SANDBOXES.CONFIG.restore();
        readFileStub = $$.SANDBOX.stub(fs, 'readFileSync');
        // @ts-expect-error --> we're only mocking on prop of many
        $$.SANDBOX.stub(fs, 'statSync').returns({ mtimeNs: BigInt(Date.now() - 1000 * 60 * 5) });
      });

      it('caches file contents', () => {
        readFileStub.returns(testFileContentsString);
        // TestConfig.create() calls read()
        config = new TestConfig(TestConfig.getOptions('test', false, true));
        expect(readFileStub.calledOnce).to.be.false;

        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(config.hasRead).to.be.false;

        config.readSync(false, false);
        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(config.hasRead).to.be.true;
        expect(config.getContents()).to.deep.equal(testFileContentsJson);

        // Read again.  Stub should still only be called once.
        const contents2 = config.readSync(false, false);
        expect(readFileStub.calledOnce).to.be.true;
        expect(contents2).to.deep.equal(testFileContentsJson);
      });

      it('sets contents as empty object when file does not exist', () => {
        const err = SfError.wrap(new Error());
        err.code = 'ENOENT';
        readFileStub.throws(err);

        config = new TestConfig(TestConfig.getOptions('test', false, true));
        config.readSync();
        expect(readFileStub.calledOnce).to.be.true;

        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(config.hasRead).to.be.true;
        expect(config.getContents()).to.deep.equal({});
      });

      it('throws when file does not exist and throwOnNotFound=true on method call', () => {
        const err = new Error('not here');
        err.name = 'FileNotFound';
        (err as any).code = 'ENOENT';
        readFileStub.throws(SfError.wrap(err));

        const configOptions = {
          filename: 'test',
          isGlobal: true,
          throwOnNotFound: false,
        };

        try {
          // The above config doesn't matter because we don't read on creation and it is overridden in the read method.
          new TestConfig(configOptions).readSync(true);
          assert(false, 'should throw');
        } catch (e) {
          expect(e).to.have.property('name', 'FileNotFound');
        }
      });

      it('forces another read of the config file with force=true', () => {
        readFileStub.returns(testFileContentsString);
        // TestConfig.create() calls read()
        config = new TestConfig(TestConfig.getOptions('test', false, true));
        config.readSync();

        // -> hasRead is protected. Ignore for testing.
        // @ts-expect-error -> hasRead is protected. Ignore for testing.
        expect(config.hasRead).to.be.true;

        // Read again.  Stub should now be called twice.
        const contents2 = config.readSync(false, true);
        expect(readFileStub.calledTwice).to.be.true;
        expect(contents2).to.deep.equal(testFileContentsJson);
      });
    });
  });
});
