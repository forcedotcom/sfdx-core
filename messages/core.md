# JsonParseError

Parse error in file %s on line %s:

%s

# AuthInfoCreationError

Must pass a username and/or OAuth options when creating an AuthInfo instance.

# AuthInfoOverwriteError

Cannot create an AuthInfo instance that will overwrite existing auth data.

# AuthInfoOverwriteErrorAction

Create the AuthInfo instance using existing auth data by just passing the username. E.g., `AuthInfo.create({ username: 'my@user.org' });`.

# AuthCodeExchangeError

Error authenticating with auth code due to: %s

# AuthCodeUsernameRetrievalError

Could not retrieve the username after successful auth code exchange.

Due to: %s

# JWTAuthError

Error authenticating with JWT config due to: %s

# RefreshTokenAuthError

Error authenticating with the refresh token due to: %s

# OrgDataNotAvailableError

An attempt to refresh the authentication token failed with a 'Data Not Found Error'. The org identified by username %s does not appear to exist. Likely cause is that the org was deleted by another user or has expired.

# OrgDataNotAvailableErrorActions

- Run `sfdx force:org:list --clean` to remove stale org authentications.
- Use `sfdx force:config:set` to update the defaultusername.
- Use `sfdx force:org:create` to create a new org.
- Use `sfdx auth` to authenticate an existing org.

# NamedOrgNotFound

No AuthInfo found for name %s.

# NoAliasesFound

Nothing to set.

# InvalidFormat

Setting aliases must be in the format <key>=<value> but found: [%s].

# NoAuthInfoFound

No authorization information can be found.

# InvalidJsonCasing

All JSON input must have heads down camelcase keys. E.g., `{ sfdcLoginUrl: "https://login.salesforce.com" }`
Found "%s" at %s
