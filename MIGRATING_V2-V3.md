# Migrating `@salesforce/core` from v2 to v3

The goal of v3 is to support the [multiple Salesforce clouds and the unification strategy](https://github.com/salesforcecli/CLI-Unification-demo/blob/main/STRATEGY.md).

There are several breaking changes from v2 to v3. This doc outlines what those the differences are between v2 and v3, why we did them, and how to transition to v3.

## New `.sf` State Folder

### What

All files were stored in the directory `.sfdx` at both the user’s home directory and in the project directory. The folder was named `.sfdx` because of the Salesforce CLI executable. The executable is changing to `sf` for several [reasons](https://github.com/salesforcecli/CLI-Unification-demo/blob/main/STRATEGY.md) so we are updating the directory to be called `.sf`.

### Why

We don’t want to change the name of the folder just for the sake of changing it. However, there are several benefits.

- A clear distinction of ownership between the two CLIs, or any consumer using v3 of the library.
- The name “Salesforce DX” and “sfdx“ carries baggage. There has been an attempt to remove references to it, especially for unification.
- No conflicts with existing files.

Of course, there are some negatives to creating a new folder as well. The main one being this will cause more work for other plugins and tools that also store files in this directory. When they start consuming v3, they will have to explicitly point to `.sfdx` or work on migrating their existing files to the new directory.

## StateAggregator

### What

- Removed export for `AuthInfoConfig`
- Removed export for `Aliases`
- Removed `AuthInfo.listAllAuthFiles`
- Added `StateAggregator`

### Why

We wanted to introduce a single entry point for all configuration files. This makes it easier for consumers to access information without having to know the nuances of each underlying class.

**v2:**

```typescript
await AuthInfo.listAllAuthFiles();
const aliases = await Aliases.create(Aliases.getDefaultOptions());
aliases.set('my-alias', 'my-username');
aliases.get('my-alias');
await aliases.write();
```

**v3:**

```typescript
await AuthInfo.listAllAuthorizations();
```

OR

```typescript
const stateAggregator = await StateAggregator.getInstance();
await stateAggregator.orgs.readAll();
stateAggregator.aliases.getAll();
stateAggregator.aliases.set('my-alias', 'my-username');
stateAggregator.aliases.resolveAlias('my-alias'); // returns 'my-alias'
stateAggregator.aliases.resolveAlias('my-username'); // returns 'my-alias'
stateAggregator.aliases.resolveUsername('my-alias'); // returns 'my-username'
stateAggregator.aliases.resolveUsername('my-username'); // returns 'my-username'
await stateAggregator.aliases.write();
```

## Config, ConfigAggregator

### What

- Moved `.sfdx/sfdx-config.json` to `.sf/config.json`
- Removed `Config.<config key name>`
- Deprecated the following:

| Deprecated Config Var                            | New Config Var                                      |
| ------------------------------------------------ | --------------------------------------------------- |
| `SfdxPropertyKeys.API_VERSION`                   | `OrgConfigProperties.ORG_API_VERSION`               |
| `SfdxPropertyKeys.CUSTOM_ORG_METADATA_TEMPLATES` | `OrgConfigProperties.ORG_CUSTOM_METADATA_TEMPLATES` |
| `SfdxPropertyKeys.DEFAULT_DEV_HUB_USERNAME`      | `OrgConfigProperties.TARGET_DEV_HUB`                |
| `SfdxPropertyKeys.DEFAULT_USERNAME`              | `OrgConfigProperties.TARGET_ORG`                    |
| `SfdxPropertyKeys.DISABLE_TELEMETRY`             | `SfConfigProperties.DISABLE_TELEMETRY`              |
| `SfdxPropertyKeys.INSTANCE_URL`                  | `OrgConfigProperties.ORG_INSTANCE_URL`              |
| `SfdxPropertyKeys.ISV_DEBUGGER_SID`              | `OrgConfigProperties.ORG_ISV_DEBUGGER_SID`          |
| `SfdxPropertyKeys.ISV_DEBUGGER_URL`              | `OrgConfigProperties.ORG_ISV_DEBUGGER_URL`          |
| `SfdxPropertyKeys.MAX_QUERY_LIMIT`               | `OrgConfigProperties.ORG_MAX_QUERY_LIMIT`           |
| `SfdxPropertyKeys.REST_DEPLOY`                   | REMOVED                                             |

- `ConfigAggregator` will not work with any of the deprecated keys. **We strongly suggest that you move to the new keys as part of the migration process.**
- If you absolutely cannot migrate to the new config keys, then you can use `SfdxConfigAggregator` in the meantime.

### Why

Config keys need to be a lot more specific to support multiple clouds. For example, `apiVersion` is ambiguous and does not specify which api it's referring to. We still have to support these keys moving forward so we don't break existing workflows. All old keys were moved to a `SfdxPropertyKeys` to make it very clear that they are legacy key names.

**v2**

```typescript
Config.update(true, Config.API_VERSION, '49.0');

const configAggregator = await ConfigAggregator.create();
configAggregator.getPropertyValue(Config.API_VERSION);
```

**v3**

```typescript
Config.update(true, OrgConfigProperties.ORG_API_VERSION, '49.0');

const configAggregator = await ConfigAggregator.create();
configAggregator.getPropertyValue(OrgConfigProperties.ORG_API_VERSION);
```

OR

```typescript
const configAggregator = await SfdxConfigAggregator.create();
configAggregator.getPropertyValue(SfdxPropertyKeys.API_VERSION);
```

## ConfigStore, ConfigFile, AuthInfo, and Encrypting Values

### What

- New: Encrypting capabilities on ConfigStore and ConfigFile.
- New: Improved typings on ConfigStore to understand the config data.
- Removed `AuthInfo.clearCache`.
- Removed encrypt param on `AuthInfo.update`.
- Changed: ConfigStore now extends `AsyncOptionalCreatable`.

### Why

Originally encryption happened within AuthInfo. Ideally the mechanism that reads and writes secure values also encrypt them. This helps ensure that decrypted values don't get saved to disk. If you use ConfigFile, you can now set encryption keys rather than dealing with Crypto directly.

Because of that change it no longer made sense to have a cache on AuthInfo. Instead, getting auth info fields should always be getting it from the true source, which is the config file. In this case, StateAggregator.

Most people won't have to worry about these changes unless doing some special test mocking or using the removed `AuthInfo.clearCache` or the encrypt param on `AuthInfo.update`. Everything updated will always be encrypted to prevent any accidents with storying decrypted data.

**v2:**

```typescript
type MyConfig = {
  option1: string;
  option2: boolean;
};

class MyConfigFile extends ConfigFile<ConfigFile.Options> {
  constructor(options: ConfigFile.Options) {
    super(options);
    // Some logic
  }

  public get(key: string): ConfigValue {
    let value = super.get(key);
    // Do custom crypto
    return value;
  }
  public set(key: string, value: ConfigValue) {
    // Do custom crypto
    super.set(key, value);
  }
}

const myConfig = await MyConfigFile.create({});
myConfig.getContents(); // ConfigContents
myConfig.get('option1'); // ConfigValue - forcing type narrowing.
myConfig.get('option2'); // ConfigValue - forcing type narrowing.
```

**v3:**

```typescript
type MyConfig = {
  option1: string;
  option2: boolean;
};

class MyConfigFile extends ConfigFile<ConfigFile.Options, MyConfig> {
  protected static encryptedKeys = ['option1'];

  constructor(options?: ConfigFile.Options) {
    super(options);
    // Some logic
  }
}

const myConfig = await MyConfigFile.create({});
myConfig.getContents(); // MyConfig
myConfig.get('option1'); // string - automatically decrypted
myConfig.get('option2'); // boolean
```

## SfError (formerly SfdxError)

### What?

- Renamed: `SfdxError` to `SfError`
- Removed: `SfdxErrorConfig`
- Removed: `SfdxError.create`

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
throw new SfError(errMessage, errName, errActions);
```

### Why?

With the changes to messages we want developers to be explicit about the keys they are using. We also want to encourage messages are loaded at the top of the file. The `SfdxError.create` method bypasses both of those objectives. Because of this we just completely removed it. Although it adds a little bit of convenience, it also simplifies the usage. For a similar convenience, see `Messages.createError`.

# Error Names

While standardizing on our message files, we realized that there were a lot of inconsistencies with our thrown error names. To stay consistent with [ecma](https://tc39.es/ecma262/#sec-error.prototype.name) we changed all error names to be CamelCase and end in `Error`. Below is a table of all the changed error names. If you are catching one of these errors and checking the name, you will need to update that reference.

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

## SfdxProject

### What?

- Renamed `SfdxProject` to `SfProject`
- Renamed `SfdxProjectJson` to `SfProjectJson`

### Why?

As we move to supporting the new `sf` executable, we want the naming to be consistent.
