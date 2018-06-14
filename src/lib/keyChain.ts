/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { keyChainImpl, KeyChain } from './keyChainImpl';
import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { isEnvVarTruthy } from './util';

/**
 * Gets the os level keychain impl.
 * @param platform The os platform.
 * @returns {Promise<any>} The keychain impl.
 * @private
 */
export const retrieveKeychain = async (platform): Promise<KeyChain> => {

    const logger: Logger = await Logger.child('keyChain');
    logger.debug(`platform: ${platform}`);

    const useGenericUnixKeychainVar = isEnvVarTruthy('SFDX_USE_GENERIC_UNIX_KEYCHAIN');
    const shouldUseGenericUnixKeychain = !!useGenericUnixKeychainVar && useGenericUnixKeychainVar;

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
                await keyChainImpl.linux.validateProgram();
                return keyChainImpl.linux;
            } catch (e) {
                // If the builtin keychain is not available use generic
                return keyChainImpl.generic_unix;
            }
        }
    } else {
        throw SfdxError.create('@salesforce/core', 'encryption', 'UnsupportedOperatingSystemError', [platform]);
    }
};
