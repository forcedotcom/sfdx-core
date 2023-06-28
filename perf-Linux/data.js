window.BENCHMARK_DATA = {
  "lastUpdate": 1687964850639,
  "repoUrl": "https://github.com/forcedotcom/sfdx-core",
  "entries": {
    "Logger Benchmarks - ubuntu-latest": [
      {
        "commit": {
          "author": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "committer": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "distinct": true,
          "id": "2587fdd632e7aa20ed507532d5a6fb966423b698",
          "message": "docs: readme and Benchmark names",
          "timestamp": "2023-06-27T21:36:43-05:00",
          "tree_id": "bd8f4474bb599c788b303866a0bc184847c96b9f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2587fdd632e7aa20ed507532d5a6fb966423b698"
        },
        "date": 1687920199164,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15413,
            "range": "±0.77%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 83759147,
            "range": "±0.29%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 52033571,
            "range": "±0.77%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 50118784,
            "range": "±0.37%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 52767399,
            "range": "±0.63%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 29574244,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "92 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "committer": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "distinct": true,
          "id": "d62da0186fe4031acc248dec68ce7b2b619cab6b",
          "message": "test: restore all tests",
          "timestamp": "2023-06-27T21:41:42-05:00",
          "tree_id": "7cb7d44ba92c17b62f6d0b0d763a1c18aa618c81",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d62da0186fe4031acc248dec68ce7b2b619cab6b"
        },
        "date": 1687957267453,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15559,
            "range": "±1.35%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 87939414,
            "range": "±0.22%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 57168926,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 54166415,
            "range": "±0.32%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 55851128,
            "range": "±0.51%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 31581918,
            "range": "±0.50%",
            "unit": "ops/sec",
            "extra": "91 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "committer": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "distinct": true,
          "id": "5f0f741aeefb720927169a63c4678aa719e72ad3",
          "message": "test: also build",
          "timestamp": "2023-06-28T09:29:15-05:00",
          "tree_id": "732d62551659090303af4ffa5f6ec7ff89c91c64",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5f0f741aeefb720927169a63c4678aa719e72ad3"
        },
        "date": 1687962712080,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 382591,
            "range": "±2.63%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 94574492,
            "range": "±2.00%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 66701506,
            "range": "±1.57%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 41363757,
            "range": "±1.81%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 70217750,
            "range": "±1.65%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 35888226,
            "range": "±2.08%",
            "unit": "ops/sec",
            "extra": "82 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "committer": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "mshanemc",
            "username": "mshanemc"
          },
          "distinct": true,
          "id": "af4e0716272de067d5393cc95b433184f0164bcd",
          "message": "test: use warn level to capture real (non-noop) traffic",
          "timestamp": "2023-06-28T10:04:44-05:00",
          "tree_id": "76783a92cf0e3ad70f3683eb127cf282842cd3b1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/af4e0716272de067d5393cc95b433184f0164bcd"
        },
        "date": 1687964843355,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 8412,
            "range": "±1.40%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 57722,
            "range": "±1.27%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 46432,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 20828,
            "range": "±1.27%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 42620,
            "range": "±1.13%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 38907,
            "range": "±1.24%",
            "unit": "ops/sec",
            "extra": "85 samples"
          }
        ]
      }
    ]
  }
}