library identifier: 'salesforcedx-library'


withEnv([
	'USE_GENERIC_UNIX_KEYCHAIN=true'
]) {
    runUnitTestsWithCoverage(currentBuild)
}