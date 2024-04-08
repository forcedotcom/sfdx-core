# Migrating `@salesforce/core` from v6 to v7

v7 replaces `jsforce` with the new `@jsforce/jsforce-node`. It's a much smaller library. See https://github.com/jsforce/jsforce/issues/1374.

If you use `@salesforce/core` AND jsforce together, you should switch to using `@jsforce/jsforce-node`.

If you use another library that is using jsforce modules or types, be sure to update to a version of that library which uses `@jsforce/jsforce-node`

## Interfaces=>Type

We're going to standardize on Types instead of interfaces. They're almost identical except where they aren't. You probably won't notice.

## Breaking changes to AliasAccessor

Alias accessor had previously deprecated methods that are removed by this PR.

- `set`
- `unset`
- `unsetAll`
- `write` (has been a no-op since v6)

If you use these, typically via StateAggregator, update your code to use `setAndSave` or `unsetAndSave`

## SfError

SfError previously had a `cause` that conflicted with the more recent ES2022 native Error.cause

SfError has some new convenience methods. SfError.create (pass in props instead of setting 5 via params and others via instance methods).  
SfError.wrap and the `cause` prop of SfError.create are now typed as `unknown` for convenience (throw the `unknown` from a catch block without having to worry about types!).
SfError.data is now constrained to be AnyJson (some sort of JSON/primitive or collection of that).

## Top-level exports

v7 exports more top-level modules. If you had previously imported via `@salesforce/core/lib/foo` you may be able to import them from the top-level. See the package.json for what's available now.

everything that was previously available via `import ____ from '@salesforce/core'` is still available the same way.

```
"./messages": {
      "types": "./lib/messages.d.ts",
      "require": "./lib/messages.js",
      "import": "./lib/messages.js"
    },
    "./logger": {
      "types": "./lib/logger.d.ts",
      "require": "./lib/logger.js",
      "import": "./lib/logger.js"
    },
    "./project": {
      "types": "./lib/project.d.ts",
      "require": "./lib/project.js",
      "import": "./lib/project.js"
    },
    "./sfError": {
      "types": "./lib/sfError.d.ts",
      "require": "./lib/sfError.js",
      "import": "./lib/sfError.js"
    },
    "./stateAggregator": {
      "types": "./lib/stateAggregator/stateAggregator.d.ts",
      "require": "./lib/stateAggregator/stateAggregator.js",
      "import": "./lib/stateAggregator/stateAggregator.js"
    },
    "./configAggregator": {
      "types": "./lib/config/configAggregator.d.ts",
      "require": "./lib/config/configAggregator.js",
      "import": "./lib/config/configAggregator.js"
    },
    "./lifecycle": {
      "types": "./lib/lifecycleEvents.d.ts",
      "require": "./lib/lifecycleEvents.js",
      "import": "./lib/lifecycleEvents.js"
    },
    "./envVars": {
      "types": "./lib/config/envVars.d.ts",
      "require.js": "./lib/config/envVars.js",
      "import": "./lib/config/envVars.js"
    },
```
