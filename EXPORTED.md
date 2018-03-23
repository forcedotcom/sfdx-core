# Salesforce DX Core Library (Beta)
This library provides client-side management of Salesforce DX projects, org authentication, connections to Salesforce APIs, and various other utilities. These libraries are used by and follow patterns of the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli).

Requires [Node.js](https://nodejs.org) v8.4 or greater and [TypeScript](http://www.typescriptlang.org/) target `es2017`.

____
**As a beta feature, Salesforce DX Core Library is a preview and isn’t part of the “Services” under your master subscription agreement with Salesforce. Use this feature at your sole discretion, and make your purchase decisions only on the basis of generally available products and features. Salesforce doesn’t guarantee general availability of this feature within any particular time frame or at all, and we can discontinue it at any time. This feature is for evaluation purposes only, not for production use. It’s offered as is and isn’t supported, and Salesforce has no liability for any harm or damage arising out of or in connection with it. All restrictions, Salesforce reservation of rights, obligations concerning the Services, and terms for related Non-Salesforce Applications and Content apply equally to your use of this feature. You can provide feedback and suggestions for Salesforce DX Core Library in the [issues](TODO:replace-with-link-to-github-issues) section of this repo.**
____

## [AuthInfo]{@link AuthInfo}

Create, read, update, and delete authentication information for an org.

## [Connection]{@link Connection}

Create an instance of an API connection to a Salesforce org.

## {@link Org}

Create a representation of an org based on an already authenticated alias, username, or default. The representation has a [connection]{@link Connection} and other useful methods for interacting with an org and its users.

## {@link ConfigFile}

Represents a config file at either a local or global path. The config file extends the {@link ConfigStore} which provides map-like functions to interact with config values. The following classes are config files.

* {@link Aliases}
* {@link AuthInfoConfig}
* {@link OrgUsersConfig}
* {@link SfdxConfig}
* {@link SfdxProjectJson}

## {@link SfdxConfigAggregator}

Aggregates local, global, and environment config values using {@link SfdxConfig} and environment variables.

## {@link Project}

Represents a Salesfore DX project, defined by the file `sfdx-project.json`.

## {@link UX}

Helper methods for user experiences related to interacting with the terminal.

## {@link Logger}

All logging in `sfdx-core` is accomplished through this logging class. Anyone can also use the logger to log their own log lines to the `sfdx.log` file or to any other log file or stream by utilizing the log level flags and envars set by the CLI or framework. 

## [SfdxError]{@link SfdxError}

An error class that is always thrown from `sfdx-core`, providing useful formatting and contextual data.

## [Messages]{@link Messages}

Manage user messages that are accessible by all plugins and consumers of `sfdx-core`.

