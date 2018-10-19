/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import * as _ from 'lodash';
import { retrieveKeychain } from '../../src/keyChain';
import { GenericUnixKeychainAccess, GenericWindowsKeychainAccess, keyChainImpl } from '../../src/keyChainImpl';
import { testSetup } from '../../src/testSetup';

// Setup the test environment.
const $$ = testSetup();

describe('keyChain', () => {

    const OLD_SFDX_GENERIC_VAL = process.env.SFDX_USE_GENERIC_UNIX_KEYCHAIN;
    const OLD_GENERIC_VAL = process.env.USE_GENERIC_UNIX_KEYCHAIN;

    beforeEach(() => {
        // Testing crypto functionality, so restore global stubs.
        $$.SANDBOXES.CRYPTO.restore();

        process.env.SFDX_USE_GENERIC_UNIX_KEYCHAIN = 'false';
        process.env.USE_GENERIC_UNIX_KEYCHAIN = 'false';
    });

    after(() => {
        process.env.SFDX_USE_GENERIC_UNIX_KEYCHAIN = OLD_SFDX_GENERIC_VAL || '';
        process.env.USE_GENERIC_UNIX_KEYCHAIN = OLD_GENERIC_VAL || '';
    });

    it('should return OSX keychain and lib secret', () => {

        $$.SANDBOX.stub(keyChainImpl.linux, 'validateProgram').returns({});

        const testArray = [{ osName: 'linux', validateString: 'secret' }, {
            osName: 'darwin',
            validateString: 'security'
        }];

        const promiseArray = testArray.map(obj => retrieveKeychain(obj.osName));

        return Promise.all(promiseArray)
            .then(_keychains => {
                _.forEach(_keychains, _keychain => {
                    expect(_keychain).to.have.property('osImpl');
                    const program = _keychain['osImpl'].getProgram();
                    const testArrayMeta = _.find(testArray, elem => program.includes(elem.validateString));
                    expect(testArrayMeta == null).to.be.false;
                });
            });
    });

    it('should return generic unix for OSX and Linux', async () => {
        process.env.SFDX_USE_GENERIC_UNIX_KEYCHAIN = 'true';
        const darwinKeychain = await retrieveKeychain('darwin');
        const linuxKeychain = await retrieveKeychain('linux');

        expect(darwinKeychain).to.be.instanceOf(GenericUnixKeychainAccess);
        expect(linuxKeychain).to.be.instanceOf(GenericUnixKeychainAccess);
    });

    it('should return generic windows for windows and win32 platform', async () => {
        const windowsKeychain = await retrieveKeychain('windows');
        const win32Keychain = await retrieveKeychain('win32');
        expect(windowsKeychain).to.be.instanceOf(GenericWindowsKeychainAccess);
        expect(win32Keychain).to.be.instanceOf(GenericWindowsKeychainAccess);
    });
});
