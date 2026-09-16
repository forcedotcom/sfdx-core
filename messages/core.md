# authInfoCreationError

Must pass a username and/or OAuth options when creating an AuthInfo instance.

# authInfoOverwriteError

Cannot create an AuthInfo instance that will overwrite existing auth data.

# authInfoOverwriteError.actions

- Create the AuthInfo instance using existing auth data by just passing the username. E.g., `AuthInfo.create({ username: 'my@user.org' });`.

# authCodeExchangeError

Error authenticating with auth code due to: %s

# authCodeUsernameRetrievalError

Could not retrieve the username after successful auth code exchange.

Due to: %s

# jwtAuthError

Error authenticating with JWT config due to: %s

# jwtAuthErrors

Error authenticating with JWT.
Errors encountered:
%s

# refreshTokenAuthError

Error authenticating with the refresh token due to: %s

# refreshTokenAuthError.actions

- The stored refresh token is no longer valid (it may have expired, been revoked, or been rotated). Re-authenticate to the org, then try again.

# refreshTokenRotationTimeoutError

Timed out waiting for another process to finish rotating the refresh token for %s. Another process held the rotation lock for the entire wait without completing. Try again. If it persists, another process is likely stuck mid-refresh: stop any other processes using this org's authentication, then try again.

# invalidSfdxAuthUrlError

Invalid SFDX authorization URL. Must be in the format "force://<clientId>:<clientSecret>:<refreshToken>@<instanceUrl>". Note that the "instanceUrl" inside the SFDX authorization URL doesn\'t include the protocol ("https://"). Run "org display --target-org" on an org to see an example of an SFDX authorization URL.

# orgDataNotAvailableError

An attempt to refresh the authentication token failed with a 'Data Not Found Error'. The org identified by username %s does not appear to exist. Likely cause is that the org was deleted by another user or has expired.

# orgDataNotAvailableError.actions

- Run `sfdx force:org:list --clean` to remove stale org authentications.
- Use `sfdx force:config:set` to update the defaultusername.
- Use `sfdx force:org:create` to create a new org.
- Use `sfdx auth` to authenticate an existing org.

# namedOrgNotFound

No authorization information found for %s.

# noAliasesFound

Nothing to set.

# invalidFormat

Setting aliases must be in the format <key>=<value> but found: [%s].

# invalidJsonCasing

All JSON input must have heads down camelcase keys. E.g., `{ sfdcLoginUrl: "https://login.salesforce.com" }`
Found "%s" at %s

# missingClientId

Client ID is required for JWT authentication.
