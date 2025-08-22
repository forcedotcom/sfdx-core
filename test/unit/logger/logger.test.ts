/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { expect, config as chaiConfig } from 'chai';
import { isString } from '@salesforce/ts-types';
import { Logger, LoggerLevel, computeLevel } from '../../../src/logger/logger';
import { shouldThrowSync, TestContext } from '../../../src/testSetup';

// NOTE: These tests still use 'await' which is how it use to work and were left to make
// sure we didn't regress the way they were used.

chaiConfig.truncateThreshold = 0;
describe('Logger', () => {
  const $$ = new TestContext();
  const originalEnv = {
    SFDX_ENV: process.env.SFDX_ENV,
    SF_ENV: process.env.SF_ENV,
    SF_LOG_LEVEL: process.env.SF_LOG_LEVEL,
    SF_DISABLE_LOG_FILE: process.env.SF_DISABLE_LOG_FILE,
    SF_LOG_ROTATION_PERIOD: process.env.SF_LOG_ROTATION_PERIOD,
    SF_LOG_ROTATION_COUNT: process.env.SF_LOG_ROTATION_COUNT,
  };

  const cleanEnv = () => Object.keys(originalEnv).map((key) => delete process.env[key]);
  beforeEach(() => {
    cleanEnv();
    process.env.SFDX_ENV = 'test';
    process.env.SF_ENV = 'test';

    // Must restore the globally stubbed Logger.child method here.  Stubbed in testSetup.
    // @ts-expect-error: called is a sinon spy property
    if (Logger.child['restore']) Logger.child['restore']();
  });

  afterEach(() => {
    Logger.destroyRoot();
  });

  after(() => {
    cleanEnv();
    Object.entries(originalEnv)
      .filter(([, value]) => isString(value))
      .map(([key, value]) => {
        process.env[key] = value;
      });
  });

  describe('constructor', () => {
    it('should construct a new named logger', async () => {
      const logger1 = new Logger({ name: 'testLogger', useMemoryLogger: true });
      expect(logger1).to.be.instanceof(Logger);
      expect(logger1.getName()).to.equal('testLogger');
      const logger2 = await Logger.root();
      expect(logger2).to.not.equal(logger1);
    });

    describe('DISABLE_LOG_FILE', () => {
      before(() => {
        process.env.SF_DISABLE_LOG_FILE = 'true';
      });

      it('should construct a new named logger', async () => {
        const logger1 = new Logger({ name: 'testLogger-noop' });
        expect(logger1).to.be.instanceof(Logger);
        // @ts-expect-error testing a private property
        expect(logger1.memoryLogger).to.be.ok;
        expect(logger1.getName()).to.equal('testLogger-noop');
      });
    });
  });

  describe('levels', () => {
    describe('level computation', () => {
      it('should use a matching a level name when passed in', () => {
        expect(computeLevel('error')).to.equal('error');
      });
      it('number passed in matching a level number', () => {
        expect(computeLevel(30)).to.equal('info');
      });
      it('number passed in not matching a level number', () => {
        expect(computeLevel(28)).to.equal('info');
        expect(computeLevel(1)).to.equal('trace');
      });
      it('should use default level when nothing passed in and no env', () => {
        expect(computeLevel()).to.equal('warn');
      });
      it('env var set to a level name', () => {
        process.env.SF_LOG_LEVEL = 'warn';
        expect(computeLevel()).to.equal('warn');
      });
      it('env var set to a level number matching a level number', () => {
        process.env.SF_LOG_LEVEL = '30';
        expect(computeLevel()).to.equal('info');
      });
      it('env var set to a level number not matching a level number', () => {
        process.env.SF_LOG_LEVEL = '28';
        expect(computeLevel()).to.equal('info');
        process.env.SF_LOG_LEVEL = '1';
        expect(computeLevel()).to.equal('trace');
      });
      it('env var set to an invalid level name', () => {
        process.env.SF_LOG_LEVEL = 'goat';
        expect(computeLevel()).to.equal('goat');
      });
      it('should use the env var when env var and value passed in', () => {
        process.env.SF_LOG_LEVEL = 'debug';
        expect(computeLevel('error')).to.equal('debug');
      });
      it('should use the env var when env var and value passed in', () => {
        process.env.SF_LOG_LEVEL = '30';
        expect(computeLevel('error')).to.equal('info');
      });
    });

    it('should set the log level using a number', () => {
      const logger = new Logger({ name: 'testLogger', useMemoryLogger: true });
      logger.setLevel(LoggerLevel.ERROR);
      expect(logger.getLevel()).to.equal(LoggerLevel.ERROR);
      logger.setLevel();
      expect(logger.getLevel()).to.equal(LoggerLevel.WARN);
    });

    it('should set the log level using a string', () => {
      const logger = new Logger({ name: 'testLogger', useMemoryLogger: true });
      logger.setLevel(Logger.getLevelByName('ERROR'));
      expect(logger.getLevel()).to.equal(LoggerLevel.ERROR);
      logger.setLevel(Logger.getLevelByName('warn'));
      expect(logger.getLevel()).to.equal(LoggerLevel.WARN);
    });

    it('should throw an error with an invalid logger level string', async () => {
      try {
        shouldThrowSync(
          () => Logger.getLevelByName('invalid'),
          'should have thrown an error trying to get an invalid level name'
        );
      } catch (err) {
        expect((err as Error).name).to.equal('UnrecognizedLoggerLevelNameError');
      }
    });

    it('should list available level strings', () => {
      expect(Logger.LEVEL_NAMES).to.deep.equal(['trace', 'debug', 'info', 'warn', 'error', 'fatal']);
    });
  });

  describe('shouldLog', () => {
    it('returns correct boolean', () => {
      const logger = new Logger({ name: 'test', useMemoryLogger: true });
      logger.setLevel();
      expect(logger.shouldLog(LoggerLevel.ERROR)).to.be.true;
      expect(logger.shouldLog(LoggerLevel.WARN)).to.be.true;
      expect(logger.shouldLog(LoggerLevel.INFO)).to.be.false;
      logger.setLevel(LoggerLevel.DEBUG);
      expect(logger.shouldLog(LoggerLevel.INFO)).to.be.true;
      expect(logger.shouldLog(LoggerLevel.DEBUG)).to.be.true;
      expect(logger.shouldLog(LoggerLevel.TRACE)).to.be.false;
    });
  });

  describe('root', () => {
    it('should construct the root SF logger', async () => {
      const defaultLogger = await Logger.root();
      expect(defaultLogger).to.be.instanceof(Logger);
      expect(defaultLogger.getName()).to.equal('sf');
      const logger = await Logger.root();
      expect(logger).to.equal(defaultLogger);
    });

    it('should return the same root logger instance', async () => {
      const rootLogger = await Logger.root();
      expect(rootLogger.getName()).to.equal('sf');
      expect(await Logger.root()).to.equal(rootLogger);
    });

    it('should create the root logger if not already created', async () => {
      $$.SANDBOX.spy(Logger, 'root');
      const rootLogger = await Logger.root();
      expect(rootLogger.getName()).to.equal('sf');
      expect(await Logger.root()).to.equal(rootLogger);
      // @ts-expect-error: called is a sinon spy property
      expect(Logger.root['called']).to.be.true;
    });
  });

  describe('child', () => {
    it('should return a child logger instance off the root', async () => {
      const childLoggerName = 'myChildLogger';
      const childLogger = await Logger.child(childLoggerName);
      expect(childLogger).to.be.instanceof(Logger);
      expect(childLogger.getName()).to.equal(`${Logger.ROOT_NAME}:${childLoggerName}`);
    });
  });

  describe('addField', () => {
    it('should add a field to the log record', async () => {
      const logger = await Logger.child('testLogger');
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

  describe('Pino level configuration', () => {
    it('make sure the pino level is set correctly', async () => {
      // When no level is set, the Pino level defaults to INFO.
      // So we set a level lower than INFO to make sure the Pino level is set correctly
      process.env.SF_LOG_LEVEL = 'debug';

      const logger = await Logger.child('childTestLogger');
      logger.trace('This message should NOT appear');
      logger.debug('This message SHOULD appear');
      logger.error('This message SHOULD appear');
      logger.info('This message SHOULD appear');

      // Assert
      const records = logger.getBufferedRecords();
      expect(records).to.have.length(3);
      expect(records[0]).to.have.property('level', LoggerLevel.DEBUG);
      expect(records[1]).to.have.property('level', LoggerLevel.ERROR);
      expect(records[2]).to.have.property('level', LoggerLevel.INFO);
    });
  });
});
