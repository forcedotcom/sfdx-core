window.BENCHMARK_DATA = {
  "lastUpdate": 1701701779743,
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
          "id": "985bd0b66173dfb65912b58a1444ce29996404c7",
          "message": "Merge branch 'sm/perf-metrics' into wr/unsetAliasConfig",
          "timestamp": "2023-06-29T07:58:10-05:00",
          "tree_id": "ccb1fce7b32f747f2c83d3aa8c1fe17b4308b887",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/985bd0b66173dfb65912b58a1444ce29996404c7"
        },
        "date": 1688043827499,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 3311,
            "range": "±1.11%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 51556,
            "range": "±1.13%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 38789,
            "range": "±0.95%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 18035,
            "range": "±0.91%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 34836,
            "range": "±1.16%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 31794,
            "range": "±1.00%",
            "unit": "ops/sec",
            "extra": "85 samples"
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
          "id": "a548663511e01d19964f3bade9366ca4e23ad63c",
          "message": "test: build before perf",
          "timestamp": "2023-06-29T08:12:46-05:00",
          "tree_id": "f132f7b1957875823a092e05504a2af6db2fb4f1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a548663511e01d19964f3bade9366ca4e23ad63c"
        },
        "date": 1688044830756,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 6003,
            "range": "±6.15%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 58363,
            "range": "±0.56%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49729,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23763,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45202,
            "range": "±0.12%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 40117,
            "range": "±0.18%",
            "unit": "ops/sec",
            "extra": "96 samples"
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
          "id": "8ebb20a32771a874fbe7d9756bbf259501143971",
          "message": "test: don't need cache",
          "timestamp": "2023-06-29T08:28:57-05:00",
          "tree_id": "dbe17c1e036cac8eb4967c877a1ac36b98e99a1e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8ebb20a32771a874fbe7d9756bbf259501143971"
        },
        "date": 1688045663917,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 3372,
            "range": "±1.59%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 51395,
            "range": "±1.17%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 39204,
            "range": "±1.43%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 17462,
            "range": "±2.81%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 38172,
            "range": "±1.12%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 33932,
            "range": "±1.10%",
            "unit": "ops/sec",
            "extra": "83 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e564c78511cbf2d4aa8b7de45968c51f88e949ca",
          "message": "chore(dev-deps): bump @typescript-eslint/parser from 5.59.11 to 5.60.1\n\nBumps [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/parser) from 5.59.11 to 5.60.1.\n- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)\n- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/parser/CHANGELOG.md)\n- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v5.60.1/packages/parser)\n\n---\nupdated-dependencies:\n- dependency-name: \"@typescript-eslint/parser\"\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-06-29T14:24:56Z",
          "tree_id": "d2a7c9596188626bda554e9e20514689d11528e8",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e564c78511cbf2d4aa8b7de45968c51f88e949ca"
        },
        "date": 1688048971951,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5066,
            "range": "±1.43%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 59246,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 50499,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 24162,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 44903,
            "range": "±1.11%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 41273,
            "range": "±0.85%",
            "unit": "ops/sec",
            "extra": "88 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "svc-cli-bot",
            "username": "svc-cli-bot",
            "email": "svc_cli_bot@salesforce.com"
          },
          "committer": {
            "name": "svc-cli-bot",
            "username": "svc-cli-bot",
            "email": "svc_cli_bot@salesforce.com"
          },
          "id": "c26a63635e96a375bc0afbc57778544a48b58805",
          "message": "chore(release): 4.3.5 [skip ci]",
          "timestamp": "2023-06-29T14:24:25Z",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c26a63635e96a375bc0afbc57778544a48b58805"
        },
        "date": 1688049490708,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 3634,
            "range": "±8.93%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 50213,
            "range": "±1.67%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 42886,
            "range": "±1.03%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 18842,
            "range": "±3.31%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 39357,
            "range": "±1.23%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 33290,
            "range": "±1.77%",
            "unit": "ops/sec",
            "extra": "86 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mshanemc",
            "username": "mshanemc",
            "email": "shane.mclaughlin@salesforce.com"
          },
          "committer": {
            "name": "mshanemc",
            "username": "mshanemc",
            "email": "shane.mclaughlin@salesforce.com"
          },
          "id": "3e49d42db93c742c0a115aa29a322c6f9e28d2f9",
          "message": "ci: don't run perf tests on gh-pages pushes",
          "timestamp": "2023-06-29T15:08:19Z",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3e49d42db93c742c0a115aa29a322c6f9e28d2f9"
        },
        "date": 1688051564367,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5916,
            "range": "±6.89%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 67415,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 57022,
            "range": "±0.57%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 26402,
            "range": "±0.61%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 51196,
            "range": "±0.51%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 45174,
            "range": "±0.54%",
            "unit": "ops/sec",
            "extra": "91 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "name": "mshanemc",
            "username": "mshanemc",
            "email": "shane.mclaughlin@salesforce.com"
          },
          "committer": {
            "name": "mshanemc",
            "username": "mshanemc",
            "email": "shane.mclaughlin@salesforce.com"
          },
          "id": "3e49d42db93c742c0a115aa29a322c6f9e28d2f9",
          "message": "ci: don't run perf tests on gh-pages pushes",
          "timestamp": "2023-06-29T15:08:19Z",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3e49d42db93c742c0a115aa29a322c6f9e28d2f9"
        },
        "date": 1688052094604,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 3326,
            "range": "±0.99%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 49551,
            "range": "±1.00%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 36566,
            "range": "±0.99%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 15768,
            "range": "±2.90%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 33293,
            "range": "±1.15%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 28685,
            "range": "±1.62%",
            "unit": "ops/sec",
            "extra": "83 samples"
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
          "id": "210f380e466da90f26a01891d36f660b0c5892be",
          "message": "Merge remote-tracking branch 'origin/main' into sm/new-logger",
          "timestamp": "2023-06-29T10:12:15-05:00",
          "tree_id": "beb631c20367e3c3baa1f781c62159c8947ba93d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/210f380e466da90f26a01891d36f660b0c5892be"
        },
        "date": 1688056695003,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 299792,
            "range": "±1.15%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 610896,
            "range": "±10.65%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 419550,
            "range": "±13.10%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 213593,
            "range": "±22.33%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 3757,
            "range": "±205.78%",
            "unit": "ops/sec",
            "extra": "21 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 267433,
            "range": "±9.80%",
            "unit": "ops/sec",
            "extra": "71 samples"
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
          "id": "4b0746bb3fea34d9636b6539d05b68dfbd7f6ddb",
          "message": "refactor: 3x faster filters",
          "timestamp": "2023-06-29T14:39:48-05:00",
          "tree_id": "0edb9bd4bb1bbe572357a8703f9d6150aaa98900",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4b0746bb3fea34d9636b6539d05b68dfbd7f6ddb"
        },
        "date": 1688068220186,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 313610,
            "range": "±1.70%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 542286,
            "range": "±11.74%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 474700,
            "range": "±13.40%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 279133,
            "range": "±18.03%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 8448,
            "range": "±200.58%",
            "unit": "ops/sec",
            "extra": "25 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 227494,
            "range": "±13.65%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
          "id": "e37e172636bc064e7f23d753a48be12f69ce2019",
          "message": "chore: code cleanup for pr",
          "timestamp": "2023-06-29T16:07:01-05:00",
          "tree_id": "010e93cab508ce57d73126b881e78cf81c5b5aef",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e37e172636bc064e7f23d753a48be12f69ce2019"
        },
        "date": 1688073453417,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 251827,
            "range": "±0.94%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 448254,
            "range": "±16.80%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 330859,
            "range": "±14.53%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 164404,
            "range": "±23.82%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 205359,
            "range": "±20.85%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 122913,
            "range": "±24.97%",
            "unit": "ops/sec",
            "extra": "43 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "committer": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "distinct": true,
          "id": "cfab6a0f045105e7e852d602bf81002574797716",
          "message": "chore: bring back jsforce changes",
          "timestamp": "2023-06-29T19:18:54-03:00",
          "tree_id": "4c67c13e048c020c95787aac4f6175952523d71b",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/cfab6a0f045105e7e852d602bf81002574797716"
        },
        "date": 1688077499365,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 3007,
            "range": "±2.16%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 47470,
            "range": "±1.46%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 37669,
            "range": "±1.57%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 16558,
            "range": "±1.71%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 33245,
            "range": "±1.57%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 30699,
            "range": "±1.74%",
            "unit": "ops/sec",
            "extra": "84 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ae12764a1051e4a7723a66965c97b09e5d69cac2",
          "message": "chore(dev-deps): bump @typescript-eslint/parser from 5.59.11 to 5.60.1\n\nBumps [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/parser) from 5.59.11 to 5.60.1.\n- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)\n- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/parser/CHANGELOG.md)\n- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v5.60.1/packages/parser)\n\n---\nupdated-dependencies:\n- dependency-name: \"@typescript-eslint/parser\"\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-06-30T05:46:04Z",
          "tree_id": "9244836f19a4bea8ed1e07c45f8523a4455b0080",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ae12764a1051e4a7723a66965c97b09e5d69cac2"
        },
        "date": 1688104235157,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 4166,
            "range": "±1.77%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 49398,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 43224,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 19742,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 38895,
            "range": "±1.12%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 32650,
            "range": "±1.20%",
            "unit": "ops/sec",
            "extra": "86 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "52ddabdbd02062a2fd721e6505e0d54a46443399",
          "message": "chore(dev-deps): bump eslint from 8.43.0 to 8.44.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.43.0 to 8.44.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.43.0...v8.44.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-01T21:23:50Z",
          "tree_id": "967e650d4c07f7f389f9233c6c296952160dc475",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/52ddabdbd02062a2fd721e6505e0d54a46443399"
        },
        "date": 1688246878409,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5273,
            "range": "±1.11%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 61395,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 51821,
            "range": "±0.36%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23915,
            "range": "±2.03%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 47496,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 43575,
            "range": "±0.38%",
            "unit": "ops/sec",
            "extra": "90 samples"
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
          "id": "aab1552ce71beb98d5e07ca77e924cb172d16719",
          "message": "test: 1 external nut",
          "timestamp": "2023-07-03T10:22:27-05:00",
          "tree_id": "262ce283ce965d0f46a005f429445e7aa1ad0d6a",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/aab1552ce71beb98d5e07ca77e924cb172d16719"
        },
        "date": 1688398169943,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 318681,
            "range": "±0.46%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 606449,
            "range": "±14.96%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 320808,
            "range": "±19.80%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 131826,
            "range": "±20.97%",
            "unit": "ops/sec",
            "extra": "27 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 220252,
            "range": "±23.50%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 145303,
            "range": "±16.78%",
            "unit": "ops/sec",
            "extra": "41 samples"
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
          "id": "3f3b529da50276dca38065495462a91fd87e2db5",
          "message": "test: verify auth nuts",
          "timestamp": "2023-07-03T11:57:13-05:00",
          "tree_id": "b53832b37f0fc9e9078eb432c5a7276bd499772f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3f3b529da50276dca38065495462a91fd87e2db5"
        },
        "date": 1688403942742,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 238556,
            "range": "±0.97%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 462543,
            "range": "±13.82%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 308548,
            "range": "±21.01%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 168364,
            "range": "±20.11%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 196176,
            "range": "±19.12%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 101608,
            "range": "±25.06%",
            "unit": "ops/sec",
            "extra": "36 samples"
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
          "id": "96735d7faa66e439d7f35378b9a97ec303f8c8e6",
          "message": "test: get more data for 3 windows nut failures",
          "timestamp": "2023-07-05T09:26:37-05:00",
          "tree_id": "3f67ef3dd2f0fda09fe36b3785ae39a66dc2f972",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/96735d7faa66e439d7f35378b9a97ec303f8c8e6"
        },
        "date": 1688567559670,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 233374,
            "range": "±7.63%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 415308,
            "range": "±12.09%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 295761,
            "range": "±24.87%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 159125,
            "range": "±22.47%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 198859,
            "range": "±20.87%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 128750,
            "range": "±24.38%",
            "unit": "ops/sec",
            "extra": "44 samples"
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
          "id": "52b2c8662ef1065fcdc812b559693e19223fe1bf",
          "message": "test: avoid perf flaps, restore all extNuts",
          "timestamp": "2023-07-05T10:29:54-05:00",
          "tree_id": "d6c9eeb40955d4e4e2a80413bd87b2181b9e992d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/52b2c8662ef1065fcdc812b559693e19223fe1bf"
        },
        "date": 1688571336055,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 303405,
            "range": "±0.28%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 731110,
            "range": "±9.67%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 341136,
            "range": "±20.54%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 164259,
            "range": "±23.67%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 239137,
            "range": "±22.00%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 148794,
            "range": "±21.50%",
            "unit": "ops/sec",
            "extra": "44 samples"
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
          "id": "cbfc47a66975a482cc51af2f1528142775aca3be",
          "message": "fix: query scratch orgs by provided Id",
          "timestamp": "2023-07-05T12:47:30-05:00",
          "tree_id": "90cc767c87fbcd5f464043be04ccb4e717158556",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/cbfc47a66975a482cc51af2f1528142775aca3be"
        },
        "date": 1688579423224,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 6133,
            "range": "±0.74%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 58751,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49674,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23577,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45636,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 40544,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "94 samples"
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
          "id": "5f535654b95a50aa6a37fbe313d6138a3ca43cf7",
          "message": "test: don't fail for perf (yet!)",
          "timestamp": "2023-07-05T13:01:55-05:00",
          "tree_id": "b322a482d31d24173c14287796a89467a183ed0c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5f535654b95a50aa6a37fbe313d6138a3ca43cf7"
        },
        "date": 1688580379683,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5962,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 58025,
            "range": "±0.38%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49903,
            "range": "±0.55%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 22865,
            "range": "±7.35%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45556,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 40765,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "94 samples"
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
          "id": "17dd00452d93c2a62bcf45ac9a6429671d16648b",
          "message": "test: delay nuts for UT",
          "timestamp": "2023-07-05T13:36:20-05:00",
          "tree_id": "4b6df803d301ced81e7936a8274d8cf7b7226aa1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/17dd00452d93c2a62bcf45ac9a6429671d16648b"
        },
        "date": 1688582668972,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 196430,
            "range": "±8.86%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 416473,
            "range": "±10.47%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 273834,
            "range": "±20.12%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 165226,
            "range": "±21.31%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 223425,
            "range": "±25.77%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 117942,
            "range": "±24.76%",
            "unit": "ops/sec",
            "extra": "38 samples"
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
          "id": "0b24b599b5310527029c5afeb8f62dcd4187b926",
          "message": "test: org with testkit for debug",
          "timestamp": "2023-07-06T10:09:57-05:00",
          "tree_id": "a3aa8bd54724008304cd70b9269c8b4da1d74929",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0b24b599b5310527029c5afeb8f62dcd4187b926"
        },
        "date": 1688656628132,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 387318,
            "range": "±4.89%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 818760,
            "range": "±12.87%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 627075,
            "range": "±16.39%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5902,
            "range": "±211.06%",
            "unit": "ops/sec",
            "extra": "15 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 535445,
            "range": "±15.54%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 349364,
            "range": "±12.44%",
            "unit": "ops/sec",
            "extra": "67 samples"
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
          "id": "4c1a87dc2dcf3d78db20497b9a4eb2e0e2849b34",
          "message": "test: re-add user, org plugins",
          "timestamp": "2023-07-06T10:39:48-05:00",
          "tree_id": "71e76b5b39b7a1cd9d2135221af3b20a3a5ddc0f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4c1a87dc2dcf3d78db20497b9a4eb2e0e2849b34"
        },
        "date": 1688658544843,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 235866,
            "range": "±0.89%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 544131,
            "range": "±7.83%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 293868,
            "range": "±20.21%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 145959,
            "range": "±23.51%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 234472,
            "range": "±19.27%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 138633,
            "range": "±22.52%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "2d8191a5831e6f3e66c2adeb8c8ed9b6802d697a",
          "message": "test: full extNut suite",
          "timestamp": "2023-07-06T18:01:31-05:00",
          "tree_id": "faddd6d112fc1ace750de91c1e7e6907cb82ab3e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2d8191a5831e6f3e66c2adeb8c8ed9b6802d697a"
        },
        "date": 1688684975819,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 290405,
            "range": "±2.86%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 601021,
            "range": "±11.92%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 447180,
            "range": "±18.63%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 226644,
            "range": "±18.99%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 15428,
            "range": "±186.03%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 214357,
            "range": "±14.44%",
            "unit": "ops/sec",
            "extra": "59 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "109ac7d5fef8b6ad583b1c2f87215fc5dab26837",
          "message": "chore(deps): bump tough-cookie from 4.0.0 to 4.1.3 in /examples\n\nBumps [tough-cookie](https://github.com/salesforce/tough-cookie) from 4.0.0 to 4.1.3.\n- [Release notes](https://github.com/salesforce/tough-cookie/releases)\n- [Changelog](https://github.com/salesforce/tough-cookie/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/salesforce/tough-cookie/compare/v4.0.0...v4.1.3)\n\n---\nupdated-dependencies:\n- dependency-name: tough-cookie\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-08T03:02:55Z",
          "tree_id": "ebd46a96c27df948c044bddff2e25c4b508691d4",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/109ac7d5fef8b6ad583b1c2f87215fc5dab26837"
        },
        "date": 1688785625986,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 6002,
            "range": "±1.09%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 57967,
            "range": "±0.16%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 48546,
            "range": "±1.51%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23555,
            "range": "±0.49%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 44461,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 40048,
            "range": "±0.33%",
            "unit": "ops/sec",
            "extra": "87 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "db06bc93cc99060d250b3d6f5bb0ee9050d9c898",
          "message": "chore(deps): bump tough-cookie from 4.0.0 to 4.1.3 in /examples\n\nBumps [tough-cookie](https://github.com/salesforce/tough-cookie) from 4.0.0 to 4.1.3.\n- [Release notes](https://github.com/salesforce/tough-cookie/releases)\n- [Changelog](https://github.com/salesforce/tough-cookie/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/salesforce/tough-cookie/compare/v4.0.0...v4.1.3)\n\n---\nupdated-dependencies:\n- dependency-name: tough-cookie\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-08T05:45:46Z",
          "tree_id": "cf190ce4d2fa2b697576ae8c13237354a8b4aab3",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/db06bc93cc99060d250b3d6f5bb0ee9050d9c898"
        },
        "date": 1688795312714,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5109,
            "range": "±7.17%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 59275,
            "range": "±0.42%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49479,
            "range": "±6.44%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 24321,
            "range": "±0.34%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45737,
            "range": "±0.32%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 42235,
            "range": "±0.41%",
            "unit": "ops/sec",
            "extra": "90 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "faa354c797181977ff058cfd14a197171df076b9",
          "message": "chore(dev-deps): bump @salesforce/ts-sinon from 1.4.8 to 1.4.9\n\nBumps [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon) from 1.4.8 to 1.4.9.\n- [Release notes](https://github.com/forcedotcom/ts-sinon/releases)\n- [Changelog](https://github.com/forcedotcom/ts-sinon/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-sinon/compare/1.4.8...1.4.9)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-sinon\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-08T21:39:49Z",
          "tree_id": "34b22a376d895440821a191e227d4f440cb23e85",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/faa354c797181977ff058cfd14a197171df076b9"
        },
        "date": 1688852688113,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 6098,
            "range": "±0.97%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 58669,
            "range": "±0.23%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 48966,
            "range": "±0.43%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23679,
            "range": "±0.70%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45340,
            "range": "±0.48%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 40965,
            "range": "±0.50%",
            "unit": "ops/sec",
            "extra": "92 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0c58e73cea21a1616c2270408e6647c3023f023b",
          "message": "fix(deps): bump @salesforce/schemas from 1.5.1 to 1.6.0\n\nBumps [@salesforce/schemas](https://github.com/forcedotcom/schemas) from 1.5.1 to 1.6.0.\n- [Release notes](https://github.com/forcedotcom/schemas/releases)\n- [Commits](https://github.com/forcedotcom/schemas/compare/1.5.1...1.6.0)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/schemas\"\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-09T03:05:40Z",
          "tree_id": "7943b16f9327ecbb604c6d51e38d8a0e9e0bf65d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0c58e73cea21a1616c2270408e6647c3023f023b"
        },
        "date": 1688872248756,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 3285,
            "range": "±1.34%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 44729,
            "range": "±0.88%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 37898,
            "range": "±0.98%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 16985,
            "range": "±1.42%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 33258,
            "range": "±1.09%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 29763,
            "range": "±1.30%",
            "unit": "ops/sec",
            "extra": "84 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "238e166de406d35082bc263e50f94ebdb0ee9927",
          "message": "chore(dev-deps): bump @typescript-eslint/parser from 5.60.1 to 5.61.0\n\nBumps [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/parser) from 5.60.1 to 5.61.0.\n- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)\n- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/parser/CHANGELOG.md)\n- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v5.61.0/packages/parser)\n\n---\nupdated-dependencies:\n- dependency-name: \"@typescript-eslint/parser\"\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-09T05:46:02Z",
          "tree_id": "2d7a20cc99f68a9f3bc66f884b5a549f89da1589",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/238e166de406d35082bc263e50f94ebdb0ee9927"
        },
        "date": 1688881798532,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5244,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 59009,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 50781,
            "range": "±0.67%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 24183,
            "range": "±0.66%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45750,
            "range": "±0.31%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 42118,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "92 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2be226386f14a3b3ffa1a4d6483d2db3d032c3f1",
          "message": "fix(deps): bump @salesforce/schemas from 1.5.1 to 1.6.0\n\nBumps [@salesforce/schemas](https://github.com/forcedotcom/schemas) from 1.5.1 to 1.6.0.\n- [Release notes](https://github.com/forcedotcom/schemas/releases)\n- [Commits](https://github.com/forcedotcom/schemas/compare/1.5.1...1.6.0)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/schemas\"\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-09T11:46:09Z",
          "tree_id": "07dc9fe38f154f3df77b13002de8933520e731a7",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2be226386f14a3b3ffa1a4d6483d2db3d032c3f1"
        },
        "date": 1688903386973,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5950,
            "range": "±6.06%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 59293,
            "range": "±0.16%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 50617,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 24430,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 46217,
            "range": "±0.23%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 42714,
            "range": "±0.22%",
            "unit": "ops/sec",
            "extra": "90 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "eef3f68337ff0b087072e4e911f309eefe60efb4",
          "message": "fix(deps): bump semver from 5.7.1 to 5.7.2\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-11T03:54:33Z",
          "tree_id": "4fa71fe4f17a369229ece24763873b5205fb7f60",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/eef3f68337ff0b087072e4e911f309eefe60efb4"
        },
        "date": 1689047844426,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 6068,
            "range": "±0.81%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 55556,
            "range": "±0.18%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49380,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23877,
            "range": "±0.78%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45656,
            "range": "±0.22%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 42063,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "91 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b80254b384de25ee0e0712fbc8fb52d32ee13153",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-11T05:45:27Z",
          "tree_id": "1791e000a29296c00108eb909ae13c1e0e073d29",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b80254b384de25ee0e0712fbc8fb52d32ee13153"
        },
        "date": 1689054592029,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5336,
            "range": "±1.09%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 59355,
            "range": "±1.87%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49059,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 22875,
            "range": "±0.55%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 43343,
            "range": "±2.15%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 39780,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "92 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ae66699c99012999db0edd85384237ba7405b7bf",
          "message": "fix(deps): bump jsonwebtoken from 9.0.0 to 9.0.1\n\nBumps [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) from 9.0.0 to 9.0.1.\n- [Changelog](https://github.com/auth0/node-jsonwebtoken/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/auth0/node-jsonwebtoken/compare/v9.0.0...v9.0.1)\n\n---\nupdated-dependencies:\n- dependency-name: jsonwebtoken\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-15T21:08:13Z",
          "tree_id": "bc0bb8752bfe6c1323eb80f1f4e988416b88375f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ae66699c99012999db0edd85384237ba7405b7bf"
        },
        "date": 1689455568134,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5080,
            "range": "±7.36%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 59243,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 48196,
            "range": "±0.37%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 22833,
            "range": "±0.60%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 44101,
            "range": "±0.33%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 39685,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "88 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fe7313e850b2072ba860ee78bc5abd233825ad89",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-16T03:08:51Z",
          "tree_id": "c21aaf7c08ba7f79e7ac28f8d41188bd855f3001",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/fe7313e850b2072ba860ee78bc5abd233825ad89"
        },
        "date": 1689477208449,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 4382,
            "range": "±1.58%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 50715,
            "range": "±0.98%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 42528,
            "range": "±1.37%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 20182,
            "range": "±1.25%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 38483,
            "range": "±1.10%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 33616,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "85 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7732fb9bc05745778061abcd4af4912e55933348",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-16T05:45:49Z",
          "tree_id": "dea9840ee555db16edddf27f17278a0dc5484eda",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7732fb9bc05745778061abcd4af4912e55933348"
        },
        "date": 1689486532736,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 4231,
            "range": "±8.38%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 51391,
            "range": "±0.37%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 43162,
            "range": "±1.80%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 19823,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 38869,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 33241,
            "range": "±0.63%",
            "unit": "ops/sec",
            "extra": "90 samples"
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
          "id": "c52a29bd4162bc14ebaf690876db6589d21929fe",
          "message": "chore: breaking changes for Logger",
          "timestamp": "2023-07-20T11:44:09-05:00",
          "tree_id": "77e76513f23db1793883b0f5e71ff6417f323eff",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c52a29bd4162bc14ebaf690876db6589d21929fe"
        },
        "date": 1689871914795,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 598288,
            "range": "±1.27%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 817851,
            "range": "±14.13%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 479361,
            "range": "±24.56%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 244041,
            "range": "±22.60%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 4044,
            "range": "±242.35%",
            "unit": "ops/sec",
            "extra": "7 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 275780,
            "range": "±15.74%",
            "unit": "ops/sec",
            "extra": "71 samples"
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
          "id": "6f9451a8d3d210c7cd50e98a9042c7409067780b",
          "message": "docs: logger migration guide",
          "timestamp": "2023-07-20T13:39:39-05:00",
          "tree_id": "f61f78101a065d58cdcad69dc58fcc0cf8e55def",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6f9451a8d3d210c7cd50e98a9042c7409067780b"
        },
        "date": 1689878901500,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 339366,
            "range": "±17.22%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 452263,
            "range": "±19.75%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 309332,
            "range": "±20.29%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 179100,
            "range": "±19.05%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 246463,
            "range": "±20.52%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 138432,
            "range": "±22.01%",
            "unit": "ops/sec",
            "extra": "47 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ewillhoit@salesforce.com",
            "name": "Eric Willhoit",
            "username": "iowillhoit"
          },
          "committer": {
            "email": "ewillhoit@salesforce.com",
            "name": "Eric Willhoit",
            "username": "iowillhoit"
          },
          "distinct": true,
          "id": "568e9e8a23b3102875a042a6812c18737c71c90f",
          "message": "chore: new prerelease logic",
          "timestamp": "2023-07-20T15:20:25-05:00",
          "tree_id": "36549ca6ee498d8d67683a781c797dcca2d4f604",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/568e9e8a23b3102875a042a6812c18737c71c90f"
        },
        "date": 1689884730843,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 3169,
            "range": "±1.78%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 51810,
            "range": "±1.25%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 37757,
            "range": "±1.39%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 15445,
            "range": "±1.69%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 32543,
            "range": "±1.58%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 29312,
            "range": "±2.76%",
            "unit": "ops/sec",
            "extra": "85 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ewillhoit@salesforce.com",
            "name": "Eric Willhoit",
            "username": "iowillhoit"
          },
          "committer": {
            "email": "ewillhoit@salesforce.com",
            "name": "Eric Willhoit",
            "username": "iowillhoit"
          },
          "distinct": true,
          "id": "568e9e8a23b3102875a042a6812c18737c71c90f",
          "message": "chore: new prerelease logic",
          "timestamp": "2023-07-20T15:20:25-05:00",
          "tree_id": "36549ca6ee498d8d67683a781c797dcca2d4f604",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/568e9e8a23b3102875a042a6812c18737c71c90f"
        },
        "date": 1689885551250,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 4713,
            "range": "±9.71%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 58738,
            "range": "±0.56%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 48896,
            "range": "±0.88%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23078,
            "range": "±1.20%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45025,
            "range": "±0.82%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 39048,
            "range": "±12.07%",
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
          "id": "c6bbeb59aa4740382501a10d0a1b051dec5cb7c1",
          "message": "refactor: we can log objects now",
          "timestamp": "2023-07-21T14:33:07-05:00",
          "tree_id": "352b39efee20d0d26e1c8962dd40a5f5f0be6655",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c6bbeb59aa4740382501a10d0a1b051dec5cb7c1"
        },
        "date": 1689968453020,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 442948,
            "range": "±4.60%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 652135,
            "range": "±9.92%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 533590,
            "range": "±19.23%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 239711,
            "range": "±18.28%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 6639,
            "range": "±206.97%",
            "unit": "ops/sec",
            "extra": "18 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 285999,
            "range": "±18.67%",
            "unit": "ops/sec",
            "extra": "75 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c340b2cdd8119aeedbba02727448465e9903a155",
          "message": "chore(dev-deps): bump eslint-config-salesforce-typescript\n\nBumps [eslint-config-salesforce-typescript](https://github.com/forcedotcom/eslint-config-salesforce-typescript) from 1.1.1 to 1.1.2.\n- [Release notes](https://github.com/forcedotcom/eslint-config-salesforce-typescript/releases)\n- [Changelog](https://github.com/forcedotcom/eslint-config-salesforce-typescript/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/eslint-config-salesforce-typescript/compare/v1.1.1...1.1.2)\n\n---\nupdated-dependencies:\n- dependency-name: eslint-config-salesforce-typescript\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-22T21:10:45Z",
          "tree_id": "8e19d9c961f5218b6162bdcc754993f37835f04d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c340b2cdd8119aeedbba02727448465e9903a155"
        },
        "date": 1690060564430,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 4059,
            "range": "±1.82%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 50040,
            "range": "±1.12%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 41514,
            "range": "±1.28%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 19692,
            "range": "±2.18%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 37644,
            "range": "±1.44%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 32824,
            "range": "±1.05%",
            "unit": "ops/sec",
            "extra": "86 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f3ee1dc2751b43756571f41a0e08edc56d05ae45",
          "message": "chore(dev-deps): bump eslint-config-salesforce from 2.0.1 to 2.0.2\n\nBumps [eslint-config-salesforce](https://github.com/forcedotcom/eslint-config-salesforce) from 2.0.1 to 2.0.2.\n- [Release notes](https://github.com/forcedotcom/eslint-config-salesforce/releases)\n- [Changelog](https://github.com/forcedotcom/eslint-config-salesforce/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/eslint-config-salesforce/compare/2.0.1...2.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: eslint-config-salesforce\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-23T02:49:53Z",
          "tree_id": "59e2228a2ab5fcfcab0e150a0df0412599778920",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f3ee1dc2751b43756571f41a0e08edc56d05ae45"
        },
        "date": 1690080847137,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5220,
            "range": "±1.64%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 59192,
            "range": "±1.63%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49603,
            "range": "±1.60%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23277,
            "range": "±2.47%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 46458,
            "range": "±0.99%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 41494,
            "range": "±3.77%",
            "unit": "ops/sec",
            "extra": "90 samples"
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
          "id": "c6f4ddda89c10921b4e9680d3c3a38329b69e920",
          "message": "refactor: extract more auth from org",
          "timestamp": "2023-07-22T17:08:47-05:00",
          "tree_id": "9cb5b13f1f94efdd8c31be5562585a1cb5071aec",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c6f4ddda89c10921b4e9680d3c3a38329b69e920"
        },
        "date": 1690144920694,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 5735,
            "range": "±7.79%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 58744,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49662,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23653,
            "range": "±0.59%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 45438,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 40596,
            "range": "±0.29%",
            "unit": "ops/sec",
            "extra": "93 samples"
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
          "id": "039cc199fa867fba00bbad72b88a204494995a42",
          "message": "chore: pr comments",
          "timestamp": "2023-07-26T14:58:43-05:00",
          "tree_id": "2676a9f96f45e3707e97f46d397abda2a935ba19",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/039cc199fa867fba00bbad72b88a204494995a42"
        },
        "date": 1690401996800,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 471895,
            "range": "±3.40%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 613151,
            "range": "±6.81%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 484119,
            "range": "±11.44%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 280276,
            "range": "±17.21%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10975,
            "range": "±197.32%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 270933,
            "range": "±13.81%",
            "unit": "ops/sec",
            "extra": "68 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d787ff2c4619c0b4c0304cf104adf499ba18614c",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-27T16:28:17Z",
          "tree_id": "124f2414cf5df9769b4056069ab4d730152a0b90",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d787ff2c4619c0b4c0304cf104adf499ba18614c"
        },
        "date": 1690475723047,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 336732,
            "range": "±7.14%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 465285,
            "range": "±16.32%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 367202,
            "range": "±20.74%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 148571,
            "range": "±26.01%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 232926,
            "range": "±25.39%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 129145,
            "range": "±23.75%",
            "unit": "ops/sec",
            "extra": "43 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d74126520043d2357f847086059e59c6f8f16e5b",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-28T02:45:48Z",
          "tree_id": "f2eaaccb86c5ed688e92838c299194111b543224",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d74126520043d2357f847086059e59c6f8f16e5b"
        },
        "date": 1690512693332,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 478151,
            "range": "±5.56%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 576590,
            "range": "±13.26%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 308105,
            "range": "±34.08%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 119614,
            "range": "±23.81%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 161132,
            "range": "±22.26%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 150586,
            "range": "±21.81%",
            "unit": "ops/sec",
            "extra": "45 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e4c1ad3af2620ddf41ba39229ddef13da36b1671",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-28T05:45:58Z",
          "tree_id": "10e9d189538bcea40322bfb7e502618fef3f1871",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e4c1ad3af2620ddf41ba39229ddef13da36b1671"
        },
        "date": 1690523578194,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 477870,
            "range": "±5.14%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 519520,
            "range": "±14.14%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 436152,
            "range": "±17.86%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 238745,
            "range": "±22.60%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 13510,
            "range": "±187.70%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 221889,
            "range": "±29.08%",
            "unit": "ops/sec",
            "extra": "66 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "01e36987c8ef26217d4547bc9db84bd54e1f5068",
          "message": "fix(deps): bump pino-pretty from 10.0.0 to 10.2.0\n\nBumps [pino-pretty](https://github.com/pinojs/pino-pretty) from 10.0.0 to 10.2.0.\n- [Release notes](https://github.com/pinojs/pino-pretty/releases)\n- [Commits](https://github.com/pinojs/pino-pretty/compare/v10.0.0...v10.2.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino-pretty\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-29T21:39:06Z",
          "tree_id": "20fa04ff251febc83717b9aa878c144cc127c764",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/01e36987c8ef26217d4547bc9db84bd54e1f5068"
        },
        "date": 1690667186747,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473288,
            "range": "±1.01%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 574766,
            "range": "±9.90%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 377670,
            "range": "±19.24%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 280254,
            "range": "±19.17%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11990,
            "range": "±188.65%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 274931,
            "range": "±5.41%",
            "unit": "ops/sec",
            "extra": "71 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c9aad6ac23a19eb195caf8c19ec2062a829cfeb1",
          "message": "chore(dev-deps): bump eslint from 8.44.0 to 8.46.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.44.0 to 8.46.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.44.0...v8.46.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-30T02:47:06Z",
          "tree_id": "c2341227a9509f589902f6ce087a29586c7a3c18",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c9aad6ac23a19eb195caf8c19ec2062a829cfeb1"
        },
        "date": 1690685505539,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 490307,
            "range": "±0.76%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 534941,
            "range": "±15.71%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 357081,
            "range": "±20.80%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 161373,
            "range": "±26.60%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 203600,
            "range": "±20.77%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 155513,
            "range": "±20.55%",
            "unit": "ops/sec",
            "extra": "46 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3159052b5d9390f4bbb8d74aa7eea8b91135b718",
          "message": "chore(dev-deps): bump eslint from 8.44.0 to 8.46.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.44.0 to 8.46.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.44.0...v8.46.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-30T05:47:37Z",
          "tree_id": "066f8b8eaf1b9ee74f43ff68531355f8351863ff",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3159052b5d9390f4bbb8d74aa7eea8b91135b718"
        },
        "date": 1690696366118,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 487015,
            "range": "±4.59%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 541877,
            "range": "±17.84%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 442818,
            "range": "±14.07%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 284838,
            "range": "±14.60%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11704,
            "range": "±188.92%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 252214,
            "range": "±19.57%",
            "unit": "ops/sec",
            "extra": "63 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9edac596b2dcd30c249b24be323da7e16cf256d3",
          "message": "fix(deps): bump pino-pretty from 10.0.0 to 10.2.0\n\nBumps [pino-pretty](https://github.com/pinojs/pino-pretty) from 10.0.0 to 10.2.0.\n- [Release notes](https://github.com/pinojs/pino-pretty/releases)\n- [Commits](https://github.com/pinojs/pino-pretty/compare/v10.0.0...v10.2.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino-pretty\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-30T11:45:59Z",
          "tree_id": "b75eb14c6eb55b9b6b6715bf5c068bcfb6208cee",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9edac596b2dcd30c249b24be323da7e16cf256d3"
        },
        "date": 1690717957586,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473416,
            "range": "±3.70%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 471884,
            "range": "±17.25%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 215316,
            "range": "±33.82%",
            "unit": "ops/sec",
            "extra": "28 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 129609,
            "range": "±37.43%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 315326,
            "range": "±22.16%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 10741,
            "range": "±187.73%",
            "unit": "ops/sec",
            "extra": "58 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "57c0bae9098f5d750a8ee4d90bc8bfa30a88f38b",
          "message": "fix: check devhubs and non-scratch orgs and sandboxes",
          "timestamp": "2023-08-01T11:46:07-06:00",
          "tree_id": "0109612f2db354b0ee228879fdc71f7bd2868ca0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/57c0bae9098f5d750a8ee4d90bc8bfa30a88f38b"
        },
        "date": 1690912327507,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 418010,
            "range": "±0.84%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 497549,
            "range": "±9.86%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 448049,
            "range": "±10.85%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 257186,
            "range": "±18.59%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 286271,
            "range": "±17.76%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1439,
            "range": "±224.32%",
            "unit": "ops/sec",
            "extra": "10 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "committer": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "distinct": true,
          "id": "8d2dd7ea9a5752a2ad9df3c2b5233476119db1b2",
          "message": "feat: save namespacePrefix in auth file",
          "timestamp": "2023-08-01T17:29:48-03:00",
          "tree_id": "ffe64e45d8340011b7419767d987be373c9ab391",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8d2dd7ea9a5752a2ad9df3c2b5233476119db1b2"
        },
        "date": 1690922293774,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 486356,
            "range": "±5.08%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 570383,
            "range": "±10.92%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 330541,
            "range": "±20.35%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 155760,
            "range": "±24.13%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 245970,
            "range": "±19.07%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 140285,
            "range": "±20.03%",
            "unit": "ops/sec",
            "extra": "42 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "9bf4154216dc0bd07438f8be34a3902fa0e64d8f",
          "message": "fix: better type for SandboxFields",
          "timestamp": "2023-08-01T16:27:18-06:00",
          "tree_id": "cebc8c1904a12be46edb9f4ec0395bd1f335bd55",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9bf4154216dc0bd07438f8be34a3902fa0e64d8f"
        },
        "date": 1690929208385,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 438437,
            "range": "±1.88%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 593182,
            "range": "±16.67%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 353048,
            "range": "±22.10%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 178322,
            "range": "±22.45%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 214519,
            "range": "±23.88%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 126244,
            "range": "±21.91%",
            "unit": "ops/sec",
            "extra": "40 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "26d923e5ec34efd9236675ef8c0290341da48c40",
          "message": "fix: query devhubs, non-scratch orgs, and non-sandboxes to identify sandboxes",
          "timestamp": "2023-08-02T13:37:06-06:00",
          "tree_id": "d08a78e92bd0d13e215f8b503384809a0ba3c628",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/26d923e5ec34efd9236675ef8c0290341da48c40"
        },
        "date": 1691005509819,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 408780,
            "range": "±6.92%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 494339,
            "range": "±11.00%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 394945,
            "range": "±16.56%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 278591,
            "range": "±19.76%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 8166,
            "range": "±190.88%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 190891,
            "range": "±21.38%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
          "id": "f051963272c91ace99e948ba36de8f7e29952796",
          "message": "fix: use debug levels that are numbers from the env",
          "timestamp": "2023-08-02T15:54:58-05:00",
          "tree_id": "169fbd24b60649f977016480a3d588ac5cad0a3a",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f051963272c91ace99e948ba36de8f7e29952796"
        },
        "date": 1691011644851,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 502346,
            "range": "±0.99%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 550156,
            "range": "±14.73%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 424262,
            "range": "±14.79%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 234503,
            "range": "±20.02%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9288,
            "range": "±190.31%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 247011,
            "range": "±6.05%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
          "id": "f60ed20b7c24225b297aa59d1f9f3b335c43ff1c",
          "message": "refactor: one less switch case",
          "timestamp": "2023-08-02T17:57:10-05:00",
          "tree_id": "9b79b40b1b44a81e8885a36eba99c7e41604d12d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f60ed20b7c24225b297aa59d1f9f3b335c43ff1c"
        },
        "date": 1691017385098,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 443778,
            "range": "±6.83%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 596755,
            "range": "±9.43%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 377598,
            "range": "±22.06%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 184683,
            "range": "±20.34%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 267050,
            "range": "±20.37%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 125807,
            "range": "±22.19%",
            "unit": "ops/sec",
            "extra": "45 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "committer": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "distinct": true,
          "id": "90e0e002cbf9ba4ffb443f803b78d2a5b4c6c3e5",
          "message": "Merge branch 'main' into cd/save-namespace-auth-info",
          "timestamp": "2023-08-03T13:23:25-03:00",
          "tree_id": "d865741388836aebb61586ae63feff9ba751f0b0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/90e0e002cbf9ba4ffb443f803b78d2a5b4c6c3e5"
        },
        "date": 1691080287013,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 443691,
            "range": "±5.15%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 574519,
            "range": "±13.46%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 329951,
            "range": "±20.02%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 150947,
            "range": "±24.91%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 243405,
            "range": "±19.74%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 125948,
            "range": "±22.80%",
            "unit": "ops/sec",
            "extra": "37 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f221a6cddcd5b24b2e59df4b62d6bc5a17bc9ae7",
          "message": "fix(deps): bump @salesforce/kit from 3.0.6 to 3.0.8\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.6 to 3.0.8.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.6...3.0.8)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-05T21:49:48Z",
          "tree_id": "5ba133217d345355683ec67241d904a9d530febf",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f221a6cddcd5b24b2e59df4b62d6bc5a17bc9ae7"
        },
        "date": 1691272594440,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 443199,
            "range": "±6.74%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 613200,
            "range": "±12.43%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 508360,
            "range": "±14.42%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 269740,
            "range": "±11.91%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 2295,
            "range": "±255.11%",
            "unit": "ops/sec",
            "extra": "6 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 290478,
            "range": "±14.21%",
            "unit": "ops/sec",
            "extra": "73 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a9d45eb7ac4f116464f2852cd4cce889d07e9228",
          "message": "fix(deps): bump @salesforce/kit from 3.0.6 to 3.0.9\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.6 to 3.0.9.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.6...3.0.9)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-12T21:34:26Z",
          "tree_id": "bcf667d1377d6af440ccf227c51d6fb2c1c9e130",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a9d45eb7ac4f116464f2852cd4cce889d07e9228"
        },
        "date": 1691876371874,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 495542,
            "range": "±3.90%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 561168,
            "range": "±8.30%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 419505,
            "range": "±14.60%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 289919,
            "range": "±16.83%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11034,
            "range": "±189.25%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 245452,
            "range": "±13.56%",
            "unit": "ops/sec",
            "extra": "54 samples"
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
          "id": "75b9bf0b7432d103a3c59b96c4acd9c63ff1da2b",
          "message": "ci: retries on yarn install",
          "timestamp": "2023-08-16T18:22:44-05:00",
          "tree_id": "d0743bef91973c6b9cc6b513ed8e80231a789a2f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/75b9bf0b7432d103a3c59b96c4acd9c63ff1da2b"
        },
        "date": 1692228612007,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 175863,
            "range": "±93.25%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 467939,
            "range": "±12.40%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 301598,
            "range": "±15.00%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 160148,
            "range": "±17.47%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 218434,
            "range": "±17.96%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 134275,
            "range": "±20.75%",
            "unit": "ops/sec",
            "extra": "44 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "afddcfa4f64ed36a3b0d83a6b01c3844df9e7b04",
          "message": "chore(dev-deps): bump @types/lodash from 4.14.195 to 4.14.197\n\nBumps [@types/lodash](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/lodash) from 4.14.195 to 4.14.197.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/lodash)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/lodash\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-19T21:39:54Z",
          "tree_id": "db37ec35d83c42dc4b3058618dfc89ce6aa4b233",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/afddcfa4f64ed36a3b0d83a6b01c3844df9e7b04"
        },
        "date": 1692481568512,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 413504,
            "range": "±1.80%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 503861,
            "range": "±10.21%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 328523,
            "range": "±14.82%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 166844,
            "range": "±19.81%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 136423,
            "range": "±41.09%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 120892,
            "range": "±34.47%",
            "unit": "ops/sec",
            "extra": "40 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2be0b51fa8c37b6b11faf3f2a88b37c270fe7abb",
          "message": "chore(dev-deps): bump eslint-config-prettier from 8.9.0 to 8.10.0\n\nBumps [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) from 8.9.0 to 8.10.0.\n- [Changelog](https://github.com/prettier/eslint-config-prettier/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/prettier/eslint-config-prettier/compare/v8.9.0...v8.10.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint-config-prettier\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-20T02:46:10Z",
          "tree_id": "6314bdfc1439222cf37c9572139cb36b35b478c7",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2be0b51fa8c37b6b11faf3f2a88b37c270fe7abb"
        },
        "date": 1692499864187,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 474351,
            "range": "±0.75%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 554805,
            "range": "±19.37%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 315679,
            "range": "±24.21%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 133829,
            "range": "±23.98%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 237034,
            "range": "±19.58%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 152685,
            "range": "±17.03%",
            "unit": "ops/sec",
            "extra": "44 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "02897b5b187911fbc61e20ea80f01c9a871e151e",
          "message": "fix(deps): bump @salesforce/kit from 3.0.9 to 3.0.11\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.9 to 3.0.11.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.9...3.0.11)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-26T21:08:12Z",
          "tree_id": "eb638c4a596eeb29d1bc4118895c27731c062370",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/02897b5b187911fbc61e20ea80f01c9a871e151e"
        },
        "date": 1693084530600,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 373976,
            "range": "±1.48%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 477541,
            "range": "±11.12%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 296629,
            "range": "±30.18%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 155522,
            "range": "±21.84%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 242629,
            "range": "±25.35%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 139911,
            "range": "±20.81%",
            "unit": "ops/sec",
            "extra": "45 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "61e0d1b8044fcb34c0d8fdb0bae926f0250fee75",
          "message": "chore(dev-deps): bump eslint-plugin-import from 2.28.0 to 2.28.1\n\nBumps [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import) from 2.28.0 to 2.28.1.\n- [Release notes](https://github.com/import-js/eslint-plugin-import/releases)\n- [Changelog](https://github.com/import-js/eslint-plugin-import/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/import-js/eslint-plugin-import/compare/v2.28.0...v2.28.1)\n\n---\nupdated-dependencies:\n- dependency-name: eslint-plugin-import\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-27T02:46:57Z",
          "tree_id": "b1fae9b6e88b630917a15135cac733abd78d4926",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/61e0d1b8044fcb34c0d8fdb0bae926f0250fee75"
        },
        "date": 1693104734966,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 465264,
            "range": "±0.70%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 676994,
            "range": "±7.02%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 448405,
            "range": "±13.90%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 243519,
            "range": "±18.45%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 6944,
            "range": "±202.57%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 283000,
            "range": "±14.17%",
            "unit": "ops/sec",
            "extra": "73 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ea6619e3f4bdbc5bbbd8515c42d8dadeff5f1dc7",
          "message": "fix(deps): bump pino from 8.14.2 to 8.15.0\n\nBumps [pino](https://github.com/pinojs/pino) from 8.14.2 to 8.15.0.\n- [Release notes](https://github.com/pinojs/pino/releases)\n- [Commits](https://github.com/pinojs/pino/compare/v8.14.2...v8.15.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-31T13:43:54Z",
          "tree_id": "a14c927299056572b6a1ec5a71d568dbeaa167cf",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ea6619e3f4bdbc5bbbd8515c42d8dadeff5f1dc7"
        },
        "date": 1693489860488,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 496120,
            "range": "±0.68%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 562539,
            "range": "±9.59%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 397528,
            "range": "±17.94%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 277157,
            "range": "±16.39%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 13973,
            "range": "±187.01%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 154703,
            "range": "±26.89%",
            "unit": "ops/sec",
            "extra": "40 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d71420a7360e81c8c561e07becbb085ddaf5f6ce",
          "message": "fix(deps): bump ts-retry-promise from 0.7.0 to 0.7.1\n\nBumps [ts-retry-promise](https://github.com/normartin/ts-retry-promise) from 0.7.0 to 0.7.1.\n- [Release notes](https://github.com/normartin/ts-retry-promise/releases)\n- [Commits](https://github.com/normartin/ts-retry-promise/compare/v0.7.0...v0.7.1)\n\n---\nupdated-dependencies:\n- dependency-name: ts-retry-promise\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-02T21:13:57Z",
          "tree_id": "401bb89542eac9a1eddd1c4823be361d7d61ebe3",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d71420a7360e81c8c561e07becbb085ddaf5f6ce"
        },
        "date": 1693689586131,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 396907,
            "range": "±1.70%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 481546,
            "range": "±8.94%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 385078,
            "range": "±12.60%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 223253,
            "range": "±12.50%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 306584,
            "range": "±17.46%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1275,
            "range": "±228.88%",
            "unit": "ops/sec",
            "extra": "9 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8323f3cd253527210050b87b9936fb210ea74974",
          "message": "fix(deps): bump jsonwebtoken from 9.0.1 to 9.0.2\n\nBumps [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) from 9.0.1 to 9.0.2.\n- [Changelog](https://github.com/auth0/node-jsonwebtoken/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/auth0/node-jsonwebtoken/compare/v9.0.1...v9.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: jsonwebtoken\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-03T02:46:12Z",
          "tree_id": "3c5ab42d03839bffad8c7e0769151fe65d57cc2c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8323f3cd253527210050b87b9936fb210ea74974"
        },
        "date": 1693709588958,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 497750,
            "range": "±5.91%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 731516,
            "range": "±10.75%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 473027,
            "range": "±18.17%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 333053,
            "range": "±18.28%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 20832,
            "range": "±186.12%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 250140,
            "range": "±17.23%",
            "unit": "ops/sec",
            "extra": "57 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a38d86fa2944ea843c5a576bd5f8b1e69a5c92e0",
          "message": "chore(dev-deps): bump @types/chai-string from 1.4.2 to 1.4.3\n\nBumps [@types/chai-string](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/chai-string) from 1.4.2 to 1.4.3.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/chai-string)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/chai-string\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-09T21:56:13Z",
          "tree_id": "ef5ec2bc496bbb7cf8f38cf1b816e740be6af8ae",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a38d86fa2944ea843c5a576bd5f8b1e69a5c92e0"
        },
        "date": 1694296927538,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 457037,
            "range": "±0.91%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 731729,
            "range": "±9.07%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 340504,
            "range": "±22.84%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 179470,
            "range": "±20.60%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 182454,
            "range": "±22.74%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 128844,
            "range": "±24.35%",
            "unit": "ops/sec",
            "extra": "40 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e86fc30a0c02faf17406821f6841f6b6ebcc3fb8",
          "message": "chore(dev-deps): bump @types/chai-string from 1.4.2 to 1.4.3\n\nBumps [@types/chai-string](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/chai-string) from 1.4.2 to 1.4.3.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/chai-string)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/chai-string\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-10T11:46:33Z",
          "tree_id": "69463fd3352b6e8a98c39f7f67c771f5780e7cb1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e86fc30a0c02faf17406821f6841f6b6ebcc3fb8"
        },
        "date": 1694346760000,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 580532,
            "range": "±1.24%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 825623,
            "range": "±13.84%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 405938,
            "range": "±26.26%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 232142,
            "range": "±23.00%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 270219,
            "range": "±26.00%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1418,
            "range": "±275.25%",
            "unit": "ops/sec",
            "extra": "5 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ec53a4f8e8b21f8146c3ccde1faf84acbf6eb0b4",
          "message": "chore(dev-deps): bump wireit from 0.13.0 to 0.14.0\n\nBumps [wireit](https://github.com/google/wireit) from 0.13.0 to 0.14.0.\n- [Changelog](https://github.com/google/wireit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/google/wireit/compare/v0.13.0...v0.14.0)\n\n---\nupdated-dependencies:\n- dependency-name: wireit\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-16T21:23:54Z",
          "tree_id": "44021182ac8191a591dca199a4652cefc406aa8c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ec53a4f8e8b21f8146c3ccde1faf84acbf6eb0b4"
        },
        "date": 1694899835940,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 465141,
            "range": "±0.72%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 709220,
            "range": "±10.75%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 393740,
            "range": "±22.14%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 246556,
            "range": "±22.19%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 4979,
            "range": "±211.28%",
            "unit": "ops/sec",
            "extra": "15 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 208498,
            "range": "±27.52%",
            "unit": "ops/sec",
            "extra": "61 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cad4f79dce0469a769f81411811d3473f97b4e53",
          "message": "chore(dev-deps): bump @types/benchmark from 2.1.2 to 2.1.3\n\nBumps [@types/benchmark](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/benchmark) from 2.1.2 to 2.1.3.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/benchmark)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/benchmark\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-17T02:46:35Z",
          "tree_id": "4779146f8e9a6027f558fa1f4878ae4d9c59970a",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/cad4f79dce0469a769f81411811d3473f97b4e53"
        },
        "date": 1694919105797,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 428900,
            "range": "±23.88%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 529758,
            "range": "±13.80%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 416583,
            "range": "±9.64%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 272547,
            "range": "±20.13%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 262810,
            "range": "±22.03%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 12224,
            "range": "±187.10%",
            "unit": "ops/sec",
            "extra": "69 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "76c978f7d4c00aaf4afee0bf84ee1a4c3fdaa8ad",
          "message": "chore(dev-deps): bump eslint from 8.49.0 to 8.50.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.49.0 to 8.50.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.49.0...v8.50.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-23T21:30:50Z",
          "tree_id": "78579026353c0e54644c930173721676f49fcb34",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/76c978f7d4c00aaf4afee0bf84ee1a4c3fdaa8ad"
        },
        "date": 1695504969405,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 479649,
            "range": "±0.59%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 583190,
            "range": "±10.67%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 309371,
            "range": "±20.14%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 159130,
            "range": "±19.15%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 158082,
            "range": "±21.14%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 134228,
            "range": "±21.06%",
            "unit": "ops/sec",
            "extra": "46 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9c419e71223d37bc845953b45bbd0f271f9d13d6",
          "message": "chore(dev-deps): bump eslint from 8.49.0 to 8.50.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.49.0 to 8.50.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.49.0...v8.50.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-24T02:46:35Z",
          "tree_id": "79099d07213070b01697e34f593e9f571889f757",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9c419e71223d37bc845953b45bbd0f271f9d13d6"
        },
        "date": 1695523879640,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 485997,
            "range": "±5.89%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 594561,
            "range": "±10.50%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 320118,
            "range": "±16.55%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 148794,
            "range": "±18.60%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 163900,
            "range": "±21.23%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 132265,
            "range": "±21.15%",
            "unit": "ops/sec",
            "extra": "42 samples"
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
          "id": "84ec4aba8a1cdf9d28fa923df6204e8ba09afda7",
          "message": "feat: unique listener names for lifecycle events",
          "timestamp": "2023-09-25T17:14:38-05:00",
          "tree_id": "fc4686da6acc47c9cb7e9b2caa03d4db9b305a37",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/84ec4aba8a1cdf9d28fa923df6204e8ba09afda7"
        },
        "date": 1695680531629,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 455013,
            "range": "±8.95%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 568568,
            "range": "±13.23%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 206582,
            "range": "±94.05%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 270143,
            "range": "±17.23%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10839,
            "range": "±189.18%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 260027,
            "range": "±11.19%",
            "unit": "ops/sec",
            "extra": "73 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "394f2ad95a9c92700941f2a72c153973ddc3949b",
          "message": "chore(deps): bump get-func-name from 2.0.0 to 2.0.2 in /examples\n\nBumps [get-func-name](https://github.com/chaijs/get-func-name) from 2.0.0 to 2.0.2.\n- [Release notes](https://github.com/chaijs/get-func-name/releases)\n- [Commits](https://github.com/chaijs/get-func-name/commits/v2.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: get-func-name\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-27T20:46:28Z",
          "tree_id": "183ede4651118ec8e6eb6a97fa5bc3ce60a16a7a",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/394f2ad95a9c92700941f2a72c153973ddc3949b"
        },
        "date": 1695848042555,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 340608,
            "range": "±1.54%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 387557,
            "range": "±16.34%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 226617,
            "range": "±20.61%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 152817,
            "range": "±29.97%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 179383,
            "range": "±28.50%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 125397,
            "range": "±26.53%",
            "unit": "ops/sec",
            "extra": "48 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "19aeb98c16297da433f3227e413fe92833929108",
          "message": "fix(deps): bump get-func-name from 2.0.0 to 2.0.2\n\nBumps [get-func-name](https://github.com/chaijs/get-func-name) from 2.0.0 to 2.0.2.\n- [Release notes](https://github.com/chaijs/get-func-name/releases)\n- [Commits](https://github.com/chaijs/get-func-name/commits/v2.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: get-func-name\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-27T21:13:18Z",
          "tree_id": "c9c246cb69149a5195ada65296174ff3bf4cba1f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/19aeb98c16297da433f3227e413fe92833929108"
        },
        "date": 1695849525552,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 467514,
            "range": "±1.32%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 626515,
            "range": "±11.77%",
            "unit": "ops/sec",
            "extra": "28 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 307157,
            "range": "±20.00%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 157333,
            "range": "±26.31%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 208181,
            "range": "±24.64%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 124777,
            "range": "±26.33%",
            "unit": "ops/sec",
            "extra": "39 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "813353c4fa0200593ac2ea30020a732319b3988d",
          "message": "chore(deps): bump get-func-name from 2.0.0 to 2.0.2 in /examples\n\nBumps [get-func-name](https://github.com/chaijs/get-func-name) from 2.0.0 to 2.0.2.\n- [Release notes](https://github.com/chaijs/get-func-name/releases)\n- [Commits](https://github.com/chaijs/get-func-name/commits/v2.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: get-func-name\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-28T02:46:08Z",
          "tree_id": "e090574771b7611f39b0785df1246c09d5d2bbb6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/813353c4fa0200593ac2ea30020a732319b3988d"
        },
        "date": 1695869516007,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 414569,
            "range": "±15.83%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 731381,
            "range": "±10.03%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 308590,
            "range": "±21.35%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 167468,
            "range": "±23.60%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 171100,
            "range": "±24.54%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 129025,
            "range": "±23.83%",
            "unit": "ops/sec",
            "extra": "43 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "6a78a03e86e5e939327f0ad866936b60dc512da5",
          "message": "chore: lint fixes",
          "timestamp": "2023-09-29T16:32:18-06:00",
          "tree_id": "a6dbbc347ffdf46d98daf8739f5f6b41b3699841",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6a78a03e86e5e939327f0ad866936b60dc512da5"
        },
        "date": 1696027196183,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 497775,
            "range": "±2.80%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 574859,
            "range": "±14.07%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 372189,
            "range": "±17.86%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 272201,
            "range": "±17.31%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 236962,
            "range": "±24.17%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 13052,
            "range": "±186.94%",
            "unit": "ops/sec",
            "extra": "75 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2079efcfaf668cdaf0c63b2e19fd007aa4cf3a54",
          "message": "chore(dev-deps): bump @salesforce/ts-sinon from 1.4.15 to 1.4.16\n\nBumps [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon) from 1.4.15 to 1.4.16.\n- [Release notes](https://github.com/forcedotcom/ts-sinon/releases)\n- [Changelog](https://github.com/forcedotcom/ts-sinon/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-sinon/compare/1.4.15...1.4.16)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-sinon\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-30T21:10:35Z",
          "tree_id": "e37fc98917424d7f2f01c353e56b3c5e48df6dad",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2079efcfaf668cdaf0c63b2e19fd007aa4cf3a54"
        },
        "date": 1696108615302,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 497933,
            "range": "±1.01%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 575696,
            "range": "±10.52%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 405458,
            "range": "±13.21%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 258876,
            "range": "±16.99%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 273355,
            "range": "±22.39%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 13418,
            "range": "±186.77%",
            "unit": "ops/sec",
            "extra": "73 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d3e22b9420beae576ca085fd4827c169f8b54535",
          "message": "fix(deps): bump @salesforce/ts-types from 2.0.7 to 2.0.8\n\nBumps [@salesforce/ts-types](https://github.com/forcedotcom/ts-types) from 2.0.7 to 2.0.8.\n- [Release notes](https://github.com/forcedotcom/ts-types/releases)\n- [Changelog](https://github.com/forcedotcom/ts-types/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-types/compare/2.0.7...2.0.8)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-types\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-01T05:46:42Z",
          "tree_id": "891093bc0285eb25639dcd6ff396639e838529fd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d3e22b9420beae576ca085fd4827c169f8b54535"
        },
        "date": 1696139557183,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 367792,
            "range": "±8.56%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 456835,
            "range": "±15.45%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 316220,
            "range": "±18.97%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 239758,
            "range": "±23.52%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 232064,
            "range": "±18.42%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 7015,
            "range": "±188.57%",
            "unit": "ops/sec",
            "extra": "55 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "0bf1680b7104983f75ec49676d26a33332208f76",
          "message": "fix: pollStatusAndAuth uses the sandbox process id rather than sandbox info id",
          "timestamp": "2023-10-04T10:29:09-06:00",
          "tree_id": "23284805eb0d3d0ae250fcad159fe525d56383ae",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0bf1680b7104983f75ec49676d26a33332208f76"
        },
        "date": 1696437444812,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 385727,
            "range": "±3.69%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 494376,
            "range": "±9.07%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 334002,
            "range": "±15.86%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 255001,
            "range": "±12.99%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 234076,
            "range": "±18.85%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 5801,
            "range": "±189.68%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "0f02b10297a278f9ab8ede88e497928b3e5cef50",
          "message": "refactor: module interop and test imports",
          "timestamp": "2023-10-05T11:57:29-05:00",
          "tree_id": "c97b989b368b75cb56f87600047a6dc94ae4d6b8",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0f02b10297a278f9ab8ede88e497928b3e5cef50"
        },
        "date": 1696525443066,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 420219,
            "range": "±16.94%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 636695,
            "range": "±12.10%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 471131,
            "range": "±14.14%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 232691,
            "range": "±21.06%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 6766,
            "range": "±205.44%",
            "unit": "ops/sec",
            "extra": "19 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 269138,
            "range": "±14.79%",
            "unit": "ops/sec",
            "extra": "73 samples"
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
          "id": "79f6c6a1f04952efc6fab09d0f8b4feff22aaa48",
          "message": "ci: match tsconfig for typedoc examples",
          "timestamp": "2023-10-05T12:22:42-05:00",
          "tree_id": "edbfe81f3bae71d384f1ea2a442eb61ce5fca8b5",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/79f6c6a1f04952efc6fab09d0f8b4feff22aaa48"
        },
        "date": 1696527044593,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 399493,
            "range": "±40.10%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 574358,
            "range": "±11.75%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 396641,
            "range": "±17.27%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 271881,
            "range": "±15.02%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 265927,
            "range": "±22.04%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 12963,
            "range": "±186.55%",
            "unit": "ops/sec",
            "extra": "71 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ewillhoit@salesforce.com",
            "name": "Eric Willhoit",
            "username": "iowillhoit"
          },
          "committer": {
            "email": "ewillhoit@salesforce.com",
            "name": "Eric Willhoit",
            "username": "iowillhoit"
          },
          "distinct": true,
          "id": "b93ac504d09145dad3d5b5beea4ce1d5a56985cd",
          "message": "fix: allow padding on id and secret",
          "timestamp": "2023-10-06T09:52:12-05:00",
          "tree_id": "e45b88bae874be6f0283bde30b50ce303cd86399",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b93ac504d09145dad3d5b5beea4ce1d5a56985cd"
        },
        "date": 1696604390124,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 508245,
            "range": "±0.65%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 580179,
            "range": "±7.68%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 358235,
            "range": "±19.49%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 265142,
            "range": "±12.11%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 271139,
            "range": "±19.92%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 13223,
            "range": "±186.30%",
            "unit": "ops/sec",
            "extra": "74 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2f10547b7a0ba52362f0bb351b353af96be46bde",
          "message": "fix(deps): bump @salesforce/kit from 3.0.12 to 3.0.13\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.12 to 3.0.13.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.12...3.0.13)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-07T21:40:00Z",
          "tree_id": "54777616f32ef3475186ff4493459af5cc0f33f2",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2f10547b7a0ba52362f0bb351b353af96be46bde"
        },
        "date": 1696715138048,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 454389,
            "range": "±4.97%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 616526,
            "range": "±14.25%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 460524,
            "range": "±13.99%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 264581,
            "range": "±19.81%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 4294,
            "range": "±217.36%",
            "unit": "ops/sec",
            "extra": "12 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 268998,
            "range": "±11.00%",
            "unit": "ops/sec",
            "extra": "75 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2a5a9cc69e6616ed6b4338c3ce26e5c5dbd9abab",
          "message": "fix(deps): bump pino from 8.15.1 to 8.15.6\n\nBumps [pino](https://github.com/pinojs/pino) from 8.15.1 to 8.15.6.\n- [Release notes](https://github.com/pinojs/pino/releases)\n- [Commits](https://github.com/pinojs/pino/compare/v8.15.1...v8.15.6)\n\n---\nupdated-dependencies:\n- dependency-name: pino\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-08T05:46:46Z",
          "tree_id": "56605fc3421da856b911b66bff6c9c2391264616",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2a5a9cc69e6616ed6b4338c3ce26e5c5dbd9abab"
        },
        "date": 1696744385581,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 514664,
            "range": "±0.87%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 585651,
            "range": "±10.51%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 289943,
            "range": "±21.45%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 166085,
            "range": "±22.02%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 168629,
            "range": "±20.41%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 127188,
            "range": "±21.72%",
            "unit": "ops/sec",
            "extra": "42 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "08fb56b1a14385168adba81bc44d67fc987040e6",
          "message": "fix(deps): bump @salesforce/kit from 3.0.12 to 3.0.13\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.12 to 3.0.13.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.12...3.0.13)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-08T08:46:26Z",
          "tree_id": "7e91809447127afd6fd9ba0c750c0c3d1b965dbb",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/08fb56b1a14385168adba81bc44d67fc987040e6"
        },
        "date": 1696755149243,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 584160,
            "range": "±8.99%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 854197,
            "range": "±9.95%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 488276,
            "range": "±20.09%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 246106,
            "range": "±25.78%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 3584,
            "range": "±241.56%",
            "unit": "ops/sec",
            "extra": "7 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 309153,
            "range": "±13.16%",
            "unit": "ops/sec",
            "extra": "68 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "b1309829cbcc8511e60cb6c88a5721edb3c060dd",
          "message": "fix: add scopeProfiles to project type",
          "timestamp": "2023-10-09T12:09:16-06:00",
          "tree_id": "fe79ded587a55843c4033f97839def1d03e8d0a6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b1309829cbcc8511e60cb6c88a5721edb3c060dd"
        },
        "date": 1696875505482,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 511254,
            "range": "±1.49%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 612462,
            "range": "±9.92%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 384381,
            "range": "±14.10%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 293185,
            "range": "±16.58%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 12328,
            "range": "±187.36%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 269635,
            "range": "±8.62%",
            "unit": "ops/sec",
            "extra": "70 samples"
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
          "id": "10cccaea91c92382c14507f924e46b8dd0542634",
          "message": "feat: use lodash directly",
          "timestamp": "2023-10-09T16:23:06-05:00",
          "tree_id": "c2b67d66d44e9243046be00b2e964ba858ca663c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/10cccaea91c92382c14507f924e46b8dd0542634"
        },
        "date": 1696890476804,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 522012,
            "range": "±0.61%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 559271,
            "range": "±11.77%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 305580,
            "range": "±19.18%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 160921,
            "range": "±24.72%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 188422,
            "range": "±19.47%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 123298,
            "range": "±21.10%",
            "unit": "ops/sec",
            "extra": "41 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "committer": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "distinct": true,
          "id": "fcf84ac232483c024c59cd79de44e89b7065881c",
          "message": "fix: bump jsforce",
          "timestamp": "2023-10-10T13:38:54-03:00",
          "tree_id": "34811ffe913b027662e8da598a483c28b1211263",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/fcf84ac232483c024c59cd79de44e89b7065881c"
        },
        "date": 1696956367796,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 518856,
            "range": "±0.88%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 567224,
            "range": "±11.54%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 390058,
            "range": "±16.60%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 250251,
            "range": "±14.55%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 285087,
            "range": "±21.90%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 2071,
            "range": "±220.55%",
            "unit": "ops/sec",
            "extra": "11 samples"
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
          "id": "03a7b8ef82eb5d8ae0ee8fcb4cea0cdce0285b02",
          "message": "test(wip): mocks for lockfile, but also some TBD skips",
          "timestamp": "2023-10-11T09:34:58-05:00",
          "tree_id": "3b9bae42f0914be876fc25f26fddf3437ed5096b",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/03a7b8ef82eb5d8ae0ee8fcb4cea0cdce0285b02"
        },
        "date": 1697035361481,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 425738,
            "range": "±1.10%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 481170,
            "range": "±19.53%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 274629,
            "range": "±23.66%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 173008,
            "range": "±21.68%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 137822,
            "range": "±24.85%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 109616,
            "range": "±24.35%",
            "unit": "ops/sec",
            "extra": "35 samples"
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
          "id": "e7e23bb8677b4c814ded08369e3353c602f46e21",
          "message": "test: how are the nuts",
          "timestamp": "2023-10-11T09:50:01-05:00",
          "tree_id": "edc0c05dd181e13192dd7ac9fc35618401cf45d1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e7e23bb8677b4c814ded08369e3353c602f46e21"
        },
        "date": 1697036232424,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 415626,
            "range": "±1.26%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 452588,
            "range": "±16.61%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 358573,
            "range": "±16.15%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 293219,
            "range": "±8.92%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 291480,
            "range": "±18.57%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 2803,
            "range": "±206.79%",
            "unit": "ops/sec",
            "extra": "19 samples"
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
          "id": "8e346ca8206a23515bb1247872f19dbd7f13bf55",
          "message": "feat!: remove parameters on config.write\n\nThe Config family of classes' write(sync) method used to accept a param.\nThe value in the param would overwrite the existing file.",
          "timestamp": "2023-10-11T11:26:37-05:00",
          "tree_id": "1da114e90b3fefaa5da4244a8dc2ccf47b0d8c0e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8e346ca8206a23515bb1247872f19dbd7f13bf55"
        },
        "date": 1697042133768,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 354069,
            "range": "±11.38%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 417103,
            "range": "±9.66%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 305300,
            "range": "±18.95%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 212172,
            "range": "±13.30%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 233725,
            "range": "±21.69%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 187343,
            "range": "±21.04%",
            "unit": "ops/sec",
            "extra": "57 samples"
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
          "id": "469373fd2d4e74ba5f7d924cc3b5eda9338c1ddc",
          "message": "test: remove more skips",
          "timestamp": "2023-10-11T17:56:48-05:00",
          "tree_id": "cb1f526378f38ea88c744e81ad0263d4d020ee9e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/469373fd2d4e74ba5f7d924cc3b5eda9338c1ddc"
        },
        "date": 1697065429106,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480185,
            "range": "±7.93%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 550872,
            "range": "±9.13%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 304616,
            "range": "±21.01%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 150339,
            "range": "±27.34%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 180772,
            "range": "±20.15%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 117672,
            "range": "±22.59%",
            "unit": "ops/sec",
            "extra": "42 samples"
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
          "id": "57d56ce119b3d82146f18082bbbeebf8e9aca8a4",
          "message": "test: ttlConfig expiration logic",
          "timestamp": "2023-10-12T17:05:30-05:00",
          "tree_id": "22f1183b057ad8720527b566c1d813fc940bc97e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/57d56ce119b3d82146f18082bbbeebf8e9aca8a4"
        },
        "date": 1697148774924,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 469189,
            "range": "±6.36%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 604484,
            "range": "±13.38%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 415660,
            "range": "±15.34%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 261242,
            "range": "±12.69%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 12185,
            "range": "±186.83%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 284729,
            "range": "±7.62%",
            "unit": "ops/sec",
            "extra": "75 samples"
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
          "id": "41423d63db353ebb65d4e4b8e058718a7b997590",
          "message": "feat!: make AuthInfo.getFields return readonly",
          "timestamp": "2023-10-12T18:06:48-05:00",
          "tree_id": "94f56c91d901e6b306acbb5a819754b549232ac4",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/41423d63db353ebb65d4e4b8e058718a7b997590"
        },
        "date": 1697152385685,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 447672,
            "range": "±5.94%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 696436,
            "range": "±15.93%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 347814,
            "range": "±16.27%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 139842,
            "range": "±25.37%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 170629,
            "range": "±23.76%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 124069,
            "range": "±22.57%",
            "unit": "ops/sec",
            "extra": "44 samples"
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
          "id": "4e02b0a7c384e8a9fb24132af10ef6dcafb00160",
          "message": "chore: bump jsforce deps",
          "timestamp": "2023-10-13T10:22:04-05:00",
          "tree_id": "7dabc58819a8077afc1927b691ad1bee73292412",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4e02b0a7c384e8a9fb24132af10ef6dcafb00160"
        },
        "date": 1697210887579,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 485572,
            "range": "±5.63%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 547761,
            "range": "±12.16%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 294953,
            "range": "±22.02%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 170778,
            "range": "±21.28%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 184893,
            "range": "±19.74%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 147049,
            "range": "±22.39%",
            "unit": "ops/sec",
            "extra": "48 samples"
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
          "id": "9dff8f063e22dff2dc8d1d51272cdbcfcbd1c856",
          "message": "Merge remote-tracking branch 'origin/main' into sm/crdt-config",
          "timestamp": "2023-10-13T10:59:24-05:00",
          "tree_id": "c165091326ec3d52b57fc9802376fad3373f3cfb",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9dff8f063e22dff2dc8d1d51272cdbcfcbd1c856"
        },
        "date": 1697213158579,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 444237,
            "range": "±5.59%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 618635,
            "range": "±13.63%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 326195,
            "range": "±22.38%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 143828,
            "range": "±25.62%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 215283,
            "range": "±20.33%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 137219,
            "range": "±20.94%",
            "unit": "ops/sec",
            "extra": "46 samples"
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
          "id": "51c1b9f6100f53d4db1d0f36cb37e0b20f4e5ce7",
          "message": "Merge branch 'sm/crdt-config' of https://github.com/forcedotcom/sfdx-core into sm/crdt-config",
          "timestamp": "2023-10-13T13:27:35-05:00",
          "tree_id": "7d3b125b311315283d5326fc54f0dceaf39d49b4",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/51c1b9f6100f53d4db1d0f36cb37e0b20f4e5ce7"
        },
        "date": 1697222097714,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 417790,
            "range": "±1.54%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 474602,
            "range": "±12.71%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 361506,
            "range": "±18.37%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 210448,
            "range": "±16.68%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 234279,
            "range": "±21.09%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 5331,
            "range": "±190.40%",
            "unit": "ops/sec",
            "extra": "39 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c30d00a17eb4e1db397b2e1b6a149375181061d6",
          "message": "fix(deps): bump jsforce from 2.0.0-beta.27 to 2.0.0-beta.28\n\nBumps [jsforce](https://github.com/jsforce/jsforce) from 2.0.0-beta.27 to 2.0.0-beta.28.\n- [Release notes](https://github.com/jsforce/jsforce/releases)\n- [Changelog](https://github.com/jsforce/jsforce/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/jsforce/jsforce/compare/2.0.0-beta.27...2.0.0-beta.28)\n\n---\nupdated-dependencies:\n- dependency-name: jsforce\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-14T21:08:28Z",
          "tree_id": "34811ffe913b027662e8da598a483c28b1211263",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c30d00a17eb4e1db397b2e1b6a149375181061d6"
        },
        "date": 1697318011454,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 436561,
            "range": "±0.97%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 493490,
            "range": "±14.18%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 276703,
            "range": "±17.64%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 169029,
            "range": "±22.49%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 164794,
            "range": "±19.02%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 117158,
            "range": "±22.18%",
            "unit": "ops/sec",
            "extra": "44 samples"
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
          "id": "079d73ba0fa0fe6aec08540d63913bc749977c2f",
          "message": "Merge branch 'sm/crdt-config' of https://github.com/forcedotcom/sfdx-core into sm/crdt-config",
          "timestamp": "2023-10-16T09:41:30-05:00",
          "tree_id": "819094436046d7bbec69fdb71301a915550de7cd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/079d73ba0fa0fe6aec08540d63913bc749977c2f"
        },
        "date": 1697467706994,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480184,
            "range": "±0.80%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 581472,
            "range": "±14.30%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 310618,
            "range": "±18.84%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 170705,
            "range": "±22.63%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 161247,
            "range": "±21.83%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 147727,
            "range": "±19.13%",
            "unit": "ops/sec",
            "extra": "47 samples"
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
          "id": "f3abda113935c3619b5cb6ab051b34cd1e669106",
          "message": "ci: pdr tracking xnuts",
          "timestamp": "2023-10-16T10:12:55-05:00",
          "tree_id": "fa8702bc267ce2f610e586d17a364388a2aa6dc0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f3abda113935c3619b5cb6ab051b34cd1e669106"
        },
        "date": 1697469539626,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473199,
            "range": "±5.57%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 526434,
            "range": "±14.30%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 275832,
            "range": "±19.85%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 189722,
            "range": "±21.89%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 151718,
            "range": "±22.21%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 118406,
            "range": "±22.21%",
            "unit": "ops/sec",
            "extra": "40 samples"
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
          "id": "79540e6f50c39f2b618a128b14b170225548731d",
          "message": "test: pin jsforce to 27",
          "timestamp": "2023-10-16T10:18:48-05:00",
          "tree_id": "2edf124302a565d2a2df6fdc17cf27a4923d0a0f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/79540e6f50c39f2b618a128b14b170225548731d"
        },
        "date": 1697470624831,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 271109,
            "range": "±22.46%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 238556,
            "range": "±22.03%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 173694,
            "range": "±14.86%",
            "unit": "ops/sec",
            "extra": "31 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 68388,
            "range": "±68.56%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 148676,
            "range": "±35.78%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 142859,
            "range": "±16.84%",
            "unit": "ops/sec",
            "extra": "46 samples"
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
          "id": "2cb98df83041d4870d3e4ade9f7a5c33dca92ded",
          "message": "test: not data, yes pdr",
          "timestamp": "2023-10-17T14:29:47-05:00",
          "tree_id": "cb44d4ac2c7ad203f9ae32d287a24e5e1d5b759e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2cb98df83041d4870d3e4ade9f7a5c33dca92ded"
        },
        "date": 1697571447802,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 366767,
            "range": "±1.78%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 432725,
            "range": "±17.26%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 282762,
            "range": "±17.24%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 136991,
            "range": "±30.09%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 162209,
            "range": "±28.06%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 113788,
            "range": "±25.27%",
            "unit": "ops/sec",
            "extra": "45 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "769680ea19a5f1d2d6c064772d47b4e87a9b3384",
          "message": "fix(deps): bump @babel/traverse from 7.18.8 to 7.23.2\n\nBumps [@babel/traverse](https://github.com/babel/babel/tree/HEAD/packages/babel-traverse) from 7.18.8 to 7.23.2.\n- [Release notes](https://github.com/babel/babel/releases)\n- [Changelog](https://github.com/babel/babel/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/babel/babel/commits/v7.23.2/packages/babel-traverse)\n\n---\nupdated-dependencies:\n- dependency-name: \"@babel/traverse\"\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-18T06:13:45Z",
          "tree_id": "d905fef8b962e7cebccd723d8ddcbfcd5fc9f1d2",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/769680ea19a5f1d2d6c064772d47b4e87a9b3384"
        },
        "date": 1697610056157,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 407415,
            "range": "±1.97%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 471261,
            "range": "±12.09%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 357494,
            "range": "±10.84%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 218726,
            "range": "±27.83%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 237888,
            "range": "±21.96%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 4021,
            "range": "±192.15%",
            "unit": "ops/sec",
            "extra": "33 samples"
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
          "id": "c03ec4de0b4509bfa10b46b504f22a1cdacb6ed6",
          "message": "ci: try forcing to jsforce top-level",
          "timestamp": "2023-10-18T09:39:03-05:00",
          "tree_id": "5eb581763b12c094146b60dc7aa508df85fd3313",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c03ec4de0b4509bfa10b46b504f22a1cdacb6ed6"
        },
        "date": 1697640345089,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 487123,
            "range": "±5.77%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 598100,
            "range": "±9.40%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 297384,
            "range": "±24.03%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 129528,
            "range": "±25.79%",
            "unit": "ops/sec",
            "extra": "26 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 197146,
            "range": "±20.30%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 135313,
            "range": "±19.35%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "60bfafda89c11e2781692514098cdc9306d94ed3",
          "message": "test: remove core from more libraries to force this version",
          "timestamp": "2023-10-18T10:20:45-05:00",
          "tree_id": "5e1d4e736e43288f1e74fefaf2f06380d9ba9407",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/60bfafda89c11e2781692514098cdc9306d94ed3"
        },
        "date": 1697642910382,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 360011,
            "range": "±9.42%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 438491,
            "range": "±9.03%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 331694,
            "range": "±12.37%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 218893,
            "range": "±15.88%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 238278,
            "range": "±17.12%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 173777,
            "range": "±17.96%",
            "unit": "ops/sec",
            "extra": "53 samples"
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
          "id": "b0790f383aa207e436368a237d3cca8e1a5a944a",
          "message": "feat!: drop support for lodash-style deep get/set",
          "timestamp": "2023-10-18T17:33:11-05:00",
          "tree_id": "9d0f14efd3adc581c22ecc0022bc8f827e2fd9fe",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b0790f383aa207e436368a237d3cca8e1a5a944a"
        },
        "date": 1697669742683,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 409466,
            "range": "±2.46%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 512110,
            "range": "±7.97%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 288918,
            "range": "±20.60%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 165984,
            "range": "±24.61%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 190959,
            "range": "±20.43%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 121341,
            "range": "±25.17%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "20e32bd37c8d37cc145fc6608a7cc23cf3c6fb78",
          "message": "refactor: tighten up property keys",
          "timestamp": "2023-10-19T11:39:17-05:00",
          "tree_id": "04c0f7d6483e6ee4a126dd8bc19b1ea9a3bfca40",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/20e32bd37c8d37cc145fc6608a7cc23cf3c6fb78"
        },
        "date": 1697734112237,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 416499,
            "range": "±7.93%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 493560,
            "range": "±17.00%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 291106,
            "range": "±17.75%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 192025,
            "range": "±20.20%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 183525,
            "range": "±19.77%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 117917,
            "range": "±21.92%",
            "unit": "ops/sec",
            "extra": "44 samples"
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
          "id": "f1f20a6ae44d3a3b19d2e1cf12974144f699ea4b",
          "message": "test: more timestamp offset for bigInt UT",
          "timestamp": "2023-10-19T11:53:30-05:00",
          "tree_id": "5594543245125950d09f11d0ae5c2d7186792d49",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f1f20a6ae44d3a3b19d2e1cf12974144f699ea4b"
        },
        "date": 1697734813725,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 211194,
            "range": "±113.76%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 613401,
            "range": "±11.43%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 347661,
            "range": "±26.61%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 261759,
            "range": "±16.12%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 270645,
            "range": "±22.51%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 983,
            "range": "±276.76%",
            "unit": "ops/sec",
            "extra": "5 samples"
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
          "id": "903fc59d1a3b62ee6c99c155d72918b7d5813488",
          "message": "feat!: remove SchemaPrinter",
          "timestamp": "2023-10-19T15:29:20-05:00",
          "tree_id": "6338c8e01c9fc6d71a59c54e5f44ac29b58a7fc6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/903fc59d1a3b62ee6c99c155d72918b7d5813488"
        },
        "date": 1697747957017,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 498393,
            "range": "±0.53%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 555831,
            "range": "±12.68%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 309338,
            "range": "±20.04%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 157406,
            "range": "±21.40%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 174440,
            "range": "±20.57%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 145018,
            "range": "±18.82%",
            "unit": "ops/sec",
            "extra": "46 samples"
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
          "id": "b3ba85b8b59c654bd05b67b4467ce6321bc447a4",
          "message": "refactor: crdt patterns on sfdxConfig",
          "timestamp": "2023-10-20T16:57:26-05:00",
          "tree_id": "5a21a4489c79e327d2a82d673ca8eafbb4077b49",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b3ba85b8b59c654bd05b67b4467ce6321bc447a4"
        },
        "date": 1697839426397,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 375503,
            "range": "±6.01%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 432820,
            "range": "±13.07%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 330996,
            "range": "±13.00%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 219208,
            "range": "±13.44%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 255181,
            "range": "±16.56%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 5103,
            "range": "±190.06%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "5eaeb2ffc8a40a199ff914de482ffd732cb58551",
          "message": "test: catch when sfdx-config.json isn't there",
          "timestamp": "2023-10-20T17:11:05-05:00",
          "tree_id": "1778468ba3e4a5bd445fe3a63da082964c9f357e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5eaeb2ffc8a40a199ff914de482ffd732cb58551"
        },
        "date": 1697840275043,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 402919,
            "range": "±30.91%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 615423,
            "range": "±8.12%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 436459,
            "range": "±8.72%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 291083,
            "range": "±15.17%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9964,
            "range": "±196.67%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 243638,
            "range": "±4.04%",
            "unit": "ops/sec",
            "extra": "61 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7e0568183015151e649883ebcf581be298f792b3",
          "message": "fix(deps): bump pino from 8.15.6 to 8.16.0\n\nBumps [pino](https://github.com/pinojs/pino) from 8.15.6 to 8.16.0.\n- [Release notes](https://github.com/pinojs/pino/releases)\n- [Commits](https://github.com/pinojs/pino/compare/v8.15.6...v8.16.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-20T22:21:38Z",
          "tree_id": "077ed498c7d055da96a6eab98091f4604a1fd0b6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7e0568183015151e649883ebcf581be298f792b3"
        },
        "date": 1697840970547,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 377018,
            "range": "±1.16%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 448231,
            "range": "±13.90%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 345652,
            "range": "±12.83%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 196396,
            "range": "±16.51%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 234780,
            "range": "±23.87%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 170438,
            "range": "±15.64%",
            "unit": "ops/sec",
            "extra": "62 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "dfca5aa90e070ef794c2d6db09fce92eec0ee1f2",
          "message": "chore(dev-deps): bump @salesforce/ts-sinon from 1.4.16 to 1.4.18\n\nBumps [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon) from 1.4.16 to 1.4.18.\n- [Release notes](https://github.com/forcedotcom/ts-sinon/releases)\n- [Changelog](https://github.com/forcedotcom/ts-sinon/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-sinon/compare/1.4.16...1.4.18)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-sinon\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-21T21:43:02Z",
          "tree_id": "373e164df99c443a0e8ada90b77040e06a5e1854",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/dfca5aa90e070ef794c2d6db09fce92eec0ee1f2"
        },
        "date": 1697924948737,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 477244,
            "range": "±0.60%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 539145,
            "range": "±15.55%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 392030,
            "range": "±14.72%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 292519,
            "range": "±7.43%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 242919,
            "range": "±23.73%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 3451,
            "range": "±206.44%",
            "unit": "ops/sec",
            "extra": "19 samples"
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
          "id": "67e6f5ae13bb2714f0cb399367c17cd4dd065fbc",
          "message": "test: back to jsforce latest",
          "timestamp": "2023-10-23T15:36:01-05:00",
          "tree_id": "041a3e1ab1c13068df1a66c1ffbde5f63a4aa296",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/67e6f5ae13bb2714f0cb399367c17cd4dd065fbc"
        },
        "date": 1698093988368,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 386812,
            "range": "±12.17%",
            "unit": "ops/sec",
            "extra": "77 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 498195,
            "range": "±9.23%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 293302,
            "range": "±16.20%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 169250,
            "range": "±19.83%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 163318,
            "range": "±19.56%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 110126,
            "range": "±21.25%",
            "unit": "ops/sec",
            "extra": "42 samples"
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
          "id": "938e5dae52f9a9430a43f319290fe2080a129393",
          "message": "chore: bump deps for xnuts",
          "timestamp": "2023-10-23T15:57:25-05:00",
          "tree_id": "a3c03342bdadc02cc85f3aeda60171ea47dee0e3",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/938e5dae52f9a9430a43f319290fe2080a129393"
        },
        "date": 1698095072589,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 402438,
            "range": "±8.15%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 449593,
            "range": "±13.80%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 295353,
            "range": "±21.21%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 167230,
            "range": "±23.69%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 170526,
            "range": "±19.53%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 114797,
            "range": "±22.46%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "02bc9d6c13fcdf132c13de920b3bc13d3c22372b",
          "message": "refactor: remove barrel files",
          "timestamp": "2023-10-24T08:47:39-05:00",
          "tree_id": "c8e39d04562c5e15ea027afe977a8f16f7cce416",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/02bc9d6c13fcdf132c13de920b3bc13d3c22372b"
        },
        "date": 1698155707026,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 391874,
            "range": "±1.33%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 461299,
            "range": "±10.27%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 285973,
            "range": "±20.41%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 167689,
            "range": "±17.87%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 165913,
            "range": "±21.87%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 117310,
            "range": "±24.53%",
            "unit": "ops/sec",
            "extra": "44 samples"
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
          "id": "ead7330269a8f3121a4b4e6129c84a79825a26d7",
          "message": "test: concurrency tests in configFile",
          "timestamp": "2023-10-25T10:58:27-05:00",
          "tree_id": "d954379417b2507de29cdf82f7569ddd1b3a41fe",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ead7330269a8f3121a4b4e6129c84a79825a26d7"
        },
        "date": 1698250159310,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 342127,
            "range": "±7.26%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 441560,
            "range": "±14.38%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 256861,
            "range": "±26.20%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 168638,
            "range": "±17.86%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 177038,
            "range": "±24.65%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 120811,
            "range": "±23.64%",
            "unit": "ops/sec",
            "extra": "38 samples"
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
          "id": "37ed65b5897e12410a9f60803e020b9ec4c8ceac",
          "message": "chore: remove unused unexported code",
          "timestamp": "2023-10-25T11:34:15-05:00",
          "tree_id": "8eb4957e2570ec371c21f23167266ca666782a9e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/37ed65b5897e12410a9f60803e020b9ec4c8ceac"
        },
        "date": 1698252368915,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 445777,
            "range": "±1.01%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 502223,
            "range": "±19.13%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 356911,
            "range": "±13.93%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 244742,
            "range": "±15.10%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 260679,
            "range": "±20.97%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 3111,
            "range": "±204.95%",
            "unit": "ops/sec",
            "extra": "21 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "6853656+cristiand391@users.noreply.github.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ce1ebcb5396e5ee8d302fdcd639f7716d84e1a04",
          "message": "Update src/stateAggregator/accessors/aliasAccessor.ts\n\nCo-authored-by: Shane McLaughlin <shane.mclaughlin@salesforce.com>",
          "timestamp": "2023-10-25T14:51:30-03:00",
          "tree_id": "ca3fca7bdfa25e456fe4d22aa1978ef53d89d388",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ce1ebcb5396e5ee8d302fdcd639f7716d84e1a04"
        },
        "date": 1698256686021,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 406802,
            "range": "±1.02%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 436839,
            "range": "±11.55%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 283586,
            "range": "±24.21%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 160443,
            "range": "±25.39%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 144715,
            "range": "±25.27%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 112494,
            "range": "±22.40%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "cdfdc792104ab1b3ef2361873aea812db14fe1b6",
          "message": "docs: v5 to v6 migration",
          "timestamp": "2023-10-26T15:35:09-05:00",
          "tree_id": "1bd5ae29ff620a07d86e64f7f7d87352b6c3dfbf",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/cdfdc792104ab1b3ef2361873aea812db14fe1b6"
        },
        "date": 1698352908431,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 486930,
            "range": "±0.53%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 553335,
            "range": "±14.34%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 317674,
            "range": "±18.03%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 167111,
            "range": "±22.69%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 171303,
            "range": "±21.30%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 137137,
            "range": "±18.70%",
            "unit": "ops/sec",
            "extra": "43 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "c4ef97ddbd1b59f5a4492c380b70a2eb6963e9b4",
          "message": "fix: merge main",
          "timestamp": "2023-10-26T15:18:56-06:00",
          "tree_id": "40548e82762176abb59bc02978c32e06d9626010",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c4ef97ddbd1b59f5a4492c380b70a2eb6963e9b4"
        },
        "date": 1698355621339,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 427427,
            "range": "±0.61%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 486759,
            "range": "±11.93%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 381827,
            "range": "±12.58%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 245917,
            "range": "±15.43%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 232089,
            "range": "±23.74%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 4919,
            "range": "±190.81%",
            "unit": "ops/sec",
            "extra": "34 samples"
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
          "id": "2a3dbeccf08f8732fae22419e50278a78647cf6b",
          "message": "chore: pr feedback",
          "timestamp": "2023-10-27T16:39:04-05:00",
          "tree_id": "522b4e05b9cf784cc71cfa8330dd626f32cf8b4d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2a3dbeccf08f8732fae22419e50278a78647cf6b"
        },
        "date": 1698443233991,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 423432,
            "range": "±0.77%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 448849,
            "range": "±11.29%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 366514,
            "range": "±14.73%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 238161,
            "range": "±15.73%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 245625,
            "range": "±20.71%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 7291,
            "range": "±188.71%",
            "unit": "ops/sec",
            "extra": "51 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6d3c02a2000f698bb8a21e5c796bc6f28b58595d",
          "message": "fix(deps): bump @salesforce/kit from 3.0.14 to 3.0.15\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.14 to 3.0.15.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.14...3.0.15)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-28T21:26:39Z",
          "tree_id": "9f9964e4aa634876fe249c5d531b20d9833f18d1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6d3c02a2000f698bb8a21e5c796bc6f28b58595d"
        },
        "date": 1698528766617,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 415596,
            "range": "±1.09%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 534422,
            "range": "±5.04%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 336889,
            "range": "±18.96%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 227362,
            "range": "±18.35%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 238893,
            "range": "±18.78%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 5304,
            "range": "±190.33%",
            "unit": "ops/sec",
            "extra": "40 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "13276dc6aeb4b441c24a66904b4e9aa03c5cec74",
          "message": "fix(deps): bump @salesforce/kit from 3.0.14 to 3.0.15\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.14 to 3.0.15.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.14...3.0.15)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-29T02:48:30Z",
          "tree_id": "64ae3918655b50f38aea40e9398ef556e333f1c8",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/13276dc6aeb4b441c24a66904b4e9aa03c5cec74"
        },
        "date": 1698548049493,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 485956,
            "range": "±1.59%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 575327,
            "range": "±14.85%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 273010,
            "range": "±19.92%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 165614,
            "range": "±23.53%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 157447,
            "range": "±21.72%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 115296,
            "range": "±21.94%",
            "unit": "ops/sec",
            "extra": "37 samples"
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
          "id": "9d99e6174905dfd7c1df6d299799ac7706756735",
          "message": "refactor: steve review",
          "timestamp": "2023-10-31T09:58:38-05:00",
          "tree_id": "ca7bcb68ec36dd57e7e33df02d7d0fe4c649a818",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9d99e6174905dfd7c1df6d299799ac7706756735"
        },
        "date": 1698764765105,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 373101,
            "range": "±6.19%",
            "unit": "ops/sec",
            "extra": "81 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 410241,
            "range": "±13.08%",
            "unit": "ops/sec",
            "extra": "28 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 263545,
            "range": "±14.01%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 161199,
            "range": "±19.68%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 160561,
            "range": "±23.64%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 109823,
            "range": "±24.51%",
            "unit": "ops/sec",
            "extra": "42 samples"
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
          "id": "9fcb206220174af1c20fcc041e127409a41c3593",
          "message": "fix(deps): testSetup has non ts-sinon dependency",
          "timestamp": "2023-11-02T11:44:21-05:00",
          "tree_id": "09ce33216a9db71202b54b10ca56d998af6690a5",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9fcb206220174af1c20fcc041e127409a41c3593"
        },
        "date": 1698943810490,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 560868,
            "range": "±0.91%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 775020,
            "range": "±5.51%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 527407,
            "range": "±8.26%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 16870,
            "range": "±184.85%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 399750,
            "range": "±20.25%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 285018,
            "range": "±7.36%",
            "unit": "ops/sec",
            "extra": "64 samples"
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
          "id": "599f23c79458b8cf08a6e63b17cd18691dec6818",
          "message": "test: mock throws when no user",
          "timestamp": "2023-11-02T11:52:25-05:00",
          "tree_id": "83fa2c1ac0eb28799e98053930857c8f5751cb43",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/599f23c79458b8cf08a6e63b17cd18691dec6818"
        },
        "date": 1698944513178,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 402157,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 499448,
            "range": "±8.89%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 226844,
            "range": "±35.26%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 149081,
            "range": "±24.82%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 178673,
            "range": "±28.64%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 105730,
            "range": "±28.07%",
            "unit": "ops/sec",
            "extra": "39 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0041526a97693ca687aba04960b013a9768a580a",
          "message": "chore(dev-deps): bump eslint from 8.52.0 to 8.53.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.52.0 to 8.53.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.52.0...v8.53.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-04T21:30:19Z",
          "tree_id": "653e149849cfc480b0fb0031dbfb0b3db58ec494",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0041526a97693ca687aba04960b013a9768a580a"
        },
        "date": 1699133840309,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 309675,
            "range": "±32.63%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 493342,
            "range": "±14.12%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 339014,
            "range": "±14.55%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 232858,
            "range": "±17.98%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 237139,
            "range": "±23.26%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 6669,
            "range": "±188.46%",
            "unit": "ops/sec",
            "extra": "52 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8cb21ce85a5ab07d8fba7204b9d644024d58946d",
          "message": "chore(dev-deps): bump @salesforce/ts-sinon from 1.4.18 to 1.4.19\n\nBumps [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon) from 1.4.18 to 1.4.19.\n- [Release notes](https://github.com/forcedotcom/ts-sinon/releases)\n- [Changelog](https://github.com/forcedotcom/ts-sinon/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-sinon/compare/1.4.18...1.4.19)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-sinon\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-05T05:46:11Z",
          "tree_id": "38a2eaf806002068ef09a9c60836b726138c588f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8cb21ce85a5ab07d8fba7204b9d644024d58946d"
        },
        "date": 1699163534612,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 379781,
            "range": "±5.78%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 425006,
            "range": "±12.02%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 326181,
            "range": "±19.18%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 207252,
            "range": "±11.72%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 257608,
            "range": "±18.55%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 6125,
            "range": "±189.83%",
            "unit": "ops/sec",
            "extra": "49 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "c2ef3a0f8fea0518b5eec2f6f515064e9741b46e",
          "message": "fix: use memory logger instance when disabled",
          "timestamp": "2023-11-07T14:41:38-07:00",
          "tree_id": "3b8a444f63e3ea0035df93c98572be14d819b1fd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c2ef3a0f8fea0518b5eec2f6f515064e9741b46e"
        },
        "date": 1699393716574,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 348225,
            "range": "±0.35%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 825105,
            "range": "±6.01%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 652905,
            "range": "±7.64%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23494,
            "range": "±184.38%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 476442,
            "range": "±6.37%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 328575,
            "range": "±5.44%",
            "unit": "ops/sec",
            "extra": "64 samples"
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
          "id": "29c59e013f0cf25407430bd0d4752e4df8686ab5",
          "message": "feat: reusable file locks outside of ConfigFile",
          "timestamp": "2023-11-08T15:06:53-06:00",
          "tree_id": "f496af57cf2dfa1aa9bbb36c6bdcf0a7862dd0ff",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/29c59e013f0cf25407430bd0d4752e4df8686ab5"
        },
        "date": 1699478083819,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 587812,
            "range": "±0.54%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 763983,
            "range": "±6.94%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 513955,
            "range": "±9.03%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 294241,
            "range": "±10.56%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 2627,
            "range": "±275.01%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 274455,
            "range": "±6.14%",
            "unit": "ops/sec",
            "extra": "69 samples"
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
          "id": "6deabcd603055786311994cb25c8c9282ff9971d",
          "message": "fix: http 420 errors",
          "timestamp": "2023-11-09T09:36:00-06:00",
          "tree_id": "835db27c55898b15fb098e2a0d5f56036aba1879",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6deabcd603055786311994cb25c8c9282ff9971d"
        },
        "date": 1699544610057,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 313520,
            "range": "±0.80%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 712419,
            "range": "±5.79%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 576034,
            "range": "±9.04%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 11843,
            "range": "±189.20%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 455969,
            "range": "±6.60%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 321664,
            "range": "±6.18%",
            "unit": "ops/sec",
            "extra": "63 samples"
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
          "id": "3c9c73d50f68a71820d0727149819c9056bf5af3",
          "message": "refactor: use messages for text",
          "timestamp": "2023-11-09T09:43:44-06:00",
          "tree_id": "3185217205758f86559f224c400dee900832d6c5",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3c9c73d50f68a71820d0727149819c9056bf5af3"
        },
        "date": 1699545080884,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 349164,
            "range": "±0.33%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 841907,
            "range": "±9.94%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 495433,
            "range": "±7.89%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 13296,
            "range": "±187.05%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 397143,
            "range": "±9.03%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 293738,
            "range": "±5.51%",
            "unit": "ops/sec",
            "extra": "65 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "Shane McLaughlin",
            "username": "mshanemc"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5562a3d8436414303aa5809dc7e2ca09da523550",
          "message": "Merge pull request #981 from forcedotcom/sm/reusable-file-locks\n\nfeat: reusable file locks outside of ConfigFile",
          "timestamp": "2023-11-09T11:51:57-06:00",
          "tree_id": "f496af57cf2dfa1aa9bbb36c6bdcf0a7862dd0ff",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5562a3d8436414303aa5809dc7e2ca09da523550"
        },
        "date": 1699552644904,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 458326,
            "range": "±0.56%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 645321,
            "range": "±11.02%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 320024,
            "range": "±22.34%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 181644,
            "range": "±21.24%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 213966,
            "range": "±21.44%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 122796,
            "range": "±24.61%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "a702f2b288db5a6cfd1d0fabfb2721d8c68b1c0c",
          "message": "Merge remote-tracking branch 'origin/main' into sm/crdt-config",
          "timestamp": "2023-11-09T15:58:12-06:00",
          "tree_id": "5bb5490e5237e17c518759e99b70a7785981f014",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a702f2b288db5a6cfd1d0fabfb2721d8c68b1c0c"
        },
        "date": 1699567441337,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 345983,
            "range": "±0.46%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 806782,
            "range": "±7.23%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 585281,
            "range": "±6.49%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7111,
            "range": "±204.28%",
            "unit": "ops/sec",
            "extra": "21 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 446007,
            "range": "±9.91%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 310288,
            "range": "±5.39%",
            "unit": "ops/sec",
            "extra": "61 samples"
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
          "id": "9fe6f49f44d2ff613f20b8a78de7d27f306dc276",
          "message": "refactor: dev-scripts",
          "timestamp": "2023-11-09T16:28:47-06:00",
          "tree_id": "01caf6ca518d055b22d5ed78bc4717b571d0a474",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9fe6f49f44d2ff613f20b8a78de7d27f306dc276"
        },
        "date": 1699569255193,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 336036,
            "range": "±0.70%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 764947,
            "range": "±10.57%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 604659,
            "range": "±6.60%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7782,
            "range": "±202.41%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 465357,
            "range": "±11.05%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 322938,
            "range": "±6.40%",
            "unit": "ops/sec",
            "extra": "67 samples"
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
          "id": "3e9c988223f285deda794e0ef2a7ed5cab91425f",
          "message": "test: add apex, comunity nuts",
          "timestamp": "2023-11-09T17:01:37-06:00",
          "tree_id": "ae81a025bc4d80477166aa73ce4bba9656729e17",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3e9c988223f285deda794e0ef2a7ed5cab91425f"
        },
        "date": 1699571263608,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 206821,
            "range": "±5.84%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 494880,
            "range": "±8.41%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 317757,
            "range": "±12.16%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 166290,
            "range": "±21.65%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 187603,
            "range": "±22.55%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 98829,
            "range": "±23.90%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "d5b345f9179e64497b4f42fcef8fd45dce1f9d19",
          "message": "ci: also remove core from apex-node lib",
          "timestamp": "2023-11-10T08:33:29-06:00",
          "tree_id": "e6fa34f4467fb957a376a0ea0099bc0efb9f5649",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d5b345f9179e64497b4f42fcef8fd45dce1f9d19"
        },
        "date": 1699627127080,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 319236,
            "range": "±0.76%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 812081,
            "range": "±5.57%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 602785,
            "range": "±4.91%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5769,
            "range": "±207.36%",
            "unit": "ops/sec",
            "extra": "18 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 455806,
            "range": "±12.88%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 334782,
            "range": "±5.46%",
            "unit": "ops/sec",
            "extra": "74 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shane.mclaughlin@salesforce.com",
            "name": "Shane McLaughlin",
            "username": "mshanemc"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a57f79f8d1342d1dbd66f2ae91e3ffc4e712eb2a",
          "message": "Merge pull request #982 from forcedotcom/sm/dev-scripts\n\nrefactor: dev-scripts",
          "timestamp": "2023-11-10T09:37:47-06:00",
          "tree_id": "e6fa34f4467fb957a376a0ea0099bc0efb9f5649",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a57f79f8d1342d1dbd66f2ae91e3ffc4e712eb2a"
        },
        "date": 1699631010562,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 170635,
            "range": "±1.63%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 394456,
            "range": "±19.31%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 305057,
            "range": "±18.81%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 161573,
            "range": "±19.58%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 186822,
            "range": "±21.99%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 134173,
            "range": "±22.19%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "4dbd64a33e03ce56d7e9940c0e8524705bdfca8f",
          "message": "Merge remote-tracking branch 'origin/main' into sm/crdt-config",
          "timestamp": "2023-11-10T09:43:16-06:00",
          "tree_id": "b341e80b7c8fdbd43c7707a60d12fd1d1a0beacd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4dbd64a33e03ce56d7e9940c0e8524705bdfca8f"
        },
        "date": 1699631406054,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 199486,
            "range": "±3.90%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 487144,
            "range": "±11.40%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 274758,
            "range": "±21.31%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 185462,
            "range": "±16.22%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 161447,
            "range": "±20.07%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 118828,
            "range": "±22.16%",
            "unit": "ops/sec",
            "extra": "44 samples"
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
          "id": "4e66905b9c0bd8997c2b995f11d3f36648ec15cb",
          "message": "feat: ts5 and ts-patch",
          "timestamp": "2023-11-10T11:12:31-06:00",
          "tree_id": "0cb5b0013b84c194e1ae7540c403f3a3cff1395e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4e66905b9c0bd8997c2b995f11d3f36648ec15cb"
        },
        "date": 1699636744706,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 338212,
            "range": "±0.96%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 844025,
            "range": "±8.19%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 644539,
            "range": "±5.69%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 2624,
            "range": "±234.56%",
            "unit": "ops/sec",
            "extra": "8 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 478225,
            "range": "±5.72%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 345902,
            "range": "±4.16%",
            "unit": "ops/sec",
            "extra": "75 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "willieruemmele@gmail.com",
            "name": "Willie Ruemmele",
            "username": "WillieRuemmele"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2b6556bb42d8c2d83f59416571acb0a0fa1b1f5f",
          "message": "Merge pull request #983 from forcedotcom/sm/ts-patch\n\nfeat: ts5 and ts-patch",
          "timestamp": "2023-11-10T14:50:31-04:00",
          "tree_id": "0cb5b0013b84c194e1ae7540c403f3a3cff1395e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2b6556bb42d8c2d83f59416571acb0a0fa1b1f5f"
        },
        "date": 1699642677456,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 198750,
            "range": "±7.20%",
            "unit": "ops/sec",
            "extra": "79 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 448751,
            "range": "±8.49%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 318766,
            "range": "±18.53%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 225606,
            "range": "±16.53%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 250078,
            "range": "±21.41%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 5621,
            "range": "±190.02%",
            "unit": "ops/sec",
            "extra": "43 samples"
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
          "id": "e4ba4f3cd53698ff5d3d98e89fbbc753ed0dea7b",
          "message": "style: fix comment",
          "timestamp": "2023-11-10T12:59:58-06:00",
          "tree_id": "3153fd28d8b307f291b52203557bc8c4d178b350",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e4ba4f3cd53698ff5d3d98e89fbbc753ed0dea7b"
        },
        "date": 1699645099030,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 315906,
            "range": "±3.79%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 753302,
            "range": "±4.47%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 555188,
            "range": "±8.58%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10263,
            "range": "±198.66%",
            "unit": "ops/sec",
            "extra": "28 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 462972,
            "range": "±7.31%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 323879,
            "range": "±5.12%",
            "unit": "ops/sec",
            "extra": "72 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "25ed002bdd090c96d085f952855ba3d97f07882d",
          "message": "chore(dev-deps): bump @types/lodash from 4.14.200 to 4.14.201\n\nBumps [@types/lodash](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/lodash) from 4.14.200 to 4.14.201.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/lodash)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/lodash\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-11T21:24:12Z",
          "tree_id": "a9e2d9eb5e922e5599b810fa4063e4408c68d61f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/25ed002bdd090c96d085f952855ba3d97f07882d"
        },
        "date": 1699738177128,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 234432,
            "range": "±2.64%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 603314,
            "range": "±6.36%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 293116,
            "range": "±18.32%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 152932,
            "range": "±22.79%",
            "unit": "ops/sec",
            "extra": "31 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 152355,
            "range": "±22.12%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 122725,
            "range": "±19.96%",
            "unit": "ops/sec",
            "extra": "40 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a41989823d8b66e227d7f610347655ab094ea6d6",
          "message": "chore(dev-deps): bump @types/lodash from 4.14.200 to 4.14.201\n\nBumps [@types/lodash](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/lodash) from 4.14.200 to 4.14.201.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/lodash)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/lodash\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-12T02:45:59Z",
          "tree_id": "870f4c48afb14ce0543e21639f11849cd9b0c6c9",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a41989823d8b66e227d7f610347655ab094ea6d6"
        },
        "date": 1699757619057,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 319895,
            "range": "±0.80%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 753956,
            "range": "±5.51%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 632099,
            "range": "±5.58%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7782,
            "range": "±202.56%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 448306,
            "range": "±14.23%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 298857,
            "range": "±9.53%",
            "unit": "ops/sec",
            "extra": "74 samples"
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
          "id": "515b5a8042709771aae529f0ea82e95dae62f5cb",
          "message": "chore: bump major",
          "timestamp": "2023-11-13T13:45:20-06:00",
          "tree_id": "86e6cdc01f18210441e5a0221a3ecc26e3843085",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/515b5a8042709771aae529f0ea82e95dae62f5cb"
        },
        "date": 1699905159979,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 342538,
            "range": "±0.75%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 922875,
            "range": "±6.73%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 35643,
            "range": "±184.54%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 384860,
            "range": "±5.73%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 480393,
            "range": "±5.87%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 22063,
            "range": "±183.35%",
            "unit": "ops/sec",
            "extra": "68 samples"
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
          "id": "ac78de4f76f133b7cbe14f3f5b55169e73f97033",
          "message": "refactor: revert #980 in favor of a jsforce solution",
          "timestamp": "2023-11-14T11:03:26-06:00",
          "tree_id": "6c5f7e59e55413fe4e6f906068850fdbae78305f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ac78de4f76f133b7cbe14f3f5b55169e73f97033"
        },
        "date": 1699981747099,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 342487,
            "range": "±0.59%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 780924,
            "range": "±8.47%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 593347,
            "range": "±5.22%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8579,
            "range": "±200.16%",
            "unit": "ops/sec",
            "extra": "27 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 449208,
            "range": "±6.93%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 336063,
            "range": "±5.57%",
            "unit": "ops/sec",
            "extra": "71 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f151982e2b5c335d4c4b7615d01ef9058ed95ddd",
          "message": "fix(deps): bump @babel/traverse from 7.18.8 to 7.23.3\n\nBumps [@babel/traverse](https://github.com/babel/babel/tree/HEAD/packages/babel-traverse) from 7.18.8 to 7.23.3.\n- [Release notes](https://github.com/babel/babel/releases)\n- [Changelog](https://github.com/babel/babel/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/babel/babel/commits/v7.23.3/packages/babel-traverse)\n\n---\nupdated-dependencies:\n- dependency-name: \"@babel/traverse\"\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-14T21:17:24Z",
          "tree_id": "0630a0de0364072320269833b6b679d68a764d73",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f151982e2b5c335d4c4b7615d01ef9058ed95ddd"
        },
        "date": 1699997162791,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 346933,
            "range": "±0.35%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 878805,
            "range": "±7.08%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 636548,
            "range": "±5.67%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 22327,
            "range": "±184.42%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 493142,
            "range": "±6.74%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 338419,
            "range": "±5.10%",
            "unit": "ops/sec",
            "extra": "66 samples"
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
          "id": "ff8b06696f7ef88ac74a35f60e281b90eb74471b",
          "message": "fix: write safety and valid typing for sfProject",
          "timestamp": "2023-11-15T07:46:50-06:00",
          "tree_id": "1254fecc9b14651415d1d2c18948581efdb53311",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ff8b06696f7ef88ac74a35f60e281b90eb74471b"
        },
        "date": 1700056404594,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 321839,
            "range": "±0.70%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 816003,
            "range": "±5.37%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 535151,
            "range": "±7.75%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7941,
            "range": "±201.98%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 493003,
            "range": "±6.01%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 308487,
            "range": "±5.07%",
            "unit": "ops/sec",
            "extra": "72 samples"
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
          "id": "25b3cf1b28d58bdaeebfef13d4463c33ed8a4b8a",
          "message": "fix(types): additional props for packaging lib",
          "timestamp": "2023-11-15T11:46:40-06:00",
          "tree_id": "9f79d147554d4c10853f93ebda5ca8121590462d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/25b3cf1b28d58bdaeebfef13d4463c33ed8a4b8a"
        },
        "date": 1700070799562,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 345195,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 820301,
            "range": "±5.81%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 642427,
            "range": "±5.39%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 3646,
            "range": "±220.41%",
            "unit": "ops/sec",
            "extra": "11 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 462167,
            "range": "±7.87%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 331376,
            "range": "±5.16%",
            "unit": "ops/sec",
            "extra": "66 samples"
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
          "id": "b7f55882d10bb69c945ebd0cb89bcc6f1d48b9da",
          "message": "fix: no retries on sync lock",
          "timestamp": "2023-11-15T14:34:56-06:00",
          "tree_id": "d8681840282770465468e018f1431cdb2eeb72c0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b7f55882d10bb69c945ebd0cb89bcc6f1d48b9da"
        },
        "date": 1700080998108,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 325123,
            "range": "±0.64%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 728434,
            "range": "±4.58%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 569957,
            "range": "±5.90%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 12705,
            "range": "±188.94%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 500213,
            "range": "±4.85%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 346779,
            "range": "±6.65%",
            "unit": "ops/sec",
            "extra": "69 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "iowillhoit@users.noreply.github.com",
            "name": "Willhoit",
            "username": "iowillhoit"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e9a2a5f104d944561ff0ab451fe2f99100a2b6ee",
          "message": "Update CODEOWNERS",
          "timestamp": "2023-11-15T15:37:55-06:00",
          "tree_id": "5129817703646c4153cdec4b934d5a13e1d171e5",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e9a2a5f104d944561ff0ab451fe2f99100a2b6ee"
        },
        "date": 1700084738096,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 337264,
            "range": "±3.24%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 766388,
            "range": "±7.71%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 533389,
            "range": "±7.26%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 270126,
            "range": "±8.56%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 6029,
            "range": "±211.36%",
            "unit": "ops/sec",
            "extra": "14 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 288705,
            "range": "±6.42%",
            "unit": "ops/sec",
            "extra": "66 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "committer": {
            "email": "shetzel@salesforce.com",
            "name": "Steve Hetzel",
            "username": "shetzel"
          },
          "distinct": true,
          "id": "dd051bd5b1f91999c38e70ad4342381fdd88a014",
          "message": "fix: set stack to fullStack if set",
          "timestamp": "2023-11-16T12:40:40-07:00",
          "tree_id": "c87ad6097b77e03ed2afa061b4bdf827d3b174a4",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/dd051bd5b1f91999c38e70ad4342381fdd88a014"
        },
        "date": 1700164147883,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 319902,
            "range": "±0.92%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 846988,
            "range": "±7.91%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 657782,
            "range": "±7.73%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 12701,
            "range": "±188.88%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 479070,
            "range": "±8.50%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 332719,
            "range": "±5.31%",
            "unit": "ops/sec",
            "extra": "66 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "074e70684040116b0ca75d12de59ab8dcb90d03f",
          "message": "chore(dev-deps): bump @types/benchmark from 2.1.3 to 2.1.5\n\nBumps [@types/benchmark](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/benchmark) from 2.1.3 to 2.1.5.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/benchmark)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/benchmark\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-18T21:31:39Z",
          "tree_id": "b676ee719b9ea5fb4fd784eda7369e2114a9a6c2",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/074e70684040116b0ca75d12de59ab8dcb90d03f"
        },
        "date": 1700343609808,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 327601,
            "range": "±0.84%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 763744,
            "range": "±5.87%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 559725,
            "range": "±6.13%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 11399,
            "range": "±189.00%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 416012,
            "range": "±4.74%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 296467,
            "range": "±5.19%",
            "unit": "ops/sec",
            "extra": "64 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d40300556bc8cc7d2deb4ce366886c88bc75322c",
          "message": "chore(dev-deps): bump @types/benchmark from 2.1.3 to 2.1.5\n\nBumps [@types/benchmark](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/benchmark) from 2.1.3 to 2.1.5.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/benchmark)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/benchmark\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-19T02:46:07Z",
          "tree_id": "c914aa596c80cbae70e8221874235bcecd7fbdd1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d40300556bc8cc7d2deb4ce366886c88bc75322c"
        },
        "date": 1700362425105,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 340424,
            "range": "±0.46%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 796854,
            "range": "±5.83%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 615682,
            "range": "±5.80%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4954,
            "range": "±211.26%",
            "unit": "ops/sec",
            "extra": "15 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 505635,
            "range": "±5.67%",
            "unit": "ops/sec",
            "extra": "76 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 310808,
            "range": "±5.61%",
            "unit": "ops/sec",
            "extra": "61 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4485e58ba990aef5c8f748fdd4fb4ebdcdeb58cb",
          "message": "chore(dev-deps): bump @types/benchmark from 2.1.3 to 2.1.5\n\nBumps [@types/benchmark](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/benchmark) from 2.1.3 to 2.1.5.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/benchmark)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/benchmark\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-19T08:46:07Z",
          "tree_id": "a7d660d89c6f40add5391e693bdbf24586580312",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4485e58ba990aef5c8f748fdd4fb4ebdcdeb58cb"
        },
        "date": 1700384057092,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 345032,
            "range": "±0.41%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 783053,
            "range": "±6.38%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 588257,
            "range": "±6.66%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8395,
            "range": "±201.65%",
            "unit": "ops/sec",
            "extra": "25 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 445434,
            "range": "±14.09%",
            "unit": "ops/sec",
            "extra": "76 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 315102,
            "range": "±4.31%",
            "unit": "ops/sec",
            "extra": "62 samples"
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
          "id": "715b364c5b6bd6227f51c343efc6c65863ca4257",
          "message": "fix: export 2 accessors",
          "timestamp": "2023-11-20T08:34:30-06:00",
          "tree_id": "bfffc6a46be01e4f00341a7d717ba4e84ea9ce4c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/715b364c5b6bd6227f51c343efc6c65863ca4257"
        },
        "date": 1700491653659,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 340711,
            "range": "±0.59%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 819274,
            "range": "±4.83%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 640330,
            "range": "±5.60%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 2627,
            "range": "±228.47%",
            "unit": "ops/sec",
            "extra": "9 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 441397,
            "range": "±14.49%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 328734,
            "range": "±5.98%",
            "unit": "ops/sec",
            "extra": "64 samples"
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
          "id": "49beee53824a843a53e44e6b78f38b628b4eb0f8",
          "message": "feat: generic type for sfError.data",
          "timestamp": "2023-11-20T15:45:39-06:00",
          "tree_id": "9f5491b7ae70702e723e5c9a0f4ae78be1d60e21",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/49beee53824a843a53e44e6b78f38b628b4eb0f8"
        },
        "date": 1700517364992,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 343714,
            "range": "±0.53%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 804844,
            "range": "±4.70%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 626407,
            "range": "±5.30%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4888,
            "range": "±211.41%",
            "unit": "ops/sec",
            "extra": "15 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 454665,
            "range": "±8.85%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 324047,
            "range": "±5.19%",
            "unit": "ops/sec",
            "extra": "64 samples"
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
          "id": "a8d732bf333280d06161e947f848d25a9163c03b",
          "message": "chore: bump dev-scripts",
          "timestamp": "2023-11-20T16:29:09-06:00",
          "tree_id": "c4b664c6894ff3893916d2a65dd202e0a95d8328",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a8d732bf333280d06161e947f848d25a9163c03b"
        },
        "date": 1700519743157,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 331352,
            "range": "±0.89%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 805865,
            "range": "±7.14%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 602248,
            "range": "±4.82%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7313,
            "range": "±203.52%",
            "unit": "ops/sec",
            "extra": "22 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 408992,
            "range": "±12.21%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 313213,
            "range": "±5.72%",
            "unit": "ops/sec",
            "extra": "67 samples"
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
          "id": "447b070d02badbe488f20c961b8db79ac6e9aef9",
          "message": "feat: set some known props during scratch org creation",
          "timestamp": "2023-11-22T11:17:37-06:00",
          "tree_id": "0d2d5e6e18ff0db7b6b4113499a2a045de64dd2c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/447b070d02badbe488f20c961b8db79ac6e9aef9"
        },
        "date": 1700673965332,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 340835,
            "range": "±3.46%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 792427,
            "range": "±5.38%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 607490,
            "range": "±8.63%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4676,
            "range": "±211.52%",
            "unit": "ops/sec",
            "extra": "15 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 412836,
            "range": "±8.09%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 320034,
            "range": "±6.03%",
            "unit": "ops/sec",
            "extra": "65 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "49699333+dependabot[bot]@users.noreply.github.com",
            "name": "dependabot[bot]",
            "username": "dependabot[bot]"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c12440de94c8479f4a885157082ee28065e43cff",
          "message": "fix(deps): bump @types/semver from 7.5.5 to 7.5.6\n\nBumps [@types/semver](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/semver) from 7.5.5 to 7.5.6.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/semver)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/semver\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-25T21:13:05Z",
          "tree_id": "b1e00108278b043cef3451010f8febe4556967b3",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c12440de94c8479f4a885157082ee28065e43cff"
        },
        "date": 1700947245426,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 339772,
            "range": "±2.88%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 791641,
            "range": "±6.61%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 629847,
            "range": "±5.22%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5511,
            "range": "±208.46%",
            "unit": "ops/sec",
            "extra": "17 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 428581,
            "range": "±17.43%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 321953,
            "range": "±5.87%",
            "unit": "ops/sec",
            "extra": "62 samples"
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
          "id": "7c79453d42110ebf6531ec39d8f1d44b7424f632",
          "message": "Merge remote-tracking branch 'origin/main' into sm/set-scratchiness-during-creation",
          "timestamp": "2023-11-27T07:53:41-06:00",
          "tree_id": "5b2b61df41a375abbdcd785db5b7993484bda35d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7c79453d42110ebf6531ec39d8f1d44b7424f632"
        },
        "date": 1701093870804,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 350493,
            "range": "±0.42%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 837120,
            "range": "±6.60%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 654862,
            "range": "±6.99%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 20444,
            "range": "±184.85%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 459212,
            "range": "±8.44%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 310705,
            "range": "±5.75%",
            "unit": "ops/sec",
            "extra": "62 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "committer": {
            "email": "cdominguez@salesforce.com",
            "name": "Cristian Dominguez",
            "username": "cristiand391"
          },
          "distinct": true,
          "id": "0d1954522ece0bbb4d8447a93003fed6e6fe6173",
          "message": "fix: bump jsforce",
          "timestamp": "2023-11-27T16:14:41-03:00",
          "tree_id": "a439ccc24e9f04dde377b74eeab53da114cba646",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0d1954522ece0bbb4d8447a93003fed6e6fe6173"
        },
        "date": 1701113060843,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 339471,
            "range": "±3.14%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 869530,
            "range": "±5.49%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 650217,
            "range": "±6.14%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 1581,
            "range": "±276.45%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 433324,
            "range": "±12.16%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 337933,
            "range": "±5.45%",
            "unit": "ops/sec",
            "extra": "66 samples"
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
          "id": "b311cb1a9340e9494c8deff127900d04f921aab8",
          "message": "feat: return a value, use that instead of mutating state",
          "timestamp": "2023-11-27T17:07:06-06:00",
          "tree_id": "46c6195f88cfec227f67d1aa55bb5d322b856efb",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b311cb1a9340e9494c8deff127900d04f921aab8"
        },
        "date": 1701126901512,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 322390,
            "range": "±2.95%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 786173,
            "range": "±5.91%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 591125,
            "range": "±6.11%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8151,
            "range": "±201.85%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 470388,
            "range": "±7.19%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 345341,
            "range": "±5.11%",
            "unit": "ops/sec",
            "extra": "69 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "snyk-bot@snyk.io",
            "name": "snyk-bot",
            "username": "snyk-bot"
          },
          "committer": {
            "email": "snyk-bot@snyk.io",
            "name": "snyk-bot",
            "username": "snyk-bot"
          },
          "distinct": true,
          "id": "7aaceeefc48969f93525cbde3ae4169cc331d47a",
          "message": "fix: examples/package.json & examples/yarn.lock to reduce vulnerabilities\n\nThe following vulnerabilities are fixed with an upgrade:\n- https://snyk.io/vuln/SNYK-JS-INFLIGHT-6095116",
          "timestamp": "2023-11-30T15:30:53Z",
          "tree_id": "fc3f9ae50f4e8d16d921736b16bdbcd7e2faa091",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7aaceeefc48969f93525cbde3ae4169cc331d47a"
        },
        "date": 1701358583840,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 349698,
            "range": "±0.50%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 816916,
            "range": "±7.17%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 649165,
            "range": "±5.44%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 3549,
            "range": "±223.60%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 469209,
            "range": "±11.55%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 342908,
            "range": "±6.32%",
            "unit": "ops/sec",
            "extra": "70 samples"
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
          "id": "22eb1c6c868018f5e7a619b23008ccea494dd901",
          "message": "Merge remote-tracking branch 'origin/main' into sm/set-scratchiness-during-creation",
          "timestamp": "2023-12-04T08:49:24-06:00",
          "tree_id": "96716cddc33ce5dff595311f7f2a7148ded57ba6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/22eb1c6c868018f5e7a619b23008ccea494dd901"
        },
        "date": 1701701759111,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 343465,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 825125,
            "range": "±6.80%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 630376,
            "range": "±6.05%",
            "unit": "ops/sec",
            "extra": "75 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 3851,
            "range": "±217.92%",
            "unit": "ops/sec",
            "extra": "12 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 468673,
            "range": "±6.55%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 337094,
            "range": "±5.28%",
            "unit": "ops/sec",
            "extra": "66 samples"
          }
        ]
      }
    ]
  }
}