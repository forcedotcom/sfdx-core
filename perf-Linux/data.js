window.BENCHMARK_DATA = {
  "lastUpdate": 1688580287619,
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
          "id": "985bd0b66173dfb65912b58a1444ce29996404c7",
          "message": "Merge branch 'sm/perf-metrics' into wr/unsetAliasConfig",
          "timestamp": "2023-06-29T07:58:10-05:00",
          "tree_id": "ccb1fce7b32f747f2c83d3aa8c1fe17b4308b887",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/985bd0b66173dfb65912b58a1444ce29996404c7"
        },
        "date": 1688043754752,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 11589,
            "range": "±2.18%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 57600,
            "range": "±0.73%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 46002,
            "range": "±1.59%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 22303,
            "range": "±1.74%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 41034,
            "range": "±1.74%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 39833,
            "range": "±1.46%",
            "unit": "ops/sec",
            "extra": "84 samples"
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
        "date": 1688044534744,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15601,
            "range": "±0.49%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 73717,
            "range": "±0.10%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 63301,
            "range": "±0.10%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29891,
            "range": "±0.18%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 56527,
            "range": "±0.06%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 51280,
            "range": "±0.29%",
            "unit": "ops/sec",
            "extra": "97 samples"
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
        "date": 1688045528121,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 16988,
            "range": "±1.27%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 68316,
            "range": "±0.44%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 58027,
            "range": "±0.78%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28084,
            "range": "±0.49%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 52389,
            "range": "±0.44%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 48436,
            "range": "±0.36%",
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
          "id": "e564c78511cbf2d4aa8b7de45968c51f88e949ca",
          "message": "chore(dev-deps): bump @typescript-eslint/parser from 5.59.11 to 5.60.1\n\nBumps [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint/tree/HEAD/packages/parser) from 5.59.11 to 5.60.1.\n- [Release notes](https://github.com/typescript-eslint/typescript-eslint/releases)\n- [Changelog](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/parser/CHANGELOG.md)\n- [Commits](https://github.com/typescript-eslint/typescript-eslint/commits/v5.60.1/packages/parser)\n\n---\nupdated-dependencies:\n- dependency-name: \"@typescript-eslint/parser\"\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-06-29T14:24:56Z",
          "tree_id": "d2a7c9596188626bda554e9e20514689d11528e8",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e564c78511cbf2d4aa8b7de45968c51f88e949ca"
        },
        "date": 1688048853897,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 16835,
            "range": "±0.31%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 69643,
            "range": "±0.06%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 60478,
            "range": "±0.15%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28991,
            "range": "±0.06%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 54857,
            "range": "±0.08%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50109,
            "range": "±0.14%",
            "unit": "ops/sec",
            "extra": "95 samples"
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
        "date": 1688049348655,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 9515,
            "range": "±1.62%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 61261,
            "range": "±1.04%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 43235,
            "range": "±0.82%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 20887,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 42576,
            "range": "±1.43%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 41018,
            "range": "±1.58%",
            "unit": "ops/sec",
            "extra": "84 samples"
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
        "date": 1688051446539,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15105,
            "range": "±0.67%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 71045,
            "range": "±0.31%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 61218,
            "range": "±0.08%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29005,
            "range": "±0.37%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 55147,
            "range": "±0.08%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50295,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "94 samples"
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
        "date": 1688051832534,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 16974,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 68919,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 58769,
            "range": "±0.59%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28577,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 53184,
            "range": "±0.45%",
            "unit": "ops/sec",
            "extra": "99 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 48902,
            "range": "±0.23%",
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
          "id": "210f380e466da90f26a01891d36f660b0c5892be",
          "message": "Merge remote-tracking branch 'origin/main' into sm/new-logger",
          "timestamp": "2023-06-29T10:12:15-05:00",
          "tree_id": "beb631c20367e3c3baa1f781c62159c8947ba93d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/210f380e466da90f26a01891d36f660b0c5892be"
        },
        "date": 1688056539342,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 409857,
            "range": "±1.51%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 568032,
            "range": "±22.62%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 490783,
            "range": "±7.46%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8837,
            "range": "±190.97%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 314601,
            "range": "±18.31%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 277309,
            "range": "±10.74%",
            "unit": "ops/sec",
            "extra": "50 samples"
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
        "date": 1688068002338,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 349949,
            "range": "±2.84%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 523969,
            "range": "±11.83%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 429211,
            "range": "±17.98%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 236628,
            "range": "±15.23%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10326,
            "range": "±190.01%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 176570,
            "range": "±39.69%",
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
          "id": "e37e172636bc064e7f23d753a48be12f69ce2019",
          "message": "chore: code cleanup for pr",
          "timestamp": "2023-06-29T16:07:01-05:00",
          "tree_id": "010e93cab508ce57d73126b881e78cf81c5b5aef",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e37e172636bc064e7f23d753a48be12f69ce2019"
        },
        "date": 1688073272844,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 339101,
            "range": "±0.82%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 490684,
            "range": "±10.74%",
            "unit": "ops/sec",
            "extra": "28 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 415058,
            "range": "±15.58%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 229418,
            "range": "±15.80%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 291950,
            "range": "±18.73%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 2207,
            "range": "±223.66%",
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
          "id": "cfab6a0f045105e7e852d602bf81002574797716",
          "message": "chore: bring back jsforce changes",
          "timestamp": "2023-06-29T19:18:54-03:00",
          "tree_id": "4c67c13e048c020c95787aac4f6175952523d71b",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/cfab6a0f045105e7e852d602bf81002574797716"
        },
        "date": 1688077360161,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 16376,
            "range": "±0.70%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 68228,
            "range": "±0.13%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 57425,
            "range": "±0.18%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28235,
            "range": "±0.12%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 52775,
            "range": "±0.23%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 49209,
            "range": "±0.13%",
            "unit": "ops/sec",
            "extra": "93 samples"
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
        "date": 1688104093022,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 9851,
            "range": "±1.45%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 67231,
            "range": "±1.09%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 53269,
            "range": "±1.71%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23239,
            "range": "±0.87%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 47424,
            "range": "±0.82%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 43526,
            "range": "±0.88%",
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
          "id": "52ddabdbd02062a2fd721e6505e0d54a46443399",
          "message": "chore(dev-deps): bump eslint from 8.43.0 to 8.44.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.43.0 to 8.44.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.43.0...v8.44.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-01T21:23:50Z",
          "tree_id": "967e650d4c07f7f389f9233c6c296952160dc475",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/52ddabdbd02062a2fd721e6505e0d54a46443399"
        },
        "date": 1688246767720,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 14854,
            "range": "±1.04%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 72542,
            "range": "±0.60%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 62002,
            "range": "±0.14%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29413,
            "range": "±0.41%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 54784,
            "range": "±0.29%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50384,
            "range": "±0.15%",
            "unit": "ops/sec",
            "extra": "91 samples"
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
        "date": 1688398039647,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 400433,
            "range": "±0.53%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 639050,
            "range": "±10.33%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 551755,
            "range": "±8.58%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 15218,
            "range": "±186.20%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 427935,
            "range": "±16.60%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 312461,
            "range": "±11.95%",
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
          "id": "3f3b529da50276dca38065495462a91fd87e2db5",
          "message": "test: verify auth nuts",
          "timestamp": "2023-07-03T11:57:13-05:00",
          "tree_id": "b53832b37f0fc9e9078eb432c5a7276bd499772f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3f3b529da50276dca38065495462a91fd87e2db5"
        },
        "date": 1688403730330,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 379811,
            "range": "±3.45%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 653571,
            "range": "±12.84%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 536895,
            "range": "±9.77%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 14620,
            "range": "±186.37%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 440965,
            "range": "±10.32%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 290573,
            "range": "±10.60%",
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
          "id": "96735d7faa66e439d7f35378b9a97ec303f8c8e6",
          "message": "test: get more data for 3 windows nut failures",
          "timestamp": "2023-07-05T09:26:37-05:00",
          "tree_id": "3f67ef3dd2f0fda09fe36b3785ae39a66dc2f972",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/96735d7faa66e439d7f35378b9a97ec303f8c8e6"
        },
        "date": 1688567477008,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 342001,
            "range": "±1.06%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 519943,
            "range": "±12.24%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 366349,
            "range": "±17.12%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 265526,
            "range": "±8.93%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10354,
            "range": "±189.65%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 261677,
            "range": "±10.71%",
            "unit": "ops/sec",
            "extra": "55 samples"
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
        "date": 1688571247282,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 402332,
            "range": "±0.41%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 752691,
            "range": "±10.21%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 532303,
            "range": "±10.49%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10774,
            "range": "±188.91%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 469858,
            "range": "±17.79%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 299333,
            "range": "±8.99%",
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
          "id": "cbfc47a66975a482cc51af2f1528142775aca3be",
          "message": "fix: query scratch orgs by provided Id",
          "timestamp": "2023-07-05T12:47:30-05:00",
          "tree_id": "90cc767c87fbcd5f464043be04ccb4e717158556",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/cbfc47a66975a482cc51af2f1528142775aca3be"
        },
        "date": 1688579424782,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15276,
            "range": "±0.53%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 71266,
            "range": "±0.46%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 61444,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29235,
            "range": "±0.25%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 54595,
            "range": "±0.15%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 49988,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "95 samples"
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
        "date": 1688580281263,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 12353,
            "range": "±1.24%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 57472,
            "range": "±0.98%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 50722,
            "range": "±0.91%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 24077,
            "range": "±0.72%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 44670,
            "range": "±0.85%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 43107,
            "range": "±0.81%",
            "unit": "ops/sec",
            "extra": "86 samples"
          }
        ]
      }
    ]
  }
}