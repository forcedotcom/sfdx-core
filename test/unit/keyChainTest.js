/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const chai = require('chai');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..', '..');
const keyChain = require(path.join(root, 'lib', 'keyChain.js'));

describe('keyChain Tests', () => {

    describe('keychain program file issues', () => {

        it('File not found', () => {
            chai.expect(keyChain.validateProgram.bind(null, `/foo/bar/${Date.now()}`, fs)).to.throw(Error)
                .and.have.property('name', 'CantFindCredentialProgram');
        });

        it('File not executable', () => {

            const fsImpl = {
                statSync() {
                    return {
                        mode: 1, gid: 1, uid: 1
                    };
                }
            };

            chai.expect(
                keyChain.validateProgram.bind(null, `/foo/bar/${Date.now()}`, fsImpl, () => false))
                    .to.throw(Error).and.have.property('name', 'CantExecuteError');
        });
    });

    describe('service account attribute dependency Tests', () => {
        it('Null service', () => {

            const callback = (err) => {
                chai.expect(err).to.have.property('name', 'ServiceRequired');
            };
            keyChain[keyChain.platforms.DARWIN].getPassword({}, callback);
            keyChain[keyChain.platforms.DARWIN].setPassword({}, callback);
        });

        it('Null account', () => {

            const callback = (err) => {
                chai.expect(err).to.have.property('name', 'AccountRequired');
            };
            keyChain[keyChain.platforms.DARWIN].getPassword({ service: 'venkman' }, callback);
            keyChain[keyChain.platforms.DARWIN].setPassword({ service: 'venkman' }, callback);
        });
    });

    describe('setPassword', () => {
        it('Null password', () => {

            const callback = (err) => {
                chai.expect(err).to.have.property('name', 'PasswordRequired');
            };

            keyChain[keyChain.platforms.DARWIN].setPassword({ service: 'venkman', account: 'spengler' }, callback);
        });
    });

    describe('OS Tests', () => {

        const keyChainOptions = { service: 'venkman', account: 'spengler', password: 'keymaster' };

        const _testForPlatform = function (done) {
            chai.expect(this.platformImpl).not.to.be.null;
            chai.expect(this.platformImpl).not.to.be.undefined;
            done();
        };

        const _getCommandFunc = function (done) {

            const testFunc = function(pgmPath, options) {
                chai.expect(pgmPath).to.equal(this.platformImpl.osImpl.program);
                chai.expect(options).to.include(keyChainOptions.service).and.to.include(keyChainOptions.account);
            };

            this.platformImpl.osImpl.getCommandFunc(keyChainOptions, testFunc.bind(this));
            done();
        };

        const _OnGetCommandError = function (done) {

            const responseFunc = function (err) {
                if (this.platform === keyChain.platforms.WINDOWS) {
                    chai.expect(err).to.have.property('name', 'CredentialError');
                }
                else {
                    chai.expect(err).to.have.property('name', 'PasswordNotFound');
                }
            };

            this.platformImpl.osImpl.onGetCommandClose(1, 'zuul', 'dana', null, responseFunc.bind(this));
            done();
        };

        const _OnGetCommandMacUserCanceled = function (done) {

            const responseFunc = function (err) {
                chai.expect(err).to.have.property('name', 'user_canceled');
            };

            this.platformImpl.osImpl.onGetCommandClose(128, 'zuul', 'dana', null, responseFunc.bind(this));
            done();
        };

        const _OnGetCommandWindowsParseError = function (done) {

            const responseFunc = function (err) {
                chai.expect(err).to.have.property('name', 'SetCredentialParseError');
            };

            this.platformImpl.osImpl.onGetCommandClose(0, '', null, keyChainOptions, responseFunc.bind(this));
            this.platformImpl.osImpl.onGetCommandClose(0, `${keyChainOptions.service}`, null, keyChainOptions,
                responseFunc.bind(this));
            done();
        };

        const _OnGetCommandWindowsParseErrorPasswordNotFound = function (done) {
            const responseFunc = function (err) {
                chai.expect(err).to.have.property('name', 'PasswordNotFound');
            };

            this.platformImpl.osImpl.onGetCommandClose(0, `${keyChainOptions.service} type was not found`, null,
                keyChainOptions, responseFunc.bind(this));

            done();
        };

        const __OnGetCommandWindows = function (done) {
            const password = 'keymaster';
            const responseFunc = function (err, passwd) {
                chai.expect(password).to.equal(passwd);
                chai.expect(err).to.be.null;
            };

            this.platformImpl.osImpl.onGetCommandClose(0, `Password : ${password}`, null,
                keyChainOptions, responseFunc.bind(this));

            done();
        };

        const _OnSetFunc = function(done) {
            const testFunc = function(pgmPath, options) {

                // passwords for linux are read properly from stdin. Boo Windows and Mac
                if (this.platform !== keyChain.platforms.LINUX) {
                    chai.expect(path).to.equal(this.platformImpl.osImpl.program);
                    chai.expect(options).to.include(keyChainOptions.password);
                    chai.expect(options).to.include(keyChainOptions.service).and.to.include(keyChainOptions.account);
                    this.platformImpl.osImpl.setCommandFunc(keyChainOptions, testFunc.bind(this));
                }
            };
            done();
        };

        const _OnGetCommandLinuxRetry = function (done) {
            chai.expect(this.platformImpl.osImpl.onGetCommandClose.bind(null, 1, null, 'invalid or unencryptable secret',
                keyChainOptions, () => {
                })).to.throw(Error).and.have.property('retry', true);

            done();
        };

        const _tests = function () {

            it('Found Impl', _testForPlatform.bind(this));
            it('getCommandFunc', _getCommandFunc.bind(this));
            it('OnGetCommand Close Error', _OnGetCommandError.bind(this));
            it('OnSetFunc', _OnSetFunc.bind(this));

            if (this.platform === keyChain.platforms.DARWIN) {
                it('User canceled keychain user/password prompt', _OnGetCommandMacUserCanceled.bind(this));
            }

            if (this.platform === keyChain.platforms.WINDOWS) {
                it('Windows password parse error', _OnGetCommandWindowsParseError.bind(this));
                it('Windows password not found', _OnGetCommandWindowsParseErrorPasswordNotFound.bind(this));
                it('Windows password success', __OnGetCommandWindows.bind(this));
            }

            if (this.platform === keyChain.platforms.LINUX) {
                it('Should indicate retry logic', _OnGetCommandLinuxRetry.bind(this));
            }
        };

        Object.keys(keyChain.platforms).forEach((platformKey) => {
            if (Object.hasOwnProperty.call(keyChain.platforms, platformKey)) {
                const platform = keyChain.platforms[platformKey];
                const platformImpl = keyChain[platform];

                describe(`${platform} tests`, _tests.bind({ platformImpl, platform }));
            }
        });
    });
});
