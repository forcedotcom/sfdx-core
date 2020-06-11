## [2.5.1](https://github.com/forcedotcom/sfdx-core/compare/v2.5.0...v2.5.1) (2020-06-11)


### Bug Fixes

* fix child logger unit test ([93da343](https://github.com/forcedotcom/sfdx-core/commit/93da3432e83e4db0f2642b54f618521ea53bc414))
* log uncaught exception in root logger only ([7a80662](https://github.com/forcedotcom/sfdx-core/commit/7a806622e1007d363f317f90a392328f6b6d40e7))
* mock audience url for unit test ([963b696](https://github.com/forcedotcom/sfdx-core/commit/963b6960e971adaafd43c31581ffc07686fc8378))

# [2.5.0](https://github.com/forcedotcom/sfdx-core/compare/v2.4.1...v2.5.0) (2020-06-08)


### Bug Fixes

* update mkdirp for updated dep ([e2b471b](https://github.com/forcedotcom/sfdx-core/commit/e2b471b120edd1b55bca50d71a2fe8d995ef8bbd))


### Features

* add fs.fileExists ([0c5d0a7](https://github.com/forcedotcom/sfdx-core/commit/0c5d0a75867094f5b05d9d356f23c94c38d6213e))

## [2.4.1](https://github.com/forcedotcom/sfdx-core/compare/v2.4.0...v2.4.1) (2020-05-05)


### Bug Fixes

* don't ship with ts-sinon ([b4005fb](https://github.com/forcedotcom/sfdx-core/commit/b4005fb27b3f85be1297b9cfec0bc7e0de91979d))
* fixed test spy ([c1f4ba4](https://github.com/forcedotcom/sfdx-core/commit/c1f4ba42ba94a03c5e3e77e793558cfea947f78e))
* path.resolve jwt key file path ([86e6957](https://github.com/forcedotcom/sfdx-core/commit/86e695757a68dca1ea659e801ead59e57e6632b9))

# [2.4.0](https://github.com/forcedotcom/sfdx-core/compare/v2.3.1...v2.4.0) (2020-04-23)


### Features

* create auth info with sfdx auth url ([68dbfad](https://github.com/forcedotcom/sfdx-core/commit/68dbfad817202813555b5438c498b24bfdb5aa0f))

## [2.3.1](https://github.com/forcedotcom/sfdx-core/compare/v2.3.0...v2.3.1) (2020-04-13)


### Bug Fixes

* use new @salesfore/bunyan library, run tests in node 10 & 12 ([#211](https://github.com/forcedotcom/sfdx-core/issues/211)) ([249850d](https://github.com/forcedotcom/sfdx-core/commit/249850dfbf5da4199709e9573944a4da72d0581d))

# [2.3.0](https://github.com/forcedotcom/sfdx-core/compare/v2.2.0...v2.3.0) (2020-03-20)


### Features

* allow stubbing on single tests ([37cef1b](https://github.com/forcedotcom/sfdx-core/commit/37cef1bbf8f4d1c4909f13c1fac7757f1430e40b))

# [2.2.0](https://github.com/forcedotcom/sfdx-core/compare/v2.1.6...v2.2.0) (2020-02-11)


### Features

* create authinfo with a parent authinfo ([9b21226](https://github.com/forcedotcom/sfdx-core/commit/9b212264bafe458c95ae22fce11298c706d23393)), closes [#202](https://github.com/forcedotcom/sfdx-core/issues/202)

## [2.1.6](https://github.com/forcedotcom/sfdx-core/compare/v2.1.5...v2.1.6) (2020-01-13)


### Bug Fixes

* add config var for telemetry opt out ([f79ace3](https://github.com/forcedotcom/sfdx-core/commit/f79ace34462f586feb296b94ee369e1f7922341d))

## [2.1.5](https://github.com/forcedotcom/sfdx-core/compare/v2.1.4...v2.1.5) (2019-11-15)


### Bug Fixes

* rogue import causing compile issue ([d0b5e5c](https://github.com/forcedotcom/sfdx-core/commit/d0b5e5c13dc497ef0ba98d460e91514ea0400d7a))

## [2.1.4](https://github.com/forcedotcom/sfdx-core/compare/v2.1.3...v2.1.4) (2019-11-04)


### Bug Fixes

* contrib ([7e91751](https://github.com/forcedotcom/sfdx-core/commit/7e91751e1dcb1d3ca18d083262ae675503a7614b))

## [2.1.3](https://github.com/forcedotcom/sfdx-core/compare/v2.1.2...v2.1.3) (2019-10-09)


### Bug Fixes

* make sure when stream processor throws an error we disconnect the streaming client ([6dc8de9](https://github.com/forcedotcom/sfdx-core/commit/6dc8de9cfbf7aebfadf50233d914c05cba6eda9a))

## [2.1.2](https://github.com/forcedotcom/sfdx-core/compare/v2.1.1...v2.1.2) (2019-08-29)


### Bug Fixes

* add debug logger that accepts a function ([117dee4](https://github.com/forcedotcom/sfdx-core/commit/117dee4))
* deleting and org auth file never worked ([a6a77c6](https://github.com/forcedotcom/sfdx-core/commit/a6a77c6))
* review feedback ([7c1f630](https://github.com/forcedotcom/sfdx-core/commit/7c1f630))

## [2.1.1](https://github.com/forcedotcom/sfdx-core/compare/v2.1.0...v2.1.1) (2019-07-17)


### Bug Fixes

* yarn.lock ([70e75a2](https://github.com/forcedotcom/sfdx-core/commit/70e75a2))

# [2.1.0](https://github.com/forcedotcom/sfdx-core/compare/v2.0.1...v2.1.0) (2019-07-16)


### Bug Fixes

* update secureBuffer cipherName ([b55fcde](https://github.com/forcedotcom/sfdx-core/commit/b55fcde))
* update secureBuffer cipherName ([8e66a0c](https://github.com/forcedotcom/sfdx-core/commit/8e66a0c))
* use empty string for client secret when client secret is undefined ([9513551](https://github.com/forcedotcom/sfdx-core/commit/9513551))


### Features

* add config file for sandbox ([db2026e](https://github.com/forcedotcom/sfdx-core/commit/db2026e))
* do not throw error on org.remove if sandbox config doesn't exist ([3912993](https://github.com/forcedotcom/sfdx-core/commit/3912993))

## [2.0.1](https://github.com/forcedotcom/sfdx-core/compare/v2.0.0...v2.0.1) (2019-07-02)


### Bug Fixes

* update secureBuffer cipherName ([1e8037b](https://github.com/forcedotcom/sfdx-core/commit/1e8037b))
* update secureBuffer cipherName ([874d5b6](https://github.com/forcedotcom/sfdx-core/commit/874d5b6))
* use empty string for client secret when client secret is undefined ([0d22a56](https://github.com/forcedotcom/sfdx-core/commit/0d22a56))

# [2.0.0](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v2.0.0) (2019-06-17)


### Bug Fixes

* 🐛 prevent auth files from being accidentally overwritten ([06d96fc](https://github.com/forcedotcom/sfdx-core/commit/06d96fc)), closes [PR#114](https://github.com/PR/issues/114)
* add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))
* force version bump to test ci-docs on release ([ecb6a66](https://github.com/forcedotcom/sfdx-core/commit/ecb6a66))


### BREAKING CHANGES

* 🧨 some commands that call getCoreConnection with auth options and a
username will now throw an error.

## [1.3.4](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v1.3.4) (2019-05-02)


### Bug Fixes

* add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))
* force version bump to test ci-docs on release ([ecb6a66](https://github.com/forcedotcom/sfdx-core/commit/ecb6a66))

## [1.3.4](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v1.3.4) (2019-05-01)


### Bug Fixes

* add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))

## [1.3.4](https://github.com/forcedotcom/sfdx-core/compare/v1.3.3...v1.3.4) (2019-04-11)


### Bug Fixes

* add clientId to jwt fields ([8a7c040](https://github.com/forcedotcom/sfdx-core/commit/8a7c040))

## [1.3.3](https://github.com/forcedotcom/sfdx-core/compare/v1.3.2...v1.3.3) (2019-04-04)


### Bug Fixes

* allow aliases with dots ([e8b17af](https://github.com/forcedotcom/sfdx-core/commit/e8b17af))
* allow packageAliases in sfdx-project.json ([8d7b1fe](https://github.com/forcedotcom/sfdx-core/commit/8d7b1fe))
* hide sensitive values from being logged ([8505f04](https://github.com/forcedotcom/sfdx-core/commit/8505f04))
* move generating the secretfile path to the catch block ([2b9e57d](https://github.com/forcedotcom/sfdx-core/commit/2b9e57d))
* potential missing key.json file on windows ([f94f127](https://github.com/forcedotcom/sfdx-core/commit/f94f127))
* properly invoke callbacks ([f03838c](https://github.com/forcedotcom/sfdx-core/commit/f03838c))

## [1.3.2](https://github.com/forcedotcom/sfdx-core/compare/v1.3.1...v1.3.2) (2019-03-25)


### Bug Fixes

* revert of throwing auth error ([f6ebe12](https://github.com/forcedotcom/sfdx-core/commit/f6ebe12))

## [1.3.1](https://github.com/forcedotcom/sfdx-core/compare/v1.3.0...v1.3.1) (2019-03-25)


### Bug Fixes

* prevent auth files from being inadvertently overwritten ([45195c1](https://github.com/forcedotcom/sfdx-core/commit/45195c1))
* update test and don't throw when auth file not found ([75af396](https://github.com/forcedotcom/sfdx-core/commit/75af396))

# [1.3.0](https://github.com/forcedotcom/sfdx-core/compare/v1.2.3...v1.3.0) (2019-03-19)


### Features

* support wrapping a string ([2445003](https://github.com/forcedotcom/sfdx-core/commit/2445003))

## [1.2.3](https://github.com/forcedotcom/sfdx-core/compare/v1.2.2...v1.2.3) (2019-03-18)


### Bug Fixes

* @W-5907580@ respect code if it exist ([5263fe2](https://github.com/forcedotcom/sfdx-core/commit/5263fe2))
* do not let name and code get out-of-date is name is set ([3e5914e](https://github.com/forcedotcom/sfdx-core/commit/3e5914e))
* security update and patch to allow colons in filepaths for windows ([a385b40](https://github.com/forcedotcom/sfdx-core/commit/a385b40))
* use name by default for code ([c5283d3](https://github.com/forcedotcom/sfdx-core/commit/c5283d3))

## [1.2.2](https://github.com/forcedotcom/sfdx-core/compare/v1.2.1...v1.2.2) (2019-02-11)


### Bug Fixes

* use default options off the constructor ([368a5f1](https://github.com/forcedotcom/sfdx-core/commit/368a5f1))

## [1.2.1](https://github.com/forcedotcom/sfdx-core/compare/v1.2.0...v1.2.1) (2019-01-31)


### Bug Fixes

* update docs ([789816e](https://github.com/forcedotcom/sfdx-core/commit/789816e))

# [1.2.0](https://github.com/forcedotcom/sfdx-core/compare/v1.1.2...v1.2.0) (2019-01-30)


### Bug Fixes

* do not query server if cached ([d7ccf99](https://github.com/forcedotcom/sfdx-core/commit/d7ccf99))
* update to allow stored connected app info ([66ea057](https://github.com/forcedotcom/sfdx-core/commit/66ea057))


### Features

* determine if a org is a dev hub ([586d7ba](https://github.com/forcedotcom/sfdx-core/commit/586d7ba))

## [1.1.2](https://github.com/forcedotcom/sfdx-core/compare/v1.1.1...v1.1.2) (2018-12-21)


### Bug Fixes

* update contrib doc to trigger build ([28c6945](https://github.com/forcedotcom/sfdx-core/commit/28c6945))

## [1.1.1](https://github.com/forcedotcom/sfdx-core/compare/v1.1.0...v1.1.1) (2018-12-19)


### Bug Fixes

* bump kit, ts-types, and ts-sinon versions ([1f088b4](https://github.com/forcedotcom/sfdx-core/commit/1f088b4))
* downgrade jsforce to match sfdx toolbelt ([5fba254](https://github.com/forcedotcom/sfdx-core/commit/5fba254))
* fix jsforce types reference ([407e3df](https://github.com/forcedotcom/sfdx-core/commit/407e3df))
* migrate from /docs to gh-pages branch ([7d36139](https://github.com/forcedotcom/sfdx-core/commit/7d36139))

# [1.1.0](https://github.com/forcedotcom/sfdx-core/compare/v1.0.3...v1.1.0) (2018-12-14)


### Bug Fixes

* doc update ([7ad690e](https://github.com/forcedotcom/sfdx-core/commit/7ad690e))
* ensure AuthInfoConfig can throw when config file not found ([f11b84a](https://github.com/forcedotcom/sfdx-core/commit/f11b84a))
* move throwOnNotFound option to ConfigFile ([924352a](https://github.com/forcedotcom/sfdx-core/commit/924352a))


### Features

* update jsforce typings ([374b8fc](https://github.com/forcedotcom/sfdx-core/commit/374b8fc))
