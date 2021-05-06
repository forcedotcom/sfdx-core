# Migrating `@salesforce/core` from v2 to v3

There are several breaking changes from v2 to v3. This doc outlines what those the differences are between v2 and v3, why we did them, and how to transition to v3.

## Messages

### What?

- Rename: `Messages.loadMessages` -> `Messages.load`
- Require keys names when loading messages
- Added markdown as supported message format

**v2:**

```typescript
// Top of the file which is loaded when the file is loaded
Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('@salesforce/core', 'core');

messages.getMessage('fooKey'); // string - if fooKey doesn't exist, error
```

**v3:**

```typescript
Messages.importMessagesDirectory(__dirname);
// if fooKey or barKey doesn't exist, error.
const messages = Messages.load('@salesforce/core', 'core', ['fooKey', 'barKey']);

messages.getMessage('fooKey'); // string
messages.getMessage('baKey'); // type error because baKey is not loaded above
```

### Why?

Quite often, customers would get the error `Missing message <bundle>:<key> for locale en_US.` at runtime in production code. This should really be a development time error. In v3, we have added typescript typings to help catch these at development time. We also updates all examples to load messages at the top of the file which most libraries and plugins already do. Reading the messages at loadtime is very fast (under 0.5ms per message file).

We renamed the method from `loadMessages` to `load` to really highlight the breaking change, and because using messages there is redundant. We did not rename `getMessages` to reduce the amount of code changes.

## SfdxError

### What?

- Removed: `SfdxErrorConfig`
- Removed: `Sfdx.create`

**v2:**

```typescript
throw SfdxError.create('<package>', '<bundle>', 'myKey', ['tokens'], 'actionKey', ['actionToken']);
```

**v3:**

```typescript
Messages.importMessagesDirectory(__dirname);
const messages = Messages.load('<package>', '<bundle>', ['myKey', 'actionKey']);
// ...
const errName = 'myKey';
const errMessage = messages.getMessage(errName, ['tokens']);
const errActions = messages.getMessages('actionsKey', ['actionTokens']);
throw new SfdxError(errMessage, errName, errActions);
```

### Why?

With the changes to messages, we want developers to be explict about the keys they are using. We also want to encourage messages are loaded at the top of the file. The `SfdxError.create` method bypasses both of those objectives. Because of this, we just completly removed it. Although it adds a little bit of convience, it also simplifies the usage.

# Error Names

While standardizing on our message files, we realized that there were a lot of inconsistencies with our thrown error names. To stay consistent with [ecma](https://tc39.es/ecma262/#sec-error.prototype.name), we changed all error names to be CamelCase and end in `Error`. Below is a table of all the changed error names. If you are catching one of these errors and checking the name, you will need to update that reference.

| v2 Error Name                                | V3 Error Name                                |
| -------------------------------------------- | -------------------------------------------- |
| NoOrgFound                                   | DefaultUsernameNotSetError                   |
| SfdxSchemaValidationError                    | SchemaValidationError                        |
| waitParamValidValueError                     | WaitParamValidValueError                     |
| handshakeApiVersionError                     | HandshakeApiVersionError                     |
| genericHandshakeTimeoutMessage               | GenericHandshakeTimeoutError                 |
| genericTimeoutMessage                        | GenericTimeoutError                          |
| assignCommandPermissionSetNotFoundError      | AssignCommandPermissionSetNotFoundError      |
| assignCommandPermissionSetNotFoundForNSError | AssignCommandPermissionSetNotFoundForNSError |
| pollingTimeout                               | PollingTimeoutError                          |
| invalidConfigValue                           | InvalidConfigValueError                      |
| UnknownConfigKey                             | UnknownConfigKeyError                        |
| InvalidProjectWorkspace                      | InvalidProjectWorkspaceError                 |
| InvalidApiVersion                            | InvalidApiVersionError                       |
| NotADevHub                                   | NotADevHubError                              |
| InvalidFormat                                | InvalidFormatError                           |
| JWTAuthError                                 | JwtAuthError                                 |
| NamedOrgNotFound                             | NamedOrgNotFoundError                        |
| IncorrectAPIVersion                          | IncorrectAPIVersionError                     |
| Domain Not Found                             | DomainNotFoundError                          |
| NoInstanceUrl                                | NoInstanceUrlError                           |
| RedundantRootLogger                          | RedundantRootLoggerError                     |
| UnrecognizedLoggerLevelName                  | UnrecognizedLoggerLevelNameError             |
| NoResults                                    | NoResultsError                               |
| MissingAuthInfo                              | MissingAuthInfoError                         |
| InvalidWrite                                 | InvalidWriteError                            |
| MissingGroupNameError                        | MissingGroupNameError                        |
| ValidationSchemaFieldErrors                  | ValidationSchemaFieldError                   |
| ValidationSchemaUnknown                      | ValidationSchemaUnknownError                 |
