/*
 * Copyright, 1999-2016, salesforce.com
 * All Rights Reserved
 * Company Confidential
 */
'use strict';

import * as Path from 'path';
import { tmpdir as osTmpdir } from 'os';
import { expect } from 'chai';

import { ConfigFile } from '../../../lib/config/configFile';

class TestConfigFile extends ConfigFile {

    public static getTestLocalPath() {
        return Path.join(osTmpdir(), 'local');
    }

    public static getTestGlobalpath() {
        return Path.join(osTmpdir(), 'global');
    }
    constructor(filename: string, isGlobal: boolean = false, isState: boolean = true, filePath: string = '') {
        const rootPath: string = isGlobal ? TestConfigFile.getTestGlobalpath() : TestConfigFile.getTestLocalPath();
        super(rootPath, filename, isGlobal, isState, filePath);
    }
}

describe('ConfigFile', () => {
    describe('instantiation', () => {
        it('not using global has project dir', () => {
            const config = new TestConfigFile('test', false);
            expect(config.getPath()).to.contain(TestConfigFile.getTestLocalPath());
        });
        it('using global does not have project dir', () => {
            const config = new TestConfigFile('test', true);
            expect(config.getPath()).to.not.contain(TestConfigFile.getTestLocalPath());
        });
        it('using state folder for global even when state is set to false', () => {
            const config = new TestConfigFile('test', true, false);
            expect(config.getPath()).to.not.contain(TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
        });
        it('using local state folder', () => {
            const config = new TestConfigFile('test', false, true);
            expect(config.getPath()).to.contain(TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.contain('.sfdx');
        });
        it('using local file', () => {
            const config = new TestConfigFile('test', false, false);
            expect(config.getPath()).to.contain(TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.not.contain('.sfdx');
        });
        it('using local custom folder', () => {
            const config = new TestConfigFile('test', false, false, Path.join('my', 'path'));
            expect(config.getPath()).to.contain(TestConfigFile.getTestLocalPath());
            expect(config.getPath()).to.not.contain('.sfdx');
            expect(config.getPath()).to.contain(Path.join('my', 'path', 'test'));
        });
    });
});
