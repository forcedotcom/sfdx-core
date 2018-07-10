/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { expect } from 'chai';
import { testSetup } from '../../src/testSetup';
import { Crypto } from '../../src/crypto';

// Setup the test environment.
const $$ = testSetup();

const TEST_KEY = {
    service: 'sfdx',
    account: 'local',
    key: '8e8fd1e6dc06a37bf420898dbc3ee35c'
};

describe('CryptoTest', function() {
    const disableEncryptionEnvVar = process.env.SFDX_DISABLE_ENCRYPTION;
    let crypto;

    beforeEach(() => {
        // Testing crypto functionality, so restore global stubs.
        $$.SANDBOXES.CRYPTO.restore();

        $$.SANDBOX.stub(Crypto.prototype, 'getKeyChain').callsFake(() => Promise.resolve({
            setPassword: () => Promise.resolve(),
            getPassword: (data, cb) => cb(undefined, TEST_KEY.key)
        }));
    });

    afterEach(() => {
        crypto.close();
        process.env.SFDX_DISABLE_ENCRYPTION = disableEncryptionEnvVar || '';
    });

    if (process.platform === 'darwin' ) {
        this.timeout(3 * 60 * 1000);

        const text = 'Unencrypted text';
        let secret;

        it('Should have encrypted the string.', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'false';

            crypto = new Crypto();
            await crypto.init();
            secret = crypto.encrypt(text);
            expect(secret).to.not.equal(text);
        });

        it('Should have decrypted the string', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'false';

            crypto = new Crypto();
            await crypto.init();
            const decrypted = crypto.decrypt(secret);
            expect(decrypted).to.equal(text);
        });

        it('Should have encrypted the string even if SFDX_DISABLE_ENCRYPTION is true.', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'true';

            crypto = new Crypto();
            await crypto.init();
            secret = crypto.encrypt(text);
            expect(secret).to.not.equal(text);
        });

        it('Should have encrypted the string because SFDX_DISABLE_ENCRYPTION is not defined.', async () => {
            delete process.env.SFDX_DISABLE_ENCRYPTION;

            crypto = new Crypto();
            await crypto.init();
            secret = crypto.encrypt(text);
            expect(secret).to.not.equal(text);
        });

        it('Should have decrypted the string even if SFDX_DISABLE_ENCRYPTION is "true"', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'true';

            crypto = new Crypto();
            await crypto.init();
            const str = '123456';
            const encrypted = crypto.encrypt(str);
            const decrypted = crypto.decrypt(encrypted);
            expect(encrypted).to.not.equal(str);
            expect(decrypted).to.equal(str);
        });

        it('InvalidEncryptedFormatError action', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'false';

            crypto = new Crypto();
            await crypto.init();
            expect(Crypto.prototype.decrypt.bind(crypto, 'foo')).to.throw(Error).and.have.property('actions');
        });

        it('InvalidEncryptedFormatError name', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'false';

            crypto = new Crypto();
            await crypto.init();
            expect(Crypto.prototype.decrypt.bind(crypto, '')).to.throw(Error).and.have.property('name', 'InvalidEncryptedFormatError');
        });

        it('Should return null if text is null.', async () => {
            delete process.env.SFDX_DISABLE_ENCRYPTION;

            crypto = new Crypto();
            await crypto.init();
            secret = crypto.encrypt(null);
            expect(secret).to.equal(undefined);
        });

        it('Should return null if text is undefined.', async () => {
            delete process.env.SFDX_DISABLE_ENCRYPTION;

            crypto = new Crypto();
            await crypto.init();
            secret = crypto.encrypt(undefined);
            expect(secret).to.equal(undefined);
        });
    }
});
