/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { isBoolean, isNumber, isString } from '@salesforce/ts-types';
import { assert, expect } from 'chai';
import * as debug from 'debug';
import * as _ from 'lodash';
import { Logger, LoggerFormat, LoggerLevel, LoggerStream } from '../../src/logger';
import { testSetup } from '../../src/testSetup';
import { fs } from '../../src/util/fs';

// Setup the test environment.
const $$ = testSetup();

// NOTE: These tests still use 'await' which is how it use to work and were left to make
// sure we didn't regress the way they were used.

describe('Logger', () => {
  const sfdxEnv = process.env.SFDX_ENV;

  beforeEach(async () => {
    process.env.SFDX_ENV = 'test';

    // Must restore the globally stubbed Logger.child method here.  Stubbed in testSetup.
    if (Logger.child['restore']) {
      Logger.child['restore']();
    }
  });

  afterEach(() => {
    Logger.destroyRoot();
    process.env.SFDX_ENV = sfdxEnv;
  });

  describe('constructor', () => {
    it('should construct a new named logger', async () => {
      const logger1 = new Logger('testLogger');
      expect(logger1).to.be.instanceof(Logger);
      expect(logger1.getName()).to.equal('testLogger');
      const logger2 = await Logger.root();
      expect(logger2).to.not.equal(logger1);
    });
  });

  describe('levels', () => {
    it('should set the log level using a number', () => {
      const logger = new Logger('testLogger');
      logger.setLevel(LoggerLevel.ERROR);
      expect(logger.getLevel()).to.equal(LoggerLevel.ERROR);
      logger.setLevel();
      expect(logger.getLevel()).to.equal(LoggerLevel.WARN);
    });

    it('should set the log level using a string', () => {
      const logger = new Logger('testLogger');
      logger.setLevel(Logger.getLevelByName('ERROR'));
      expect(logger.getLevel()).to.equal(LoggerLevel.ERROR);
      logger.setLevel(Logger.getLevelByName('warn'));
      expect(logger.getLevel()).to.equal(LoggerLevel.WARN);
    });

    it('should throw an error with an invalid logger level string', () => {
      try {
        Logger.getLevelByName('invalid');
        assert.fail('should have thrown an error trying to get an invalid level name');
      } catch (err) {
        expect(err.name).to.equal('UnrecognizedLoggerLevelNameError');
      }
    });

    it('should list available level strings', () => {
      expect(Logger.LEVEL_NAMES).to.deep.equal(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
    });
  });

  describe('shouldLog', () => {
    it('returns correct boolean', () => {
      const logger = new Logger('test');
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

    let utilAccessStub;
    let utilMkdirpStub;
    let utilWriteFileStub;

    beforeEach(() => {
      utilAccessStub = $$.SANDBOX.stub(fs, 'access');
      utilMkdirpStub = $$.SANDBOX.stub(fs, 'mkdirp');
      utilWriteFileStub = $$.SANDBOX.stub(fs, 'writeFile');
    });

    it('should not create a new log file if it exists already', async () => {
      utilAccessStub.returns(Promise.resolve({}));
      const logger = new Logger('test');
      const addStreamStub = $$.SANDBOX.stub(logger, 'addStream');
      await logger.addLogFileStream(testLogFile);
      expect(utilAccessStub.firstCall.args[0]).to.equal(testLogFile);
      expect(utilMkdirpStub.called).to.be.false;
      expect(utilWriteFileStub.called).to.be.false;
      const addStreamArgs = addStreamStub.firstCall.args[0];
      expect(addStreamArgs).to.have.property('type', 'file');
      expect(addStreamArgs).to.have.property('path', testLogFile);
      expect(addStreamArgs).to.have.property('level', logger.getLevel());
    });

    it('should create a new log file and all directories if nonexistent', async () => {
      utilAccessStub.throws();
      const logger = new Logger('testLogger');
      const addStreamStub = $$.SANDBOX.stub(logger, 'addStream');
      await logger.addLogFileStream(testLogFile);
      expect(utilAccessStub.firstCall.args[0]).to.equal(testLogFile);
      expect(utilMkdirpStub.firstCall.args[0]).to.equal('some/dir');
      expect(utilMkdirpStub.firstCall.args[1]).to.have.property('mode', '700');
      expect(utilWriteFileStub.firstCall.args[0]).to.equal(testLogFile);
      expect(utilWriteFileStub.firstCall.args[1]).to.equal('');
      expect(utilWriteFileStub.firstCall.args[2]).to.have.property('mode', '600');
      expect(addStreamStub.called).to.be.true;
    });
  });

  describe('root', () => {
    it('should construct the root SFDX logger', async () => {
      $$.SANDBOX.spy(Logger.prototype, 'addFilter');
      const defaultLogger = await Logger.root();
      expect(defaultLogger).to.be.instanceof(Logger);
      expect(defaultLogger.getName()).to.equal('sfdx');
      expect(defaultLogger.addFilter['called'], 'new Logger() should have called addFilter()').to.be.true;
      const logger = await Logger.root();
      expect(logger).to.equal(defaultLogger);
    });

    it('should return the same root logger instance', async () => {
      const rootLogger = await Logger.root();
      expect(rootLogger.getName()).to.equal('sfdx');
      expect(await Logger.root()).to.equal(rootLogger);
    });

    it('should create the root logger if not already created', async () => {
      $$.SANDBOX.stub(Logger.prototype, 'addLogFileStream');
      $$.SANDBOX.spy(Logger, 'root');
      const rootLogger = await Logger.root();
      expect(rootLogger.getName()).to.equal('sfdx');
      expect(await Logger.root()).to.equal(rootLogger);
      expect(Logger.root['called']).to.be.true;
      expect(rootLogger.addLogFileStream['called']).to.be.false;
    });

    it('should log uncaught exception in root logger', async () => {
      process.env.SFDX_ENV = 'dev';

      const rootLogger = await Logger.root();
      $$.SANDBOX.stub(rootLogger, 'fatal');

      // @ts-ignore to access private property `lifecycle` for testing uncaughtException
      Logger.lifecycle.emit('uncaughtException', 'testException');
      expect(rootLogger.fatal['called']).to.be.true;
    });
  });

  describe('child', () => {
    it('should return a child logger instance off the root', async () => {
      const childLoggerName = 'myChildLogger';
      const childLogger = await Logger.child(childLoggerName);
      expect(childLogger).to.be.instanceof(Logger);
      expect(childLogger.getName()).to.equal(childLoggerName);
    });

    it('should not log uncaught exception in child logger', async () => {
      process.env.SFDX_ENV = 'dev';

      const childLoggerName = 'myChildLogger';
      const childLogger = await Logger.child(childLoggerName);
      $$.SANDBOX.stub(childLogger, 'fatal');

      // @ts-ignore to access private property `lifecycle` for testing uncaughtException
      Logger.lifecycle.emit('uncaughtException', 'testException');
      expect(childLogger.fatal['called']).to.be.false;
    });
  });

  describe('debugCallback', () => {
    it('should log', async () => {
      const logger = (await Logger.child('testLogger')).useMemoryLogging();
      logger.setLevel(LoggerLevel.DEBUG);
      const FOO = 'foo';
      const BAR = 'bar';
      const spy = $$.SANDBOX.spy(() => [FOO, BAR]);
      logger.debugCallback(spy);
      expect(spy.callCount).to.be.equal(1);
      expect(logger.readLogContentsAsText()).to.include(FOO).and.to.include(BAR);
    });

    it("shouldn't log", async () => {
      const logger = (await Logger.child('testLogger')).useMemoryLogging();
      const fooSpy = $$.SANDBOX.spy(() => 'FOO');
      const cbSpy = $$.SANDBOX.spy(() => `${fooSpy()}`);
      logger.debugCallback(cbSpy);
      expect(fooSpy.callCount).to.be.equal(0);
      expect(cbSpy.callCount).to.be.equal(0);
    });
  });

  describe('filters', () => {
    const sid = '00D55000000M2qA!AQ0AQHg3LnYDOyobmH07';
    const simpleString = `sid=${sid}`;
    const stringWithObject = ` The rain in Spain: ${JSON.stringify({
      // eslint-disable-next-line camelcase
      access_token: sid,
    })}`;
    const obj1 = { accessToken: `${sid}`, refreshToken: `${sid}` };
    const obj2 = { key: 'Access Token', value: `${sid}` };
    const arr1 = [
      { key: 'ACCESS token ', value: `${sid}` },
      { key: 'refresh  TOKEN', value: `${sid}` },
      { key: 'Sfdx Auth Url', value: `${sid}` },
    ];
    const arr2 = [
      { key: ' AcCESS 78token', value: ` ${sid} ` },
      { key: ' refresh  _TOKEn ', value: ` ${sid} ` },
      { key: ' SfdX__AuthUrl  ', value: ` ${sid} ` },
    ];
    const testLogEntries = [simpleString, stringWithObject, obj1, obj2, arr1, arr2];

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
      logger.getBunyanLogger().serializers.config = (obj) =>
        _.reduce(
          obj,
          (acc, val, key) => {
            if (isString(val) || isNumber(val) || isBoolean(val)) {
              acc[key] = val;
            }
            return acc;
          },
          {}
        );

      logger.warn({ config: { foo: { bar: 1 }, sid: 'secret' } });
      const logRecords = logger.getBufferedRecords();

      // If the serializer was applied it should not log the 'foo' entry
      const msgOnError = 'Expected the config serializer to remove the "foo" entry from the log record ';
      expect(logRecords[0], msgOnError).to.have.deep.property('config', {
        sid: '<sid - HIDDEN>',
      });
    });
  });

  describe('debug lib', () => {
    let output;
    beforeEach(() => {
      Logger.destroyRoot();
      // @ts-ignore enable debug logging
      debug.useColors = () => false;
      debug.enable('*');
      output = '';
    });

    afterEach(() => {
      debug.enable('');
    });

    it('should use root in output', async () => {
      // Do this in the test because we want normal mocha output
      const out = $$.SANDBOX.stub(process.stdout, 'write');
      const err = $$.SANDBOX.stub(process.stderr, 'write').callsFake((error) => {
        return (output += error);
      });
      const logger = await Logger.root();
      expect(logger.debugEnabled).to.equal(true);
      logger.warn('warn');
      out.restore();
      err.restore();
      expect(output).to.contain('sfdx:core WARN warn');
    });

    it('should use child name in output', async () => {
      // Do this in the test because we want normal mocha output
      const out = $$.SANDBOX.stub(process.stdout, 'write');
      const err = $$.SANDBOX.stub(process.stderr, 'write').callsFake((error) => {
        return (output += error);
      });
      const logger = (await Logger.root()).child('test');
      logger.warn('warn');
      out.restore();
      err.restore();
      expect(output).to.contain('sfdx:test WARN warn');
    });

    it('should include higher level', async () => {
      // Do this in the test because we want normal mocha output
      const out = $$.SANDBOX.stub(process.stdout, 'write');
      const err = $$.SANDBOX.stub(process.stderr, 'write').callsFake((error) => {
        return (output += error);
      });
      const logger = await Logger.root();
      // Logger is debug by default. Debug is lower than info.
      logger.info('info');
      out.restore();
      err.restore();
      expect(output).to.contain('sfdx:core INFO info');
    });

    it('should not include lower level', async () => {
      // Do this in the test because we want normal mocha output
      const out = $$.SANDBOX.stub(process.stdout, 'write');
      const err = $$.SANDBOX.stub(process.stderr, 'write').callsFake((error) => {
        return (output += error);
      });
      const logger = await Logger.root();
      logger.setLevel(LoggerLevel.FATAL);
      logger.info('info');
      out.restore();
      err.restore();
      expect(output).to.not.contain('sfdx:core INFO info');
    });
  });

  describe('addStream', () => {
    it('should transform to logfmt streams', () => {
      let output = '';

      // @ts-ignore
      const out = $$.SANDBOX.stub(process.stdout, 'write').callsFake((info) => {
        return (output += info);
      });

      const testStream: LoggerStream = {
        name: 'test stream',
        level: LoggerLevel.INFO,
        stream: process.stdout,
      };

      const testLogger = new Logger({ name: 'testLogger', format: LoggerFormat.LOGFMT });
      testLogger.addStream(testStream);
      testLogger.addField('container_id', '1234567890');

      testLogger.info('info');
      out.restore();

      expect(output).to.contain('msg=info');
      expect(output).to.contain('container_id=1234567890');
    });

    it('should wrap LogFmt message with quotes', () => {
      let output = '';

      // @ts-ignore
      const out = $$.SANDBOX.stub(process.stdout, 'write').callsFake((info) => {
        return (output += info);
      });

      const testStream: LoggerStream = {
        name: 'test stream',
        level: LoggerLevel.INFO,
        stream: process.stdout,
      };

      const testLogger = new Logger({ name: 'testLogger', format: LoggerFormat.LOGFMT });
      testLogger.addStream(testStream);

      testLogger.info('some long message with white space in between');
      out.restore();

      expect(output).to.contain('msg="some long message with white space in between"');
    });
  });
});
