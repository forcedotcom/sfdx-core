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

## RPC Interface

The @salesforce/core library now includes a lightweight RPC interface that can connect with Python's AnyIO for JSON-based access to all commands.

### Usage

1. Start the RPC server:

```javascript
const { RpcServer } = require('@salesforce/core');
const rpcServer = new RpcServer();
rpcServer.start();
```

2. Connect to the RPC server using Python's AnyIO:

```python
import anyio
import httpx
from pydantic import BaseModel

class AuthInfo(BaseModel):
    username: str
    accessToken: str
    instanceUrl: str

class Connection(BaseModel):
    accessToken: str
    instanceUrl: str

class Org(BaseModel):
    orgId: str

class RpcClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.client = httpx.AsyncClient()

    async def get_auth_info(self, username: str) -> AuthInfo:
        response = await self.client.get(f"{self.base_url}/authInfo", params={"username": username})
        response.raise_for_status()
        return AuthInfo(**response.json())

    async def get_connection(self, username: str) -> Connection:
        response = await self.client.get(f"{self.base_url}/connection", params={"username": username})
        response.raise_for_status()
        return Connection(**response.json())

    async def get_org(self, username: str) -> Org:
        response = await self.client.get(f"{self.base_url}/org", params={"username": username})
        response.raise_for_status()
        return Org(**response.json())

    async def get_lifecycle_listeners(self, event_name: str) -> int:
        response = await self.client.get(f"{self.base_url}/lifecycle", params={"eventName": event_name})
        response.raise_for_status()
        return response.json()["listeners"]

    async def close(self):
        await self.client.aclose()

async def main():
    client = RpcClient("http://localhost:4000")
    auth_info = await client.get_auth_info("example_username")
    print(auth_info)
    await client.close()

anyio.run(main)
```
