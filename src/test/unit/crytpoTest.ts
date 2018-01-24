/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as sinon from 'sinon';
import { assert, expect } from 'chai';
import * as path from 'path';
import { testSetup } from '../testSetup';
import { Crypto } from '../../lib/crypto';
import { Logger } from '../../lib/logger';

// Setup the test environment.
const $$ = testSetup();

describe('CryptoTest', function() {
    const disableEncryptionEnvVar = process.env.SFDX_DISABLE_ENCRYPTION;
    let crypto;

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

        it('Should NOT have encrypted the string because SFDX_DISABLE_ENCRYPTION is true.', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'true';

            crypto = new Crypto();
            await crypto.init();
            secret = crypto.encrypt(text);
            expect(secret).to.equal(text);
        });

        it('Should have encrypted the string because SFDX_DISABLE_ENCRYPTION is not defined.', async () => {
            delete process.env.SFDX_DISABLE_ENCRYPTION;

            crypto = new Crypto();
            await crypto.init();
            secret = crypto.encrypt(text);
            expect(secret).to.not.equal(text);
        });

        it('Should NOT have decrypted the string because SFDX_DISABLE_ENCRYPTION is "true"', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'true';

            crypto = new Crypto();
            await crypto.init();
            const string = '123456';
            const decrypted = crypto.decrypt(string);
            expect(decrypted).to.equal(string);
        });

        it('Should not have decrypted the string because SFDX_DISABLE_ENCRYPTION is "TRUE"', async () => {
            process.env.SFDX_DISABLE_ENCRYPTION = 'TRUE';

            crypto = new Crypto();
            await crypto.init();
            const string = '123456';
            const decrypted = crypto.decrypt(string);
            expect(decrypted).to.equal(string);
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
