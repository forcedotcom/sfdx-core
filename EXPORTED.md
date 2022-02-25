# Salesforce DX Core Library

This library provides client-side management of Salesforce DX projects, org authentication, connections to Salesforce APIs, and various other utilities. These libraries are used by and follow patterns of the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli).

Requires [Node.js](https://nodejs.org) v8.4 or greater and [TypeScript](http://www.typescriptlang.org/) target `es2017`.

## [AuthInfo]{@link AuthInfo}

Create, read, update, and delete authentication information for an org.

## [Connection]{@link Connection}

Create an instance of an API connection to a Salesforce org.

## {@link Org}

Create a representation of an org based on an already authenticated alias, username, or default. The representation has a [connection]{@link Connection} and other useful methods for interacting with an org and its users.

## [StreamingClient]{@link StreamingClient}

Create an instance of a streaming API connection to a Salesforce org for a particular streaming channel.

## {@link ConfigFile}

Represents a config file at either a local or global path. The config file extends the {@link ConfigStore} which provides map-like functions to interact with config values. The following classes are config files.

- {@link Aliases}
- {@link OrgUsersConfig}
- {@link Config}
- {@link SfProjectJson}

## {@link ConfigAggregator}

Aggregates local, global, and environment config values using {@link Config} and environment variables.

## {@link SfProject}

Represents a Salesforce DX project, defined by the file `sfdx-project.json`.

## {@link Logger}

All logging in `sfdx-core` is accomplished through this logging class. Anyone can also use the logger to log their own log lines to the `sfdx.log` file or to any other log file or stream by utilizing the log level flags and envars set by the CLI or framework.

## [SfError]{@link SfError}

An error class that is always thrown from `sfdx-core`, providing useful formatting and contextual data.

## [Messages]{@link Messages}

Manage user messages that are accessible by all plugins and consumers of `sfdx-core`.
