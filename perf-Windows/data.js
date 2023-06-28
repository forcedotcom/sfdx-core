window.BENCHMARK_DATA = {
  "lastUpdate": 1687993965484,
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
          "id": "bd83d3ebe45900d8506e5e10066e30cada49c4c0",
          "message": "test: cleanup from test",
          "timestamp": "2023-06-28T16:36:52-05:00",
          "tree_id": "e81fe27e91d901206cc6599931a9059b6effd9cc",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/bd83d3ebe45900d8506e5e10066e30cada49c4c0"
        },
        "date": 1687993902754,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 291314,
            "range": "±1.30%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 613774,
            "range": "±15.51%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 418999,
            "range": "±15.39%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 239771,
            "range": "±17.38%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 1457,
            "range": "±235.19%",
            "unit": "ops/sec",
            "extra": "8 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 248575,
            "range": "±14.60%",
            "unit": "ops/sec",
            "extra": "67 samples"
          }
        ]
      }
    ]
  }
}