# Salesforce DX Core Library (**Beta**)
This library provides client side management of sfdx projects, org authentication, connections to Salesforce APIs, and other various utilities. These libraries are used by and follow patterns of the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli).

Requires [Node](https://nodejs.org) 8.4 or greater and [Typescript](http://www.typescriptlang.org/) target `es2017`.

**Note: Currently in Beta.**

## [AuthInfo]{@link AuthInfo}

Create, read, update and delete authentication information for an org.

## [Connection]{@link Connection}

Create an instance of an API connection to a Salesforce org.

## {@link Org}

Create a representation of an org based on an already authenticated alias, username or default. The org will have a [connection]{@link Connection} and other useful methods for interacting with an org and its users.

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

Manage user messages that are accessible by all plugins and consumers of sfdx-core.

