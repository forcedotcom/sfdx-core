window.BENCHMARK_DATA = {
  "lastUpdate": 1687916476818,
  "repoUrl": "https://github.com/forcedotcom/sfdx-core",
  "entries": {
    "Benchmark": [
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
          "id": "edf6ad5d0a97564ec2e098a024d39a31950ba2e4",
          "message": "test: perf on windows",
          "timestamp": "2023-06-27T19:56:47-05:00",
          "tree_id": "b51f589034f255c9fe61dd129b61715753e7d4cd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/edf6ad5d0a97564ec2e098a024d39a31950ba2e4"
        },
        "date": 1687914010761,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 4124,
            "range": "±1.55%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 65730946,
            "range": "±1.13%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 40948499,
            "range": "±2.27%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 39746609,
            "range": "±1.00%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 41733373,
            "range": "±1.05%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 22469999,
            "range": "±8.18%",
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
          "id": "e7258d67c8f4e2537392b8ce5b5cae5aaf3569f2",
          "message": "style: remove example comments",
          "timestamp": "2023-06-27T20:36:08-05:00",
          "tree_id": "13ef2b0f189515b083dfc874c67fab4d71a5f331",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e7258d67c8f4e2537392b8ce5b5cae5aaf3569f2"
        },
        "date": 1687916460485,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5341,
            "range": "±1.74%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 79394057,
            "range": "±2.40%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 52302640,
            "range": "±0.60%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 47805326,
            "range": "±0.51%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 50607748,
            "range": "±1.96%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 28403323,
            "range": "±1.38%",
            "unit": "ops/sec",
            "extra": "86 samples"
          }
        ]
      }
    ]
  }
}