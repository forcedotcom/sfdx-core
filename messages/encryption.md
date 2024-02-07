# invalidEncryptedFormatError

The encrypted data is not properly formatted.

# invalidEncryptedFormatError.actions

- If attempting to create a scratch org then re-authorize. Otherwise create a new scratch org.

# authDecryptError

Failed to decipher auth data. reason: %s.

# unsupportedOperatingSystemError

Unsupported Operating System: %s

# missingCredentialProgramError

Unable to find required security software: %s

# credentialProgramAccessError

Unable to execute security software: %s

# passwordRetryError

Failed to get the password after %i retries.

# passwordRequiredError

A password is required.

# keyChainServiceRequiredError

Unable to get or set a keychain value without a service name.

# keyChainAccountRequiredError

Unable to get or set a keychain value without an account name.

# keyChainUserCanceledError

User canceled authentication.

# keychainPasswordCreationError

Failed to create a password in the keychain.

# genericKeychainServiceError

The service and account specified in %s do not match the version of the toolbelt.

# genericKeychainServiceError.actions

- Check your toolbelt version and re-auth.

# genericKeychainInvalidPermsError

Invalid file permissions for secret file

# genericKeychainInvalidPermsError.actions

- Ensure the file %s has the file permission octal value of %s.

# passwordNotFoundError

Could not find password.
%s

# passwordNotFoundError.actions

- Ensure a valid password is returned with the following command: [%s]

# setCredentialError

Command failed with response:
%s

# setCredentialError.actions

- Determine why this command failed to set an encryption key for user %s: [%s].

# macKeychainOutOfSync

We’ve encountered an error with the Mac keychain being out of sync with your `sfdx` credentials. To fix the problem, sync your credentials by authenticating into your org again using the auth commands.

# v1CryptoWithV2KeyWarning

The SF_CRYPTO_V2 environment variable was set to "false" but a v2 crypto key was detected. v1 crypto can only be used with a v1 key. Unset the SF_CRYPTO_V2 environment variable.

# v2CryptoWithV1KeyWarning

SF_CRYPTO_V2 was set to "true" but a v1 crypto key was detected. v2 crypto can only be used with a v2 key. To generate a v2 key:

1. Logout of all orgs: `sf org logout --all`
2. Delete the sfdx keychain entry (account: local, service: sfdx). If `SF_USE_GENERIC_UNIX_KEYCHAIN=true` env var is set, you can delete the `key.json` file.
3. Set `SF_CRYPTO_V2=true` env var.
4. Re-Authenticate with your orgs using the CLI org login commands.
