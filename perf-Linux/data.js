window.BENCHMARK_DATA = {
  "lastUpdate": 1687993827716,
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
          "id": "bd83d3ebe45900d8506e5e10066e30cada49c4c0",
          "message": "test: cleanup from test",
          "timestamp": "2023-06-28T16:36:52-05:00",
          "tree_id": "e81fe27e91d901206cc6599931a9059b6effd9cc",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/bd83d3ebe45900d8506e5e10066e30cada49c4c0"
        },
        "date": 1687993821947,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 408432,
            "range": "±1.00%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 641515,
            "range": "±21.57%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 457083,
            "range": "±8.97%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7840,
            "range": "±190.79%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 377167,
            "range": "±17.03%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 305448,
            "range": "±8.63%",
            "unit": "ops/sec",
            "extra": "55 samples"
          }
        ]
      }
    ]
  }
}