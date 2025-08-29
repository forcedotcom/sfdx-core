/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { env } from '@salesforce/kit';
import { Logger } from '../logger/logger';
import { Messages } from '../messages';
import { KeyChain, keyChainImpl } from './keyChainImpl';

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'encryption');

/**
 * Gets the os level keychain impl.
 *
 * @param platform The os platform.
 * @ignore
 */
export const retrieveKeychain = async (platform: string): Promise<KeyChain> => {
  const logger: Logger = await Logger.child('keyChain');

  const useGenericUnixKeychainVar = env.getBoolean('SF_USE_GENERIC_UNIX_KEYCHAIN');

  if (platform.startsWith('win')) {
    logger.debug(`platform: ${platform}. Using generic Windows keychain.`);
    return keyChainImpl.generic_windows;
  } else if (platform.includes('darwin')) {
    // OSX can use the generic keychain. This is useful when running under an
    // automation user.
    if (useGenericUnixKeychainVar) {
      logger.debug(`platform: ${platform}. Using generic Unix keychain.`);
      return keyChainImpl.generic_unix;
    } else {
      logger.debug(`platform: ${platform}. Using Darwin native keychain.`);
      return keyChainImpl.darwin;
    }
  } else if (platform.includes('linux')) {
    // Use the generic keychain if specified
    if (useGenericUnixKeychainVar) {
      logger.debug(`platform: ${platform}. Using generic Unix keychain.`);
      return keyChainImpl.generic_unix;
    } else {
      // otherwise try and use the builtin keychain
      try {
        logger.debug(`platform: ${platform}. Using Linux keychain.`);
        await keyChainImpl.linux.validateProgram();
        return keyChainImpl.linux;
      } catch (e) {
        // If the builtin keychain is not available use generic
        logger.debug(`platform: ${platform}. Using generic Unix keychain.`);
        return keyChainImpl.generic_unix;
      }
    }
  } else if (platform === 'browser') {
    logger.debug(`platform: ${platform}. Using generic keychain.`);
    return keyChainImpl.generic_unix;
  } else {
    throw messages.createError('unsupportedOperatingSystemError', [platform]);
  }
};
