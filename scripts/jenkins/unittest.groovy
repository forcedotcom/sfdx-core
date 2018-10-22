/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
library identifier: 'salesforcedx-library'

withEnv([
    'SFDX_USE_GENERIC_UNIX_KEYCHAIN=true'
]) {
    runUnitTestsWithCoverage(currentBuild)
}