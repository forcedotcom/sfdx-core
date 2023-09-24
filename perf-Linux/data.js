window.BENCHMARK_DATA = {
  "lastUpdate": 1695523818792,
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
      }
    ]
  }
}