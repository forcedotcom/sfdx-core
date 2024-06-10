# incorrectAPIVersionError

Invalid API version %s. Expecting format "[1-9][0-9].0", i.e. 42.0

# domainNotFoundError

The org cannot be found

# domainNotFoundError.actions

- Verify that the org still exists,
- If your org is newly created, wait a minute and run your command again,
- If you deployed or updated the org's My Domain, logout from the CLI and authenticate again,
- If you are running in a CI environment with a DNS that blocks external IPs, try setting SFDX_DISABLE_DNS_CHECK=true

# noInstanceUrlError

Connection has no instanceUrl.

# noInstanceUrlError.actions

Make sure the instanceUrl is set in your command or config.

# noApiVersionsError

Org failed to respond with its list of API versions. This is usually the result of domain changes like activating MyDomain or Enhanced Domains

# noApiVersionsError.actions

Re-authenticate to the org.
