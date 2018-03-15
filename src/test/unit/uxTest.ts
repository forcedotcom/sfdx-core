/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';

import { Logger } from '../../lib/logger';
import { UX } from '../../lib/ux';
import cli from 'cli-ux';
import { testSetup } from '../testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('UX', () => {
    const sfdxEnv = process.env.SFDX_ENV;

    beforeEach(() => {
        process.env.SFDX_ENV = 'test';
    });

    afterEach(() => {
        process.env.SFDX_ENV = sfdxEnv;
    });

    it('log() should only log to the logger when output IS NOT enabled', () => {
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        $$.SANDBOX.stub(cli, 'log');
        const ux = new UX($$.TEST_LOGGER, false, cli);
        const logMsg = 'test log() 1 for log wrapper';

        const ux1 = ux.log(logMsg);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(logMsg);
        expect(cli.log['called']).to.be.false;
        expect(ux1).to.equal(ux);
    });

    it('log() should log to the logger and stdout when output IS enabled', () => {
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        $$.SANDBOX.stub(cli, 'log');
        const ux = new UX($$.TEST_LOGGER, true, cli);
        const logMsg = 'test log() 2 for log wrapper';

        const ux1 = ux.log(logMsg);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(logMsg);
        expect(cli.log['called']).to.be.true;
        expect(cli.log['firstCall'].args[0]).to.equal(logMsg);
        expect(ux1).to.equal(ux);
    });

    it('logJson() should log to the logger (unformatted) and stdout (formatted)', () => {
        let retVal;
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        const styledJsonGetter = () => (x) => retVal = x;
        $$.SANDBOX.stub(cli, 'styledJSON').get(styledJsonGetter);
        const ux = new UX($$.TEST_LOGGER, true, cli);
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };

        const ux1 = ux.logJson(logMsg);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(logMsg);
        expect(retVal).to.deep.equal(logMsg);
        expect(ux1).to.equal(ux);
    });

    it('errorJson() should log to the logger (logLevel = error) and stderr', () => {
        $$.SANDBOX.stub($$.TEST_LOGGER, 'error');
        $$.SANDBOX.stub(console, 'error');
        const ux = new UX($$.TEST_LOGGER, true, cli);
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };

        ux.errorJson(logMsg);

        expect($$.TEST_LOGGER.error['called']).to.be.true;
        expect($$.TEST_LOGGER.error['firstCall'].args[0]).to.equal(JSON.stringify(logMsg, null, 4));
        expect(console.error['called']).to.be.true;
        expect(console.error['firstCall'].args[0]).to.equal(JSON.stringify(logMsg, null, 4));
    });

    it('error() should only log to the logger (logLevel = error) when output IS NOT enabled', () => {
        $$.SANDBOX.stub($$.TEST_LOGGER, 'error');
        $$.SANDBOX.stub(console, 'error');
        const ux = new UX($$.TEST_LOGGER, false, cli);
        const logMsg = 'test error() 1 for log wrapper';

        ux.error(logMsg);

        expect($$.TEST_LOGGER.error['called']).to.be.true;
        expect($$.TEST_LOGGER.error['firstCall'].args[0]).to.equal(logMsg);
        expect(console.error['called']).to.be.false;
    });

    it('error() should log to the logger (logLevel = error) and stderr when output IS enabled', () => {
        $$.SANDBOX.stub($$.TEST_LOGGER, 'error');
        $$.SANDBOX.stub(console, 'error');
        const ux = new UX($$.TEST_LOGGER, true, cli);
        const logMsg = 'test error() 2 for log wrapper\n';

        ux.error(logMsg);

        expect($$.TEST_LOGGER.error['called']).to.be.true;
        expect($$.TEST_LOGGER.error['firstCall'].args[0]).to.equal(logMsg);
        expect(console.error['called']).to.be.true;
        expect(console.error['firstCall'].args[0]).to.equal(logMsg);
    });

    it('styledObject() should only log to the logger when output IS NOT enabled', () => {
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        $$.SANDBOX.stub(cli, 'styledObject');
        const ux = new UX($$.TEST_LOGGER, false, cli);
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };

        const ux1 = ux.styledObject(logMsg);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(logMsg);
        expect(cli.styledObject['called']).to.be.false;
        expect(ux1).to.equal(ux);
    });

    it('styledObject() should log to the logger and stdout when output IS enabled', () => {
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        $$.SANDBOX.stub(cli, 'styledObject');
        const ux = new UX($$.TEST_LOGGER, true, cli);
        const logMsg = { key1: 'foo', key2: 9, key3: true, key4: [1, 2, 3] };
        const keysToLog = ['key1', 'key2', 'key3'];

        const ux1 = ux.styledObject(logMsg, keysToLog);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(logMsg);
        expect(cli.styledObject['called']).to.be.true;
        expect(cli.styledObject['firstCall'].args[0]).to.equal(logMsg);
        expect(cli.styledObject['firstCall'].args[1]).to.equal(keysToLog);
        expect(ux1).to.equal(ux);
    });

    it('styledHeader() should only log to the logger when output IS NOT enabled', () => {
        let retVal;
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        const styledHeaderGetter = () => (x) => retVal = x;
        $$.SANDBOX.stub(cli, 'styledHeader').get(styledHeaderGetter);
        const ux = new UX($$.TEST_LOGGER, false, cli);
        const logMsg = 'test styledHeader() 1 for log wrapper';

        const ux1 = ux.styledHeader(logMsg);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(logMsg);
        expect(retVal).to.be.undefined;
        expect(ux1).to.equal(ux);
    });

    it('styledHeader() should log to the logger and stdout when output IS enabled', () => {
        let retVal;
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        const styledHeaderGetter = () => (x) => retVal = x;
        $$.SANDBOX.stub(cli, 'styledHeader').get(styledHeaderGetter);
        const ux = new UX($$.TEST_LOGGER, true, cli);
        const logMsg = 'test styledHeader() 2 for log wrapper';

        const ux1 = ux.styledHeader(logMsg);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(logMsg);
        expect(retVal).to.equal(logMsg);
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
        let retVal;
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        const tableGetter = () => (x) => retVal = x;
        $$.SANDBOX.stub(cli, 'table').get(tableGetter);
        const ux = new UX($$.TEST_LOGGER, false, cli);
        const tableData = [
            { foo: 'amazing!', bar: 3, baz: true },
            { foo: 'incredible!', bar: 0, baz: false },
            { foo: 'truly amazing!', bar: 9, baz: true }
        ];

        const ux1 = ux.table(tableData);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(tableData);
        expect(retVal).to.be.undefined;
        expect(ux1).to.equal(ux);
    });

    it('table() should log to the logger and output in table format when output IS enabled with simple column config', () => {
        const retVal: any = {};
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        const tableGetter = () => (x, y) => { retVal.x = x; retVal.y = y; };
        $$.SANDBOX.stub(cli, 'table').get(tableGetter);
        const ux = new UX($$.TEST_LOGGER, true, cli);
        const tableData = [
            { foo: 'amazing!', bar: 3, baz: true },
            { foo: 'incredible!', bar: 0, baz: false },
            { foo: 'truly amazing!', bar: 9, baz: true }
        ];
        const options = ['foo', 'bar', 'baz'];
        const expectedOptions = {
            columns: [
                { key: 'foo', label: 'FOO' },
                { key: 'bar', label: 'BAR' },
                { key: 'baz', label: 'BAZ' }
            ]
        };

        const ux1 = ux.table(tableData, options);

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(tableData);
        expect(retVal.x).to.deep.equal(tableData);
        expect(retVal.y).to.deep.equal(expectedOptions);
        expect(ux1).to.equal(ux);
    });

    it('table() should log to the logger and output in table format when output IS enabled with complex column config', () => {
        const retVal: any = {};
        $$.SANDBOX.stub($$.TEST_LOGGER, 'info');
        const tableGetter = () => (x, y) => { retVal.x = x; retVal.y = y; };
        $$.SANDBOX.stub(cli, 'table').get(tableGetter);
        const ux = new UX($$.TEST_LOGGER, true, cli);
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

        expect($$.TEST_LOGGER.info['called']).to.be.true;
        expect($$.TEST_LOGGER.info['firstCall'].args[0]).to.equal(tableData);
        expect(retVal.x).to.deep.equal(tableData);
        expect(retVal.y).to.deep.equal(options);
        expect(ux1).to.equal(ux);
    });

    describe('warn()', () => {
        after(() => {
            UX.warnings.clear();
        });

        it('warn() should only log to the logger when logLevel > WARN', () => {
            $$.TEST_LOGGER.setLevel('error');
            $$.SANDBOX.stub($$.TEST_LOGGER, 'warn');
            $$.SANDBOX.stub(console, 'warn');
            const ux = new UX($$.TEST_LOGGER, false, cli);
            const logMsg = 'test warn() 1 for log wrapper';

            const ux1 = ux.warn(logMsg);

            expect($$.TEST_LOGGER.warn['called']).to.be.true;
            expect($$.TEST_LOGGER.warn['firstCall'].args[0]).to.equal('WARNING:');
            expect($$.TEST_LOGGER.warn['firstCall'].args[1]).to.equal(logMsg);
            expect(console.warn['called']).to.be.false;
            expect(UX.warnings.size).to.equal(0);
            expect(ux1).to.equal(ux);
        });

        it('warn() should log to the logger and stderr when logLevel <= WARN and output enabled', () => {
            $$.TEST_LOGGER.setLevel('warn');
            $$.SANDBOX.stub($$.TEST_LOGGER, 'warn');
            $$.SANDBOX.stub(console, 'warn');
            const ux = new UX($$.TEST_LOGGER, true, cli);
            const logMsg = 'test warn() 1 for log wrapper\n';

            const ux1 = ux.warn(logMsg);

            expect($$.TEST_LOGGER.warn['called']).to.be.true;
            expect($$.TEST_LOGGER.warn['firstCall'].args[0]).to.equal('WARNING:');
            expect($$.TEST_LOGGER.warn['firstCall'].args[1]).to.equal(logMsg);
            expect(console.warn['called']).to.be.true;
            expect(UX.warnings.size).to.equal(0);
            expect(ux1).to.equal(ux);
        });

        it('warn() should log to the logger and add to warnings Set when logLevel <= WARN and output NOT enabled', () => {
            $$.TEST_LOGGER.setLevel('warn');
            $$.SANDBOX.stub($$.TEST_LOGGER, 'warn');
            $$.SANDBOX.stub(console, 'warn');
            const ux = new UX($$.TEST_LOGGER, false, cli);
            const logMsg = 'test warn() 1 for log wrapper';

            const ux1 = ux.warn(logMsg);

            expect($$.TEST_LOGGER.warn['called']).to.be.true;
            expect($$.TEST_LOGGER.warn['firstCall'].args[0]).to.equal('WARNING:');
            expect($$.TEST_LOGGER.warn['firstCall'].args[1]).to.equal(logMsg);
            expect(console.warn['called']).to.be.false;
            expect(UX.warnings.size).to.equal(1);
            expect(Array.from(UX.warnings)[0]).to.equal(logMsg);
            expect(ux1).to.equal(ux);
        });
    });
});
