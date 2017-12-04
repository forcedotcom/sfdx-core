/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';
import { assert, expect } from 'chai';

import { Logger, LoggerLevel, LoggerOptions } from '../../lib/logger';

describe('Logger', () => {
    const sandbox = sinon.sandbox.create();

    afterEach(() => {
        sandbox.restore();
    });

    describe('create', () => {
        it('should register, create and return the root SFDX logger by default', () => {
            sandbox.spy(Logger.prototype, 'addFilter')
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
    })

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
});
