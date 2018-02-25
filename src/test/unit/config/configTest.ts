/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import * as Path from 'path';
import { expect } from 'chai';

import { Config, ConfigOptions } from '../../../lib/config/config';
import { testSetup } from '../../testSetup';

const $$ = testSetup();

class TestConfig extends Config {

    public static async getTestLocalPath() {
        return $$.localPathRetriever(TestConfig.testId);
    }

    public static async getOptions(filename: string, isGlobal: boolean, isState?: boolean, filePath?: string): Promise<ConfigOptions> {
        return {
            rootFolder: await $$.rootPathRetriever(isGlobal, TestConfig.testId),
            filename,
            isGlobal,
            isState,
            filePath
        };
    }

    private static testId: string = $$.uniqid();
}

describe('Config', () => {
    describe('instantiation', () => {
        it('not using global has project dir', async () => {
            const config: Config = await TestConfig.create(await TestConfig.getOptions('test', false));
            expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
        });
        it('using global does not have project dir', async () => {
            const config = await TestConfig.create(await TestConfig.getOptions('test', true));
            expect(config.getPath()).to.not.contain(await TestConfig.getTestLocalPath());
        });
        it('using state folder for global even when state is set to false', async () => {
            const config = await TestConfig.create(await TestConfig.getOptions('test', true, false));
            expect(config.getPath()).to.not.contain(await TestConfig.getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
        });
        it('using local state folder', async () => {
            const config = await TestConfig.create(await TestConfig.getOptions('test', false, true));
            expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
        });
        it('using local file', async () => {
            const config = await TestConfig.create(await TestConfig.getOptions('test', false, false));
            expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
            expect(config.getPath()).to.not.contain('.sfdx');
        });
        it('using local custom folder', async () => {
            const config = await TestConfig.create(
                await TestConfig.getOptions('test', false, false, Path.join('my', 'path')));
            expect(config.getPath()).to.contain(await TestConfig.getTestLocalPath());
            expect(config.getPath()).to.not.contain('.sfdx');
            expect(config.getPath()).to.contain(Path.join('my', 'path', 'test'));
        });
    });
});
