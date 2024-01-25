# Migrating `@salesforce/core` from v4 to v5

v5 contains breaking changes to the Logger class

Prior to v5, the Logger class wrapped a fork of Bunyan. v5 uses [Pino](https://getpino.io/)

You could create the Logger and then make modifications to it (adding streams, changing it to in-memory).

The v5 implementation is much simpler. Once you've created it, you cannot modify the logging destination.

This commit contains the breaking changes: https://github.com/forcedotcom/sfdx-core/commit/c52a29bd4162bc14ebaf690876db6589d21929fe

Most of the methods for manipulating streams, filter or changing the settings of an existing Logger are gone. The only change you can make to an existing Logger is to change the level or to add an additional field to all the outputs.

## MemoryLogging

instead of creating a Logger and then calling `useMemoryLogging` you can now pass the option `useMemoryLogger` when creating the Logger

## Output format

JSON is your only option. LogFmt no longer exists

## Debug

`enableDEBUG` is gone. The logger will use DEBUG and prettified output when `DEBUG=*` etc are in the environment.

## Log file destinations

Previously, logger went to sf.log and then rotated to sf.log.0, sf.log.1, etc.

The new Logger will write to dated files like `sf-2023-06-29.log` so that no rotation is necessary.

## Log file cleanup

When a new logger is instantiated, there's a chance that it kicks off a cleanup process on existing logs. By default, they'll be around 7 days. If you don't use the CLI much, it might take extra time before the log files are cleaned up (but they'd be much smaller in that case)

## Notes

the new `getRawLogger` is similar to the previous `getBunyanLogger. It'll return the underlying Pino instance.

This is an improvement in that it has TypeScript types for the pino methods. Example usage

```ts
// Logger (class) which contains the root pino logger.  Will be created if one doesn't exist
// child (class) which contains a pino child logger
// return the pino logger from child class
const childLogger = Logger.childFromRoot('myRootChild', { tag: 'whatever' }).getRawLogger();
// same result, but async
const childLogger = await Logger.child('myRootChild', { tag: 'whatever' }).getRawLogger();

childLogger.debug('foo');
```

This skips all that Class instantiation and hierarchy (get the pino instance from the root Logger class and create a child logger off of that)

```ts
// Logger (class) which contains the root pino logger.  Will be created if one doesn't exist
// pino child logger created from the root Logger (class) pino instance
const childLogger = Logger.getRoot().getRawLogger().child({ tag: 'whatever', name: `myRootChild` });
// same result, but async
const childLogger = (await Logger.root()).getRawLogger().child({ tag: 'whatever', name: `myRootChild` });

childLogger.debug('foo');
```
