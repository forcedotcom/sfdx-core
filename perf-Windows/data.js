window.BENCHMARK_DATA = {
  "lastUpdate": 1687962859529,
  "repoUrl": "https://github.com/forcedotcom/sfdx-core",
  "entries": {
    "Logger Benchmarks - windows-latest": [
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
        "date": 1687920323379,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 6140,
            "range": "±2.85%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 66863389,
            "range": "±0.95%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 38426290,
            "range": "±1.15%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 35362991,
            "range": "±0.92%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 36990721,
            "range": "±0.71%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 20060562,
            "range": "±0.81%",
            "unit": "ops/sec",
            "extra": "87 samples"
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
        "date": 1687957377634,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 4099,
            "range": "±1.67%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 63699143,
            "range": "±0.91%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 40441193,
            "range": "±0.82%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 38076233,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 40514385,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 22834127,
            "range": "±0.55%",
            "unit": "ops/sec",
            "extra": "89 samples"
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
        "date": 1687962843258,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 281042,
            "range": "±5.22%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 84715611,
            "range": "±0.85%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 72946725,
            "range": "±1.26%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 63003908,
            "range": "±3.01%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 57948991,
            "range": "±7.79%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 39251837,
            "range": "±2.37%",
            "unit": "ops/sec",
            "extra": "84 samples"
          }
        ]
      }
    ]
  }
}