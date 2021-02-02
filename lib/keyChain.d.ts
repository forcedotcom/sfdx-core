import { KeyChain } from './keyChainImpl';
/**
 * Gets the os level keychain impl.
 * @param platform The os platform.
 * @ignore
 */
export declare const retrieveKeychain: (platform: string) => Promise<KeyChain>;
