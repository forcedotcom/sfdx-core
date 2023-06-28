window.BENCHMARK_DATA = {
  "lastUpdate": 1687957272736,
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
      }
    ]
  }
}