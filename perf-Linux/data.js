window.BENCHMARK_DATA = {
  "lastUpdate": 1687912723277,
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
          "id": "5f9a3c2b23424a5f681dc1dc1247e93713a0271c",
          "message": "test: new output file path",
          "timestamp": "2023-06-27T19:24:46-05:00",
          "tree_id": "9a63e9c399e87559bf9f57d90b85ee35a71e62f3",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5f9a3c2b23424a5f681dc1dc1247e93713a0271c"
        },
        "date": 1687912718420,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15405,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 85233312,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 52452160,
            "range": "±0.67%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 50866019,
            "range": "±0.41%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 53309860,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 29554805,
            "range": "±0.45%",
            "unit": "ops/sec",
            "extra": "93 samples"
          }
        ]
      }
    ]
  }
}