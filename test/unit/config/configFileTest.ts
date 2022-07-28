/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as Path from 'path';
import * as fs from 'fs';
import { expect } from 'chai';

import { assert } from '@salesforce/ts-types';
import { ConfigFile } from '../../../src/config/configFile';
import { SfError } from '../../../src/exported';
import { shouldThrow, testSetup } from '../../../src/testSetup';

const $$ = testSetup();

class TestConfig extends ConfigFile<ConfigFile.Options> {
  private static testId: string = $$.uniqid();

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

describe('Config', () => {
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
        expect(e.name).to.equal('TargetFileNotFound');
      }
    });
  });

  describe('write', () => {
    beforeEach(() => {
      $$.SANDBOXES.CONFIG.restore();
    });
    it('uses passed in contents', async () => {
      // const mkdirpStub = $$.SANDBOX.stub(mkdirp, 'native');
      const writeJson = $$.SANDBOX.stub(fs.promises, 'writeFile');

      const config = await TestConfig.create({ isGlobal: true });

      const expected = { test: 'test' };
      const actual = await config.write(expected);
      expect(expected).to.equal(actual);
      expect(expected).to.equal(config.getContents());
      // expect(mkdirpStub.called).to.be.true;
      expect(writeJson.called).to.be.true;
    });
    it('sync uses passed in contents', async () => {
      const mkdirpStub = $$.SANDBOX.stub(fs, 'mkdirSync');
      const writeJson = $$.SANDBOX.stub(fs, 'writeFileSync');

      const config = await TestConfig.create({ isGlobal: true });

      const expected = { test: 'test' };
      const actual = config.writeSync(expected);
      expect(expected).to.equal(actual);
      expect(expected).to.equal(config.getContents());
      expect(mkdirpStub.called).to.be.true;
      expect(writeJson.called).to.be.true;
    });
  });
  const testFileContentsString = '{"foo":"bar"}';
  const testFileContentsJson = { foo: 'bar' };

  describe('read()', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let readFileStub: any;
    let config: TestConfig;

    beforeEach(async () => {
      $$.SANDBOXES.CONFIG.restore();
      readFileStub = $$.SANDBOX.stub(fs.promises, 'readFile');
    });

    it('caches file contents', async () => {
      readFileStub.resolves(testFileContentsString);
      // TestConfig.create() calls read()
      config = await TestConfig.create(TestConfig.getOptions('test', false, true));
      expect(readFileStub.calledOnce).to.be.true;

      // @ts-ignore -> hasRead is protected. Ignore for testing.
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

      // @ts-ignore -> hasRead is protected. Ignore for testing.
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
      // @ts-ignore -> hasRead is protected. Ignore for testing.
      expect(testConfig.hasRead).to.be.false;
    });

    it('forces another read of the config file with force=true', async () => {
      readFileStub.resolves(testFileContentsString);
      // TestConfig.create() calls read()
      config = await TestConfig.create(TestConfig.getOptions('test', false, true));
      expect(readFileStub.calledOnce).to.be.true;

      // @ts-ignore -> hasRead is protected. Ignore for testing.
      expect(config.hasRead).to.be.true;
      expect(config.getContents()).to.deep.equal(testFileContentsJson);

      // Read again.  Stub should now be called twice.
      const contents2 = await config.read(false, true);
      expect(readFileStub.calledTwice).to.be.true;
      expect(contents2).to.deep.equal(testFileContentsJson);
    });
  });

  describe('readSync()', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let readFileStub: any;
    let config: TestConfig;

    beforeEach(async () => {
      $$.SANDBOXES.CONFIG.restore();
      readFileStub = $$.SANDBOX.stub(fs, 'readFileSync');
    });

    it('caches file contents', () => {
      readFileStub.returns(testFileContentsString);
      // TestConfig.create() calls read()
      config = new TestConfig(TestConfig.getOptions('test', false, true));
      expect(readFileStub.calledOnce).to.be.false;

      // @ts-ignore -> hasRead is protected. Ignore for testing.
      expect(config.hasRead).to.be.false;

      config.readSync(false, false);
      // @ts-ignore -> hasRead is protected. Ignore for testing.
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

      // @ts-ignore -> hasRead is protected. Ignore for testing.
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
      // @ts-ignore
      expect(config.hasRead).to.be.true;

      // Read again.  Stub should now be called twice.
      const contents2 = config.readSync(false, true);
      expect(readFileStub.calledTwice).to.be.true;
      expect(contents2).to.deep.equal(testFileContentsJson);
    });
  });
});
