# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.25.1](https://github.com/forcedotcom/sfdx-core/compare/v3.1.1-3.2...v2.25.1) (2021-06-30)


### Bug Fixes

* set retries to INFINITELY for polling client ([31539b4](https://github.com/forcedotcom/sfdx-core/commit/31539b4f0edd0cc1c049f70331ed5e40b8af55ea))

## [2.25.0](https://github.com/forcedotcom/sfdx-core/compare/v2.24.2...v2.25.0) (2021-06-30)


### Features

* @W-9517449@ Allow signupTargetLoginUrl to be overridden via env var ([#429](https://github.com/forcedotcom/sfdx-core/issues/429)) ([e2b8b36](https://github.com/forcedotcom/sfdx-core/commit/e2b8b36b2836b5277c83ffe22922978dc32e7b11)), closes [#427](https://github.com/forcedotcom/sfdx-core/issues/427)

### [2.24.2](https://github.com/forcedotcom/sfdx-core/compare/v3.1.1-3.1...v2.24.2) (2021-06-23)


### Bug Fixes

* puts some types back in dependencies ([94bea31](https://github.com/forcedotcom/sfdx-core/commit/94bea31037a41d4377faecb22bce8a2d12e95f4f))

### [2.24.1](https://github.com/forcedotcom/sfdx-core/compare/v2.24.0...v2.24.1) (2021-06-23)


### Bug Fixes

* rewrite polling client ([8d363d1](https://github.com/forcedotcom/sfdx-core/commit/8d363d13616f5efa944d4bb717a010add3c996b5))

## [2.24.0](https://github.com/forcedotcom/sfdx-core/compare/v2.23.5...v2.24.0) (2021-06-08)


### Features

* exported function checkLightningDomain() ([#415](https://github.com/forcedotcom/sfdx-core/issues/415)) ([8e75231](https://github.com/forcedotcom/sfdx-core/commit/8e752313abf4a383a6ef18250ffac78b398987dd))

### [2.23.5](https://github.com/forcedotcom/sfdx-core/compare/v3.1.1-3.0...v2.23.5) (2021-06-07)


### Bug Fixes

* w-9299422 (login url from config) and fs-parallelization ([043bb17](https://github.com/forcedotcom/sfdx-core/commit/043bb179dbf64f9c4522a4c0f0720ae09794227c))

### [2.23.4](https://github.com/forcedotcom/sfdx-core/compare/v2.23.3...v2.23.4) (2021-06-03)


### Bug Fixes

* works with TS4+ and jsforce types ([#413](https://github.com/forcedotcom/sfdx-core/issues/413)) ([b77cdad](https://github.com/forcedotcom/sfdx-core/commit/b77cdad56b114290b8e5fd23d968e23e7d4eedf4))

### [2.23.3](https://github.com/forcedotcom/sfdx-core/compare/v2.23.2...v2.23.3) (2021-06-03)

### [2.23.2](https://github.com/forcedotcom/sfdx-core/compare/v2.23.1...v2.23.2) (2021-06-02)


### Bug Fixes

* authinfo returning only lowercase usernames. ([#411](https://github.com/forcedotcom/sfdx-core/issues/411)) ([243668e](https://github.com/forcedotcom/sfdx-core/commit/243668e61cd8418b6acb2f0d4806da50ccf37b29)), closes [#405](https://github.com/forcedotcom/sfdx-core/issues/405)

### [2.23.1](https://github.com/forcedotcom/sfdx-core/compare/v2.23.0...v2.23.1) (2021-05-27)

## [2.23.0](https://github.com/forcedotcom/sfdx-core/compare/v2.22.0...v2.23.0) (2021-05-26)


### Features

* export getJwtAudienceUrl ([e7d26d2](https://github.com/forcedotcom/sfdx-core/commit/e7d26d20106d6abb6b424936bdf26c0a9f8cd175))


### Bug Fixes

* export library method ([d0016f9](https://github.com/forcedotcom/sfdx-core/commit/d0016f96da1246535049884c1043399239a33c00))

## [2.22.0](https://github.com/forcedotcom/sfdx-core/compare/v2.21.0...v2.22.0) (2021-05-24)


### Features

* export getJwtAudienceUrl ([#407](https://github.com/forcedotcom/sfdx-core/issues/407)) ([585bb07](https://github.com/forcedotcom/sfdx-core/commit/585bb073434d73473a855ee52b7ddc6f0228aae1))

## [2.21.0](https://github.com/forcedotcom/sfdx-core/compare/v2.20.11...v2.21.0) (2021-05-24)


### Features

* modify authInfo to return username for access token auth ([160b7d2](https://github.com/forcedotcom/sfdx-core/commit/160b7d20e32b80d7a54c8cf679154fcbaa9e8cda))

### [2.20.11](https://github.com/forcedotcom/sfdx-core/compare/v3.1.0-3.0...v2.20.11) (2021-05-12)


### Bug Fixes

* force release ([f0b837a](https://github.com/forcedotcom/sfdx-core/commit/f0b837ab7b4d0361c2fa3ba15fe56cd2f7cc1fd0))

### [2.20.10](https://github.com/forcedotcom/sfdx-core/compare/v2.20.9...v2.20.10) (2021-04-14)


### Bug Fixes

* add another internal test env domain ([6ea538f](https://github.com/forcedotcom/sfdx-core/commit/6ea538f2ce62daba7262a247472ce821c6e2616f))

### [2.20.9](https://github.com/forcedotcom/sfdx-core/compare/v2.20.8...v2.20.9) (2021-04-05)


### Bug Fixes

* allow = in authUrl tokens ([2337fcd](https://github.com/forcedotcom/sfdx-core/commit/2337fcddfb1907a7092cd52f5b3ad73ae963d59e))

### [2.20.8](https://github.com/forcedotcom/sfdx-core/compare/v2.20.7...v2.20.8) (2021-04-03)


### Bug Fixes

* debugEnabled should be public ([dbd0124](https://github.com/forcedotcom/sfdx-core/commit/dbd01243003f555b8b4db45c83e81cc08b8cb9a1))

### [2.20.7](https://github.com/forcedotcom/sfdx-core/compare/v2.20.6...v2.20.7) (2021-04-02)


### Bug Fixes

* add deployRecentValidation ([62d367b](https://github.com/forcedotcom/sfdx-core/commit/62d367b217e6b552573bd7176b064e28252348c5))
* add deployRecentValidation ([a39c329](https://github.com/forcedotcom/sfdx-core/commit/a39c329b3fab603b537ae5ed8cce4773bdf24eb6))
* add test, clarify comments ([8d5679e](https://github.com/forcedotcom/sfdx-core/commit/8d5679ecbd482af84842f5c1c8908a059d97ef3f))

### [2.20.6](https://github.com/forcedotcom/sfdx-core/compare/v2.20.5...v2.20.6) (2021-04-02)

### Bug Fixes

- add REST deploy and test ([a1204f8](https://github.com/forcedotcom/sfdx-core/commit/a1204f857654ef979913708a8404d3b1e5328352))
- deploy with REST working :) ([ec36851](https://github.com/forcedotcom/sfdx-core/commit/ec368515cd2d5d947f947573abbdaa83d3a853a2))
- remove requrie ts-node/register from package ([5377fe4](https://github.com/forcedotcom/sfdx-core/commit/5377fe46c3ed5707d31e45794f9fd397aabbcf63))
- rest deploy without fs :D ([9a4202d](https://github.com/forcedotcom/sfdx-core/commit/9a4202d157131fbf6aebb007a0334d3d1ce1d4e8))
- working on adding REST deploy ([0b3947b](https://github.com/forcedotcom/sfdx-core/commit/0b3947b4e39b1ecd790cd6c03077e4388faf2b04))

### [2.20.5](https://github.com/forcedotcom/sfdx-core/compare/v2.20.4...v2.20.5) (2021-03-08)

### Bug Fixes

- qualify a sandbox url via cname lookup ([#385](https://github.com/forcedotcom/sfdx-core/issues/385)) ([3e27623](https://github.com/forcedotcom/sfdx-core/commit/3e276237278fabb609b890e3271c4d8a28c0f573))

### [2.20.4](https://github.com/forcedotcom/sfdx-core/compare/v2.20.3...v2.20.4) (2021-03-03)

### [2.20.3](https://github.com/forcedotcom/sfdx-core/compare/v2.20.2...v2.20.3) (2021-02-25)

### Bug Fixes

- await the call to authInfo.save ([299499e](https://github.com/forcedotcom/sfdx-core/commit/299499ee29e9243b7d60fb9bdef22165a34b4611))
- web:login fails when org cannot access REST ([31b139a](https://github.com/forcedotcom/sfdx-core/commit/31b139a56ce37e0d8a15946163dbf96c872c565b))

### [2.20.2](https://github.com/forcedotcom/sfdx-core/compare/v2.20.1...v2.20.2) (2021-02-25)

### [2.20.1](https://github.com/forcedotcom/sfdx-core/compare/v2.20.0...v2.20.1) (2021-02-24)

### Bug Fixes

- await the call to authInfo.save ([b26ea70](https://github.com/forcedotcom/sfdx-core/commit/b26ea700793eb2a985f28ce7fc349164d5edaf89))

## [2.20.0](https://github.com/forcedotcom/sfdx-core/compare/v2.19.1...v2.20.0) (2021-02-22)

### Features

- cache api version on auth info ([cb21cf0](https://github.com/forcedotcom/sfdx-core/commit/cb21cf099a4ab6911e49b26488b51eb6988b2be7))

### Bug Fixes

- do not save access token files ([46d88b9](https://github.com/forcedotcom/sfdx-core/commit/46d88b90c11c7de392412ef64ded201a2145de9d))

### [2.19.1](https://github.com/forcedotcom/sfdx-core/compare/v2.19.0...v2.19.1) (2021-02-19)

### Bug Fixes

- meet more password requirements ([53025f0](https://github.com/forcedotcom/sfdx-core/commit/53025f00a5a52cb32ed8ac20178c409df5014b76))

## [2.19.0](https://github.com/forcedotcom/sfdx-core/compare/v2.18.6...v2.19.0) (2021-02-17)

### Features

- add SFDX_DISABLE_DNS_CHECK ([2e2cb84](https://github.com/forcedotcom/sfdx-core/commit/2e2cb84f557ecb057358efa107c616d79dbc160b))

### Bug Fixes

- move env vars to myDomainResolver ([fcf1a4a](https://github.com/forcedotcom/sfdx-core/commit/fcf1a4a4e333e6ac9e8d6e91204d030031de3d1c))
- revert dns polling timeout to 30 and frequency to 10 ([4ba7a63](https://github.com/forcedotcom/sfdx-core/commit/4ba7a63ad5019c33123773789af6c7c58e4c6eb3))

### [2.18.6](https://github.com/forcedotcom/sfdx-core/compare/v2.18.5...v2.18.6) (2021-02-17)

### Bug Fixes

- pass decrypted client secret for oauth ([#374](https://github.com/forcedotcom/sfdx-core/issues/374)) ([63bf84e](https://github.com/forcedotcom/sfdx-core/commit/63bf84eaa962c151dc6a5ffcec3edcdf4bf91b05))

### [2.18.5](https://github.com/forcedotcom/sfdx-core/compare/v2.18.4...v2.18.5) (2021-02-11)

### Bug Fixes

- filter allowedProperties on getConfigInfo ([cbb91e1](https://github.com/forcedotcom/sfdx-core/commit/cbb91e1604f7c7c8b192b8d6ca2c64bdd4fb05b2))
- no throw on unknown config value ([49618db](https://github.com/forcedotcom/sfdx-core/commit/49618db01cd180fd1267092d36754d83a6514182))

### [2.18.4](https://github.com/forcedotcom/sfdx-core/compare/v2.18.3...v2.18.4) (2021-02-10)

### Bug Fixes

- isresolvable mock ([6a7e8b1](https://github.com/forcedotcom/sfdx-core/commit/6a7e8b153a42135792a3df58b809981706492e83))

### [2.18.3](https://github.com/forcedotcom/sfdx-core/compare/v2.18.2...v2.18.3) (2021-02-05)

### Bug Fixes

- update password jsdoc for v51 + return type ([390ed8d](https://github.com/forcedotcom/sfdx-core/commit/390ed8d0f15ee3915e35ccea5505890b10f16c81))

### [2.18.2](https://github.com/forcedotcom/sfdx-core/compare/v2.18.1...v2.18.2) (2021-02-04)

### Bug Fixes

- fixed maxQueryLimit validation ([6431065](https://github.com/forcedotcom/sfdx-core/commit/6431065a0da6a615ef19594f69c069a19885f3e5))
- fixed test descriptions ([1455204](https://github.com/forcedotcom/sfdx-core/commit/145520456c48c59003b1397ef7bcdf7a047ac083))
- improved validation, error message, add test ([63e6c4d](https://github.com/forcedotcom/sfdx-core/commit/63e6c4d5814aa324d41b87a7ec275c16a085ef78))
- maxQueryLimit must be > 0 ([a3d9156](https://github.com/forcedotcom/sfdx-core/commit/a3d91561f7510901dc02e42e80bb943bf3008a62))

### [2.18.1](https://github.com/forcedotcom/sfdx-core/compare/v2.18.0...v2.18.1) (2021-02-04)

### Bug Fixes

- add space option to write json ([51d01aa](https://github.com/forcedotcom/sfdx-core/commit/51d01aae7f7b2fc7fe0cf10ec9cffd170e0574ca))

## [2.18.0](https://github.com/forcedotcom/sfdx-core/compare/v2.17.0...v2.18.0) (2021-02-01)

### Features

- falcon usa support w/o createdOrgInstance ([ec15d37](https://github.com/forcedotcom/sfdx-core/commit/ec15d37cb2500e41e787c432579e87ec7ed126d4))
- more falcon domain support, url case insensitivity ([f72b85d](https://github.com/forcedotcom/sfdx-core/commit/f72b85d3e8a875306654bc7eb5b692218f242518))
- more jwt audience domains ([03751ea](https://github.com/forcedotcom/sfdx-core/commit/03751ea884eacb59eecaadd139a8a09035cd08d0))

### Bug Fixes

- audience for loginUrls without my in the domain ([2bca84c](https://github.com/forcedotcom/sfdx-core/commit/2bca84c0b66d59b536ffa61f051e43b43c4c23dd))
- audiences handle uppercased CS instances ([0d6d3ea](https://github.com/forcedotcom/sfdx-core/commit/0d6d3ea14601c1008f16e7d23af2802ef8e3ff65))
- audiences use instanceURL ([64590cc](https://github.com/forcedotcom/sfdx-core/commit/64590cc4f9f30a37dbf4d17a6cf8db53ba0bdd09))
- support enhanced domains ([a89ce21](https://github.com/forcedotcom/sfdx-core/commit/a89ce21c24ddbdd4cfad0772490f16768e5a0e3c))

## [2.17.0](https://github.com/forcedotcom/sfdx-core/compare/v2.16.6...v2.17.0) (2021-01-29)

### Features

- adjustable DNS timeout ([9db7b66](https://github.com/forcedotcom/sfdx-core/commit/9db7b66bf8f3fb284ab98c0fbd0906c6195eabc6))

### Bug Fixes

- at least 3 ([109da8a](https://github.com/forcedotcom/sfdx-core/commit/109da8a5b335678c4967bd2aef92069e1f1bd955))

### [2.16.6](https://github.com/forcedotcom/sfdx-core/compare/v2.16.5...v2.16.6) (2021-01-29)

### Bug Fixes

- add internal mil environment ([27e33ae](https://github.com/forcedotcom/sfdx-core/commit/27e33ae0a99ebc2c63364a67348174ab56468290))
- additional "internal" host ([af15447](https://github.com/forcedotcom/sfdx-core/commit/af15447166e85124326134a4f8d51b9fd05381ea))
- internal, local, and new stm.force domains ([b93f26d](https://github.com/forcedotcom/sfdx-core/commit/b93f26d2a2e255a0ef3089cde1d20445aa12e802))
- myDomainResolver shouldn't check localhost ([c07984e](https://github.com/forcedotcom/sfdx-core/commit/c07984e507d98be59ca15da97621b92bd2e73497))

### [2.16.5](https://github.com/forcedotcom/sfdx-core/compare/v2.16.4...v2.16.5) (2021-01-29)

### Bug Fixes

- send oauth error to browser ([5fd027a](https://github.com/forcedotcom/sfdx-core/commit/5fd027a2ee8c12b21621f7478763175f499a1517))

### [2.16.4](https://github.com/forcedotcom/sfdx-core/compare/v2.16.3...v2.16.4) (2021-01-27)

### Bug Fixes

- remove mobile domains ([ae413db](https://github.com/forcedotcom/sfdx-core/commit/ae413db35916ecd480524d1994664729c0685f2f))

### [2.16.3](https://github.com/forcedotcom/sfdx-core/compare/v2.16.2...v2.16.3) (2021-01-21)

### [2.16.2](https://github.com/forcedotcom/sfdx-core/compare/v2.16.1...v2.16.2) (2021-01-21)

### Bug Fixes

- better error messaging and Steve feedback ([20c8977](https://github.com/forcedotcom/sfdx-core/commit/20c897739d077a15945701843fac9c2c3457dff4))
- better error name ([43cac98](https://github.com/forcedotcom/sfdx-core/commit/43cac980bba0bf276a28cd7d90b4bc3656cacd3b))
- error name as a constant ([92ced7e](https://github.com/forcedotcom/sfdx-core/commit/92ced7e7de418c4dc36af6d12be930adcf801706))
- export name for testing ([fda9ce0](https://github.com/forcedotcom/sfdx-core/commit/fda9ce0a802917cbcf496dc03450182f3ec5f79a))
- line spacing ([89e4dc7](https://github.com/forcedotcom/sfdx-core/commit/89e4dc7d46e7b3b553329c7eb125caa75015dce1))
- log versions as string ([d82fe3e](https://github.com/forcedotcom/sfdx-core/commit/d82fe3e8a41c177bd905ee3278332db375dc9761))
- prevent DNS ENOTFOUND from hitting stdout ([1bc473f](https://github.com/forcedotcom/sfdx-core/commit/1bc473fc36ff70edbb1145b1c2f3ae6e0a4331ee))

### [2.16.1](https://github.com/forcedotcom/sfdx-core/compare/v2.16.0...v2.16.1) (2021-01-20)

## [2.16.0](https://github.com/forcedotcom/sfdx-core/compare/v2.15.5...v2.16.0) (2021-01-12)

### Features

- singleRecordQuery ([ea72d9f](https://github.com/forcedotcom/sfdx-core/commit/ea72d9f3e31aff8dbcf1f15fd7539f75cafc4ffc))

### Bug Fixes

- bumped npm release to v4 ([1ad0a98](https://github.com/forcedotcom/sfdx-core/commit/1ad0a984fd75e5e0cba20a907f542014b919095f))
- dry-run fixed orb ([b3eb476](https://github.com/forcedotcom/sfdx-core/commit/b3eb4764b63869907d653d63e47f4e092df75481))
- per peter feedback ([e0c366a](https://github.com/forcedotcom/sfdx-core/commit/e0c366ad6d7b7affb746aa8ba4869685f8563b5d))
- remove another redundant condition ([021ff2d](https://github.com/forcedotcom/sfdx-core/commit/021ff2d08292148e50cf1ba8eccc54c92ed12328))
- revert dry-run fix ([b415aca](https://github.com/forcedotcom/sfdx-core/commit/b415aca58e005093760cd8873e67d69ce70e1935))
- updated yarn.lock ([7caaed5](https://github.com/forcedotcom/sfdx-core/commit/7caaed58d4f18bb6be675b690b1b9fc17c16d207))

### [2.15.5](https://github.com/forcedotcom/sfdx-core/compare/v2.15.4...v2.15.5) (2021-01-07)

### Bug Fixes

- accessToken works as username ([6f0ec24](https://github.com/forcedotcom/sfdx-core/commit/6f0ec24d0b220f4ba6f3460392c2ae6fc3b4d998))
- get username from accessToken ([18dd97d](https://github.com/forcedotcom/sfdx-core/commit/18dd97dad14639d66a19cfde0b33497864fa3594))
- test > match ([56815e8](https://github.com/forcedotcom/sfdx-core/commit/56815e85cbaf6fd0b7253c83af08d62ba6b1f685))

### [2.15.4](https://github.com/forcedotcom/sfdx-core/compare/v2.15.3...v2.15.4) (2020-12-09)

### Bug Fixes

- **windows:** throw error when file is not accessible ([3c5e5f8](https://github.com/forcedotcom/sfdx-core/commit/3c5e5f83ead8fe5f8e9cfc9623a3d4296e42458f))

### [2.15.3](https://github.com/forcedotcom/sfdx-core/compare/v2.15.2...v2.15.3) (2020-12-02)

### Bug Fixes

- added docs around MyDomainResolver constructor method ([68d8e52](https://github.com/forcedotcom/sfdx-core/commit/68d8e520353dae10cda4b04153ec7cc753cbc02a))
- single package entry is defaulted to default package ([badff89](https://github.com/forcedotcom/sfdx-core/commit/badff89be92c492d990dc91ce79ff94eb88a7117))

### [2.15.2](https://github.com/forcedotcom/sfdx-core/compare/v2.15.1...v2.15.2) (2020-11-11)

### Bug Fixes

- config aggregator show changes to local and global config ([e3b3a55](https://github.com/forcedotcom/sfdx-core/commit/e3b3a55b7ea5e3a728ea021c8eb6a24555b63dc4))
- localConfig typings now correctly show it might not exist ([3cb7716](https://github.com/forcedotcom/sfdx-core/commit/3cb7716fff790aac2357cd28dd28e11e81513e4f))
- updated various logic and QOL on User and PermissionSetAssignment ([1bab28f](https://github.com/forcedotcom/sfdx-core/commit/1bab28fc799cba944aa01aa5d330e5524e267b63))

### [2.15.1](https://github.com/forcedotcom/sfdx-core/compare/v2.15.0...v2.15.1) (2020-11-02)

### Bug Fixes

- move @types/mkdirp to dependencies ([e8e5cf7](https://github.com/forcedotcom/sfdx-core/commit/e8e5cf753c9d3ca56ae9f55e90b41d6168b49d0b))

## [2.15.0](https://github.com/forcedotcom/sfdx-core/compare/v2.14.0...v2.15.0) (2020-10-30)

### Features

- allow adding property metas to allowedProperties on config ([2a264d3](https://github.com/forcedotcom/sfdx-core/commit/2a264d3ca3002c4c90c771beaa2036a06d331697))

## [2.14.0](https://github.com/forcedotcom/sfdx-core/compare/v2.13.0...v2.14.0) (2020-10-22)

### Features

- add decrypt option to getFields ([ccd32e2](https://github.com/forcedotcom/sfdx-core/commit/ccd32e20aa613554153c75bab59373225cea2382))

## [2.13.0](https://github.com/forcedotcom/sfdx-core/compare/v2.12.3...v2.13.0) (2020-10-13)

### Features

- add DeviceOauthService ([3e72962](https://github.com/forcedotcom/sfdx-core/commit/3e72962fd3a192b7dc6ff2ce7123ef7312185694))
- add WebOauthServer for web based auth flow ([25cea05](https://github.com/forcedotcom/sfdx-core/commit/25cea057200fcb5861d6862f877832a1ad93fd79))

### Bug Fixes

- add falcon sandboxes ([558dd72](https://github.com/forcedotcom/sfdx-core/commit/558dd720d1988ad2d80fa9227b277e56c284e09a))
- mock package json instead of fs ([8cba4d1](https://github.com/forcedotcom/sfdx-core/commit/8cba4d1e04a7c8fbe98e9cc646f663f404330394))
- resolve sfdx project path before checking cache ([265e523](https://github.com/forcedotcom/sfdx-core/commit/265e52350a69028f6a81aafb2e9779f455a29c31))

### [2.12.3](https://github.com/forcedotcom/sfdx-core/compare/v2.12.2...v2.12.3) (2020-10-01)

### Bug Fixes

- lifecycle should be a singleton across core versions ([66a450b](https://github.com/forcedotcom/sfdx-core/commit/66a450b0a0030d85c61645eb8c782289e4938e4a))
- stub should call resolver at runtime ([9002cbf](https://github.com/forcedotcom/sfdx-core/commit/9002cbf8f02da9422dd547a3ea989d174749726b))

### [2.12.2](https://github.com/forcedotcom/sfdx-core/compare/v2.12.1...v2.12.2) (2020-09-28)

### Bug Fixes

- fixed mocking error ([f5cfe52](https://github.com/forcedotcom/sfdx-core/commit/f5cfe52605e54ab8250e155e17077bc03b0cd6ec))

### [2.12.1](https://github.com/forcedotcom/sfdx-core/compare/v2.12.0...v2.12.1) (2020-09-18)

### Bug Fixes

- missed line in merge ([9f73ba5](https://github.com/forcedotcom/sfdx-core/commit/9f73ba52c6cf3330b3a3f4560920e35296151bd5))

## [2.12.0](https://github.com/forcedotcom/sfdx-core/compare/v2.11.0...v2.12.0) (2020-09-14)

### Features

- add a lot of sync method, add package directory information to the project ([#284](https://github.com/forcedotcom/sfdx-core/issues/284)) ([b973901](https://github.com/forcedotcom/sfdx-core/commit/b973901d69855debecc553452a6664dc482cc3c5))
- add scope options ([#289](https://github.com/forcedotcom/sfdx-core/issues/289)) ([6bc23ec](https://github.com/forcedotcom/sfdx-core/commit/6bc23ecbb0f744e8575ac21b90a59bf540a79156))
- support plugin-auth ([a1f6eca](https://github.com/forcedotcom/sfdx-core/commit/a1f6eca37d26cb869014e1cd7eafcc3eb5b5e830))

### Bug Fixes

- convert core from tslint -> eslint ([d4791c8](https://github.com/forcedotcom/sfdx-core/commit/d4791c8db200a18973d2164971395998693b3d03))
- query for username during refresh token flow ([f640070](https://github.com/forcedotcom/sfdx-core/commit/f640070feef25c0589cbcad8868152a564be028c))
- some changes regressed toolbelt ([#299](https://github.com/forcedotcom/sfdx-core/issues/299)) ([2c571a7](https://github.com/forcedotcom/sfdx-core/commit/2c571a729c4d62fc2da4427aa28ebfc769c92b97))

## [2.11.0](https://github.com/forcedotcom/sfdx-core/compare/v2.10.0...v2.11.0) (2020-08-27)

### Features

- support array of messages when using getMessage ([ac7407a](https://github.com/forcedotcom/sfdx-core/commit/ac7407ad899fba3825082ba23f53b66101b699de))
- support logfmt style formatting ([#273](https://github.com/forcedotcom/sfdx-core/issues/273)) ([2767cbf](https://github.com/forcedotcom/sfdx-core/commit/2767cbfe4ec356915140260dfb780ec3b39ccb84))

### Bug Fixes

- examples/package.json & examples/yarn.lock to reduce vulnerabilities ([d062ccc](https://github.com/forcedotcom/sfdx-core/commit/d062cccdd96d16f45dafd41425827299a26ed766))
- wrap logfmt message with double quotes ([#280](https://github.com/forcedotcom/sfdx-core/issues/280)) ([3ef407b](https://github.com/forcedotcom/sfdx-core/commit/3ef407b667cdd65dc2bbd8259924e0b8b7ecb284))

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
