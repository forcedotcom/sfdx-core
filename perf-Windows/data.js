window.BENCHMARK_DATA = {
  "lastUpdate": 1687920338734,
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
      }
    ]
  }
}