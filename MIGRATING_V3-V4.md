# Migrating `@salesforce/core` from v3 to v4

v4 remove node14 support and removes many previously deprecated features

## Messages

Use `Messages.loadMessages` instead of `Messages.load`. You don't have to specify the messages individually, and the [eslint rules](https://github.com/salesforcecli/eslint-plugin-sf-plugin) check your messages more effectively.

`Messages.createErrorButPreserveName` is removed.

## SfdxConfigAggregator

Recent versions of v3 has `SfdxConfigAggregator` exactly matching `ConfigAggregator`. Use `ConfigAggregator`.

## SfdxError

Was a copy of `SfError`, now removed. Use `SfError`.

## SfdxProject and SfdxProjectJson

Both of these were empty wrappers around `SfProject` and `SfProjectJson`. Use those instead.

## Connection.deployRecentValidation

Since this was moved to jsforce2, the sfdx-core implementation was an empty wrapper. Use jsforce's Connection.metadata#deployRecentValidation instead.

## sfdc

These were independent functions on an object. Import the individual functions you need instead.

Ex: `sfdc.trimTo15()` should be `trimTo15()`
