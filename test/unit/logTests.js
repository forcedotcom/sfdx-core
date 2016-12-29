'use strict';

const fs = require('fs');
const path = require('path');

// Third party
const expect = require('chai').expect;
const Promise = require('bluebird');
const sinon = require('sinon');
const heroku = require('heroku-cli-util');

// Local Module
const fs_readFile = Promise.promisify(fs.readFile);
const TestWorkspace = require(path.join(__dirname, '..', 'TestWorkspace'));
const logger = require(path.join(__dirname, '..', '..', 'lib', 'logger'));

const logLineStart = '{"name":"appcloud",';
const infoMsg = 'ZORRO WAS HERE!';
const debugMsg = 'Which is worse: cockroaches or mosquitoes?';
const delay = 100 ; // delay to ensure logs are written

function expectStdout(should) {
    expect(process.stdout.write.called).to.equal(should);
    /* eslint-disable no-console */
    expect(console.log.called).to.equal(should);
    expect(console.error.called).to.equal(false);
    /* eslint-enable no-console */
}

/**
 * Test AppCloud logging functionality.
 */
describe('Logger', () => {
    before(() => {
        heroku.mockConsole(false);

        this.workspace = new TestWorkspace();
        this.logFilePath = path.join(this.workspace.getWorkspacePath(), '.appcloud', 'appcloud.log');
    });
    beforeEach(() => {
        sinon.spy(process.stdout, 'write');
        sinon.spy(console, 'log');
        sinon.spy(console, 'error');

        return logger.enableFileLogging(this.logFilePath);
    });

    after(() => {
        this.workspace.clean();
    });
    afterEach(() => {
        process.stdout.write.restore();
        /* eslint-disable no-console */
        console.log.restore();
        console.error.restore();
        /* eslint-enable no-console */
        logger.reset();
    });

    describe('with default level', () => {
        it('info should not print to file or stdout', () => {
            logger.info(infoMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) =>  {
                expectStdout(false);
                expect(data).to.be.empty;
            });
        });
        it('log should print to stdout but not file', () => {
            logger.log(infoMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) =>  {
                expectStdout(true);
                expect(data).to.be.empty;
            });
        });
        it('error should print to stdout and file', () => {
            logger.error(infoMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) =>  {
                expectStdout(true);

                expect(data).to.match(/^{.*?}(.)?$/gm);
                expect(data).to.contain(logLineStart);
                expect(data).to.contain(infoMsg);
            });
        });
    });

    describe('with info level', () => {
        it('info should print to file but not stdout', () => {
            logger.level('info');
            logger.info(infoMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) =>  {
                expectStdout(false);

                expect(data).to.match(/^{.*?}(.)?$/gm);
                expect(data).to.contain(logLineStart);
                expect(data).to.contain(infoMsg);
            });
        });

        it('info should not print debug message to file or stdout', () => {
            logger.level('info');
            logger.info(infoMsg);
            logger.debug(debugMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) =>  {
                expectStdout(false);

                expect(data).to.match(/^{.*?}(.)?$/gm);
                expect(data).to.contain(logLineStart);
                expect(data).to.contain(infoMsg);
                expect(data).to.not.contain(debugMsg);
            });
        });
    });

    describe('with debug level', () => {
        it('debug should print to file but not stdout', () => {
            logger.level('debug');
            logger.debug(debugMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) =>  {
                expectStdout(false);

                expect(data).to.match(/^{.*?}(.)?$/gm);
                expect(data).to.contain(logLineStart);
                expect(data).to.contain(debugMsg);
            });
        });

        it('info and debug should print to file but not stdout', () => {
            logger.level('debug');
            logger.info(infoMsg);
            logger.debug(debugMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) => {
                expectStdout(false);

                expect(data).to.match(/^{.*?}(.)?$/gm);
                expect(data).to.contain(logLineStart);
                expect(data).to.contain(infoMsg);
                expect(data).to.contain(debugMsg);
            });
        });

        it('child logs to main file', () => {
            logger.level('debug');
            const l = logger.child('myname', { orgId : 'xxx' });
            l.debug(infoMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) => {
                expectStdout(false);

                expect(data).to.match(/^{.*?}(.)?$/gm);
                expect(data).to.contain('Setup \'myname\' logger instance');
                expect(data).to.contain(infoMsg);
                expect(data).to.contain('"childname":"myname"');
                expect(data).to.contain('"orgId":"xxx"');
            });
        });
    });

    it('with different path', () => {
        logger.reset();
        const newPath = path.join(this.workspace.getWorkspacePath(), 'temp', 'not', 'exist', 'my.log');
        return logger.enableFileLogging(newPath, 'info').then(() => {
            logger.info(infoMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(newPath, 'utf8'))
            .then((data) => {
                expectStdout(false);

                expect(data).to.match(/^{.*?}(.)?$/gm);
                expect(data).to.contain(logLineStart);
                expect(data).to.contain(infoMsg);
            });
        });
    });

    describe('serializers', () => {
        it('remove loggers', () => {
            const mockLogger = {
                streams: []
            };
            const config = {
                id: 'zxcv',
                logger: mockLogger
            };
            const l = logger.child('mylog', {
                id: 'asdf',
                shouldShow: true,
                someNumber: 23.2,
                myconfig: config,
                logger: mockLogger,
                myFunc() {}
            });
            l.error(debugMsg);
            return Promise.delay(delay)
            .then(() => fs_readFile(this.logFilePath, 'utf8'))
            .then((data) => {
                expectStdout(true);
                expect(data).to.contain(debugMsg);
                expect(data).to.contain('"id":"asdf"');
                expect(data).to.contain('"shouldShow":true');
                expect(data).to.contain('"someNumber":23.2');
                expect(data).to.not.contain('"id":"zxcv"');
                expect(data).to.not.contain('"myconfig"');
                expect(data).to.not.contain('"logger"');
                expect(data).to.not.contain('"streams"');
            });
        });
    });
});
