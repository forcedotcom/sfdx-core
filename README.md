[![NPM](https://img.shields.io/npm/v/@salesforce/core.svg)](https://www.npmjs.com/package/@salesforce/core)

- [Description](#description)
- [Usage](#usage)
  - [Contributing](#contributing)
- [Using TestSetup](#using-testsetup)
- [Message Transformer](#message-transformer)

# Description

The @salesforce/core library provides client-side management of Salesforce DX projects, org authentication, connections to Salesforce APIs, and other utilities. Much of the core functionality that powers the Salesforce CLI plugins comes from this library. You can use this functionality in your plugins too.

# Usage

See the [API documentation](https://forcedotcom.github.io/sfdx-core/).

## Contributing

If you're interested in contributing, take a look at the [CONTRIBUTING](CONTRIBUTING.md) guide.

## Issues

Report all issues to the [issues only repository](https://github.com/forcedotcom/cli/issues).

# Using TestSetup

The Salesforce DX Core Library provides a unit testing utility to help with mocking and sand-boxing core components. This feature allows unit tests to execute without needing to make API calls to salesforce.com.

See the [Test Setup documentation](TEST_SETUP.md).

## Message Transformer

The Messages class, by default, loads message text during run time. It's optimized to do this only per file.

If you're using @salesforce/core or other code that uses its Messages class in a bundler (webpack, esbuild, etc) it may struggle with these runtime references.

src/messageTransformer will "inline" the messages into the js files during TS compile using `https://github.com/nonara/ts-patch`.

In your plugin or library,

`yarn add --dev ts-patch`

> tsconfig.json

```json
{
  ...
  "plugins": [{ "transform": "@salesforce/core/lib/messageTransformer", "import": "messageTransformer" }]
}
```

> .sfdevrc.json, which gets merged into package.json

```json
"wireit": {
    "compile": {
      "command": "tspc -p . --pretty --incremental",
      "files": [
        "src/**/*.ts",
        "tsconfig.json",
        "messages"
      ],
      "output": [
        "lib/**",
        "*.tsbuildinfo"
      ],
      "clean": "if-file-deleted"
    }
  }

```

## Performance Testing

There are some benchmark.js checks to get a baseline for Logger performance.
https://forcedotcom.github.io/sfdx-core/perf-Linux
https://forcedotcom.github.io/sfdx-core/perf-Windows

You can add more test cases in test/perf/logger/main.js

If you add tests for new parts of sfdx-core outside of Logger, add new test Suites and create new jobs in the GHA `perf.yml`
