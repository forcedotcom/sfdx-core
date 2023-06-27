window.BENCHMARK_DATA = {
  "lastUpdate": 1687909995231,
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
          "id": "b04ec4177a139e5ed7409bca0b6c0fc06cbc877d",
          "message": "test: install deps",
          "timestamp": "2023-06-27T18:38:14-05:00",
          "tree_id": "c0d66a3a7a2ba0516a19c8a819c5efc952aac506",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b04ec4177a139e5ed7409bca0b6c0fc06cbc877d"
        },
        "date": 1687909152702,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "RegExp#test",
            "value": 35593298,
            "range": "±1.00%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "String#indexOf",
            "value": 718378585,
            "range": "±1.49%",
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
          "id": "d3a051a928e412ef7abe26b61015b115d96f3435",
          "message": "test: logger specific tests",
          "timestamp": "2023-06-27T18:50:45-05:00",
          "tree_id": "81082638871207d51435b8a150dd3a80b0860091",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d3a051a928e412ef7abe26b61015b115d96f3435"
        },
        "date": 1687909989190,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 9475,
            "range": "±1.75%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 73197496,
            "range": "±2.38%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 40450300,
            "range": "±1.75%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 27395750,
            "range": "±1.34%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 41176783,
            "range": "±0.99%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 18689169,
            "range": "±1.11%",
            "unit": "ops/sec",
            "extra": "89 samples"
          }
        ]
      }
    ]
  }
}