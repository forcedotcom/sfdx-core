/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import * as Path from 'path';
import { expect } from 'chai';

import { Config } from '../../../lib/config/configFile';
import { testSetup } from '../../testSetup';

const $$ = testSetup();

class TestConfigFile extends Config {

    public static async getTestLocalPath() {
        return $$.localPathRetriever(TestConfigFile.testId);
    }

    public static async getTestGlobalpath() {
        return $$.globalPathRetriever(TestConfigFile.testId);
    }

    public static async create(filename: string, isGlobal: boolean, isState?: boolean, filePath?: string): Promise<Config> {
        const rootPath: string = isGlobal ? await TestConfigFile.getTestGlobalpath() : await TestConfigFile.getTestLocalPath();
        return new TestConfigFile(rootPath, filename, isGlobal, isState, filePath);
    }

    private static testId: string = $$.uniqid();

    private constructor(rootPath: string, filename: string, isGlobal: boolean = false, isState: boolean = true, filePath: string = '') {
        super(rootPath, filename, isGlobal, isState, filePath);
    }
}

describe('Config', () => {
    describe('instantiation', () => {
        it('not using global has project dir', async () => {
            const config: Config = await TestConfigFile.create('test', false);
            expect(config.getPath()).to.contain(await TestConfigFile.getTestLocalPath());
        });
        it('using global does not have project dir', async () => {
            const config = await TestConfigFile.create('test', true);
            expect(config.getPath()).to.not.contain(await TestConfigFile.getTestLocalPath());
        });
        it('using state folder for global even when state is set to false', async () => {
            const config = await TestConfigFile.create('test', true, false);
            expect(config.getPath()).to.not.contain(await TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
        });
        it('using local state folder', async () => {
            const config = await TestConfigFile.create('test', false, true);
            expect(config.getPath()).to.contain(await TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
        });
        it('using local file', async () => {
            const config = await TestConfigFile.create('test', false, false);
            expect(config.getPath()).to.contain(await TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.not.contain('.sfdx');
        });
        it('using local custom folder', async () => {
            const config = await TestConfigFile.create('test', false, false, Path.join('my', 'path'));
            expect(config.getPath()).to.contain(await TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.not.contain('.sfdx');
            expect(config.getPath()).to.contain(Path.join('my', 'path', 'test'));
        });
    });
});
