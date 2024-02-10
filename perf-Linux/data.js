window.BENCHMARK_DATA = {
  "lastUpdate": 1707599340458,
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
        "date": 1688582446269,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 408344,
            "range": "±0.50%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 685371,
            "range": "±15.21%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 483898,
            "range": "±10.23%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 294335,
            "range": "±16.32%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 22182,
            "range": "±184.66%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 272767,
            "range": "±14.43%",
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
          "id": "0b24b599b5310527029c5afeb8f62dcd4187b926",
          "message": "test: org with testkit for debug",
          "timestamp": "2023-07-06T10:09:57-05:00",
          "tree_id": "a3aa8bd54724008304cd70b9269c8b4da1d74929",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0b24b599b5310527029c5afeb8f62dcd4187b926"
        },
        "date": 1688656441968,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 407391,
            "range": "±0.63%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 608666,
            "range": "±12.87%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 440134,
            "range": "±14.80%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 289066,
            "range": "±11.45%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 7927,
            "range": "±203.43%",
            "unit": "ops/sec",
            "extra": "22 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 248163,
            "range": "±14.22%",
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
          "id": "4c1a87dc2dcf3d78db20497b9a4eb2e0e2849b34",
          "message": "test: re-add user, org plugins",
          "timestamp": "2023-07-06T10:39:48-05:00",
          "tree_id": "71e76b5b39b7a1cd9d2135221af3b20a3a5ddc0f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4c1a87dc2dcf3d78db20497b9a4eb2e0e2849b34"
        },
        "date": 1688658287923,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 383756,
            "range": "±0.49%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 625358,
            "range": "±13.60%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 522460,
            "range": "±13.28%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 17061,
            "range": "±184.73%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 428665,
            "range": "±10.32%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 278405,
            "range": "±11.03%",
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
          "id": "2d8191a5831e6f3e66c2adeb8c8ed9b6802d697a",
          "message": "test: full extNut suite",
          "timestamp": "2023-07-06T18:01:31-05:00",
          "tree_id": "faddd6d112fc1ace750de91c1e7e6907cb82ab3e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2d8191a5831e6f3e66c2adeb8c8ed9b6802d697a"
        },
        "date": 1688684721713,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 399835,
            "range": "±1.19%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 582644,
            "range": "±16.21%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 431770,
            "range": "±15.90%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 294558,
            "range": "±14.11%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 8795,
            "range": "±204.52%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 211120,
            "range": "±44.32%",
            "unit": "ops/sec",
            "extra": "53 samples"
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
        "date": 1688785511506,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 9536,
            "range": "±1.19%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 60146,
            "range": "±0.87%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 49293,
            "range": "±1.48%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 22105,
            "range": "±0.97%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 44187,
            "range": "±0.71%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 41089,
            "range": "±0.74%",
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
        "date": 1688795285385,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 12726,
            "range": "±1.25%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 60511,
            "range": "±0.42%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 51715,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 24646,
            "range": "±0.11%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 46657,
            "range": "±0.35%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 43390,
            "range": "±0.14%",
            "unit": "ops/sec",
            "extra": "89 samples"
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
        "date": 1688852545688,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 17034,
            "range": "±0.54%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 68220,
            "range": "±0.09%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 59195,
            "range": "±0.29%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28359,
            "range": "±0.29%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 53747,
            "range": "±0.14%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 48863,
            "range": "±0.23%",
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
        "date": 1688872119524,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 16916,
            "range": "±0.57%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 67843,
            "range": "±0.13%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 58993,
            "range": "±0.40%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28452,
            "range": "±0.08%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 53754,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 48603,
            "range": "±0.40%",
            "unit": "ops/sec",
            "extra": "94 samples"
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
        "date": 1688881709353,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 12308,
            "range": "±8.47%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 60687,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 50000,
            "range": "±7.24%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 24578,
            "range": "±0.43%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 46771,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 41034,
            "range": "±7.91%",
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
          "id": "2be226386f14a3b3ffa1a4d6483d2db3d032c3f1",
          "message": "fix(deps): bump @salesforce/schemas from 1.5.1 to 1.6.0\n\nBumps [@salesforce/schemas](https://github.com/forcedotcom/schemas) from 1.5.1 to 1.6.0.\n- [Release notes](https://github.com/forcedotcom/schemas/releases)\n- [Commits](https://github.com/forcedotcom/schemas/compare/1.5.1...1.6.0)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/schemas\"\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-09T11:46:09Z",
          "tree_id": "07dc9fe38f154f3df77b13002de8933520e731a7",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2be226386f14a3b3ffa1a4d6483d2db3d032c3f1"
        },
        "date": 1688903307881,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15695,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 73260,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 63463,
            "range": "±0.09%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 30036,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 56823,
            "range": "±0.09%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 51687,
            "range": "±0.12%",
            "unit": "ops/sec",
            "extra": "95 samples"
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
        "date": 1689047815596,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 13782,
            "range": "±9.52%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 73048,
            "range": "±0.09%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 62226,
            "range": "±0.37%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28422,
            "range": "±5.31%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 56128,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50919,
            "range": "±0.15%",
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
          "id": "b80254b384de25ee0e0712fbc8fb52d32ee13153",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-11T05:45:27Z",
          "tree_id": "1791e000a29296c00108eb909ae13c1e0e073d29",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b80254b384de25ee0e0712fbc8fb52d32ee13153"
        },
        "date": 1689054468119,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15381,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 72393,
            "range": "±0.16%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 61326,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29219,
            "range": "±0.11%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 55086,
            "range": "±0.10%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50052,
            "range": "±0.20%",
            "unit": "ops/sec",
            "extra": "89 samples"
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
        "date": 1689455435658,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15506,
            "range": "±0.97%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 73299,
            "range": "±0.14%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 60300,
            "range": "±0.32%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29166,
            "range": "±0.46%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 55392,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50406,
            "range": "±0.15%",
            "unit": "ops/sec",
            "extra": "96 samples"
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
        "date": 1689477056122,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 8550,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 56161,
            "range": "±0.85%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 45573,
            "range": "±1.33%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 20531,
            "range": "±1.21%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 41439,
            "range": "±0.94%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 37779,
            "range": "±1.02%",
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
          "id": "7732fb9bc05745778061abcd4af4912e55933348",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-16T05:45:49Z",
          "tree_id": "dea9840ee555db16edddf27f17278a0dc5484eda",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7732fb9bc05745778061abcd4af4912e55933348"
        },
        "date": 1689486486582,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15788,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 71905,
            "range": "±0.28%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 61909,
            "range": "±0.11%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29700,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 55283,
            "range": "±0.11%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50904,
            "range": "±0.19%",
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
        "date": 1689871738492,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 451475,
            "range": "±2.86%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 512867,
            "range": "±14.36%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 409567,
            "range": "±10.08%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 257819,
            "range": "±12.47%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 14423,
            "range": "±187.75%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 242267,
            "range": "±14.12%",
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
          "id": "6f9451a8d3d210c7cd50e98a9042c7409067780b",
          "message": "docs: logger migration guide",
          "timestamp": "2023-07-20T13:39:39-05:00",
          "tree_id": "f61f78101a065d58cdcad69dc58fcc0cf8e55def",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6f9451a8d3d210c7cd50e98a9042c7409067780b"
        },
        "date": 1689878700523,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 462880,
            "range": "±0.95%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 524461,
            "range": "±11.10%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 395699,
            "range": "±12.14%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 247373,
            "range": "±12.93%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 13557,
            "range": "±187.48%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 299208,
            "range": "±14.47%",
            "unit": "ops/sec",
            "extra": "76 samples"
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
        "date": 1689884577905,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 12701,
            "range": "±0.82%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 57894,
            "range": "±0.63%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 50496,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23734,
            "range": "±0.83%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 43989,
            "range": "±1.11%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 42705,
            "range": "±0.30%",
            "unit": "ops/sec",
            "extra": "90 samples"
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
        "date": 1689885387153,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15155,
            "range": "±0.68%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 71281,
            "range": "±0.07%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 60606,
            "range": "±0.08%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28843,
            "range": "±0.10%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 54766,
            "range": "±0.07%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 49531,
            "range": "±0.13%",
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
          "id": "c6bbeb59aa4740382501a10d0a1b051dec5cb7c1",
          "message": "refactor: we can log objects now",
          "timestamp": "2023-07-21T14:33:07-05:00",
          "tree_id": "352b39efee20d0d26e1c8962dd40a5f5f0be6655",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c6bbeb59aa4740382501a10d0a1b051dec5cb7c1"
        },
        "date": 1689968300811,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 463774,
            "range": "±6.07%",
            "unit": "ops/sec",
            "extra": "80 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 563802,
            "range": "±12.44%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 434982,
            "range": "±10.22%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 264881,
            "range": "±12.53%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9028,
            "range": "±199.09%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 223616,
            "range": "±20.69%",
            "unit": "ops/sec",
            "extra": "53 samples"
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
        "date": 1690060385686,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15288,
            "range": "±0.32%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 72511,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 61675,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29412,
            "range": "±0.43%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 55547,
            "range": "±0.12%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50446,
            "range": "±0.16%",
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
          "id": "f3ee1dc2751b43756571f41a0e08edc56d05ae45",
          "message": "chore(dev-deps): bump eslint-config-salesforce from 2.0.1 to 2.0.2\n\nBumps [eslint-config-salesforce](https://github.com/forcedotcom/eslint-config-salesforce) from 2.0.1 to 2.0.2.\n- [Release notes](https://github.com/forcedotcom/eslint-config-salesforce/releases)\n- [Changelog](https://github.com/forcedotcom/eslint-config-salesforce/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/eslint-config-salesforce/compare/2.0.1...2.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: eslint-config-salesforce\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-23T02:49:53Z",
          "tree_id": "59e2228a2ab5fcfcab0e150a0df0412599778920",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f3ee1dc2751b43756571f41a0e08edc56d05ae45"
        },
        "date": 1690080732746,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 14465,
            "range": "±1.48%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 66875,
            "range": "±1.17%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 59599,
            "range": "±1.05%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28271,
            "range": "±1.14%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 53306,
            "range": "±1.02%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 47771,
            "range": "±1.36%",
            "unit": "ops/sec",
            "extra": "88 samples"
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
        "date": 1690144809207,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 15092,
            "range": "±1.17%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 71082,
            "range": "±1.07%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 61022,
            "range": "±0.19%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 29149,
            "range": "±0.07%",
            "unit": "ops/sec",
            "extra": "98 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 55075,
            "range": "±0.09%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 50079,
            "range": "±0.15%",
            "unit": "ops/sec",
            "extra": "92 samples"
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
        "date": 1690401831256,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 434357,
            "range": "±1.63%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 459455,
            "range": "±13.48%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 386669,
            "range": "±11.53%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 218843,
            "range": "±16.21%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 317812,
            "range": "±15.56%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1673,
            "range": "±234.38%",
            "unit": "ops/sec",
            "extra": "8 samples"
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
        "date": 1690475578523,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 446022,
            "range": "±5.64%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 525026,
            "range": "±11.90%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 454618,
            "range": "±9.79%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 237348,
            "range": "±14.48%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11743,
            "range": "±188.62%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 274996,
            "range": "±10.00%",
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
          "id": "d74126520043d2357f847086059e59c6f8f16e5b",
          "message": "chore(deps): bump semver from 5.7.1 to 5.7.2 in /examples\n\nBumps [semver](https://github.com/npm/node-semver) from 5.7.1 to 5.7.2.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/v5.7.2/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v5.7.1...v5.7.2)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-28T02:45:48Z",
          "tree_id": "f2eaaccb86c5ed688e92838c299194111b543224",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d74126520043d2357f847086059e59c6f8f16e5b"
        },
        "date": 1690512548805,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 530459,
            "range": "±0.42%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 562277,
            "range": "±17.53%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 358300,
            "range": "±15.38%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 161752,
            "range": "±24.98%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 241508,
            "range": "±19.85%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 142426,
            "range": "±19.95%",
            "unit": "ops/sec",
            "extra": "33 samples"
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
        "date": 1690523375251,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 532983,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 575414,
            "range": "±12.67%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 454603,
            "range": "±13.61%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 300134,
            "range": "±10.93%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 7472,
            "range": "±208.50%",
            "unit": "ops/sec",
            "extra": "16 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 296046,
            "range": "±8.93%",
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
          "id": "01e36987c8ef26217d4547bc9db84bd54e1f5068",
          "message": "fix(deps): bump pino-pretty from 10.0.0 to 10.2.0\n\nBumps [pino-pretty](https://github.com/pinojs/pino-pretty) from 10.0.0 to 10.2.0.\n- [Release notes](https://github.com/pinojs/pino-pretty/releases)\n- [Commits](https://github.com/pinojs/pino-pretty/compare/v10.0.0...v10.2.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino-pretty\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-29T21:39:06Z",
          "tree_id": "20fa04ff251febc83717b9aa878c144cc127c764",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/01e36987c8ef26217d4547bc9db84bd54e1f5068"
        },
        "date": 1690666955715,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 498178,
            "range": "±10.23%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 604614,
            "range": "±9.04%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 343276,
            "range": "±18.31%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 182730,
            "range": "±20.42%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 231724,
            "range": "±19.13%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 161113,
            "range": "±19.85%",
            "unit": "ops/sec",
            "extra": "36 samples"
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
        "date": 1690685496005,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 467865,
            "range": "±1.30%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 508930,
            "range": "±14.20%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 441330,
            "range": "±10.13%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 242057,
            "range": "±14.15%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 12358,
            "range": "±188.45%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 240231,
            "range": "±13.58%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
        "date": 1690696298312,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 463765,
            "range": "±11.82%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 636174,
            "range": "±11.89%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 551696,
            "range": "±10.89%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 13546,
            "range": "±188.01%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 416877,
            "range": "±12.84%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 294737,
            "range": "±10.38%",
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
          "id": "9edac596b2dcd30c249b24be323da7e16cf256d3",
          "message": "fix(deps): bump pino-pretty from 10.0.0 to 10.2.0\n\nBumps [pino-pretty](https://github.com/pinojs/pino-pretty) from 10.0.0 to 10.2.0.\n- [Release notes](https://github.com/pinojs/pino-pretty/releases)\n- [Commits](https://github.com/pinojs/pino-pretty/compare/v10.0.0...v10.2.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino-pretty\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-07-30T11:45:59Z",
          "tree_id": "b75eb14c6eb55b9b6b6715bf5c068bcfb6208cee",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9edac596b2dcd30c249b24be323da7e16cf256d3"
        },
        "date": 1690717837431,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 463584,
            "range": "±4.42%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 496874,
            "range": "±10.83%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 375828,
            "range": "±14.46%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 294578,
            "range": "±10.93%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9695,
            "range": "±190.37%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 242444,
            "range": "±11.01%",
            "unit": "ops/sec",
            "extra": "54 samples"
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
        "date": 1690912246181,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 522932,
            "range": "±0.60%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 724285,
            "range": "±11.48%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 528692,
            "range": "±10.64%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9933,
            "range": "±198.03%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 428107,
            "range": "±12.61%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 295503,
            "range": "±11.59%",
            "unit": "ops/sec",
            "extra": "59 samples"
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
        "date": 1690922098432,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 523942,
            "range": "±0.66%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 747465,
            "range": "±7.49%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 397936,
            "range": "±17.33%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 218160,
            "range": "±17.73%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10390,
            "range": "±198.86%",
            "unit": "ops/sec",
            "extra": "27 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 252589,
            "range": "±14.44%",
            "unit": "ops/sec",
            "extra": "59 samples"
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
        "date": 1690929046653,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 373898,
            "range": "±44.29%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 553360,
            "range": "±13.70%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 328425,
            "range": "±17.70%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 177367,
            "range": "±21.77%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 212480,
            "range": "±20.24%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 143529,
            "range": "±19.27%",
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
        "date": 1691005245195,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 556565,
            "range": "±0.20%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 646418,
            "range": "±4.95%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 459432,
            "range": "±12.11%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 303026,
            "range": "±12.81%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 4571,
            "range": "±223.38%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 238371,
            "range": "±26.10%",
            "unit": "ops/sec",
            "extra": "58 samples"
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
        "date": 1691011420656,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 475268,
            "range": "±4.63%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 476483,
            "range": "±12.35%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 318703,
            "range": "±14.84%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 182365,
            "range": "±21.23%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 227653,
            "range": "±20.00%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 152495,
            "range": "±20.89%",
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
          "id": "f60ed20b7c24225b297aa59d1f9f3b335c43ff1c",
          "message": "refactor: one less switch case",
          "timestamp": "2023-08-02T17:57:10-05:00",
          "tree_id": "9b79b40b1b44a81e8885a36eba99c7e41604d12d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f60ed20b7c24225b297aa59d1f9f3b335c43ff1c"
        },
        "date": 1691017327576,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 534911,
            "range": "±0.50%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 594729,
            "range": "±11.56%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 473586,
            "range": "±7.71%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 298782,
            "range": "±13.54%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 5837,
            "range": "±214.26%",
            "unit": "ops/sec",
            "extra": "13 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 302182,
            "range": "±11.08%",
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
          "id": "90e0e002cbf9ba4ffb443f803b78d2a5b4c6c3e5",
          "message": "Merge branch 'main' into cd/save-namespace-auth-info",
          "timestamp": "2023-08-03T13:23:25-03:00",
          "tree_id": "d865741388836aebb61586ae63feff9ba751f0b0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/90e0e002cbf9ba4ffb443f803b78d2a5b4c6c3e5"
        },
        "date": 1691080127920,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 535601,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 529174,
            "range": "±15.86%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 466237,
            "range": "±9.65%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 287054,
            "range": "±13.70%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 7251,
            "range": "±204.86%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 221137,
            "range": "±31.69%",
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
          "id": "f221a6cddcd5b24b2e59df4b62d6bc5a17bc9ae7",
          "message": "fix(deps): bump @salesforce/kit from 3.0.6 to 3.0.8\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.6 to 3.0.8.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.6...3.0.8)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-05T21:49:48Z",
          "tree_id": "5ba133217d345355683ec67241d904a9d530febf",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f221a6cddcd5b24b2e59df4b62d6bc5a17bc9ae7"
        },
        "date": 1691272411273,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 523278,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 601639,
            "range": "±9.07%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 463166,
            "range": "±9.15%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 302210,
            "range": "±15.17%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 7404,
            "range": "±205.46%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 269708,
            "range": "±15.63%",
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
          "id": "a9d45eb7ac4f116464f2852cd4cce889d07e9228",
          "message": "fix(deps): bump @salesforce/kit from 3.0.6 to 3.0.9\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.6 to 3.0.9.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.6...3.0.9)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-12T21:34:26Z",
          "tree_id": "bcf667d1377d6af440ccf227c51d6fb2c1c9e130",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a9d45eb7ac4f116464f2852cd4cce889d07e9228"
        },
        "date": 1691876314213,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 477806,
            "range": "±4.15%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 496735,
            "range": "±15.31%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 408820,
            "range": "±11.79%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 244041,
            "range": "±42.42%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11449,
            "range": "±188.65%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 218640,
            "range": "±26.60%",
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
          "id": "565785ab7af2a7c46eaf80c75d267862f09e735b",
          "message": "fix(perf): cleaner module isolation",
          "timestamp": "2023-08-16T18:13:02-05:00",
          "tree_id": "beab472783cdd05da0866be5fb6c47776ec61133",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/565785ab7af2a7c46eaf80c75d267862f09e735b"
        },
        "date": 1692227858065,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 534909,
            "range": "±0.26%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 565095,
            "range": "±18.43%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 449628,
            "range": "±13.43%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 306099,
            "range": "±11.11%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 6831,
            "range": "±208.87%",
            "unit": "ops/sec",
            "extra": "16 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 237977,
            "range": "±25.08%",
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
          "id": "75b9bf0b7432d103a3c59b96c4acd9c63ff1da2b",
          "message": "ci: retries on yarn install",
          "timestamp": "2023-08-16T18:22:44-05:00",
          "tree_id": "d0743bef91973c6b9cc6b513ed8e80231a789a2f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/75b9bf0b7432d103a3c59b96c4acd9c63ff1da2b"
        },
        "date": 1692228535924,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 399447,
            "range": "±5.15%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 434461,
            "range": "±15.41%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 396990,
            "range": "±15.34%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 230010,
            "range": "±14.52%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 305552,
            "range": "±14.07%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 7972,
            "range": "±187.75%",
            "unit": "ops/sec",
            "extra": "47 samples"
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
        "date": 1692481472856,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 433459,
            "range": "±3.73%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 480346,
            "range": "±13.08%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 419212,
            "range": "±8.04%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 245891,
            "range": "±17.25%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 316874,
            "range": "±16.57%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 12417,
            "range": "±186.73%",
            "unit": "ops/sec",
            "extra": "67 samples"
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
        "date": 1692499820945,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 447859,
            "range": "±1.36%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 498299,
            "range": "±4.78%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 378666,
            "range": "±12.37%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 283342,
            "range": "±14.16%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 283140,
            "range": "±18.22%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1074,
            "range": "±276.29%",
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
          "id": "02897b5b187911fbc61e20ea80f01c9a871e151e",
          "message": "fix(deps): bump @salesforce/kit from 3.0.9 to 3.0.11\n\nBumps [@salesforce/kit](https://github.com/forcedotcom/kit) from 3.0.9 to 3.0.11.\n- [Release notes](https://github.com/forcedotcom/kit/releases)\n- [Changelog](https://github.com/forcedotcom/kit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/kit/compare/3.0.9...3.0.11)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/kit\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-26T21:08:12Z",
          "tree_id": "eb638c4a596eeb29d1bc4118895c27731c062370",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/02897b5b187911fbc61e20ea80f01c9a871e151e"
        },
        "date": 1693084349728,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 497280,
            "range": "±1.57%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 506913,
            "range": "±21.52%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 439771,
            "range": "±13.46%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 300658,
            "range": "±12.63%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9367,
            "range": "±199.43%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 262501,
            "range": "±15.54%",
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
          "id": "61e0d1b8044fcb34c0d8fdb0bae926f0250fee75",
          "message": "chore(dev-deps): bump eslint-plugin-import from 2.28.0 to 2.28.1\n\nBumps [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import) from 2.28.0 to 2.28.1.\n- [Release notes](https://github.com/import-js/eslint-plugin-import/releases)\n- [Changelog](https://github.com/import-js/eslint-plugin-import/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/import-js/eslint-plugin-import/compare/v2.28.0...v2.28.1)\n\n---\nupdated-dependencies:\n- dependency-name: eslint-plugin-import\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-27T02:46:57Z",
          "tree_id": "b1fae9b6e88b630917a15135cac733abd78d4926",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/61e0d1b8044fcb34c0d8fdb0bae926f0250fee75"
        },
        "date": 1693104688038,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 422541,
            "range": "±21.32%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 513590,
            "range": "±9.36%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 412726,
            "range": "±14.59%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 127946,
            "range": "±67.85%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 316919,
            "range": "±15.35%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 10516,
            "range": "±186.52%",
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
          "id": "ea6619e3f4bdbc5bbbd8515c42d8dadeff5f1dc7",
          "message": "fix(deps): bump pino from 8.14.2 to 8.15.0\n\nBumps [pino](https://github.com/pinojs/pino) from 8.14.2 to 8.15.0.\n- [Release notes](https://github.com/pinojs/pino/releases)\n- [Commits](https://github.com/pinojs/pino/compare/v8.14.2...v8.15.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-08-31T13:43:54Z",
          "tree_id": "a14c927299056572b6a1ec5a71d568dbeaa167cf",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ea6619e3f4bdbc5bbbd8515c42d8dadeff5f1dc7"
        },
        "date": 1693489722206,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 414110,
            "range": "±8.93%",
            "unit": "ops/sec",
            "extra": "84 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 447675,
            "range": "±12.47%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 390365,
            "range": "±6.33%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 290255,
            "range": "±13.50%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 313408,
            "range": "±17.18%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 10988,
            "range": "±188.11%",
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
          "id": "d71420a7360e81c8c561e07becbb085ddaf5f6ce",
          "message": "fix(deps): bump ts-retry-promise from 0.7.0 to 0.7.1\n\nBumps [ts-retry-promise](https://github.com/normartin/ts-retry-promise) from 0.7.0 to 0.7.1.\n- [Release notes](https://github.com/normartin/ts-retry-promise/releases)\n- [Commits](https://github.com/normartin/ts-retry-promise/compare/v0.7.0...v0.7.1)\n\n---\nupdated-dependencies:\n- dependency-name: ts-retry-promise\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-02T21:13:57Z",
          "tree_id": "401bb89542eac9a1eddd1c4823be361d7d61ebe3",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d71420a7360e81c8c561e07becbb085ddaf5f6ce"
        },
        "date": 1693689509491,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 465862,
            "range": "±4.50%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 532226,
            "range": "±14.40%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 364217,
            "range": "±12.61%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 269264,
            "range": "±16.60%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11566,
            "range": "±188.59%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 251698,
            "range": "±20.32%",
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
          "id": "8323f3cd253527210050b87b9936fb210ea74974",
          "message": "fix(deps): bump jsonwebtoken from 9.0.1 to 9.0.2\n\nBumps [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) from 9.0.1 to 9.0.2.\n- [Changelog](https://github.com/auth0/node-jsonwebtoken/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/auth0/node-jsonwebtoken/compare/v9.0.1...v9.0.2)\n\n---\nupdated-dependencies:\n- dependency-name: jsonwebtoken\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-03T02:46:12Z",
          "tree_id": "3c5ab42d03839bffad8c7e0769151fe65d57cc2c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8323f3cd253527210050b87b9936fb210ea74974"
        },
        "date": 1693709448854,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480675,
            "range": "±1.02%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 476919,
            "range": "±13.46%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 421187,
            "range": "±12.39%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 259247,
            "range": "±16.20%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 14408,
            "range": "±187.14%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 161970,
            "range": "±80.39%",
            "unit": "ops/sec",
            "extra": "70 samples"
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
        "date": 1694296841313,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 418673,
            "range": "±1.38%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 450825,
            "range": "±9.48%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 380948,
            "range": "±12.47%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 252438,
            "range": "±14.24%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 305242,
            "range": "±14.10%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1873,
            "range": "±220.91%",
            "unit": "ops/sec",
            "extra": "11 samples"
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
        "date": 1694346630161,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 462098,
            "range": "±0.54%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 638097,
            "range": "±10.12%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 482386,
            "range": "±13.82%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 302298,
            "range": "±11.78%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 21939,
            "range": "±184.35%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 289893,
            "range": "±11.36%",
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
          "id": "ec53a4f8e8b21f8146c3ccde1faf84acbf6eb0b4",
          "message": "chore(dev-deps): bump wireit from 0.13.0 to 0.14.0\n\nBumps [wireit](https://github.com/google/wireit) from 0.13.0 to 0.14.0.\n- [Changelog](https://github.com/google/wireit/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/google/wireit/compare/v0.13.0...v0.14.0)\n\n---\nupdated-dependencies:\n- dependency-name: wireit\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-16T21:23:54Z",
          "tree_id": "44021182ac8191a591dca199a4652cefc406aa8c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ec53a4f8e8b21f8146c3ccde1faf84acbf6eb0b4"
        },
        "date": 1694899653928,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 542218,
            "range": "±0.41%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 615777,
            "range": "±8.41%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 429248,
            "range": "±14.21%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 298918,
            "range": "±15.61%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 8343,
            "range": "±202.95%",
            "unit": "ops/sec",
            "extra": "21 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 266521,
            "range": "±12.82%",
            "unit": "ops/sec",
            "extra": "67 samples"
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
        "date": 1694918997078,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 536206,
            "range": "±0.17%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 557615,
            "range": "±13.99%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 306162,
            "range": "±17.25%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 178418,
            "range": "±20.15%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 205135,
            "range": "±19.61%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 159569,
            "range": "±21.07%",
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
          "id": "76c978f7d4c00aaf4afee0bf84ee1a4c3fdaa8ad",
          "message": "chore(dev-deps): bump eslint from 8.49.0 to 8.50.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.49.0 to 8.50.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.49.0...v8.50.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-23T21:30:50Z",
          "tree_id": "78579026353c0e54644c930173721676f49fcb34",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/76c978f7d4c00aaf4afee0bf84ee1a4c3fdaa8ad"
        },
        "date": 1695504900751,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 513087,
            "range": "±0.50%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 691308,
            "range": "±14.25%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 530685,
            "range": "±11.69%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 15419,
            "range": "±185.99%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 380384,
            "range": "±12.28%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 287378,
            "range": "±9.07%",
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
          "id": "9c419e71223d37bc845953b45bbd0f271f9d13d6",
          "message": "chore(dev-deps): bump eslint from 8.49.0 to 8.50.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.49.0 to 8.50.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.49.0...v8.50.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-09-24T02:46:35Z",
          "tree_id": "79099d07213070b01697e34f593e9f571889f757",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9c419e71223d37bc845953b45bbd0f271f9d13d6"
        },
        "date": 1695523811793,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 542112,
            "range": "±3.73%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 577947,
            "range": "±17.68%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 423355,
            "range": "±13.28%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 274006,
            "range": "±17.65%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11447,
            "range": "±188.19%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 259153,
            "range": "±15.89%",
            "unit": "ops/sec",
            "extra": "60 samples"
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
        "date": 1695680303881,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 542867,
            "range": "±0.53%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 597916,
            "range": "±10.58%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 407304,
            "range": "±19.32%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 294538,
            "range": "±14.40%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11700,
            "range": "±188.02%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 265723,
            "range": "±12.20%",
            "unit": "ops/sec",
            "extra": "58 samples"
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
        "date": 1695847837246,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 425096,
            "range": "±1.42%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 418546,
            "range": "±5.92%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 290436,
            "range": "±7.05%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 191667,
            "range": "±11.69%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 191804,
            "range": "±31.29%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 7166,
            "range": "±187.79%",
            "unit": "ops/sec",
            "extra": "50 samples"
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
        "date": 1695849434346,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 430576,
            "range": "±5.85%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 501847,
            "range": "±17.95%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 345994,
            "range": "±11.17%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 257537,
            "range": "±10.17%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 257222,
            "range": "±14.07%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 3435,
            "range": "±208.28%",
            "unit": "ops/sec",
            "extra": "17 samples"
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
        "date": 1695869411062,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 485875,
            "range": "±10.82%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 632052,
            "range": "±9.87%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 485860,
            "range": "±10.36%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 291157,
            "range": "±10.85%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 23706,
            "range": "±184.76%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 282294,
            "range": "±9.32%",
            "unit": "ops/sec",
            "extra": "60 samples"
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
        "date": 1696027006757,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 536289,
            "range": "±0.69%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 548639,
            "range": "±8.73%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 318573,
            "range": "±17.55%",
            "unit": "ops/sec",
            "extra": "31 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 261965,
            "range": "±12.20%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 7558,
            "range": "±201.55%",
            "unit": "ops/sec",
            "extra": "22 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 199093,
            "range": "±12.72%",
            "unit": "ops/sec",
            "extra": "49 samples"
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
        "date": 1696108455657,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 541999,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 555837,
            "range": "±8.43%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 345255,
            "range": "±11.23%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 255527,
            "range": "±11.38%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11011,
            "range": "±195.18%",
            "unit": "ops/sec",
            "extra": "31 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 224154,
            "range": "±13.81%",
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
          "id": "d3e22b9420beae576ca085fd4827c169f8b54535",
          "message": "fix(deps): bump @salesforce/ts-types from 2.0.7 to 2.0.8\n\nBumps [@salesforce/ts-types](https://github.com/forcedotcom/ts-types) from 2.0.7 to 2.0.8.\n- [Release notes](https://github.com/forcedotcom/ts-types/releases)\n- [Changelog](https://github.com/forcedotcom/ts-types/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-types/compare/2.0.7...2.0.8)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-types\"\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-01T05:46:42Z",
          "tree_id": "891093bc0285eb25639dcd6ff396639e838529fd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d3e22b9420beae576ca085fd4827c169f8b54535"
        },
        "date": 1696139436574,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 451704,
            "range": "±1.00%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 404015,
            "range": "±15.69%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 297073,
            "range": "±10.13%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 200285,
            "range": "±9.47%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 238942,
            "range": "±13.78%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 6819,
            "range": "±188.97%",
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
          "id": "0bf1680b7104983f75ec49676d26a33332208f76",
          "message": "fix: pollStatusAndAuth uses the sandbox process id rather than sandbox info id",
          "timestamp": "2023-10-04T10:29:09-06:00",
          "tree_id": "23284805eb0d3d0ae250fcad159fe525d56383ae",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0bf1680b7104983f75ec49676d26a33332208f76"
        },
        "date": 1696437291085,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 467723,
            "range": "±1.28%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 457572,
            "range": "±10.23%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 292299,
            "range": "±12.07%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 225815,
            "range": "±12.02%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 211008,
            "range": "±16.26%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 4348,
            "range": "±202.34%",
            "unit": "ops/sec",
            "extra": "22 samples"
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
        "date": 1696525275933,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 499682,
            "range": "±0.72%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 599838,
            "range": "±12.97%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 387725,
            "range": "±10.77%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 236216,
            "range": "±11.54%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 6511,
            "range": "±204.23%",
            "unit": "ops/sec",
            "extra": "19 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 214242,
            "range": "±10.10%",
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
          "id": "79f6c6a1f04952efc6fab09d0f8b4feff22aaa48",
          "message": "ci: match tsconfig for typedoc examples",
          "timestamp": "2023-10-05T12:22:42-05:00",
          "tree_id": "edbfe81f3bae71d384f1ea2a442eb61ce5fca8b5",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/79f6c6a1f04952efc6fab09d0f8b4feff22aaa48"
        },
        "date": 1696526827891,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 440759,
            "range": "±15.45%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 564887,
            "range": "±21.66%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 332671,
            "range": "±10.12%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 222079,
            "range": "±12.17%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10677,
            "range": "±195.34%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 141548,
            "range": "±35.35%",
            "unit": "ops/sec",
            "extra": "52 samples"
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
        "date": 1696604170350,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 508820,
            "range": "±0.52%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 586698,
            "range": "±20.54%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 434951,
            "range": "±16.74%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 251005,
            "range": "±16.07%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 3894,
            "range": "±223.45%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 238852,
            "range": "±13.14%",
            "unit": "ops/sec",
            "extra": "58 samples"
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
        "date": 1696715024652,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 543084,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 521449,
            "range": "±11.22%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 331823,
            "range": "±11.00%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 231010,
            "range": "±13.55%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 13985,
            "range": "±185.81%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 156990,
            "range": "±30.13%",
            "unit": "ops/sec",
            "extra": "47 samples"
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
        "date": 1696744225746,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 506291,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 583026,
            "range": "±5.40%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 334801,
            "range": "±28.63%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 239312,
            "range": "±13.02%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 6523,
            "range": "±205.12%",
            "unit": "ops/sec",
            "extra": "19 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 214338,
            "range": "±8.43%",
            "unit": "ops/sec",
            "extra": "53 samples"
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
        "date": 1696755008836,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 467001,
            "range": "±1.22%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 426465,
            "range": "±10.17%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 302544,
            "range": "±10.85%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 232860,
            "range": "±12.46%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 229127,
            "range": "±11.15%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 5783,
            "range": "±199.01%",
            "unit": "ops/sec",
            "extra": "29 samples"
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
        "date": 1696875250778,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 496739,
            "range": "±0.72%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 562212,
            "range": "±10.08%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 187599,
            "range": "±106.83%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 253494,
            "range": "±11.05%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 5702,
            "range": "±208.30%",
            "unit": "ops/sec",
            "extra": "16 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 225990,
            "range": "±7.37%",
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
          "id": "10cccaea91c92382c14507f924e46b8dd0542634",
          "message": "feat: use lodash directly",
          "timestamp": "2023-10-09T16:23:06-05:00",
          "tree_id": "c2b67d66d44e9243046be00b2e964ba858ca663c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/10cccaea91c92382c14507f924e46b8dd0542634"
        },
        "date": 1696890340709,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 483596,
            "range": "±4.24%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 514360,
            "range": "±13.81%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 427983,
            "range": "±8.09%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 277639,
            "range": "±14.33%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 4597,
            "range": "±213.53%",
            "unit": "ops/sec",
            "extra": "13 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 215485,
            "range": "±11.98%",
            "unit": "ops/sec",
            "extra": "54 samples"
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
        "date": 1696956226989,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 531695,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 481264,
            "range": "±10.13%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 316310,
            "range": "±16.73%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 238840,
            "range": "±10.92%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 238046,
            "range": "±22.54%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 2709,
            "range": "±222.97%",
            "unit": "ops/sec",
            "extra": "10 samples"
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
        "date": 1697035237087,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 409077,
            "range": "±1.13%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 378197,
            "range": "±8.75%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 318527,
            "range": "±10.60%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 176330,
            "range": "±13.37%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 210736,
            "range": "±28.47%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 153220,
            "range": "±17.35%",
            "unit": "ops/sec",
            "extra": "39 samples"
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
        "date": 1697036034259,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 397406,
            "range": "±18.39%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 414236,
            "range": "±12.52%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 294898,
            "range": "±13.67%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 163921,
            "range": "±18.79%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 164027,
            "range": "±17.26%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 117715,
            "range": "±23.84%",
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
          "id": "8e346ca8206a23515bb1247872f19dbd7f13bf55",
          "message": "feat!: remove parameters on config.write\n\nThe Config family of classes' write(sync) method used to accept a param.\nThe value in the param would overwrite the existing file.",
          "timestamp": "2023-10-11T11:26:37-05:00",
          "tree_id": "1da114e90b3fefaa5da4244a8dc2ccf47b0d8c0e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8e346ca8206a23515bb1247872f19dbd7f13bf55"
        },
        "date": 1697041882829,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 530040,
            "range": "±0.21%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 493295,
            "range": "±10.24%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 351593,
            "range": "±20.62%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 212392,
            "range": "±13.57%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 13921,
            "range": "±186.34%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 210216,
            "range": "±13.97%",
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
          "id": "469373fd2d4e74ba5f7d924cc3b5eda9338c1ddc",
          "message": "test: remove more skips",
          "timestamp": "2023-10-11T17:56:48-05:00",
          "tree_id": "cb1f526378f38ea88c744e81ad0263d4d020ee9e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/469373fd2d4e74ba5f7d924cc3b5eda9338c1ddc"
        },
        "date": 1697065277577,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 440373,
            "range": "±0.96%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 373009,
            "range": "±11.79%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 227600,
            "range": "±15.53%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 167706,
            "range": "±23.20%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 148543,
            "range": "±24.92%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 116594,
            "range": "±24.07%",
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
          "id": "57d56ce119b3d82146f18082bbbeebf8e9aca8a4",
          "message": "test: ttlConfig expiration logic",
          "timestamp": "2023-10-12T17:05:30-05:00",
          "tree_id": "22f1183b057ad8720527b566c1d813fc940bc97e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/57d56ce119b3d82146f18082bbbeebf8e9aca8a4"
        },
        "date": 1697148557101,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 531040,
            "range": "±0.44%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 451216,
            "range": "±11.25%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 315458,
            "range": "±14.19%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 233624,
            "range": "±10.88%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 262983,
            "range": "±14.39%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 3501,
            "range": "±212.85%",
            "unit": "ops/sec",
            "extra": "13 samples"
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
        "date": 1697152251379,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 538580,
            "range": "±0.62%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 522971,
            "range": "±8.70%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 311491,
            "range": "±23.25%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 304568,
            "range": "±15.56%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9280,
            "range": "±198.46%",
            "unit": "ops/sec",
            "extra": "27 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 216510,
            "range": "±21.32%",
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
          "id": "4e02b0a7c384e8a9fb24132af10ef6dcafb00160",
          "message": "chore: bump jsforce deps",
          "timestamp": "2023-10-13T10:22:04-05:00",
          "tree_id": "7dabc58819a8077afc1927b691ad1bee73292412",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4e02b0a7c384e8a9fb24132af10ef6dcafb00160"
        },
        "date": 1697210795483,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 492982,
            "range": "±0.92%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 449235,
            "range": "±14.20%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 354892,
            "range": "±10.00%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 283104,
            "range": "±13.39%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9362,
            "range": "±197.30%",
            "unit": "ops/sec",
            "extra": "27 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 175303,
            "range": "±38.40%",
            "unit": "ops/sec",
            "extra": "51 samples"
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
        "date": 1697213030007,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 524579,
            "range": "±0.67%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 526984,
            "range": "±5.72%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 331205,
            "range": "±15.11%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 294521,
            "range": "±14.46%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10870,
            "range": "±188.10%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 218159,
            "range": "±14.52%",
            "unit": "ops/sec",
            "extra": "52 samples"
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
        "date": 1697221862453,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 465779,
            "range": "±12.13%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 454350,
            "range": "±24.41%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 326560,
            "range": "±9.02%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 234494,
            "range": "±9.58%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 283061,
            "range": "±23.37%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1339,
            "range": "±276.06%",
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
          "id": "c30d00a17eb4e1db397b2e1b6a149375181061d6",
          "message": "fix(deps): bump jsforce from 2.0.0-beta.27 to 2.0.0-beta.28\n\nBumps [jsforce](https://github.com/jsforce/jsforce) from 2.0.0-beta.27 to 2.0.0-beta.28.\n- [Release notes](https://github.com/jsforce/jsforce/releases)\n- [Changelog](https://github.com/jsforce/jsforce/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/jsforce/jsforce/compare/2.0.0-beta.27...2.0.0-beta.28)\n\n---\nupdated-dependencies:\n- dependency-name: jsforce\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-14T21:08:28Z",
          "tree_id": "34811ffe913b027662e8da598a483c28b1211263",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c30d00a17eb4e1db397b2e1b6a149375181061d6"
        },
        "date": 1697317943376,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 491171,
            "range": "±16.49%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 532102,
            "range": "±15.54%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 344930,
            "range": "±19.19%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 225248,
            "range": "±21.15%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11442,
            "range": "±186.25%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 215783,
            "range": "±8.99%",
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
          "id": "079d73ba0fa0fe6aec08540d63913bc749977c2f",
          "message": "Merge branch 'sm/crdt-config' of https://github.com/forcedotcom/sfdx-core into sm/crdt-config",
          "timestamp": "2023-10-16T09:41:30-05:00",
          "tree_id": "819094436046d7bbec69fdb71301a915550de7cd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/079d73ba0fa0fe6aec08540d63913bc749977c2f"
        },
        "date": 1697467560211,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 517376,
            "range": "±6.80%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 506421,
            "range": "±10.00%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 290323,
            "range": "±12.78%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 181607,
            "range": "±17.64%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 189911,
            "range": "±18.82%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 8193,
            "range": "±186.55%",
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
          "id": "f3abda113935c3619b5cb6ab051b34cd1e669106",
          "message": "ci: pdr tracking xnuts",
          "timestamp": "2023-10-16T10:12:55-05:00",
          "tree_id": "fa8702bc267ce2f610e586d17a364388a2aa6dc0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f3abda113935c3619b5cb6ab051b34cd1e669106"
        },
        "date": 1697469427132,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 458851,
            "range": "±5.40%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 458865,
            "range": "±9.51%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 316317,
            "range": "±11.54%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 173307,
            "range": "±55.73%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 240246,
            "range": "±16.74%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1830,
            "range": "±223.06%",
            "unit": "ops/sec",
            "extra": "10 samples"
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
        "date": 1697470413445,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 534454,
            "range": "±0.23%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 487043,
            "range": "±11.20%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 318013,
            "range": "±16.25%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 256749,
            "range": "±14.14%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 14024,
            "range": "±185.33%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 214674,
            "range": "±15.18%",
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
          "id": "2cb98df83041d4870d3e4ade9f7a5c33dca92ded",
          "message": "test: not data, yes pdr",
          "timestamp": "2023-10-17T14:29:47-05:00",
          "tree_id": "cb44d4ac2c7ad203f9ae32d287a24e5e1d5b759e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2cb98df83041d4870d3e4ade9f7a5c33dca92ded"
        },
        "date": 1697571251533,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 407642,
            "range": "±10.55%",
            "unit": "ops/sec",
            "extra": "78 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 476654,
            "range": "±11.48%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 283455,
            "range": "±22.96%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 185635,
            "range": "±19.98%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 208426,
            "range": "±16.99%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 4703,
            "range": "±189.52%",
            "unit": "ops/sec",
            "extra": "38 samples"
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
        "date": 1697609849620,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 556644,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 703277,
            "range": "±11.05%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 417346,
            "range": "±12.02%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 294127,
            "range": "±14.80%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 2381,
            "range": "±255.45%",
            "unit": "ops/sec",
            "extra": "6 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 270323,
            "range": "±10.24%",
            "unit": "ops/sec",
            "extra": "65 samples"
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
        "date": 1697640179040,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 527923,
            "range": "±0.56%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 520436,
            "range": "±9.55%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 350764,
            "range": "±15.59%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 218992,
            "range": "±16.76%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 10976,
            "range": "±194.88%",
            "unit": "ops/sec",
            "extra": "31 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 171810,
            "range": "±39.14%",
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
          "id": "60bfafda89c11e2781692514098cdc9306d94ed3",
          "message": "test: remove core from more libraries to force this version",
          "timestamp": "2023-10-18T10:20:45-05:00",
          "tree_id": "5e1d4e736e43288f1e74fefaf2f06380d9ba9407",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/60bfafda89c11e2781692514098cdc9306d94ed3"
        },
        "date": 1697642695983,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 439957,
            "range": "±4.05%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 451881,
            "range": "±15.17%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 254038,
            "range": "±11.54%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 196574,
            "range": "±10.05%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 237540,
            "range": "±13.68%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 7037,
            "range": "±187.21%",
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
          "id": "b0790f383aa207e436368a237d3cca8e1a5a944a",
          "message": "feat!: drop support for lodash-style deep get/set",
          "timestamp": "2023-10-18T17:33:11-05:00",
          "tree_id": "9d0f14efd3adc581c22ecc0022bc8f827e2fd9fe",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b0790f383aa207e436368a237d3cca8e1a5a944a"
        },
        "date": 1697669558237,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 479910,
            "range": "±1.29%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 514693,
            "range": "±10.56%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 374561,
            "range": "±12.47%",
            "unit": "ops/sec",
            "extra": "34 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 251654,
            "range": "±13.03%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 9029,
            "range": "±189.69%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 238726,
            "range": "±14.31%",
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
          "id": "20e32bd37c8d37cc145fc6608a7cc23cf3c6fb78",
          "message": "refactor: tighten up property keys",
          "timestamp": "2023-10-19T11:39:17-05:00",
          "tree_id": "04c0f7d6483e6ee4a126dd8bc19b1ea9a3bfca40",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/20e32bd37c8d37cc145fc6608a7cc23cf3c6fb78"
        },
        "date": 1697733811589,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 528442,
            "range": "±0.84%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 656967,
            "range": "±10.74%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 381956,
            "range": "±15.61%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 275824,
            "range": "±13.93%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 7382,
            "range": "±202.18%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 259135,
            "range": "±9.87%",
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
          "id": "f1f20a6ae44d3a3b19d2e1cf12974144f699ea4b",
          "message": "test: more timestamp offset for bigInt UT",
          "timestamp": "2023-10-19T11:53:30-05:00",
          "tree_id": "5594543245125950d09f11d0ae5c2d7186792d49",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f1f20a6ae44d3a3b19d2e1cf12974144f699ea4b"
        },
        "date": 1697734663250,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 499026,
            "range": "±1.37%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 646407,
            "range": "±8.13%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 350076,
            "range": "±16.11%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 202793,
            "range": "±16.95%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 231853,
            "range": "±18.69%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 7661,
            "range": "±187.53%",
            "unit": "ops/sec",
            "extra": "32 samples"
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
        "date": 1697747765928,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 550548,
            "range": "±0.54%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 620694,
            "range": "±9.50%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 409332,
            "range": "±10.85%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 285993,
            "range": "±15.73%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 8805,
            "range": "±200.83%",
            "unit": "ops/sec",
            "extra": "25 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 260990,
            "range": "±16.37%",
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
          "id": "b3ba85b8b59c654bd05b67b4467ce6321bc447a4",
          "message": "refactor: crdt patterns on sfdxConfig",
          "timestamp": "2023-10-20T16:57:26-05:00",
          "tree_id": "5a21a4489c79e327d2a82d673ca8eafbb4077b49",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b3ba85b8b59c654bd05b67b4467ce6321bc447a4"
        },
        "date": 1697839277469,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 511107,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 611203,
            "range": "±19.33%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 475103,
            "range": "±11.47%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 280502,
            "range": "±13.18%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 5302,
            "range": "±216.93%",
            "unit": "ops/sec",
            "extra": "12 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 288812,
            "range": "±13.58%",
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
          "id": "5eaeb2ffc8a40a199ff914de482ffd732cb58551",
          "message": "test: catch when sfdx-config.json isn't there",
          "timestamp": "2023-10-20T17:11:05-05:00",
          "tree_id": "1778468ba3e4a5bd445fe3a63da082964c9f357e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5eaeb2ffc8a40a199ff914de482ffd732cb58551"
        },
        "date": 1697840076192,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 531920,
            "range": "±0.39%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 574708,
            "range": "±20.12%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 293081,
            "range": "±19.31%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 182840,
            "range": "±21.96%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 188622,
            "range": "±20.35%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 149030,
            "range": "±21.15%",
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
          "id": "7e0568183015151e649883ebcf581be298f792b3",
          "message": "fix(deps): bump pino from 8.15.6 to 8.16.0\n\nBumps [pino](https://github.com/pinojs/pino) from 8.15.6 to 8.16.0.\n- [Release notes](https://github.com/pinojs/pino/releases)\n- [Commits](https://github.com/pinojs/pino/compare/v8.15.6...v8.16.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-20T22:21:38Z",
          "tree_id": "077ed498c7d055da96a6eab98091f4604a1fd0b6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7e0568183015151e649883ebcf581be298f792b3"
        },
        "date": 1697840717523,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 410645,
            "range": "±25.05%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 598208,
            "range": "±17.26%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 489832,
            "range": "±10.46%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 278544,
            "range": "±14.00%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 4162,
            "range": "±220.92%",
            "unit": "ops/sec",
            "extra": "11 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 277479,
            "range": "±13.39%",
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
          "id": "dfca5aa90e070ef794c2d6db09fce92eec0ee1f2",
          "message": "chore(dev-deps): bump @salesforce/ts-sinon from 1.4.16 to 1.4.18\n\nBumps [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon) from 1.4.16 to 1.4.18.\n- [Release notes](https://github.com/forcedotcom/ts-sinon/releases)\n- [Changelog](https://github.com/forcedotcom/ts-sinon/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-sinon/compare/1.4.16...1.4.18)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-sinon\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-10-21T21:43:02Z",
          "tree_id": "373e164df99c443a0e8ada90b77040e06a5e1854",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/dfca5aa90e070ef794c2d6db09fce92eec0ee1f2"
        },
        "date": 1697924836531,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 520544,
            "range": "±7.62%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 595805,
            "range": "±11.86%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 416459,
            "range": "±12.77%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 280956,
            "range": "±13.29%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 11775,
            "range": "±196.50%",
            "unit": "ops/sec",
            "extra": "31 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 283674,
            "range": "±10.21%",
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
          "id": "67e6f5ae13bb2714f0cb399367c17cd4dd065fbc",
          "message": "test: back to jsforce latest",
          "timestamp": "2023-10-23T15:36:01-05:00",
          "tree_id": "041a3e1ab1c13068df1a66c1ffbde5f63a4aa296",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/67e6f5ae13bb2714f0cb399367c17cd4dd065fbc"
        },
        "date": 1698093656616,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 445160,
            "range": "±11.02%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 645625,
            "range": "±12.35%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 510934,
            "range": "±11.70%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 288479,
            "range": "±13.07%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 20495,
            "range": "±185.02%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 298304,
            "range": "±9.95%",
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
          "id": "938e5dae52f9a9430a43f319290fe2080a129393",
          "message": "chore: bump deps for xnuts",
          "timestamp": "2023-10-23T15:57:25-05:00",
          "tree_id": "a3c03342bdadc02cc85f3aeda60171ea47dee0e3",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/938e5dae52f9a9430a43f319290fe2080a129393"
        },
        "date": 1698094913240,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 546590,
            "range": "±0.86%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 602054,
            "range": "±10.86%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 316695,
            "range": "±16.27%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 187608,
            "range": "±21.44%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 195946,
            "range": "±19.67%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 150931,
            "range": "±20.88%",
            "unit": "ops/sec",
            "extra": "39 samples"
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
        "date": 1698155495375,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473126,
            "range": "±8.65%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 637687,
            "range": "±11.36%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 378667,
            "range": "±16.24%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 214855,
            "range": "±18.32%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 258952,
            "range": "±17.47%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 11460,
            "range": "±187.02%",
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
          "id": "ead7330269a8f3121a4b4e6129c84a79825a26d7",
          "message": "test: concurrency tests in configFile",
          "timestamp": "2023-10-25T10:58:27-05:00",
          "tree_id": "d954379417b2507de29cdf82f7569ddd1b3a41fe",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ead7330269a8f3121a4b4e6129c84a79825a26d7"
        },
        "date": 1698249752259,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 432600,
            "range": "±9.99%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 524492,
            "range": "±10.11%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 324483,
            "range": "±17.10%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 281653,
            "range": "±11.80%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 274962,
            "range": "±15.67%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 2222,
            "range": "±220.42%",
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
          "id": "37ed65b5897e12410a9f60803e020b9ec4c8ceac",
          "message": "chore: remove unused unexported code",
          "timestamp": "2023-10-25T11:34:15-05:00",
          "tree_id": "8eb4957e2570ec371c21f23167266ca666782a9e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/37ed65b5897e12410a9f60803e020b9ec4c8ceac"
        },
        "date": 1698252195255,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 471088,
            "range": "±9.50%",
            "unit": "ops/sec",
            "extra": "85 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 656084,
            "range": "±11.23%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 466774,
            "range": "±13.90%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 16215,
            "range": "±185.45%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 377428,
            "range": "±11.87%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 286421,
            "range": "±10.30%",
            "unit": "ops/sec",
            "extra": "65 samples"
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
        "date": 1698256520197,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 456074,
            "range": "±8.86%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 486490,
            "range": "±11.82%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 396049,
            "range": "±14.14%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 234578,
            "range": "±14.80%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 281092,
            "range": "±17.79%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1527,
            "range": "±243.28%",
            "unit": "ops/sec",
            "extra": "7 samples"
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
        "date": 1698352747959,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 454502,
            "range": "±7.88%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 511915,
            "range": "±10.04%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 354640,
            "range": "±11.58%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 268703,
            "range": "±12.64%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 271280,
            "range": "±13.81%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 3848,
            "range": "±206.98%",
            "unit": "ops/sec",
            "extra": "18 samples"
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
        "date": 1698355386100,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 558859,
            "range": "±0.45%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 575611,
            "range": "±13.17%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 320036,
            "range": "±15.25%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 173195,
            "range": "±20.64%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 190596,
            "range": "±21.76%",
            "unit": "ops/sec",
            "extra": "37 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 160250,
            "range": "±21.46%",
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
          "id": "2a3dbeccf08f8732fae22419e50278a78647cf6b",
          "message": "chore: pr feedback",
          "timestamp": "2023-10-27T16:39:04-05:00",
          "tree_id": "522b4e05b9cf784cc71cfa8330dd626f32cf8b4d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/2a3dbeccf08f8732fae22419e50278a78647cf6b"
        },
        "date": 1698443053393,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 328012,
            "range": "±28.49%",
            "unit": "ops/sec",
            "extra": "76 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 450894,
            "range": "±11.47%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 293042,
            "range": "±14.47%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 164455,
            "range": "±20.00%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 174524,
            "range": "±21.34%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 133767,
            "range": "±22.40%",
            "unit": "ops/sec",
            "extra": "38 samples"
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
        "date": 1698528615421,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473370,
            "range": "±0.63%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 525394,
            "range": "±11.58%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 290628,
            "range": "±15.94%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 177080,
            "range": "±18.93%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 181877,
            "range": "±20.73%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 129711,
            "range": "±21.60%",
            "unit": "ops/sec",
            "extra": "38 samples"
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
        "date": 1698547899496,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 521703,
            "range": "±0.67%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 614815,
            "range": "±10.50%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 377927,
            "range": "±17.54%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 207606,
            "range": "±17.31%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 259063,
            "range": "±16.74%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 4529,
            "range": "±205.08%",
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
          "id": "9d99e6174905dfd7c1df6d299799ac7706756735",
          "message": "refactor: steve review",
          "timestamp": "2023-10-31T09:58:38-05:00",
          "tree_id": "ca7bcb68ec36dd57e7e33df02d7d0fe4c649a818",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9d99e6174905dfd7c1df6d299799ac7706756735"
        },
        "date": 1698764553703,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 474829,
            "range": "±1.31%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 486835,
            "range": "±10.67%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 382325,
            "range": "±11.56%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 276471,
            "range": "±13.26%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 271589,
            "range": "±15.43%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 3360,
            "range": "±209.82%",
            "unit": "ops/sec",
            "extra": "16 samples"
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
        "date": 1698943688972,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 412810,
            "range": "±13.76%",
            "unit": "ops/sec",
            "extra": "82 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 537411,
            "range": "±9.94%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 285532,
            "range": "±15.92%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 191690,
            "range": "±23.68%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 180328,
            "range": "±19.31%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 141407,
            "range": "±20.92%",
            "unit": "ops/sec",
            "extra": "39 samples"
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
        "date": 1698944222236,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 685704,
            "range": "±2.55%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 831614,
            "range": "±9.05%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 605460,
            "range": "±5.52%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4145,
            "range": "±223.07%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 478514,
            "range": "±9.91%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 349691,
            "range": "±7.35%",
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
          "id": "0041526a97693ca687aba04960b013a9768a580a",
          "message": "chore(dev-deps): bump eslint from 8.52.0 to 8.53.0\n\nBumps [eslint](https://github.com/eslint/eslint) from 8.52.0 to 8.53.0.\n- [Release notes](https://github.com/eslint/eslint/releases)\n- [Changelog](https://github.com/eslint/eslint/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/eslint/eslint/compare/v8.52.0...v8.53.0)\n\n---\nupdated-dependencies:\n- dependency-name: eslint\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-04T21:30:19Z",
          "tree_id": "653e149849cfc480b0fb0031dbfb0b3db58ec494",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/0041526a97693ca687aba04960b013a9768a580a"
        },
        "date": 1699133623095,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 664944,
            "range": "±4.28%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 816342,
            "range": "±9.25%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 616161,
            "range": "±9.01%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 2491,
            "range": "±255.89%",
            "unit": "ops/sec",
            "extra": "6 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 439853,
            "range": "±12.24%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 388730,
            "range": "±5.22%",
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
          "id": "8cb21ce85a5ab07d8fba7204b9d644024d58946d",
          "message": "chore(dev-deps): bump @salesforce/ts-sinon from 1.4.18 to 1.4.19\n\nBumps [@salesforce/ts-sinon](https://github.com/forcedotcom/ts-sinon) from 1.4.18 to 1.4.19.\n- [Release notes](https://github.com/forcedotcom/ts-sinon/releases)\n- [Changelog](https://github.com/forcedotcom/ts-sinon/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/forcedotcom/ts-sinon/compare/1.4.18...1.4.19)\n\n---\nupdated-dependencies:\n- dependency-name: \"@salesforce/ts-sinon\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-05T05:46:11Z",
          "tree_id": "38a2eaf806002068ef09a9c60836b726138c588f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8cb21ce85a5ab07d8fba7204b9d644024d58946d"
        },
        "date": 1699163373361,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 705998,
            "range": "±1.56%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 769369,
            "range": "±9.53%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 599796,
            "range": "±6.73%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9546,
            "range": "±206.83%",
            "unit": "ops/sec",
            "extra": "17 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 499136,
            "range": "±7.10%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 376470,
            "range": "±9.01%",
            "unit": "ops/sec",
            "extra": "57 samples"
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
        "date": 1699393507233,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480471,
            "range": "±1.80%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 830939,
            "range": "±5.86%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 508485,
            "range": "±7.87%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 15488,
            "range": "±187.13%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 376461,
            "range": "±7.28%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 328781,
            "range": "±7.64%",
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
          "id": "29c59e013f0cf25407430bd0d4752e4df8686ab5",
          "message": "feat: reusable file locks outside of ConfigFile",
          "timestamp": "2023-11-08T15:06:53-06:00",
          "tree_id": "f496af57cf2dfa1aa9bbb36c6bdcf0a7862dd0ff",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/29c59e013f0cf25407430bd0d4752e4df8686ab5"
        },
        "date": 1699477858318,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 699481,
            "range": "±1.56%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 791610,
            "range": "±5.90%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 603986,
            "range": "±7.67%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8806,
            "range": "±205.56%",
            "unit": "ops/sec",
            "extra": "19 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 432979,
            "range": "±9.52%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 365611,
            "range": "±9.13%",
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
          "id": "6deabcd603055786311994cb25c8c9282ff9971d",
          "message": "fix: http 420 errors",
          "timestamp": "2023-11-09T09:36:00-06:00",
          "tree_id": "835db27c55898b15fb098e2a0d5f56036aba1879",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6deabcd603055786311994cb25c8c9282ff9971d"
        },
        "date": 1699544406154,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 296910,
            "range": "±11.44%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 554513,
            "range": "±8.82%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 391193,
            "range": "±14.82%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 263703,
            "range": "±14.40%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 276074,
            "range": "±16.37%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1139,
            "range": "±276.37%",
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
          "id": "3c9c73d50f68a71820d0727149819c9056bf5af3",
          "message": "refactor: use messages for text",
          "timestamp": "2023-11-09T09:43:44-06:00",
          "tree_id": "3185217205758f86559f224c400dee900832d6c5",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3c9c73d50f68a71820d0727149819c9056bf5af3"
        },
        "date": 1699544875465,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480719,
            "range": "±0.45%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 796183,
            "range": "±7.84%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 641942,
            "range": "±7.51%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 6007,
            "range": "±212.70%",
            "unit": "ops/sec",
            "extra": "14 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 455906,
            "range": "±7.35%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 389850,
            "range": "±7.23%",
            "unit": "ops/sec",
            "extra": "72 samples"
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
        "date": 1699552539242,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 465143,
            "range": "±4.21%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 490019,
            "range": "±15.46%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 323162,
            "range": "±15.95%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 187505,
            "range": "±18.26%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 169424,
            "range": "±22.56%",
            "unit": "ops/sec",
            "extra": "46 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 136545,
            "range": "±21.98%",
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
          "id": "a702f2b288db5a6cfd1d0fabfb2721d8c68b1c0c",
          "message": "Merge remote-tracking branch 'origin/main' into sm/crdt-config",
          "timestamp": "2023-11-09T15:58:12-06:00",
          "tree_id": "5bb5490e5237e17c518759e99b70a7785981f014",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a702f2b288db5a6cfd1d0fabfb2721d8c68b1c0c"
        },
        "date": 1699567367725,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 301912,
            "range": "±0.86%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 502958,
            "range": "±12.36%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 362410,
            "range": "±11.17%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 263524,
            "range": "±15.83%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 258563,
            "range": "±16.36%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 2557,
            "range": "±215.13%",
            "unit": "ops/sec",
            "extra": "13 samples"
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
        "date": 1699569140105,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 475482,
            "range": "±2.64%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 788927,
            "range": "±10.09%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 510087,
            "range": "±9.12%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 11581,
            "range": "±188.95%",
            "unit": "ops/sec",
            "extra": "32 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 410237,
            "range": "±10.00%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 339631,
            "range": "±8.24%",
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
          "id": "3e9c988223f285deda794e0ef2a7ed5cab91425f",
          "message": "test: add apex, comunity nuts",
          "timestamp": "2023-11-09T17:01:37-06:00",
          "tree_id": "ae81a025bc4d80477166aa73ce4bba9656729e17",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3e9c988223f285deda794e0ef2a7ed5cab91425f"
        },
        "date": 1699571096051,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 493902,
            "range": "±0.56%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 811765,
            "range": "±10.19%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 616113,
            "range": "±9.04%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 2595,
            "range": "±254.87%",
            "unit": "ops/sec",
            "extra": "6 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 432070,
            "range": "±12.86%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 373136,
            "range": "±8.17%",
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
          "id": "d5b345f9179e64497b4f42fcef8fd45dce1f9d19",
          "message": "ci: also remove core from apex-node lib",
          "timestamp": "2023-11-10T08:33:29-06:00",
          "tree_id": "e6fa34f4467fb957a376a0ea0099bc0efb9f5649",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/d5b345f9179e64497b4f42fcef8fd45dce1f9d19"
        },
        "date": 1699627036460,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 295862,
            "range": "±2.84%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 498229,
            "range": "±8.91%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 341194,
            "range": "±8.77%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 276297,
            "range": "±13.41%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 271319,
            "range": "±13.22%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 1488,
            "range": "±234.43%",
            "unit": "ops/sec",
            "extra": "8 samples"
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
        "date": 1699630868323,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 481339,
            "range": "±2.90%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 837909,
            "range": "±5.75%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 534496,
            "range": "±9.40%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8802,
            "range": "±201.94%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 381027,
            "range": "±12.02%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 299466,
            "range": "±7.37%",
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
          "id": "4dbd64a33e03ce56d7e9940c0e8524705bdfca8f",
          "message": "Merge remote-tracking branch 'origin/main' into sm/crdt-config",
          "timestamp": "2023-11-10T09:43:16-06:00",
          "tree_id": "b341e80b7c8fdbd43c7707a60d12fd1d1a0beacd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4dbd64a33e03ce56d7e9940c0e8524705bdfca8f"
        },
        "date": 1699631302306,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 371242,
            "range": "±0.49%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 605872,
            "range": "±13.05%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 319043,
            "range": "±16.55%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 168428,
            "range": "±19.42%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 189699,
            "range": "±20.66%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 152232,
            "range": "±20.57%",
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
          "id": "4e66905b9c0bd8997c2b995f11d3f36648ec15cb",
          "message": "feat: ts5 and ts-patch",
          "timestamp": "2023-11-10T11:12:31-06:00",
          "tree_id": "0cb5b0013b84c194e1ae7540c403f3a3cff1395e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4e66905b9c0bd8997c2b995f11d3f36648ec15cb"
        },
        "date": 1699636580083,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 372398,
            "range": "±0.33%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 690046,
            "range": "±14.73%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 403765,
            "range": "±11.21%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 291689,
            "range": "±13.84%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 5786,
            "range": "±208.25%",
            "unit": "ops/sec",
            "extra": "17 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 267245,
            "range": "±9.63%",
            "unit": "ops/sec",
            "extra": "64 samples"
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
        "date": 1699642432180,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 485988,
            "range": "±1.35%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 752798,
            "range": "±7.66%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 563844,
            "range": "±7.51%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 11117,
            "range": "±199.49%",
            "unit": "ops/sec",
            "extra": "28 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 394247,
            "range": "±13.08%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 351134,
            "range": "±9.68%",
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
          "id": "e4ba4f3cd53698ff5d3d98e89fbbc753ed0dea7b",
          "message": "style: fix comment",
          "timestamp": "2023-11-10T12:59:58-06:00",
          "tree_id": "3153fd28d8b307f291b52203557bc8c4d178b350",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e4ba4f3cd53698ff5d3d98e89fbbc753ed0dea7b"
        },
        "date": 1699645027015,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 345645,
            "range": "±0.53%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 708564,
            "range": "±11.42%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 488628,
            "range": "±9.61%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 288350,
            "range": "±11.36%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 21720,
            "range": "±184.59%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 275807,
            "range": "±9.69%",
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
          "id": "25ed002bdd090c96d085f952855ba3d97f07882d",
          "message": "chore(dev-deps): bump @types/lodash from 4.14.200 to 4.14.201\n\nBumps [@types/lodash](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/HEAD/types/lodash) from 4.14.200 to 4.14.201.\n- [Release notes](https://github.com/DefinitelyTyped/DefinitelyTyped/releases)\n- [Commits](https://github.com/DefinitelyTyped/DefinitelyTyped/commits/HEAD/types/lodash)\n\n---\nupdated-dependencies:\n- dependency-name: \"@types/lodash\"\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-11T21:24:12Z",
          "tree_id": "a9e2d9eb5e922e5599b810fa4063e4408c68d61f",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/25ed002bdd090c96d085f952855ba3d97f07882d"
        },
        "date": 1699738058593,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 461912,
            "range": "±4.31%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 766252,
            "range": "±10.96%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 568166,
            "range": "±6.73%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 11806,
            "range": "±199.53%",
            "unit": "ops/sec",
            "extra": "26 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 412619,
            "range": "±14.97%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 359175,
            "range": "±9.99%",
            "unit": "ops/sec",
            "extra": "67 samples"
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
        "date": 1699757357019,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 482174,
            "range": "±1.74%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 837539,
            "range": "±6.30%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 628855,
            "range": "±7.59%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 3829,
            "range": "±228.44%",
            "unit": "ops/sec",
            "extra": "9 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 432886,
            "range": "±14.46%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 372634,
            "range": "±7.62%",
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
          "id": "515b5a8042709771aae529f0ea82e95dae62f5cb",
          "message": "chore: bump major",
          "timestamp": "2023-11-13T13:45:20-06:00",
          "tree_id": "86e6cdc01f18210441e5a0221a3ecc26e3843085",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/515b5a8042709771aae529f0ea82e95dae62f5cb"
        },
        "date": 1699904979390,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 291961,
            "range": "±3.13%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 506516,
            "range": "±8.59%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 364444,
            "range": "±9.71%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 260472,
            "range": "±10.15%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 278929,
            "range": "±14.80%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 3068,
            "range": "±211.43%",
            "unit": "ops/sec",
            "extra": "15 samples"
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
        "date": 1699981661784,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 493333,
            "range": "±0.58%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 844131,
            "range": "±7.88%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 660597,
            "range": "±9.13%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 28874,
            "range": "±182.97%",
            "unit": "ops/sec",
            "extra": "74 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 538971,
            "range": "±10.35%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 21429,
            "range": "±185.31%",
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
          "id": "f151982e2b5c335d4c4b7615d01ef9058ed95ddd",
          "message": "fix(deps): bump @babel/traverse from 7.18.8 to 7.23.3\n\nBumps [@babel/traverse](https://github.com/babel/babel/tree/HEAD/packages/babel-traverse) from 7.18.8 to 7.23.3.\n- [Release notes](https://github.com/babel/babel/releases)\n- [Changelog](https://github.com/babel/babel/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/babel/babel/commits/v7.23.3/packages/babel-traverse)\n\n---\nupdated-dependencies:\n- dependency-name: \"@babel/traverse\"\n  dependency-type: indirect\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-11-14T21:17:24Z",
          "tree_id": "0630a0de0364072320269833b6b679d68a764d73",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f151982e2b5c335d4c4b7615d01ef9058ed95ddd"
        },
        "date": 1699996842830,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 485778,
            "range": "±1.48%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 781692,
            "range": "±7.49%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 588895,
            "range": "±10.53%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7932,
            "range": "±205.05%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 433880,
            "range": "±9.49%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 380973,
            "range": "±9.79%",
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
          "id": "ff8b06696f7ef88ac74a35f60e281b90eb74471b",
          "message": "fix: write safety and valid typing for sfProject",
          "timestamp": "2023-11-15T07:46:50-06:00",
          "tree_id": "1254fecc9b14651415d1d2c18948581efdb53311",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ff8b06696f7ef88ac74a35f60e281b90eb74471b"
        },
        "date": 1700056253480,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 492245,
            "range": "±0.48%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 885752,
            "range": "±13.88%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 609807,
            "range": "±7.19%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 25542,
            "range": "±184.23%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 503837,
            "range": "±8.04%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 25056,
            "range": "±183.14%",
            "unit": "ops/sec",
            "extra": "45 samples"
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
        "date": 1700070640522,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 479149,
            "range": "±1.14%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 789128,
            "range": "±6.99%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 575668,
            "range": "±9.28%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10577,
            "range": "±201.13%",
            "unit": "ops/sec",
            "extra": "25 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 470328,
            "range": "±8.54%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 404392,
            "range": "±7.29%",
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
          "id": "b7f55882d10bb69c945ebd0cb89bcc6f1d48b9da",
          "message": "fix: no retries on sync lock",
          "timestamp": "2023-11-15T14:34:56-06:00",
          "tree_id": "d8681840282770465468e018f1431cdb2eeb72c0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b7f55882d10bb69c945ebd0cb89bcc6f1d48b9da"
        },
        "date": 1700080725332,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473291,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 840314,
            "range": "±7.51%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 625241,
            "range": "±7.49%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4672,
            "range": "±227.87%",
            "unit": "ops/sec",
            "extra": "9 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 422583,
            "range": "±10.19%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 372532,
            "range": "±8.54%",
            "unit": "ops/sec",
            "extra": "55 samples"
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
        "date": 1700084473164,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 460743,
            "range": "±2.66%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 715152,
            "range": "±9.31%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 598983,
            "range": "±6.73%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 12859,
            "range": "±199.56%",
            "unit": "ops/sec",
            "extra": "25 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 446004,
            "range": "±8.79%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 367085,
            "range": "±6.56%",
            "unit": "ops/sec",
            "extra": "72 samples"
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
        "date": 1700163852526,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 468273,
            "range": "±2.31%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 738802,
            "range": "±8.52%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 596845,
            "range": "±8.39%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 14232,
            "range": "±189.39%",
            "unit": "ops/sec",
            "extra": "33 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 486264,
            "range": "±4.50%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 376838,
            "range": "±9.25%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
        "date": 1700343312811,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 478739,
            "range": "±0.91%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 777087,
            "range": "±9.42%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 591869,
            "range": "±7.08%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9385,
            "range": "±203.33%",
            "unit": "ops/sec",
            "extra": "22 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 461562,
            "range": "±9.42%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 400089,
            "range": "±6.03%",
            "unit": "ops/sec",
            "extra": "58 samples"
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
        "date": 1700362168536,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 483097,
            "range": "±0.57%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 824192,
            "range": "±7.86%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 628930,
            "range": "±6.75%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5918,
            "range": "±212.76%",
            "unit": "ops/sec",
            "extra": "14 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 424172,
            "range": "±10.52%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 372664,
            "range": "±6.75%",
            "unit": "ops/sec",
            "extra": "55 samples"
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
        "date": 1700383769039,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 483056,
            "range": "±1.31%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 768695,
            "range": "±9.72%",
            "unit": "ops/sec",
            "extra": "47 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 565481,
            "range": "±7.33%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10580,
            "range": "±201.39%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 442075,
            "range": "±7.57%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 375451,
            "range": "±7.16%",
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
          "id": "715b364c5b6bd6227f51c343efc6c65863ca4257",
          "message": "fix: export 2 accessors",
          "timestamp": "2023-11-20T08:34:30-06:00",
          "tree_id": "bfffc6a46be01e4f00341a7d717ba4e84ea9ce4c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/715b364c5b6bd6227f51c343efc6c65863ca4257"
        },
        "date": 1700491108734,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 485375,
            "range": "±1.70%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 783573,
            "range": "±7.93%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 587367,
            "range": "±8.14%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9739,
            "range": "±201.50%",
            "unit": "ops/sec",
            "extra": "25 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 394628,
            "range": "±8.73%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 379211,
            "range": "±8.85%",
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
          "id": "49beee53824a843a53e44e6b78f38b628b4eb0f8",
          "message": "feat: generic type for sfError.data",
          "timestamp": "2023-11-20T15:45:39-06:00",
          "tree_id": "9f5491b7ae70702e723e5c9a0f4ae78be1d60e21",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/49beee53824a843a53e44e6b78f38b628b4eb0f8"
        },
        "date": 1700516973775,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 483669,
            "range": "±2.01%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 842145,
            "range": "±5.99%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 629052,
            "range": "±7.36%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4399,
            "range": "±217.36%",
            "unit": "ops/sec",
            "extra": "12 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 382134,
            "range": "±11.46%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 358470,
            "range": "±9.43%",
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
          "id": "a8d732bf333280d06161e947f848d25a9163c03b",
          "message": "chore: bump dev-scripts",
          "timestamp": "2023-11-20T16:29:09-06:00",
          "tree_id": "c4b664c6894ff3893916d2a65dd202e0a95d8328",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a8d732bf333280d06161e947f848d25a9163c03b"
        },
        "date": 1700519582207,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 484478,
            "range": "±0.78%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 808832,
            "range": "±11.47%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 644407,
            "range": "±7.75%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 6013,
            "range": "±209.61%",
            "unit": "ops/sec",
            "extra": "16 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 425528,
            "range": "±13.82%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 379071,
            "range": "±9.52%",
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
          "id": "447b070d02badbe488f20c961b8db79ac6e9aef9",
          "message": "feat: set some known props during scratch org creation",
          "timestamp": "2023-11-22T11:17:37-06:00",
          "tree_id": "0d2d5e6e18ff0db7b6b4113499a2a045de64dd2c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/447b070d02badbe488f20c961b8db79ac6e9aef9"
        },
        "date": 1700673687394,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 470507,
            "range": "±1.17%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 845163,
            "range": "±9.16%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 635212,
            "range": "±6.06%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 3252,
            "range": "±234.35%",
            "unit": "ops/sec",
            "extra": "8 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 493411,
            "range": "±6.94%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 401054,
            "range": "±9.51%",
            "unit": "ops/sec",
            "extra": "60 samples"
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
        "date": 1700946997204,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 481233,
            "range": "±1.17%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 776030,
            "range": "±7.28%",
            "unit": "ops/sec",
            "extra": "52 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 615430,
            "range": "±8.90%",
            "unit": "ops/sec",
            "extra": "36 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 3584,
            "range": "±227.84%",
            "unit": "ops/sec",
            "extra": "9 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 399052,
            "range": "±11.96%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 366281,
            "range": "±7.52%",
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
          "id": "7c79453d42110ebf6531ec39d8f1d44b7424f632",
          "message": "Merge remote-tracking branch 'origin/main' into sm/set-scratchiness-during-creation",
          "timestamp": "2023-11-27T07:53:41-06:00",
          "tree_id": "5b2b61df41a375abbdcd785db5b7993484bda35d",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7c79453d42110ebf6531ec39d8f1d44b7424f632"
        },
        "date": 1701093652528,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 487522,
            "range": "±0.90%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 832161,
            "range": "±8.54%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 675573,
            "range": "±8.22%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 16542,
            "range": "±187.55%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 475502,
            "range": "±9.38%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 24886,
            "range": "±181.48%",
            "unit": "ops/sec",
            "extra": "46 samples"
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
        "date": 1701112807897,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 478674,
            "range": "±1.22%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 774292,
            "range": "±6.99%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 547792,
            "range": "±7.65%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 13660,
            "range": "±197.88%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 488915,
            "range": "±4.98%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 360269,
            "range": "±6.79%",
            "unit": "ops/sec",
            "extra": "52 samples"
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
        "date": 1701126659991,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 476355,
            "range": "±2.12%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 856792,
            "range": "±8.99%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 591326,
            "range": "±7.25%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4188,
            "range": "±224.09%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 466863,
            "range": "±9.47%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 365974,
            "range": "±9.09%",
            "unit": "ops/sec",
            "extra": "52 samples"
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
        "date": 1701358455311,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 482418,
            "range": "±0.91%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 810908,
            "range": "±8.33%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 664161,
            "range": "±5.58%",
            "unit": "ops/sec",
            "extra": "74 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4912,
            "range": "±220.44%",
            "unit": "ops/sec",
            "extra": "11 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 459667,
            "range": "±8.45%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 383984,
            "range": "±10.55%",
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
          "id": "22eb1c6c868018f5e7a619b23008ccea494dd901",
          "message": "Merge remote-tracking branch 'origin/main' into sm/set-scratchiness-during-creation",
          "timestamp": "2023-12-04T08:49:24-06:00",
          "tree_id": "96716cddc33ce5dff595311f7f2a7148ded57ba6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/22eb1c6c868018f5e7a619b23008ccea494dd901"
        },
        "date": 1701701594042,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 464376,
            "range": "±2.68%",
            "unit": "ops/sec",
            "extra": "83 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 857759,
            "range": "±8.79%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 570402,
            "range": "±10.30%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 1861,
            "range": "±276.51%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 467758,
            "range": "±6.45%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 374784,
            "range": "±11.25%",
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
          "id": "98762d510ad9fab37ede32a0670bf85a9fe9ab8f",
          "message": "fix: backward logic on scratch/sbox",
          "timestamp": "2023-12-04T09:53:37-06:00",
          "tree_id": "712f967339e77e99525b25921741ad8d8e4ce7ad",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/98762d510ad9fab37ede32a0670bf85a9fe9ab8f"
        },
        "date": 1701705468956,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 510994,
            "range": "±2.48%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 896263,
            "range": "±7.43%",
            "unit": "ops/sec",
            "extra": "54 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 46001,
            "range": "±182.22%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 440955,
            "range": "±9.31%",
            "unit": "ops/sec",
            "extra": "73 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 514060,
            "range": "±7.93%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 22320,
            "range": "±185.80%",
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
          "id": "1830bce7da9d1624b8dfc215ad8f8d600ddff5d6",
          "message": "refactor: parallel awaits, remove optional",
          "timestamp": "2023-12-04T10:13:56-06:00",
          "tree_id": "d868030ac0eb7f23b5b3cc81d7699d494ed5c8dd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/1830bce7da9d1624b8dfc215ad8f8d600ddff5d6"
        },
        "date": 1701706678488,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 466013,
            "range": "±1.92%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 698015,
            "range": "±9.42%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 549253,
            "range": "±5.93%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 16987,
            "range": "±187.75%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 391346,
            "range": "±16.04%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 357970,
            "range": "±7.43%",
            "unit": "ops/sec",
            "extra": "65 samples"
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
          "id": "8cedbe224009a89d78ab1c3101cc4fc71148356f",
          "message": "test: ut for fileLocking",
          "timestamp": "2023-12-04T12:51:18-06:00",
          "tree_id": "760faf6d6b7770a4bee0550efe429d472b93b657",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8cedbe224009a89d78ab1c3101cc4fc71148356f"
        },
        "date": 1701716122069,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 452426,
            "range": "±2.04%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 772163,
            "range": "±7.54%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 594028,
            "range": "±5.62%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 11711,
            "range": "±199.08%",
            "unit": "ops/sec",
            "extra": "28 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 393991,
            "range": "±15.72%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 379532,
            "range": "±5.87%",
            "unit": "ops/sec",
            "extra": "76 samples"
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
          "id": "1a2e34068cc02a2412d15f5a159ea94e3a51b995",
          "message": "chore: reset version for ci tests",
          "timestamp": "2023-12-05T11:12:17-07:00",
          "tree_id": "0de2e702e5f1075b3f3fb156428cd93b43882906",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/1a2e34068cc02a2412d15f5a159ea94e3a51b995"
        },
        "date": 1701800177587,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 468625,
            "range": "±2.59%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 785369,
            "range": "±8.35%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 640072,
            "range": "±7.95%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8219,
            "range": "±207.56%",
            "unit": "ops/sec",
            "extra": "17 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 462291,
            "range": "±9.86%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 412080,
            "range": "±6.75%",
            "unit": "ops/sec",
            "extra": "75 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "committer": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "distinct": true,
          "id": "8e86a655765a192e8dfe860bc1e96f7e50a2dc53",
          "message": "chore: update importing method of Faye",
          "timestamp": "2023-12-05T16:41:53-08:00",
          "tree_id": "790dccb4ba95d4ff29f02b4e4fc58c9094ad7706",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/8e86a655765a192e8dfe860bc1e96f7e50a2dc53"
        },
        "date": 1701823583492,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 689260,
            "range": "±3.26%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 739210,
            "range": "±9.37%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 550026,
            "range": "±7.71%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 12151,
            "range": "±201.03%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 425470,
            "range": "±7.47%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 335526,
            "range": "±6.96%",
            "unit": "ops/sec",
            "extra": "69 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "committer": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "distinct": true,
          "id": "23caa6e13abb0522a994c0c8b4dfc3b280da4d19",
          "message": "chore: update esModuleInterop",
          "timestamp": "2023-12-05T17:31:04-08:00",
          "tree_id": "9daf8c342ee82e388110ee96cf73398979b2b182",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/23caa6e13abb0522a994c0c8b4dfc3b280da4d19"
        },
        "date": 1701826509976,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 666976,
            "range": "±3.44%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 832781,
            "range": "±7.38%",
            "unit": "ops/sec",
            "extra": "39 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 619111,
            "range": "±6.97%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 3639,
            "range": "±242.70%",
            "unit": "ops/sec",
            "extra": "7 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 480617,
            "range": "±6.66%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 388082,
            "range": "±7.20%",
            "unit": "ops/sec",
            "extra": "56 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "committer": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "distinct": true,
          "id": "5410b861af4a29b5f8f121b0245c574d70f6bbe5",
          "message": "chore: update types source",
          "timestamp": "2023-12-05T19:41:58-08:00",
          "tree_id": "25d2316231abce537961248ab74d256bb6ac22ba",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5410b861af4a29b5f8f121b0245c574d70f6bbe5"
        },
        "date": 1701834321003,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 678421,
            "range": "±3.21%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 785539,
            "range": "±7.47%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 505292,
            "range": "±7.48%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 17400,
            "range": "±186.22%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 407687,
            "range": "±7.23%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 324078,
            "range": "±8.01%",
            "unit": "ops/sec",
            "extra": "56 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "committer": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "distinct": true,
          "id": "1e405c04df70482a33c9c0644ed356e83bf85fad",
          "message": "chore: introduce index to bypass npm-dts wrong declaration issue",
          "timestamp": "2023-12-07T11:50:35-08:00",
          "tree_id": "8039bf87abfb0733f3269846159ef724c9cb2b96",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/1e405c04df70482a33c9c0644ed356e83bf85fad"
        },
        "date": 1701978896859,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480258,
            "range": "±2.09%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 789628,
            "range": "±6.77%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 583739,
            "range": "±6.50%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9114,
            "range": "±204.59%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 433663,
            "range": "±9.81%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 360522,
            "range": "±7.40%",
            "unit": "ops/sec",
            "extra": "52 samples"
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
          "id": "43e0739f220cf7496f711afae4e491110ba03bd8",
          "message": "feat: import messages with 2 fewer imports",
          "timestamp": "2023-12-07T15:08:23-06:00",
          "tree_id": "5ebb5c2e98db585156853b6584153fa510ea5f99",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/43e0739f220cf7496f711afae4e491110ba03bd8"
        },
        "date": 1701983535696,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 481077,
            "range": "±0.72%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 749309,
            "range": "±7.93%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 557452,
            "range": "±7.90%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 13357,
            "range": "±197.27%",
            "unit": "ops/sec",
            "extra": "31 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 430078,
            "range": "±9.20%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 355432,
            "range": "±8.07%",
            "unit": "ops/sec",
            "extra": "51 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "committer": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "distinct": true,
          "id": "ce613455aba95e8b9d286dadacae76ea63092e45",
          "message": "chore: remove transport to see if it is a bottleneck",
          "timestamp": "2023-12-07T16:09:35-08:00",
          "tree_id": "99a17fef52d9127b4a9ab7e63b44f5d70c92718b",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ce613455aba95e8b9d286dadacae76ea63092e45"
        },
        "date": 1701994326645,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 481877,
            "range": "±1.02%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 156931,
            "range": "±0.37%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 153312,
            "range": "±1.14%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 117395,
            "range": "±4.44%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 143243,
            "range": "±0.56%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 112886,
            "range": "±0.55%",
            "unit": "ops/sec",
            "extra": "98 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "committer": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "distinct": true,
          "id": "69dd648bd3f269f62a2967de8c28fe8ab5e0ca10",
          "message": "chore: add esbuildPluginTsc or loggerTransformer",
          "timestamp": "2023-12-08T11:22:01-08:00",
          "tree_id": "c2da35350ec662d2c5ac8771652787384a378079",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/69dd648bd3f269f62a2967de8c28fe8ab5e0ca10"
        },
        "date": 1702063475605,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 478628,
            "range": "±1.09%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 163716,
            "range": "±0.27%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 158326,
            "range": "±3.41%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 124599,
            "range": "±0.35%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 147934,
            "range": "±0.76%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 115277,
            "range": "±0.39%",
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
          "id": "ee0dcd39e38a0fc39bfe7878839865b23bb4ff9f",
          "message": "chore(dev-deps): bump ts-patch from 3.0.2 to 3.1.1\n\nBumps [ts-patch](https://github.com/nonara/ts-patch) from 3.0.2 to 3.1.1.\n- [Release notes](https://github.com/nonara/ts-patch/releases)\n- [Changelog](https://github.com/nonara/ts-patch/blob/master/CHANGELOG.md)\n- [Commits](https://github.com/nonara/ts-patch/compare/v3.0.2...v3.1.1)\n\n---\nupdated-dependencies:\n- dependency-name: ts-patch\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-12-09T22:00:26Z",
          "tree_id": "1eee77158ed10f6cd73277fee9cfc5ca24b4376e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ee0dcd39e38a0fc39bfe7878839865b23bb4ff9f"
        },
        "date": 1702159706317,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 472244,
            "range": "±1.93%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 779703,
            "range": "±9.32%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 583735,
            "range": "±6.36%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10386,
            "range": "±202.19%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 447094,
            "range": "±6.57%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 380624,
            "range": "±7.48%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
          "id": "58f1073a1af3fb37014cd0c5ce43194d43c17b56",
          "message": "chore(dev-deps): bump ts-node from 10.9.1 to 10.9.2\n\nBumps [ts-node](https://github.com/TypeStrong/ts-node) from 10.9.1 to 10.9.2.\n- [Release notes](https://github.com/TypeStrong/ts-node/releases)\n- [Changelog](https://github.com/TypeStrong/ts-node/blob/main/development-docs/release-template.md)\n- [Commits](https://github.com/TypeStrong/ts-node/compare/v10.9.1...v10.9.2)\n\n---\nupdated-dependencies:\n- dependency-name: ts-node\n  dependency-type: direct:development\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-12-10T02:48:22Z",
          "tree_id": "743207cbafce2b5dfafbb7a868fd5e234b54c574",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/58f1073a1af3fb37014cd0c5ce43194d43c17b56"
        },
        "date": 1702176901954,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 471530,
            "range": "±1.88%",
            "unit": "ops/sec",
            "extra": "86 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 748906,
            "range": "±8.97%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 574843,
            "range": "±9.42%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 13767,
            "range": "±197.12%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 455509,
            "range": "±6.20%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 344540,
            "range": "±9.66%",
            "unit": "ops/sec",
            "extra": "54 samples"
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
          "id": "cb16ad0c6471c31d90f65112bf52407f09741660",
          "message": "chore(dev-deps): bump typescript from 5.2.2 to 5.3.3\n\nBumps [typescript](https://github.com/Microsoft/TypeScript) from 5.2.2 to 5.3.3.\n- [Release notes](https://github.com/Microsoft/TypeScript/releases)\n- [Commits](https://github.com/Microsoft/TypeScript/compare/v5.2.2...v5.3.3)\n\n---\nupdated-dependencies:\n- dependency-name: typescript\n  dependency-type: direct:development\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-12-10T05:47:39Z",
          "tree_id": "f4c9f61ff8f69adc7b270cd4c5d1d16dc2417d60",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/cb16ad0c6471c31d90f65112bf52407f09741660"
        },
        "date": 1702187457456,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 479166,
            "range": "±0.86%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 812649,
            "range": "±7.66%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 657449,
            "range": "±6.36%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5161,
            "range": "±220.46%",
            "unit": "ops/sec",
            "extra": "11 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 457823,
            "range": "±6.26%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 387293,
            "range": "±7.32%",
            "unit": "ops/sec",
            "extra": "57 samples"
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
          "id": "7b42e949a88885c9eea236d667e07aa10a411b49",
          "message": "fix: update max query limit env var",
          "timestamp": "2023-12-11T16:14:16-07:00",
          "tree_id": "07a9972387259370abe5294175062981950ef237",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7b42e949a88885c9eea236d667e07aa10a411b49"
        },
        "date": 1702338435504,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473476,
            "range": "±1.63%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 837718,
            "range": "±9.96%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 634233,
            "range": "±7.49%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 27285,
            "range": "±182.69%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 536912,
            "range": "±6.39%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 25370,
            "range": "±183.31%",
            "unit": "ops/sec",
            "extra": "46 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "committer": {
            "email": "mingxuanzhang@salesforce.com",
            "name": "mingxuanzhang",
            "username": "mingxuanzhangsfdx"
          },
          "distinct": true,
          "id": "9960b0e9264dbf33cb8775a5d9c7166518cdf481",
          "message": "chore: test building seperately",
          "timestamp": "2023-12-11T16:08:40-08:00",
          "tree_id": "c01de275a0ec6dd0206389bc8a4bcb3bf0b86bfd",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/9960b0e9264dbf33cb8775a5d9c7166518cdf481"
        },
        "date": 1702339977946,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 475442,
            "range": "±1.32%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 822251,
            "range": "±7.92%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 603278,
            "range": "±6.68%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 6636,
            "range": "±212.71%",
            "unit": "ops/sec",
            "extra": "14 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 411811,
            "range": "±14.46%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 403505,
            "range": "±7.06%",
            "unit": "ops/sec",
            "extra": "59 samples"
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
          "id": "3b5cfbb1c78ae7389201d4b34e4c2e7b0c1131f4",
          "message": "fix: package.json & yarn.lock to reduce vulnerabilities\n\nThe following vulnerabilities are fixed with an upgrade:\n- https://snyk.io/vuln/SNYK-JS-INFLIGHT-6095116",
          "timestamp": "2023-12-14T16:28:53Z",
          "tree_id": "8fb6ddbb34149bb998102c72811e0eff36ec860e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/3b5cfbb1c78ae7389201d4b34e4c2e7b0c1131f4"
        },
        "date": 1702571534394,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 461847,
            "range": "±0.59%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 722060,
            "range": "±10.01%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 556381,
            "range": "±6.81%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 12367,
            "range": "±198.13%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 419444,
            "range": "±6.33%",
            "unit": "ops/sec",
            "extra": "55 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 345903,
            "range": "±7.30%",
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
          "id": "f7da5be9a1384e56a60363ff04906fd7bd15de61",
          "message": "fix(deps): bump pino-pretty from 10.2.3 to 10.3.0\n\nBumps [pino-pretty](https://github.com/pinojs/pino-pretty) from 10.2.3 to 10.3.0.\n- [Release notes](https://github.com/pinojs/pino-pretty/releases)\n- [Commits](https://github.com/pinojs/pino-pretty/compare/v10.2.3...v10.3.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino-pretty\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-12-16T21:06:54Z",
          "tree_id": "8fb6ddbb34149bb998102c72811e0eff36ec860e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/f7da5be9a1384e56a60363ff04906fd7bd15de61"
        },
        "date": 1702761236661,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 462124,
            "range": "±2.31%",
            "unit": "ops/sec",
            "extra": "87 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 806365,
            "range": "±8.36%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 665727,
            "range": "±8.17%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4412,
            "range": "±223.46%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 463173,
            "range": "±7.75%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 381806,
            "range": "±8.38%",
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
          "id": "c20bba8a15649044f079a6608d8df37ba451e2a2",
          "message": "refactor: use native structured-clone",
          "timestamp": "2023-12-28T12:52:18-06:00",
          "tree_id": "13aec6b32041eeefd2d1e233eee7dea0013948d1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/c20bba8a15649044f079a6608d8df37ba451e2a2"
        },
        "date": 1703789775716,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 470268,
            "range": "±0.81%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 787763,
            "range": "±8.22%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 601125,
            "range": "±6.11%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8442,
            "range": "±205.69%",
            "unit": "ops/sec",
            "extra": "19 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 379533,
            "range": "±22.05%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 396344,
            "range": "±6.72%",
            "unit": "ops/sec",
            "extra": "58 samples"
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
          "id": "ae99dffb2b7a870930e399be1b964f28bdf0087f",
          "message": "test: ut for env global env/mode changes",
          "timestamp": "2023-12-28T18:39:51-06:00",
          "tree_id": "b5ee46d4f72b8605b6abfb06e9a8192af0f53b7e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ae99dffb2b7a870930e399be1b964f28bdf0087f"
        },
        "date": 1703811402061,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 476097,
            "range": "±0.48%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 825412,
            "range": "±9.51%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 657717,
            "range": "±8.58%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5575,
            "range": "±217.38%",
            "unit": "ops/sec",
            "extra": "12 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 443406,
            "range": "±8.81%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 369545,
            "range": "±7.88%",
            "unit": "ops/sec",
            "extra": "55 samples"
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
          "id": "e68014a992b8a6b7c7b5ff5f35bc5a2e238d834c",
          "message": "fix(deps): bump pino-pretty from 10.3.0 to 10.3.1\n\nBumps [pino-pretty](https://github.com/pinojs/pino-pretty) from 10.3.0 to 10.3.1.\n- [Release notes](https://github.com/pinojs/pino-pretty/releases)\n- [Commits](https://github.com/pinojs/pino-pretty/compare/v10.3.0...v10.3.1)\n\n---\nupdated-dependencies:\n- dependency-name: pino-pretty\n  dependency-type: direct:production\n  update-type: version-update:semver-patch\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2023-12-30T21:54:10Z",
          "tree_id": "6d5fe39c2896517486a54e3bf719cb8f751767d1",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/e68014a992b8a6b7c7b5ff5f35bc5a2e238d834c"
        },
        "date": 1703973446088,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 477310,
            "range": "±1.07%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 818666,
            "range": "±8.46%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 601985,
            "range": "±8.65%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7985,
            "range": "±213.75%",
            "unit": "ops/sec",
            "extra": "13 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 439467,
            "range": "±9.10%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 356648,
            "range": "±8.71%",
            "unit": "ops/sec",
            "extra": "52 samples"
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
          "id": "1bb300b2bb9f4990c6e19b9b8c33453416c24c95",
          "message": "fix: remove slash char from error message",
          "timestamp": "2024-01-04T11:25:33-07:00",
          "tree_id": "a2bc83e0a695640d14dd2cd24e43e96879bf3a4e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/1bb300b2bb9f4990c6e19b9b8c33453416c24c95"
        },
        "date": 1704392940442,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 453953,
            "range": "±2.08%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 716372,
            "range": "±9.23%",
            "unit": "ops/sec",
            "extra": "40 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 584520,
            "range": "±8.87%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10433,
            "range": "±200.85%",
            "unit": "ops/sec",
            "extra": "25 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 374209,
            "range": "±13.57%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 368413,
            "range": "±7.68%",
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
          "id": "90d025d07e749499206c96f2eabe2055899f38cb",
          "message": "fix: handle html server response",
          "timestamp": "2024-01-08T12:05:55-07:00",
          "tree_id": "6cb2dbe47dc0a6ebde4772700576821a007e9039",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/90d025d07e749499206c96f2eabe2055899f38cb"
        },
        "date": 1704741018188,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 470001,
            "range": "±1.38%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 843426,
            "range": "±7.78%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 622345,
            "range": "±13.12%",
            "unit": "ops/sec",
            "extra": "42 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 23761,
            "range": "±184.91%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 474599,
            "range": "±9.10%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 27204,
            "range": "±182.15%",
            "unit": "ops/sec",
            "extra": "50 samples"
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
          "id": "aeab4a9eb0c11b987d9d20e217726688fbc3fd9b",
          "message": "fix: ignore requests for site icons",
          "timestamp": "2024-01-08T14:37:05-07:00",
          "tree_id": "16f957e071523e3155ba944c8bc99610a06d9b38",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/aeab4a9eb0c11b987d9d20e217726688fbc3fd9b"
        },
        "date": 1704750033282,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 474612,
            "range": "±1.51%",
            "unit": "ops/sec",
            "extra": "88 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 737360,
            "range": "±8.39%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 557383,
            "range": "±8.33%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 12374,
            "range": "±198.73%",
            "unit": "ops/sec",
            "extra": "29 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 441129,
            "range": "±7.99%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 341289,
            "range": "±9.24%",
            "unit": "ops/sec",
            "extra": "52 samples"
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
          "id": "a5e33f0bdc4ddbb9b5ffb7e2e0e2e82f01253451",
          "message": "Merge branch 'main' into sh/handle-html-response",
          "timestamp": "2024-01-09T09:46:42-07:00",
          "tree_id": "b95fadbddcd4f3f10ab73d5eff16adc78ff54cd4",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/a5e33f0bdc4ddbb9b5ffb7e2e0e2e82f01253451"
        },
        "date": 1704819069032,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 468681,
            "range": "±2.31%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 836635,
            "range": "±11.11%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 647514,
            "range": "±7.50%",
            "unit": "ops/sec",
            "extra": "70 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 30550,
            "range": "±182.22%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 480037,
            "range": "±10.15%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 27310,
            "range": "±183.25%",
            "unit": "ops/sec",
            "extra": "47 samples"
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
          "id": "ea7ad36c65231b9a289c19f5dd185ca5bcf9c735",
          "message": "fix: address review comments",
          "timestamp": "2024-01-09T10:20:03-07:00",
          "tree_id": "349e86bf820c12a290d40072505a184a575cc233",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ea7ad36c65231b9a289c19f5dd185ca5bcf9c735"
        },
        "date": 1704821037686,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 463839,
            "range": "±1.17%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 641764,
            "range": "±7.09%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 525488,
            "range": "±9.11%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 20679,
            "range": "±184.78%",
            "unit": "ops/sec",
            "extra": "53 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 409247,
            "range": "±11.62%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 328455,
            "range": "±8.01%",
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
          "id": "ae4757f99746866b6bf0e73c4d8f5e9ac8e418c0",
          "message": "fix: better header check",
          "timestamp": "2024-01-09T10:46:35-07:00",
          "tree_id": "b6b476078e91669fc4631dec266622d290be2d59",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/ae4757f99746866b6bf0e73c4d8f5e9ac8e418c0"
        },
        "date": 1704822595420,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 469691,
            "range": "±2.81%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 793573,
            "range": "±13.17%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 654831,
            "range": "±5.40%",
            "unit": "ops/sec",
            "extra": "71 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7830,
            "range": "±208.09%",
            "unit": "ops/sec",
            "extra": "17 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 453474,
            "range": "±12.21%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 368765,
            "range": "±8.41%",
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
          "id": "53493bd23d38a3d956ced14775dc9aae594b2651",
          "message": "chore(deps): latest ts",
          "timestamp": "2024-01-10T11:08:46-06:00",
          "tree_id": "f7f0747afdd9f8d897e604d864760ca1130e36a6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/53493bd23d38a3d956ced14775dc9aae594b2651"
        },
        "date": 1704906820144,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 475336,
            "range": "±0.49%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 807619,
            "range": "±7.75%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 583121,
            "range": "±9.05%",
            "unit": "ops/sec",
            "extra": "69 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9005,
            "range": "±204.50%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 441505,
            "range": "±12.60%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 379144,
            "range": "±9.06%",
            "unit": "ops/sec",
            "extra": "54 samples"
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
          "id": "7fa714e65d4dea931d8aa0cf35ae7ca8db282846",
          "message": "fix(deps): bump ts-retry-promise from 0.7.1 to 0.8.0\n\nBumps [ts-retry-promise](https://github.com/normartin/ts-retry-promise) from 0.7.1 to 0.8.0.\n- [Release notes](https://github.com/normartin/ts-retry-promise/releases)\n- [Commits](https://github.com/normartin/ts-retry-promise/compare/v0.7.1...v0.8.0)\n\n---\nupdated-dependencies:\n- dependency-name: ts-retry-promise\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2024-01-13T21:11:24Z",
          "tree_id": "b51d2f5a2f4366764b562c0be886e187fee5a4f8",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7fa714e65d4dea931d8aa0cf35ae7ca8db282846"
        },
        "date": 1705180480892,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 483717,
            "range": "±0.70%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 759525,
            "range": "±6.34%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 604635,
            "range": "±7.63%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10311,
            "range": "±201.53%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 418638,
            "range": "±7.98%",
            "unit": "ops/sec",
            "extra": "62 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 351944,
            "range": "±9.59%",
            "unit": "ops/sec",
            "extra": "53 samples"
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
          "id": "725bf67bf0c7b4ba274644581005ed921862da09",
          "message": "feat(scratch): add `org-capitalize-record-types`",
          "timestamp": "2024-01-16T19:10:53-03:00",
          "tree_id": "d8107ce0b51b2cc7b119a8f56ad24b262aea9843",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/725bf67bf0c7b4ba274644581005ed921862da09"
        },
        "date": 1705443389023,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 481735,
            "range": "±1.11%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 802872,
            "range": "±8.88%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 594659,
            "range": "±8.05%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8845,
            "range": "±205.65%",
            "unit": "ops/sec",
            "extra": "19 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 496053,
            "range": "±10.19%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 402072,
            "range": "±8.94%",
            "unit": "ops/sec",
            "extra": "72 samples"
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
          "id": "fc3221886ed47d83999de102e7d76e82a29c0c0c",
          "message": "fix: emit warning if config var is unset",
          "timestamp": "2024-01-17T19:27:04-03:00",
          "tree_id": "094dd8085e2d8bb555fa1262ef7effd2842aaa23",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/fc3221886ed47d83999de102e7d76e82a29c0c0c"
        },
        "date": 1705530640485,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 458264,
            "range": "±2.75%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 874473,
            "range": "±9.38%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 606088,
            "range": "±6.32%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4412,
            "range": "±223.94%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 451710,
            "range": "±9.74%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 382013,
            "range": "±8.12%",
            "unit": "ops/sec",
            "extra": "55 samples"
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
          "id": "5e00c9a0030a1d7f6a39913529b3c230949da637",
          "message": "chore: improve message",
          "timestamp": "2024-01-18T11:22:21-03:00",
          "tree_id": "8fa872a5f768bfe1c4ff0caafc2794f1ad5ac5d4",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5e00c9a0030a1d7f6a39913529b3c230949da637"
        },
        "date": 1705587994186,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480851,
            "range": "±0.43%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 799611,
            "range": "±8.92%",
            "unit": "ops/sec",
            "extra": "50 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 574605,
            "range": "±5.15%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9702,
            "range": "±203.39%",
            "unit": "ops/sec",
            "extra": "21 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 421634,
            "range": "±7.31%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 361117,
            "range": "±8.08%",
            "unit": "ops/sec",
            "extra": "55 samples"
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
          "id": "94fe825c8e4772bce6ed97f3ab6842e5011f7dd2",
          "message": "fix: properly handle undefined",
          "timestamp": "2024-01-18T18:53:27-03:00",
          "tree_id": "66d9a30772c32b932ec5f4746b4587161871b943",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/94fe825c8e4772bce6ed97f3ab6842e5011f7dd2"
        },
        "date": 1705615069688,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473887,
            "range": "±1.29%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 737715,
            "range": "±6.89%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 498505,
            "range": "±8.39%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 17553,
            "range": "±187.11%",
            "unit": "ops/sec",
            "extra": "38 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 377631,
            "range": "±7.33%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 321037,
            "range": "±9.15%",
            "unit": "ops/sec",
            "extra": "47 samples"
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
          "id": "b0ae322d7ad67619131835d6b5c85b8cc7c59026",
          "message": "chore: typo",
          "timestamp": "2024-01-22T10:26:11-03:00",
          "tree_id": "c955de795bb2dadfc551069e0f6931c93f3bb3d0",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b0ae322d7ad67619131835d6b5c85b8cc7c59026"
        },
        "date": 1705954422320,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 473843,
            "range": "±1.42%",
            "unit": "ops/sec",
            "extra": "93 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 869547,
            "range": "±10.43%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 595363,
            "range": "±7.94%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5318,
            "range": "±223.62%",
            "unit": "ops/sec",
            "extra": "10 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 406691,
            "range": "±15.56%",
            "unit": "ops/sec",
            "extra": "56 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 353970,
            "range": "±8.72%",
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
          "id": "4dad8c75e38252d2ecafe1a4349cc5b0d19d68ac",
          "message": "fix: correct typings for configStore `get`",
          "timestamp": "2024-01-24T13:52:18-06:00",
          "tree_id": "60a241c59bee6447ea59a7598250a9e93e4f2e58",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/4dad8c75e38252d2ecafe1a4349cc5b0d19d68ac"
        },
        "date": 1706126173648,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 464655,
            "range": "±2.43%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 727812,
            "range": "±7.60%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 607337,
            "range": "±8.34%",
            "unit": "ops/sec",
            "extra": "35 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8341,
            "range": "±204.87%",
            "unit": "ops/sec",
            "extra": "20 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 444544,
            "range": "±6.75%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 353721,
            "range": "±7.60%",
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
          "id": "7cb8fe96053f5d0e34c9acc7c0bdb2f385ba8f0b",
          "message": "refactor: revert breaking change, leave as comments for next major",
          "timestamp": "2024-01-24T16:11:22-06:00",
          "tree_id": "eb34a420c5b0cc6cbf595942da9e25c339a45092",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/7cb8fe96053f5d0e34c9acc7c0bdb2f385ba8f0b"
        },
        "date": 1706134512229,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 476616,
            "range": "±1.29%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 788221,
            "range": "±6.51%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 603584,
            "range": "±9.84%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8316,
            "range": "±207.01%",
            "unit": "ops/sec",
            "extra": "18 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 461785,
            "range": "±9.52%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 387465,
            "range": "±7.00%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
          "id": "25fefb1a3589707874a897b8242e971508959b22",
          "message": "chore: merge main",
          "timestamp": "2024-01-25T10:03:02-07:00",
          "tree_id": "cef8a6489d6a4729593ac7e375785be4764062b6",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/25fefb1a3589707874a897b8242e971508959b22"
        },
        "date": 1706202431328,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 478722,
            "range": "±0.51%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 751423,
            "range": "±11.04%",
            "unit": "ops/sec",
            "extra": "49 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 588834,
            "range": "±9.15%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 12095,
            "range": "±198.38%",
            "unit": "ops/sec",
            "extra": "30 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 415602,
            "range": "±9.62%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 368126,
            "range": "±6.31%",
            "unit": "ops/sec",
            "extra": "56 samples"
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
          "id": "aca00d9d3effff75a7044944d8b7f15a9a3d1214",
          "message": "fix: update tests for Logger",
          "timestamp": "2024-01-29T16:49:19-07:00",
          "tree_id": "7e7856f8c7a0188c34341f1de1d199063f56fa4e",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/aca00d9d3effff75a7044944d8b7f15a9a3d1214"
        },
        "date": 1706572396520,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 476196,
            "range": "±1.71%",
            "unit": "ops/sec",
            "extra": "94 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 754485,
            "range": "±8.43%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 609462,
            "range": "±7.14%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 8064,
            "range": "±204.21%",
            "unit": "ops/sec",
            "extra": "21 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 401677,
            "range": "±15.07%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 352391,
            "range": "±7.46%",
            "unit": "ops/sec",
            "extra": "57 samples"
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
          "id": "b9b947c93e924e97cd8bf21fa4dac8df3029f4c3",
          "message": "fix: review updates",
          "timestamp": "2024-01-30T14:33:36-07:00",
          "tree_id": "cda393321be446aacd71e9c00793277fcf782dcb",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/b9b947c93e924e97cd8bf21fa4dac8df3029f4c3"
        },
        "date": 1706650651321,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 480040,
            "range": "±1.01%",
            "unit": "ops/sec",
            "extra": "91 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 749811,
            "range": "±6.65%",
            "unit": "ops/sec",
            "extra": "51 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 593063,
            "range": "±11.03%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10537,
            "range": "±201.06%",
            "unit": "ops/sec",
            "extra": "24 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 498451,
            "range": "±8.01%",
            "unit": "ops/sec",
            "extra": "59 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 339647,
            "range": "±8.76%",
            "unit": "ops/sec",
            "extra": "54 samples"
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
          "id": "aaa7aad4f98956e551e0ac4feeba545bdc5deab2",
          "message": "chore: lint fixes",
          "timestamp": "2024-01-31T11:34:45-07:00",
          "tree_id": "71796c208c82371a8c5a72c3b764ddfaea34a094",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/aaa7aad4f98956e551e0ac4feeba545bdc5deab2"
        },
        "date": 1706726314647,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 476865,
            "range": "±2.14%",
            "unit": "ops/sec",
            "extra": "89 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 852529,
            "range": "±7.47%",
            "unit": "ops/sec",
            "extra": "57 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 585079,
            "range": "±5.09%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7812,
            "range": "±204.25%",
            "unit": "ops/sec",
            "extra": "21 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 411029,
            "range": "±13.06%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 354011,
            "range": "±7.38%",
            "unit": "ops/sec",
            "extra": "53 samples"
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
          "id": "6bdb8c0906ddebd79c73f26a9809155e1e865a88",
          "message": "feat: add some comments",
          "timestamp": "2024-01-31T15:14:01-07:00",
          "tree_id": "737f2dfbd1cc912a7ef8667af9755b8b995eaf46",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6bdb8c0906ddebd79c73f26a9809155e1e865a88"
        },
        "date": 1706739473631,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 444207,
            "range": "±1.45%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 770242,
            "range": "±9.76%",
            "unit": "ops/sec",
            "extra": "41 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 603930,
            "range": "±8.07%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 10502,
            "range": "±202.15%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 432051,
            "range": "±10.09%",
            "unit": "ops/sec",
            "extra": "48 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 365527,
            "range": "±6.70%",
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
          "id": "5485a4d72ecba6796165d35900c23d989a2ce6b8",
          "message": "fix(deps): bump pino from 8.17.2 to 8.18.0\n\nBumps [pino](https://github.com/pinojs/pino) from 8.17.2 to 8.18.0.\n- [Release notes](https://github.com/pinojs/pino/releases)\n- [Commits](https://github.com/pinojs/pino/compare/v8.17.2...v8.18.0)\n\n---\nupdated-dependencies:\n- dependency-name: pino\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2024-02-03T21:47:29Z",
          "tree_id": "5ee84fb612b4978d2b4807b35d356776e47833f4",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5485a4d72ecba6796165d35900c23d989a2ce6b8"
        },
        "date": 1706997048112,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 470683,
            "range": "±0.47%",
            "unit": "ops/sec",
            "extra": "97 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 871108,
            "range": "±8.62%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 574969,
            "range": "±8.54%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 7063,
            "range": "±208.75%",
            "unit": "ops/sec",
            "extra": "17 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 459114,
            "range": "±9.70%",
            "unit": "ops/sec",
            "extra": "67 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 369648,
            "range": "±7.46%",
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
          "id": "1c5bc739e3a930847e6e9f31e7e25cfc5f357909",
          "message": "fix: remove unused env/config",
          "timestamp": "2024-02-05T11:08:23-06:00",
          "tree_id": "2eda900fb98059fe616ffaa03283d448ee163725",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/1c5bc739e3a930847e6e9f31e7e25cfc5f357909"
        },
        "date": 1707153143104,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 456619,
            "range": "±1.19%",
            "unit": "ops/sec",
            "extra": "96 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 710992,
            "range": "±7.12%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 523178,
            "range": "±8.28%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 18140,
            "range": "±186.57%",
            "unit": "ops/sec",
            "extra": "44 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 349947,
            "range": "±18.88%",
            "unit": "ops/sec",
            "extra": "61 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 315356,
            "range": "±9.54%",
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
          "id": "032ce663e53e8c9f5ad4d764ef3fa5c6ee540c5f",
          "message": "fix: detect crypto version from key length",
          "timestamp": "2024-02-06T17:07:51-07:00",
          "tree_id": "640282848a68b05ee3525123298de44760384c9c",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/032ce663e53e8c9f5ad4d764ef3fa5c6ee540c5f"
        },
        "date": 1707264704816,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 481355,
            "range": "±0.82%",
            "unit": "ops/sec",
            "extra": "90 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 833088,
            "range": "±10.36%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 647330,
            "range": "±7.77%",
            "unit": "ops/sec",
            "extra": "72 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 4626,
            "range": "±217.39%",
            "unit": "ops/sec",
            "extra": "12 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 466686,
            "range": "±12.83%",
            "unit": "ops/sec",
            "extra": "63 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 408661,
            "range": "±6.84%",
            "unit": "ops/sec",
            "extra": "67 samples"
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
          "id": "6774418628e411e2ee48cd12e96bd8aceca6c6d7",
          "message": "fix: use env var when key doesn't match v1 or v2 length",
          "timestamp": "2024-02-06T17:19:35-07:00",
          "tree_id": "7c89c04f85dd646f8d20876aa5e748e6654ad690",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/6774418628e411e2ee48cd12e96bd8aceca6c6d7"
        },
        "date": 1707265407394,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 459259,
            "range": "±0.75%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 701199,
            "range": "±7.26%",
            "unit": "ops/sec",
            "extra": "60 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 561798,
            "range": "±6.86%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 17755,
            "range": "±186.97%",
            "unit": "ops/sec",
            "extra": "45 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 380326,
            "range": "±14.30%",
            "unit": "ops/sec",
            "extra": "66 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 354811,
            "range": "±9.30%",
            "unit": "ops/sec",
            "extra": "53 samples"
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
          "id": "58761355f4fc175241e49edbf6fb8466c8e129f8",
          "message": "chore: allow undefined for internal cryptoVersion",
          "timestamp": "2024-02-08T10:36:47-07:00",
          "tree_id": "35bb6b2c8f612bf8b3adb608849aaaea792ce423",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/58761355f4fc175241e49edbf6fb8466c8e129f8"
        },
        "date": 1707414019832,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 470514,
            "range": "±2.47%",
            "unit": "ops/sec",
            "extra": "92 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 835499,
            "range": "±8.47%",
            "unit": "ops/sec",
            "extra": "58 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 587066,
            "range": "±7.57%",
            "unit": "ops/sec",
            "extra": "65 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 5185,
            "range": "±217.06%",
            "unit": "ops/sec",
            "extra": "12 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 396669,
            "range": "±11.51%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 372114,
            "range": "±8.06%",
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
          "id": "5bf0b7100c1b99221ce2524c70436e686470e976",
          "message": "fix(deps): bump semver from 7.5.4 to 7.6.0\n\nBumps [semver](https://github.com/npm/node-semver) from 7.5.4 to 7.6.0.\n- [Release notes](https://github.com/npm/node-semver/releases)\n- [Changelog](https://github.com/npm/node-semver/blob/main/CHANGELOG.md)\n- [Commits](https://github.com/npm/node-semver/compare/v7.5.4...v7.6.0)\n\n---\nupdated-dependencies:\n- dependency-name: semver\n  dependency-type: direct:production\n  update-type: version-update:semver-minor\n...\n\nSigned-off-by: dependabot[bot] <support@github.com>",
          "timestamp": "2024-02-10T21:05:39Z",
          "tree_id": "cb86b84a9cb2856436c1716173a5094bc74fae89",
          "url": "https://github.com/forcedotcom/sfdx-core/commit/5bf0b7100c1b99221ce2524c70436e686470e976"
        },
        "date": 1707599334333,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "Child logger creation",
            "value": 479538,
            "range": "±0.93%",
            "unit": "ops/sec",
            "extra": "95 samples"
          },
          {
            "name": "Logging a string on root logger",
            "value": 766207,
            "range": "±9.95%",
            "unit": "ops/sec",
            "extra": "43 samples"
          },
          {
            "name": "Logging an object on root logger",
            "value": 597857,
            "range": "±7.32%",
            "unit": "ops/sec",
            "extra": "64 samples"
          },
          {
            "name": "Logging an object with a message on root logger",
            "value": 9833,
            "range": "±202.32%",
            "unit": "ops/sec",
            "extra": "23 samples"
          },
          {
            "name": "Logging an object with a redacted prop on root logger",
            "value": 399693,
            "range": "±14.00%",
            "unit": "ops/sec",
            "extra": "68 samples"
          },
          {
            "name": "Logging a nested 3-level object on root logger",
            "value": 349195,
            "range": "±7.97%",
            "unit": "ops/sec",
            "extra": "52 samples"
          }
        ]
      }
    ]
  }
}