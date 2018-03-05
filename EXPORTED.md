# Salesforce DX Core Library
This library provides client side management of sfdx projects, org authentication, connections to Salesforce APIs, and other various utilities.

## [AuthInfo]{@link AuthInfo}

Create, read, or save authentication information to an org. 

## [Connection]{@link Connection}

Create an instance of an API connection from an {@link AuthInfo}.

## {@link Org}

Create a representation of an org based on an already authenticated alias, username or default. The org will have a [connection]{@link Connection} and other useful methods for interacting with an org and it's users.

## {@link ConfigFile}

Represents a config file at either a local or global path. The config file extends the {@link ConfigStore} which provides map like functions to interact with config values. The following classes are config files.

* {@link Aliases}
* {@link AuthInfoConfig}
* {@link OrgUsersConfig}
* {@link SfdxConfig}
* {@link SfdxProjectJson}

## {@link SfdxConfigAggregator}

Aggregates local, global, and environment config values using {@link SfdxConfig} and environment variables.

## {@link Project}

Represents an sfdx project, defined by the file `sfdx-project.json`.

## {@link UX}

Helper methods for user experiences to the terminal.

## {@link Logger}

All logging in sfdx-core is accomplished through this logging class. Anyone can also use the logger to log there own log lines to the `sfdx.log` file or to any other log file or stream utilizing the log level flags and envars set by the CLI or framework. 

## [SfdxError]{@link SfdxError}

An error class that is always thrown from sfdx-core, providing useful formatting and contextual data.

## [Messages]{@link Messages}

The [core message framework]{@link Messages} manages messages and allows them to be accessible by all plugins and consumers of sfdx-core. It is setup to handle localization down the road, at no additional effort to the consumer. Messages can be used for anything from user output (like the console), to error messages, to returned data from a method.

First, add your messages to the `<moduleRoot>/messages` directory. Message files must be in `.json`.

Next, tell sfdx-core where to load message files from. You want to add this to the index.js or whatever is loaded when the package is required. The framework will automatically strip `dist/...` from the path if using that convention.
```javascript
Messages.importMessagesDirectory(__dirname);
```
Before using the messages in your code, load the bundle you wish to use. If `Messages.importMessagesDirectory` was used, then the bundle name is the message file name.
```javascript
const messages : Messages = Messages.loadMessages('sfdx-core', 'config');
```
Now you can use them freely.
```javascript
messages.getMessage('JsonParseError');
```
The messages in your json file support [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) and applies the tokens passed into {@link Message.getMessage}.
**Note:** When running unit tests individually, you may see errors that the messages aren't found. This is because `index.js` isn't loaded when tests run like they are when the package is required. To allow tests to run, import the message directory in each test, as outlined above (it will only do it once) or load the message file the test depends on individually.
```javascript
Messages.importMessageFile(`${__dirname}/${pathFromTestFile}`);
```

