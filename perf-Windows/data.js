window.BENCHMARK_DATA = {
  "lastUpdate": 1688582761531,
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
      }
    ]
  }
}