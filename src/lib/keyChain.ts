/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import { SfdxUtil } from './util';
import { Global } from './global';
import { keyChainImpl, KeychainAccess, GenericUnixKeychainAccess } from './keyChainImpl';
import { Logger } from './logger';
import { AuthInfo } from './authInfo';
import { SfdxError } from './sfdxError';

const _usingGenericKeychain = async (logger: Logger): Promise<boolean> => {
    const keyPath = path.join(Global.DIR, 'key.json');
    logger.debug(`keyPath: ${keyPath}`);

    try {
        SfdxUtil.open(keyPath, 'r');
        logger.debug('keyPath found.');
        return true;
    } catch (err) {
        if (err.code === 'ENOENT') {
            logger.debug('keyPath not found');
            return false;
        }
        logger.debug(err.message);
        throw err;
    }
};

export const retrieveKeychain = async (platform) => {

    const logger: Logger = await Logger.child('keyChain');
    logger.debug(`platform: ${platform}`);

    const useGenericUnixKeychainVar = process.env.SFDX_USE_GENERIC_UNIX_KEYCHAIN || process.env.USE_GENERIC_UNIX_KEYCHAIN;
    const shouldUseGenericUnixKeychain = !!useGenericUnixKeychainVar && useGenericUnixKeychainVar.toLowerCase() === 'true';

    const isUsingGenericKeychain = await _usingGenericKeychain(logger);
    const hasAuthentications = await AuthInfo.hasAuthentications();

    logger.debug(`isUsingGenericKeychain: ${isUsingGenericKeychain}`);
    logger.debug(`hasAuthentications: ${hasAuthentications}`);

    if (/^win/.test(platform)) {
        return keyChainImpl.generic_windows;
    } else if (/darwin/.test(platform)) {
        // OSX can use the generic keychain. This is useful when running under an
        // automation user.
        if (shouldUseGenericUnixKeychain) {
            return keyChainImpl.generic_unix;
        } else {
            return keyChainImpl.darwin;
        }
    } else if (/linux/.test(platform)) {
        // Use the generic keychain if specified
        if (shouldUseGenericUnixKeychain) {
            return keyChainImpl.generic_unix;
        } else {
            // otherwise try and use the builtin keychain
            try {
                keyChainImpl.linux.validateProgram();
                return keyChainImpl.linux;
            } catch (e) {
                // If the builtin keychain is not available use generic
                return keyChainImpl.generic_unix;
            }
        }
    } else {
        throw await SfdxError.create('sfdx-core', 'UnsupportedOperatingSystemError', [platform]);
    }
};
