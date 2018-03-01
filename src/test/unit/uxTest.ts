/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';

import Logger from '../../lib/logger';
import { UX } from '../../lib/ux';
import { CLI } from 'cli-ux';
import chalk from 'chalk';
import { testSetup } from '../testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('UX', () => {
    const sfdxEnv = process.env.SFDX_ENV;

    let logger: Logger;

    beforeEach(() => {
        logger = Logger.create().useMemoryLogging().setLevel();
        process.env.SFDX_ENV = 'test';
    });

    afterEach(() => {
        process.env.SFDX_ENV = sfdxEnv;
    });

    it('log() should only log to the logger when output IS NOT enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'log');
        const ux = new UX(logger, false);
        const logMsg = 'test log() 1 for log wrapper';

        const ux1 = ux.log(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(CLI.prototype.log['called']).to.be.false;
        expect(ux1).to.equal(ux);
    });

    it('log() should log to the logger and stdout when output IS enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'log');
        const ux = new UX(logger);
        const logMsg = 'test log() 2 for log wrapper';

        const ux1 = ux.log(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(CLI.prototype.log['called']).to.be.true;
        expect(CLI.prototype.log['firstCall'].args[0]).to.equal(logMsg);
        expect(ux1).to.equal(ux);
    });

    it('logRaw() should only log to the logger when output IS NOT enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        const ux = new UX(logger, false);
        $$.SANDBOX.stub(ux.stdout, 'write');
        $$.SANDBOX.stub(ux.stderr, 'write');
        const logMsg = 'test logRaw() 1 for log wrapper';

        const ux1 = ux.logRaw(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(ux.stdout.write['called']).to.be.false;
        expect(ux.stderr.write['called']).to.be.false;
        expect(ux1).to.equal(ux);
    });

    it('logRaw() should log to the logger and stdout when output IS enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        const ux = new UX(logger);
        $$.SANDBOX.stub(ux.stdout, 'write');
        $$.SANDBOX.stub(ux.stderr, 'write');
        const logMsg = 'test logRaw() 2 for log wrapper';

        const ux1 = ux.logRaw(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(ux.stderr.write['called']).to.be.false;
        expect(ux.stdout.write['called']).to.be.true;
        expect(ux.stdout.write['firstCall'].args[0]).to.equal(logMsg);
        expect(ux1).to.equal(ux);
    });

    it('logJson() should log to the logger (unformatted) and stdout (formatted)', () => {
        $$.SANDBOX.stub(logger, 'info');
        const ux = new UX(logger);
        $$.SANDBOX.stub(ux, 'styledJSON');
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };

        const ux1 = ux.logJson(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(ux.styledJSON['called']).to.be.true;
        expect(ux.styledJSON['firstCall'].args[0]).to.equal(logMsg);
        expect(ux1).to.equal(ux);
    });

    it('errorJson() should log to the logger (logLevel = error) and stderr', () => {
        $$.SANDBOX.stub(logger, 'error');
        const ux = new UX(logger);
        $$.SANDBOX.stub(ux.stderr, 'log');
        $$.SANDBOX.stub(ux.stdout, 'log');
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };

        ux.errorJson(logMsg);

        expect(logger.error['called']).to.be.true;
        expect(logger.error['firstCall'].args[0]).to.equal(JSON.stringify(logMsg, null, 4));
        expect(ux.stderr.log['called']).to.be.true;
        expect(ux.stdout.log['called']).to.be.false;
        expect(ux.stderr.log['firstCall'].args[0]).to.equal(JSON.stringify(logMsg, null, 4));
    });

    it('error() should only log to the logger (logLevel = error) when output IS NOT enabled', () => {
        $$.SANDBOX.stub(logger, 'error');
        const ux = new UX(logger, false);
        $$.SANDBOX.stub(ux.stderr, 'log');
        $$.SANDBOX.stub(ux.stdout, 'log');
        const logMsg = 'test error() 1 for log wrapper';

        ux.error(logMsg);

        expect(logger.error['called']).to.be.true;
        expect(logger.error['firstCall'].args[0]).to.equal(logMsg);
        expect(ux.stderr.log['called']).to.be.false;
        expect(ux.stdout.log['called']).to.be.false;
    });

    it('error() should log to the logger (logLevel = error) and stderr when output IS enabled', () => {
        $$.SANDBOX.stub(logger, 'error');
        const ux = new UX(logger);
        $$.SANDBOX.stub(ux.stderr, 'log');
        $$.SANDBOX.stub(ux.stdout, 'log');
        const logMsg = 'test error() 2 for log wrapper\n';

        ux.error(logMsg);

        expect(logger.error['called']).to.be.true;
        expect(logger.error['firstCall'].args[0]).to.equal(logMsg);
        expect(ux.stdout.log['called']).to.be.false;
        expect(ux.stderr.log['called']).to.be.true;
        expect(ux.stderr.log['firstCall'].args[0]).to.equal(logMsg);
    });

    it('styledObject() should only log to the logger when output IS NOT enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'styledObject');
        const ux = new UX(logger, false);
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };

        const ux1 = ux.styledObject(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(CLI.prototype.styledObject['called']).to.be.false;
        expect(ux1).to.equal(ux);
    });

    it('styledObject() should log to the logger and stdout when output IS enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'styledObject');
        const ux = new UX(logger);
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };
        const keysToLog = ['key1', 'key2', 'key3'];

        const ux1 = ux.styledObject(logMsg, keysToLog);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(CLI.prototype.styledObject['called']).to.be.true;
        expect(CLI.prototype.styledObject['firstCall'].args[0]).to.equal(logMsg);
        expect(CLI.prototype.styledObject['firstCall'].args[1]).to.equal(keysToLog);
        expect(ux1).to.equal(ux);
    });

    it('styledHeader() should only log to the logger when output IS NOT enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'styledHeader');
        const ux = new UX(logger, false);
        const logMsg = 'test styledHeader() 1 for log wrapper';

        const ux1 = ux.styledHeader(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(CLI.prototype.styledHeader['called']).to.be.false;
        expect(ux1).to.equal(ux);
    });

    it('styledHeader() should log to the logger and stdout when output IS enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'styledHeader');
        const ux = new UX(logger);
        const logMsg = 'test styledHeader() 2 for log wrapper';

        const ux1 = ux.styledHeader(logMsg);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(logMsg);
        expect(CLI.prototype.styledHeader['called']).to.be.true;
        expect(CLI.prototype.styledHeader['firstCall'].args[0]).to.equal(logMsg);
        expect(ux1).to.equal(ux);
    });

    it('formatDeprecationWarning should display a consistent msg with minimal config', () => {
        const depConfig = {
            type: 'command',
            name: 'apex:test:qq',
            version: 42
        };
        const expectedMsg = `The ${depConfig.type} "${depConfig.name}" has been deprecated and will be removed in v${(depConfig.version + 1)}.0 or later.`;
        expect(UX.formatDeprecationWarning(depConfig)).to.equal(expectedMsg);
    });

    it('formatDeprecationWarning should display a custom message', () => {
        const depConfig = {
            messageOverride: 'Don\'t do what Donny Dont does.',
            message: 'Do this instead.'
        };
        const expectedMsg = `${depConfig.messageOverride} ${depConfig.message}`;
        expect(UX.formatDeprecationWarning(depConfig)).to.equal(expectedMsg);
    });

    it('formatDeprecationWarning should display a consistent msg with full config', () => {
        const depConfig = {
            type: 'command',
            name: 'apex:test:qq',
            version: 42,
            to: 'apex.test.pewpew',
            message: 'Need more pew pew, less qq!'
        };
        let expectedMsg = `The ${depConfig.type} "${depConfig.name}" has been deprecated and will be removed in v${(depConfig.version + 1)}.0 or later.`;
        expectedMsg += ` Use "${depConfig.to}" instead. ${depConfig.message}`;
        expect(UX.formatDeprecationWarning(depConfig)).to.equal(expectedMsg);
    });

    it('table() should only log to the logger when output IS NOT enabled', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'table');
        const ux = new UX(logger, false);
        const tableData = [
            { foo: 'amazing!', bar: 3, baz: true },
            { foo: 'incredible!', bar: 0, baz: false },
            { foo: 'truly amazing!', bar: 9, baz: true }
        ];

        const ux1 = ux.table(tableData);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(tableData);
        expect(CLI.prototype.table['called']).to.be.false;
        expect(ux1).to.equal(ux);
    });

    it('table() should log to the logger and output in table format when output IS enabled with simple column config', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'table');
        const ux = new UX(logger);
        const tableData = [
            { foo: 'amazing!', bar: 3, baz: true },
            { foo: 'incredible!', bar: 0, baz: false },
            { foo: 'truly amazing!', bar: 9, baz: true }
        ];
        const options = { columns: ['foo', 'bar', 'baz'] };
        const expectedOptions = {
            columns: [
                { key: 'foo', label: 'FOO' },
                { key: 'bar', label: 'BAR' },
                { key: 'baz', label: 'BAZ' }
            ]
        };

        const ux1 = ux.table(tableData, options);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(tableData);
        expect(CLI.prototype.table['called']).to.be.true;
        expect(CLI.prototype.table['firstCall'].args[0]).to.equal(tableData);
        expect(CLI.prototype.table['firstCall'].args[1]).to.deep.equal(expectedOptions);
        expect(ux1).to.equal(ux);
    });

    it('table() should log to the logger and output in table format when output IS enabled with complex column config', () => {
        $$.SANDBOX.stub(logger, 'info');
        $$.SANDBOX.stub(CLI.prototype, 'table');
        const ux = new UX(logger);
        const tableData = [
            { foo: 'amazing!', bar: 3, baz: true },
            { foo: 'incredible!', bar: 0, baz: false },
            { foo: 'truly amazing!', bar: 9, baz: true }
        ];
        const options = {
            columns: [
                { key: 'foo' },
                { key: 'bar', label: '*** BAR ***', format: (val) => val != null ? val.toString() : '' },
                { key: 'baz', label: 'ZaB' }
            ]
        };
        const expectedOptions = {
            columns: [
                { key: 'foo', label: 'FOO' },
                options.columns[1],
                options.columns[2]
            ]
        };

        const ux1 = ux.table(tableData, options);

        expect(logger.info['called']).to.be.true;
        expect(logger.info['firstCall'].args[0]).to.equal(tableData);
        expect(CLI.prototype.table['called']).to.be.true;
        expect(CLI.prototype.table['firstCall'].args[0]).to.equal(tableData);
        expect(CLI.prototype.table['firstCall'].args[1]).to.deep.equal(expectedOptions);
        expect(ux1).to.equal(ux);
    });

    describe('warn()', () => {
        const chalkEnabled = chalk.enabled;

        before(() => {
            chalk.enabled = false;
        });

        after(() => {
            chalk.enabled = chalkEnabled;
            UX.warnings.clear();
        });

        it('warn() should only log to the logger when logLevel > WARN', () => {
            logger.setLevel('error');
            $$.SANDBOX.stub(logger, 'warn');
            const ux = new UX(logger, false);
            $$.SANDBOX.stub(ux.stderr, 'log');
            $$.SANDBOX.stub(ux.stdout, 'log');
            const logMsg = 'test warn() 1 for log wrapper';

            const ux1 = ux.warn(logMsg);

            expect(logger.warn['called']).to.be.true;
            expect(logger.warn['firstCall'].args[0]).to.equal('WARNING:');
            expect(logger.warn['firstCall'].args[1]).to.equal(logMsg);
            expect(ux.stderr.log['called']).to.be.false;
            expect(ux.stdout.log['called']).to.be.false;
            expect(UX.warnings.size).to.equal(0);
            expect(ux1).to.equal(ux);
        });

        it('warn() should log to the logger and stderr when logLevel <= WARN and output enabled', () => {
            $$.SANDBOX.stub(logger, 'warn');
            const ux = new UX(logger);
            $$.SANDBOX.stub(ux.stderr, 'log');
            $$.SANDBOX.stub(ux.stdout, 'log');
            const logMsg = 'test warn() 1 for log wrapper\n';

            const ux1 = ux.warn(logMsg);

            expect(logger.warn['called']).to.be.true;
            expect(logger.warn['firstCall'].args[0]).to.equal('WARNING:');
            expect(logger.warn['firstCall'].args[1]).to.equal(logMsg);
            expect(ux.stdout.log['called']).to.be.false;
            expect(ux.stderr.log['called']).to.be.true;
            expect(ux.stderr.log['firstCall'].args[0]).to.equal(`WARNING:${logMsg}`);
            expect(UX.warnings.size).to.equal(0);
            expect(ux1).to.equal(ux);
        });

        it('warn() should log to the logger and add to warnings Set when logLevel <= WARN and output NOT enabled', () => {
            $$.SANDBOX.stub(logger, 'warn');
            const ux = new UX(logger, false);
            $$.SANDBOX.stub(ux.stderr, 'log');
            $$.SANDBOX.stub(ux.stdout, 'log');
            const logMsg = 'test warn() 1 for log wrapper';

            const ux1 = ux.warn(logMsg);

            expect(logger.warn['called']).to.be.true;
            expect(logger.warn['firstCall'].args[0]).to.equal('WARNING:');
            expect(logger.warn['firstCall'].args[1]).to.equal(logMsg);
            expect(ux.stdout.log['called']).to.be.false;
            expect(ux.stderr.log['called']).to.be.false;
            expect(UX.warnings.size).to.equal(1);
            expect(Array.from(UX.warnings)[0]).to.equal(logMsg);
            expect(ux1).to.equal(ux);
        });
    });
});
