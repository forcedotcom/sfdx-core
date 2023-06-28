window.BENCHMARK_DATA = {
  "lastUpdate": 1687920204292,
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
      }
    ]
  }
}