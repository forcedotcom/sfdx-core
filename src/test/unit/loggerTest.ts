/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import * as _ from 'lodash';

import { Logger, LoggerLevel } from '../../lib/logger';
import { SfdxUtil } from '../../lib/util';
import { testSetup } from '../testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('Logger', () => {
    const sfdxEnv = process.env.SFDX_ENV;

    beforeEach(() => {
        process.env.SFDX_ENV = 'test';

        // Must restore the globally stubbed Logger.child method here.  Stubbed in testSetup.
        if (Logger.child['restore']) {
            Logger.child['restore']();
        }
    });

    afterEach(() => {
        process.env.SFDX_ENV = sfdxEnv;
    });

    describe('create', () => {
        it('should register, create and return the root SFDX logger by default', () => {
            $$.SANDBOX.spy(Logger.prototype, 'addFilter');
            const defaultLogger = Logger.create();
            expect(defaultLogger).to.be.instanceof(Logger);
            expect(defaultLogger.name).to.equal('sfdx');
            expect(defaultLogger.addFilter['called'], 'Logger.create should have called addFilter()').to.be.true;
            const logger = Logger.get();
            expect(logger).to.deep.equal(defaultLogger);
        });

        it('should register, create and return a new named logger', () => {
            const logger1 = Logger.create('MyPlugin');
            expect(logger1).to.be.instanceof(Logger);
            expect(logger1.name).to.equal('MyPlugin');
            const logger2 = Logger.get('MyPlugin');
            expect(logger2).to.deep.equal(logger1);
        });
    });

    // NOTE: positive get tests done as part of create testing.
    describe('get', () => {
        it('should throw an error when a logger was not registered', () => {
            try {
                Logger.get('unregisteredLogger');
                assert.fail('should have thrown an error for getting an unregistered logger');
            } catch (err) {
                expect(err.message).to.equal('Logger unregisteredLogger not found');
            }
        });
    });

    describe('setLevel', () => {
        it('should set the log level using a number', () => {
            const logger = Logger.create();
            logger.setLevel(LoggerLevel.ERROR);
            expect(logger.level()).to.equal(LoggerLevel.ERROR);
            logger.setLevel();
            expect(logger.level()).to.equal(LoggerLevel.WARN);
        });

        it('should set the log level using a string', () => {
            const logger = Logger.create();
            logger.setLevel('error');
            expect(logger.level()).to.equal(LoggerLevel.ERROR);
            logger.setLevel('WARN');
            expect(logger.level()).to.equal(LoggerLevel.WARN);
        });

        it('should throw an error with an invalid logger level string', () => {
            const logger = Logger.create();

            try {
                logger.setLevel('invalid');
                assert.fail('should have thrown an error trying to set an invalid level string');
            } catch (err) {
                expect(err.message).to.equal('unknown level name: "invalid"');
            }
        });
    });

    describe('shouldLog', () => {
        it('returns correct boolean', () => {
            const logger = Logger.create();
            logger.setLevel();
            expect(logger.shouldLog(LoggerLevel.ERROR)).to.be.true;
            expect(logger.shouldLog(LoggerLevel.WARN)).to.be.true;
            expect(logger.shouldLog(LoggerLevel.INFO)).to.be.false;
            logger.setLevel(LoggerLevel.DEBUG);
            expect(logger.shouldLog(LoggerLevel.INFO)).to.be.true;
            expect(logger.shouldLog(LoggerLevel.DEBUG)).to.be.true;
            expect(logger.shouldLog(LoggerLevel.TRACE)).to.be.false;
            logger.setLevel(7);
            expect(logger.shouldLog(LoggerLevel.TRACE)).to.be.true;
        });
    });

    describe('addLogFileStream', () => {
        const testLogFile = 'some/dir/mylogfile.json';

        let sfdxUtilAccessStub;
        let sfdxUtilMkdirpStub;
        let sfdxUtilWriteFileStub;

        beforeEach(() => {
            sfdxUtilAccessStub = $$.SANDBOX.stub(SfdxUtil, 'access');
            sfdxUtilMkdirpStub = $$.SANDBOX.stub(SfdxUtil, 'mkdirp');
            sfdxUtilWriteFileStub = $$.SANDBOX.stub(SfdxUtil, 'writeFile');
        });

        it('should not create a new log file if it exists already', async () => {
            sfdxUtilAccessStub.returns(Promise.resolve({}));
            const logger = Logger.create();
            const addStreamStub = $$.SANDBOX.stub(logger, 'addStream');
            await logger.addLogFileStream(testLogFile);
            expect(sfdxUtilAccessStub.firstCall.args[0]).to.equal(testLogFile);
            expect(sfdxUtilMkdirpStub.called).to.be.false;
            expect(sfdxUtilWriteFileStub.called).to.be.false;
            const addStreamArgs = addStreamStub.firstCall.args[0];
            expect(addStreamArgs).to.have.property('type', 'file');
            expect(addStreamArgs).to.have.property('path', testLogFile);
            expect(addStreamArgs).to.have.property('level', logger.level());
        });

        it('should create a new log file and all directories if nonexistant', async () => {
            sfdxUtilAccessStub.throws();
            const logger = Logger.create();
            const addStreamStub = $$.SANDBOX.stub(logger, 'addStream');
            await logger.addLogFileStream(testLogFile);
            expect(sfdxUtilAccessStub.firstCall.args[0]).to.equal(testLogFile);
            expect(sfdxUtilMkdirpStub.firstCall.args[0]).to.equal('some/dir');
            expect(sfdxUtilMkdirpStub.firstCall.args[1]).to.have.property('mode', '700');
            expect(sfdxUtilWriteFileStub.firstCall.args[0]).to.equal(testLogFile);
            expect(sfdxUtilWriteFileStub.firstCall.args[1]).to.equal('');
            expect(sfdxUtilWriteFileStub.firstCall.args[2]).to.have.property('mode', '600');
            expect(addStreamStub.called).to.be.true;
        });
    });

    describe('root', () => {
        it('should return the root logger instance', async () => {
            const rootLogger = await Logger.root();
            expect(rootLogger.name).to.equal('sfdx');
            expect(Logger.get()).to.equal(rootLogger);
        });

        it('should create the root logger if not already created', async () => {
            $$.SANDBOX.stub(Logger, 'get').onFirstCall().throws();
            $$.SANDBOX.stub(Logger.prototype, 'addLogFileStream');
            $$.SANDBOX.spy(Logger, 'create');
            const rootLogger = await Logger.root();
            expect(rootLogger.name).to.equal('sfdx');
            Logger.get['restore']();
            expect(Logger.get()).to.equal(rootLogger);
            expect(Logger.create['called']).to.be.true;
            expect(rootLogger.addLogFileStream['called']).to.be.false;
        });
    });

    describe('child', () => {
        it('should return a child logger instance off the root', async () => {
            const childLoggerName = 'myChildLogger';
            const childLogger = await Logger.child(childLoggerName);
            expect(childLogger).to.be.instanceof(Logger);
            expect(childLogger.name).to.equal(childLoggerName);
            const childLogger2 = Logger.get(childLoggerName);
            expect(childLogger2).to.equal(childLogger);
            expect(childLogger.level()).to.equal(Logger.get().level());
        });
    });

    describe('filters', () => {
        const sid = 'SIDHERE!';
        const simpleString = `sid=${sid}`;
        const stringWithObject = ` The rain in Spain: ${JSON.stringify({ access_token : sid })}`;
        const jsforceStringWithToken = `Connection refresh completed. Refreshed access token = ${sid}`;
        const obj1 = { accessToken: `${sid}`, refreshToken: `${sid}` };
        const obj2 = { key: 'Access Token', value: `${sid}` };
        const arr1 = [
            { key: 'ACCESS token ', value: `${sid}` },
            { key: 'refresh  TOKEN', value: `${sid}` },
            { key: 'Sfdx Auth Url', value: `${sid}` }
        ];
        const arr2 = [
            { key: ' AcCESS 78token', value: ` ${sid} ` },
            { key : ' refresh  _TOKEn ', value: ` ${sid} ` },
            { key: ' SfdX__AuthUrl  ', value : ` ${sid} ` }
        ];
        const testLogEntries = [simpleString, stringWithObject, jsforceStringWithToken, obj1, obj2, arr1, arr2];

        async function runTest(logLevel: [string, number]) {
            const logger = (await Logger.child('testLogger')).useMemoryLogging().setLevel(0);

            // Log at the provided log level for each test entry
            testLogEntries.forEach((entry) => logger[logLevel[0]](entry));

            const logData = logger.readLogContentsAsText();
            expect(logData, `Logs should NOT contain '${sid}'`).to.not.contain(sid);
            const logRecords = logger.getBufferedRecords();
            expect(logRecords[0], `expected to log at level: ${logLevel[0]}`).to.have.property('level', logLevel[1]);
        }

        it('should apply for log level: trace', () => {
            return runTest(['trace', 10]);
        });

        it('should apply for log level: debug', () => {
            return runTest(['debug', 20]);
        });

        it('should apply for log level: info', () => {
            return runTest(['info', 30]);
        });

        it('should apply for log level: warn', () => {
            return runTest(['warn', 40]);
        });

        it('should apply for log level: error', () => {
            return runTest(['error', 50]);
        });

        it('should apply for log level: fatal', async () => {
            // logger.fatal() necessarily writes to stderr so stub it here
            $$.SANDBOX.stub(process.stderr, 'write');
            await runTest(['fatal', 60]);
            expect(process.stderr.write['called']).to.be.true;
        });
    });

    describe('addField', () => {
        it('should add a field to the log record', async () => {
            const logger = (await Logger.child('testLogger')).useMemoryLogging();
            logger.addField('newField1', 'stringVal');
            logger.addField('newField2', 9);
            logger.addField('newField3', true);
            logger.debug('this WILL NOT be logged');
            expect(logger.getBufferedRecords()).to.be.an('array').and.empty;
            logger.warn('this WILL be logged');
            const logRecords = logger.getBufferedRecords();
            expect(logRecords).to.be.an('array').with.lengthOf(1);
            expect(logRecords[0]).to.have.property('newField1', 'stringVal');
            expect(logRecords[0]).to.have.property('newField2', 9);
            expect(logRecords[0]).to.have.property('newField3', true);
        });
    });

    describe('serializers', () => {
        it('should run properly after filters are applied', async () => {
            const logger = (await Logger.child('testSerializersLogger')).useMemoryLogging();

            // A test serializer
            logger['serializers'].config = (obj) => _.reduce(obj, (acc, val, key) => {
                    if (_.isString(val) || _.isNumber(val) || _.isBoolean(val)) {
                        acc[key] = val;
                    }
                    return acc;
                }, {});

            logger.warn({ config: { foo: { bar: 1 }, sid: 'secret' } });
            const logRecords = logger.getBufferedRecords();

            // If the serializer was applied it should not log the 'foo' entry
            const msgOnError = 'Expected the config serializer to remove the "foo" entry from the log record ';
            expect(logRecords[0], msgOnError).to.have.deep.property('config', { sid: '<sid - HIDDEN>' });
        });
    });
});
