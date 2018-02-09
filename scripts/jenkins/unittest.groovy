library identifier: 'salesforcedx-library'


withEnv([
	'SFDX_USE_GENERIC_UNIX_KEYCHAIN=true'
]) {
    runUnitTestsWithCoverage(currentBuild)
}