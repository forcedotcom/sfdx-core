# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.13.0](https://github.com/forcedotcom/sfdx-core/compare/v2.12.3...v2.13.0) (2020-10-13)


### Features

* add DeviceOauthService ([3e72962](https://github.com/forcedotcom/sfdx-core/commit/3e72962fd3a192b7dc6ff2ce7123ef7312185694))
* add WebOauthServer for web based auth flow ([25cea05](https://github.com/forcedotcom/sfdx-core/commit/25cea057200fcb5861d6862f877832a1ad93fd79))


### Bug Fixes

* add falcon sandboxes ([558dd72](https://github.com/forcedotcom/sfdx-core/commit/558dd720d1988ad2d80fa9227b277e56c284e09a))
* mock package json instead of fs ([8cba4d1](https://github.com/forcedotcom/sfdx-core/commit/8cba4d1e04a7c8fbe98e9cc646f663f404330394))
* resolve sfdx project path before checking cache ([265e523](https://github.com/forcedotcom/sfdx-core/commit/265e52350a69028f6a81aafb2e9779f455a29c31))

### [2.12.3](https://github.com/forcedotcom/sfdx-core/compare/v2.12.2...v2.12.3) (2020-10-01)


### Bug Fixes

* lifecycle should be a singleton across core versions ([66a450b](https://github.com/forcedotcom/sfdx-core/commit/66a450b0a0030d85c61645eb8c782289e4938e4a))
* stub should call resolver at runtime ([9002cbf](https://github.com/forcedotcom/sfdx-core/commit/9002cbf8f02da9422dd547a3ea989d174749726b))

### [2.12.2](https://github.com/forcedotcom/sfdx-core/compare/v2.12.1...v2.12.2) (2020-09-28)


### Bug Fixes

* fixed mocking error ([f5cfe52](https://github.com/forcedotcom/sfdx-core/commit/f5cfe52605e54ab8250e155e17077bc03b0cd6ec))

### [2.12.1](https://github.com/forcedotcom/sfdx-core/compare/v2.12.0...v2.12.1) (2020-09-18)


### Bug Fixes

* missed line in merge ([9f73ba5](https://github.com/forcedotcom/sfdx-core/commit/9f73ba52c6cf3330b3a3f4560920e35296151bd5))

## [2.12.0](https://github.com/forcedotcom/sfdx-core/compare/v2.11.0...v2.12.0) (2020-09-14)


### Features

* add a lot of sync method, add package directory information to the project ([#284](https://github.com/forcedotcom/sfdx-core/issues/284)) ([b973901](https://github.com/forcedotcom/sfdx-core/commit/b973901d69855debecc553452a6664dc482cc3c5))
* add scope options ([#289](https://github.com/forcedotcom/sfdx-core/issues/289)) ([6bc23ec](https://github.com/forcedotcom/sfdx-core/commit/6bc23ecbb0f744e8575ac21b90a59bf540a79156))
* support plugin-auth ([a1f6eca](https://github.com/forcedotcom/sfdx-core/commit/a1f6eca37d26cb869014e1cd7eafcc3eb5b5e830))


### Bug Fixes

* convert core from tslint -> eslint ([d4791c8](https://github.com/forcedotcom/sfdx-core/commit/d4791c8db200a18973d2164971395998693b3d03))
* query for username during refresh token flow ([f640070](https://github.com/forcedotcom/sfdx-core/commit/f640070feef25c0589cbcad8868152a564be028c))
* some changes regressed toolbelt ([#299](https://github.com/forcedotcom/sfdx-core/issues/299)) ([2c571a7](https://github.com/forcedotcom/sfdx-core/commit/2c571a729c4d62fc2da4427aa28ebfc769c92b97))

## [2.11.0](https://github.com/forcedotcom/sfdx-core/compare/v2.10.0...v2.11.0) (2020-08-27)


### Features

* support array of messages when using getMessage ([ac7407a](https://github.com/forcedotcom/sfdx-core/commit/ac7407ad899fba3825082ba23f53b66101b699de))
* support logfmt style formatting ([#273](https://github.com/forcedotcom/sfdx-core/issues/273)) ([2767cbf](https://github.com/forcedotcom/sfdx-core/commit/2767cbfe4ec356915140260dfb780ec3b39ccb84))


### Bug Fixes

* examples/package.json & examples/yarn.lock to reduce vulnerabilities ([d062ccc](https://github.com/forcedotcom/sfdx-core/commit/d062cccdd96d16f45dafd41425827299a26ed766))
* wrap logfmt message with double quotes ([#280](https://github.com/forcedotcom/sfdx-core/issues/280)) ([3ef407b](https://github.com/forcedotcom/sfdx-core/commit/3ef407b667cdd65dc2bbd8259924e0b8b7ecb284))

# [2.10.0](https://github.com/forcedotcom/sfdx-core/compare/v2.9.4...v2.10.0) (2020-08-10)

### Features

- support logfmt style formatting ([#273](https://github.com/forcedotcom/sfdx-core/issues/273)) ([#274](https://github.com/forcedotcom/sfdx-core/issues/274)) ([93b156c](https://github.com/forcedotcom/sfdx-core/commit/93b156c6e82ee8029bd4c8ec714b75c89e0f531f))

## [2.9.4](https://github.com/forcedotcom/sfdx-core/compare/v2.9.3...v2.9.4) (2020-08-07)

### Bug Fixes

- updated messaging ([7f9ab06](https://github.com/forcedotcom/sfdx-core/commit/7f9ab06ecbde1ac082f027f35f07002efb8dc7cf))
- fix edge case, updated messaging ([a8f9a54](https://github.com/forcedotcom/sfdx-core/commit/a8f9a547893918b2a3f6a23e9bcfa99e13b28974))

## [2.9.3](https://github.com/forcedotcom/sfdx-core/compare/v2.9.2...v2.9.3) (2020-08-06)

### Bug Fixes

- changed to be greater than, not greater than or equal to ([7f1a12d](https://github.com/forcedotcom/sfdx-core/commit/7f1a12d7a7d7aa460de5bb32a368f52c11219a4e))

## [2.9.2](https://github.com/forcedotcom/sfdx-core/compare/v2.9.1...v2.9.2) (2020-08-06)

### Bug Fixes

- maxQueryLimit config, return full jsforce result, fix build issue ([6c11196](https://github.com/forcedotcom/sfdx-core/commit/6c11196a48e19bca8d43fd994fa864bf3cb72cfa))
- removed promise.reject ([d28d649](https://github.com/forcedotcom/sfdx-core/commit/d28d649f60ca1362380b4e5e408376561d6a64ed))
- updated autoFetchQuery method ([4d018f6](https://github.com/forcedotcom/sfdx-core/commit/4d018f6d2c8e4d6b19179563f11db2ff1f9b5f3d))

## [2.9.1](https://github.com/forcedotcom/sfdx-core/compare/v2.9.0...v2.9.1) (2020-08-04)

### Bug Fixes

- remove encrypted from ISV_URL ([d2c89fe](https://github.com/forcedotcom/sfdx-core/commit/d2c89fed3602f0f9e06a3cefa605268914d69d6e)), closes [#262](https://github.com/forcedotcom/sfdx-core/issues/262)

# [2.9.0](https://github.com/forcedotcom/sfdx-core/compare/v2.8.0...v2.9.0) (2020-07-29)

### Features

- overwriting configStore unset ([6095dd6](https://github.com/forcedotcom/sfdx-core/commit/6095dd69ab4ed5e4324e5a46d8ec5bed74bb538a))

# [2.8.0](https://github.com/forcedotcom/sfdx-core/compare/v2.7.0...v2.8.0) (2020-07-27)

### Features

- changed data to be more flexible type ([50414f9](https://github.com/forcedotcom/sfdx-core/commit/50414f936569993b5bdf96c90bf251bbd6083b10))

# [2.7.0](https://github.com/forcedotcom/sfdx-core/compare/v2.6.0...v2.7.0) (2020-07-01)

### Features

- adds areFilesEqual / actOn / getContentHash from toolbelt to core ([807dc72](https://github.com/forcedotcom/sfdx-core/commit/807dc729f414cda335fcba737580b53fc6ceddc1))

# [2.6.0](https://github.com/forcedotcom/sfdx-core/compare/v2.5.1...v2.6.0) (2020-06-23)

### Bug Fixes

- added line breaks for readability ([0f8b857](https://github.com/forcedotcom/sfdx-core/commit/0f8b8576d6401ed88b424e60e2f9302003d9ea90))
- fixed a capitalization that caused CircleCI to fail ([db803a7](https://github.com/forcedotcom/sfdx-core/commit/db803a7fc83ead6fccf84e1791ba668cd25d013e))
- updated comments and async for loop ([fa3b580](https://github.com/forcedotcom/sfdx-core/commit/fa3b580d82b3bb389a4d1b7edf9340080d392f50))

### Features

- added lifecycleEvents.ts from toolbelt: an event listener/emitter ([099478c](https://github.com/forcedotcom/sfdx-core/commit/099478cf087c024d965bba16bb6341df64ce7edb))

## [2.5.1](https://github.com/forcedotcom/sfdx-core/compare/v2.5.0...v2.5.1) (2020-06-11)

### Bug Fixes

- fix child logger unit test ([93da343](https://github.com/forcedotcom/sfdx-core/commit/93da3432e83e4db0f2642b54f618521ea53bc414))
- log uncaught exception in root logger only ([7a80662](https://github.com/forcedotcom/sfdx-core/commit/7a806622e1007d363f317f90a392328f6b6d40e7))
- mock audience url for unit test ([963b696](https://github.com/forcedotcom/sfdx-core/commit/963b6960e971adaafd43c31581ffc07686fc8378))

# [2.5.0](https://github.com/forcedotcom/sfdx-core/compare/v2.4.1...v2.5.0) (2020-06-08)

### Bug Fixes

- update mkdirp for updated dep ([e2b471b](https://github.com/forcedotcom/sfdx-core/commit/e2b471b120edd1b55bca50d71a2fe8d995ef8bbd))

### Features

- add fs.fileExists ([0c5d0a7](https://github.com/forcedotcom/sfdx-core/commit/0c5d0a75867094f5b05d9d356f23c94c38d6213e))

## [2.4.1](https://github.com/forcedotcom/sfdx-core/compare/v2.4.0...v2.4.1) (2020-05-05)

### Bug Fixes

- don't ship with ts-sinon ([b4005fb](https://github.com/forcedotcom/sfdx-core/commit/b4005fb27b3f85be1297b9cfec0bc7e0de91979d))
- fixed test spy ([c1f4ba4](https://github.com/forcedotcom/sfdx-core/commit/c1f4ba42ba94a03c5e3e77e793558cfea947f78e))
- path.resolve jwt key file path ([86e6957](https://github.com/forcedotcom/sfdx-core/commit/86e695757a68dca1ea659e801ead59e57e6632b9))

# [2.4.0](https://github.com/forcedotcom/sfdx-core/compare/v2.3.1...v2.4.0) (2020-04-23)

### Features

- create auth info with sfdx auth url ([68dbfad](https://github.com/forcedotcom/sfdx-core/commit/68dbfad817202813555b5438c498b24bfdb5aa0f))

## [2.3.1](https://github.com/forcedotcom/sfdx-core/compare/v2.3.0...v2.3.1) (2020-04-13)

### Bug Fixes

- use new @salesfore/bunyan library, run tests in node 10 & 12 ([#211](https://github.com/forcedotcom/sfdx-core/issues/211)) ([249850d](https://github.com/forcedotcom/sfdx-core/commit/249850dfbf5da4199709e9573944a4da72d0581d))

# [2.3.0](https://github.com/forcedotcom/sfdx-core/compare/v2.2.0...v2.3.0) (2020-03-20)

### Features

- allow stubbing on single tests ([37cef1b](https://github.com/forcedotcom/sfdx-core/commit/37cef1bbf8f4d1c4909f13c1fac7757f1430e40b))

# [2.2.0](https://github.com/forcedotcom/sfdx-core/compare/v2.1.6...v2.2.0) (2020-02-11)

### Features

- create authinfo with a parent authinfo ([9b21226](https://github.com/forcedotcom/sfdx-core/commit/9b212264bafe458c95ae22fce11298c706d23393)), closes [#202](https://github.com/forcedotcom/sfdx-core/issues/202)

## [2.1.6](https://github.com/forcedotcom/sfdx-core/compare/v2.1.5...v2.1.6) (2020-01-13)

### Bug Fixes

- add config var for telemetry opt out ([f79ace3](https://github.com/forcedotcom/sfdx-core/commit/f79ace34462f586feb296b94ee369e1f7922341d))

## [2.1.5](https://github.com/forcedotcom/sfdx-core/compare/v2.1.4...v2.1.5) (2019-11-15)

### Bug Fixes

- rogue import causing compile issue ([d0b5e5c](https://github.com/forcedotcom/sfdx-core/commit/d0b5e5c13dc497ef0ba98d460e91514ea0400d7a))

## [2.1.4](https://github.com/forcedotcom/sfdx-core/compare/v2.1.3...v2.1.4) (2019-11-04)

### Bug Fixes

- contrib ([7e91751](https://github.com/forcedotcom/sfdx-core/commit/7e91751e1dcb1d3ca18d083262ae675503a7614b))

## [2.1.3](https://github.com/forcedotcom/sfdx-core/compare/v2.1.2...v2.1.3) (2019-10-09)

### Bug Fixes

- make sure when stream processor throws an error we disconnect the streaming client ([6dc8de9](https://github.com/forcedotcom/sfdx-core/commit/6dc8de9cfbf7aebfadf50233d914c05cba6eda9a))

## [2.1.2](https://github.com/forcedotcom/sfdx-core/compare/v2.1.1...v2.1.2) (2019-08-29)

### Bug Fixes

- add debug logger that accepts a function ([117dee4](https://github.com/forcedotcom/sfdx-core/commit/117dee4))
- deleting and org auth file never worked ([a6a77c6](https://github.com/forcedotcom/sfdx-core/commit/a6a77c6))
- review feedback ([7c1f630](https://github.com/forcedotcom/sfdx-core/commit/7c1f630))

## [2.1.1](https://github.com/forcedotcom/sfdx-core/compare/v2.1.0...v2.1.1) (2019-07-17)

### Bug Fixes

- yarn.lock ([70e75a2](https://github.com/forcedotcom/sfdx-core/commit/70e75a2))

# [2.1.0](https://github.com/forcedotcom/sfdx-core/compare/v2.0.1...v2.1.0) (2019-07-16)

### Bug Fixes

- update secureBuffer cipherName ([b55fcde](https://github.com/forcedotcom/sfdx-core/commit/b55fcde))
- update secureBuffer cipherName ([8e66a0c](https://github.com/forcedotcom/sfdx-core/commit/8e66a0c))
- use empty string for client secret when client secret is undefined ([9513551](https://github.com/forcedotcom/sfdx-core/commit/9513551))

### Features

- add config file for sandbox ([db2026e](https://github.com/forcedotcom/sfdx-core/commit/db2026e))
- do not throw error on org.remove if sandbox config doesn't exist ([3912993](https://github.com/forcedotcom/sfdx-core/commit/3912993))

## [2.0.1](https://github.com/forcedotcom/sfdx-core/compare/v2.0.0...v2.0.1) (2019-07-02)

### Bug Fixes

- update secureBuffer cipherName ([1e8037b](https://github.com/forcedotcom/sfdx-core/commit/1e8037b))
- update secureBuffer cipherName ([874d5b6](https://github.com/forcedotcom/sfdx-core/commit/874d5b6))
- use empty string for client secret when client secret is undefined ([0d22a56](https://github.com/forcedotcom/sfdx-core/commit/0d22a56))

# [2.0.0](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v2.0.0) (2019-06-17)

### Bug Fixes

- 🐛 prevent auth files from being accidentally overwritten ([06d96fc](https://github.com/forcedotcom/sfdx-core/commit/06d96fc)), closes [PR#114](https://github.com/PR/issues/114)
- add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))
- force version bump to test ci-docs on release ([ecb6a66](https://github.com/forcedotcom/sfdx-core/commit/ecb6a66))

### BREAKING CHANGES

- 🧨 some commands that call getCoreConnection with auth options and a
  username will now throw an error.

## [1.3.4](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v1.3.4) (2019-05-02)

### Bug Fixes

- add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))
- force version bump to test ci-docs on release ([ecb6a66](https://github.com/forcedotcom/sfdx-core/commit/ecb6a66))

## [1.3.4](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v1.3.4) (2019-05-01)

### Bug Fixes

- add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))

## [1.3.4](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v1.3.4) (2019-04-11)

### Bug Fixes

- add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))

## [1.3.3](https://github.com/forcedotcom/sfdx-core/compare/v1.3.2...v1.3.3) (2019-04-04)

### Bug Fixes

- allow aliases with dots ([e8b17af](https://github.com/forcedotcom/sfdx-core/commit/e8b17af))
- allow packageAliases in sfdx-project.json ([8d7b1fe](https://github.com/forcedotcom/sfdx-core/commit/8d7b1fe))
- hide sensitive values from being logged ([8505f04](https://github.com/forcedotcom/sfdx-core/commit/8505f04))
- move generating the secretfile path to the catch block ([2b9e57d](https://github.com/forcedotcom/sfdx-core/commit/2b9e57d))
- potential missing key.json file on windows ([f94f127](https://github.com/forcedotcom/sfdx-core/commit/f94f127))
- properly invoke callbacks ([f03838c](https://github.com/forcedotcom/sfdx-core/commit/f03838c))

## [1.3.2](https://github.com/forcedotcom/sfdx-core/compare/v1.3.1...v1.3.2) (2019-03-25)

### Bug Fixes

- revert of throwing auth error ([f6ebe12](https://github.com/forcedotcom/sfdx-core/commit/f6ebe12))

## [1.3.1](https://github.com/forcedotcom/sfdx-core/compare/v1.3.0...v1.3.1) (2019-03-25)

### Bug Fixes

- prevent auth files from being inadvertently overwritten ([45195c1](https://github.com/forcedotcom/sfdx-core/commit/45195c1))
- update test and don't throw when auth file not found ([75af396](https://github.com/forcedotcom/sfdx-core/commit/75af396))

# [1.3.0](https://github.com/forcedotcom/sfdx-core/compare/v1.2.3...v1.3.0) (2019-03-19)

### Features

- support wrapping a string ([2445003](https://github.com/forcedotcom/sfdx-core/commit/2445003))

## [1.2.3](https://github.com/forcedotcom/sfdx-core/compare/v1.2.2...v1.2.3) (2019-03-18)

### Bug Fixes

- @W-5907580@ respect code if it exist ([5263fe2](https://github.com/forcedotcom/sfdx-core/commit/5263fe2))
- do not let name and code get out-of-date is name is set ([3e5914e](https://github.com/forcedotcom/sfdx-core/commit/3e5914e))
- security update and patch to allow colons in filepaths for windows ([a385b40](https://github.com/forcedotcom/sfdx-core/commit/a385b40))
- use name by default for code ([c5283d3](https://github.com/forcedotcom/sfdx-core/commit/c5283d3))

## [1.2.2](https://github.com/forcedotcom/sfdx-core/compare/v1.2.1...v1.2.2) (2019-02-11)

### Bug Fixes

- use default options off the constructor ([368a5f1](https://github.com/forcedotcom/sfdx-core/commit/368a5f1))

## [1.2.1](https://github.com/forcedotcom/sfdx-core/compare/v1.2.0...v1.2.1) (2019-01-31)

### Bug Fixes

- update docs ([789816e](https://github.com/forcedotcom/sfdx-core/commit/789816e))

# [1.2.0](https://github.com/forcedotcom/sfdx-core/compare/v1.1.2...v1.2.0) (2019-01-30)

### Bug Fixes

- do not query server if cached ([d7ccf99](https://github.com/forcedotcom/sfdx-core/commit/d7ccf99))
- update to allow stored connected app info ([66ea057](https://github.com/forcedotcom/sfdx-core/commit/66ea057))

### Features

- determine if a org is a dev hub ([586d7ba](https://github.com/forcedotcom/sfdx-core/commit/586d7ba))

## [1.1.2](https://github.com/forcedotcom/sfdx-core/compare/v1.1.1...v1.1.2) (2018-12-21)

### Bug Fixes

- update contrib doc to trigger build ([28c6945](https://github.com/forcedotcom/sfdx-core/commit/28c6945))

## [1.1.1](https://github.com/forcedotcom/sfdx-core/compare/v1.1.0...v1.1.1) (2018-12-19)

### Bug Fixes

- bump kit, ts-types, and ts-sinon versions ([1f088b4](https://github.com/forcedotcom/sfdx-core/commit/1f088b4))
- downgrade jsforce to match sfdx toolbelt ([5fba254](https://github.com/forcedotcom/sfdx-core/commit/5fba254))
- fix jsforce types reference ([407e3df](https://github.com/forcedotcom/sfdx-core/commit/407e3df))
- migrate from /docs to gh-pages branch ([7d36139](https://github.com/forcedotcom/sfdx-core/commit/7d36139))

# [1.1.0](https://github.com/forcedotcom/sfdx-core/compare/v1.0.3...v1.1.0) (2018-12-14)

### Bug Fixes

- doc update ([7ad690e](https://github.com/forcedotcom/sfdx-core/commit/7ad690e))
- ensure AuthInfoConfig can throw when config file not found ([f11b84a](https://github.com/forcedotcom/sfdx-core/commit/f11b84a))
- move throwOnNotFound option to ConfigFile ([924352a](https://github.com/forcedotcom/sfdx-core/commit/924352a))

### Features

- update jsforce typings ([374b8fc](https://github.com/forcedotcom/sfdx-core/commit/374b8fc))
