/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as Path from 'path';

import { ConfigFile } from '../../../src/config/configFile';
import { testSetup } from '../../../src/testSetup';

const $$ = testSetup();

class TestConfig extends ConfigFile<ConfigFile.Options> {
  public static async getTestLocalPath() {
    return $$.localPathRetriever(TestConfig.testId);
  }

  public static async getOptions(
    filename: string,
    isGlobal: boolean,
    isState?: boolean,
    filePath?: string
  ): Promise<ConfigFile.Options> {
    return {
      rootFolder: await $$.rootPathRetriever(isGlobal, TestConfig.testId),
      filename,
      isGlobal,
      isState,
      filePath
    };
  }

  public static getFileName() {
    return 'testFileName';
  }

  private static testId: string = $$.uniqid();

  public constructor(options: ConfigFile.Options) {
    super(options);
    options.filename = TestConfig.getFileName();
  }
}

describe('Config', () => {
  describe('instantiation', () => {
    it('not using global has project dir', async () => {
      const config = await TestConfig.create(
        await TestConfig.getOptions('test', false)
      );
      expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
    });
    it('using global does not have project dir', async () => {
      const config = await TestConfig.create(
        await TestConfig.getOptions('test', true)
      );
      expect(config.getPath()).to.not.contain(
        await TestConfig.getTestLocalPath()
      );
    });
    it('using state folder for global even when state is set to false', async () => {
      const config = await TestConfig.create(
        await TestConfig.getOptions('test', true, false)
      );
      expect(config.getPath()).to.not.contain(
        await TestConfig.getTestLocalPath()
      );
      expect(config.getPath()).to.contain('.sfdx');
    });
    it('using local state folder', async () => {
      const config = await TestConfig.create(
        await TestConfig.getOptions('test', false, true)
      );
      expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
      expect(config.getPath()).to.contain('.sfdx');
    });
    it('using local file', async () => {
      const config = await TestConfig.create(
        await TestConfig.getOptions('test', false, false)
      );
      expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
      expect(config.getPath()).to.not.contain('.sfdx');
    });
    it('using local custom folder', async () => {
      const config = await TestConfig.create(
        await TestConfig.getOptions(
          'test',
          false,
          false,
          Path.join('my', 'path')
        )
      );
      expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
      expect(config.getPath()).to.not.contain('.sfdx');
      expect(config.getPath()).to.contain(Path.join('my', 'path', 'test'));
    });
  });

  describe('default options', () => {
    it(' get applied with passed in options', async () => {
      // Pass in custom options
      const config = await TestConfig.create({ isState: true });
      // Creation doesn't fail with missing file name
      expect(config.getPath()).contains('testFileName');
    });
  });
});
