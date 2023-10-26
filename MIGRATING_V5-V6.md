# Migrating `@salesforce/core` from v5 to v6

v5 contains breaking changes to the classes that extend from ConfigStore/ConfigFile. We'll call these the "config stack" as a shorthand

We've had a series of bugs where files controlled by the config stack could lose data or become corrupted when multiple processes try to write them concurrently.

V6 introducing a file locking mechanism previously only available on the `alias` file and a process of resolving conflicts based on timestamps.

But that comes with breaking changes to to reduce the risk of "getting around" the safeties.

## Breaking changes related to the Config Stack

- AuthInfo.getFields now returns a read-only object. Use AuthInfo.update to change values in the fields.
- `setContents` method is no longer available in the ConfigFile stack. Use `update` to merge in multiple props, or `set/unset` on a single prop.
- `write` and `writeSync` method no longer accepts a param. Use other methods (`set`, `unset`, `update) to make modifications, then call write()/writeSync() to do the write.
- the use of lodash-style `get`/`set` (ex: `set('foo.bar.baz[0]', 3)`) no longer works.
- You can no longer override the `setMethod` and `getMethod`` when extending classes built on ConfigFile. Technically you could override get/set, but DON'T!
- Everything related to tokens/tokenConfig is gone

## Unrelated changes that we did because it's a major version

- node18+ only, compiles to es2022
- move `uniqid`` to a shared function, outside of testSetup

## Previously deprecated items that are now removed

- removed sfdc.isInternalUrl. Use new SfdcUrl(url).isInternalUrl()
- removed sfdc.findUppercaseKeys. There is no replacement.
- removed SchemaPrinter. There is no replacement.
