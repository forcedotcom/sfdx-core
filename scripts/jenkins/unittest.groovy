library identifier: 'salesforcedx-library'


withEnv([
	'USE_GENERIC_UNIX_KEYCHAIN=true',
	'http_proxy=http://public0-proxy1-0-prd.data.sfdc.net:8080',
	'https_proxy=http://public0-proxy1-0-prd.data.sfdc.net:8080',
	'HTTP_PROXY=http://public0-proxy1-0-prd.data.sfdc.net:8080',
	'HTTPS_PROXY=http://public0-proxy1-0-prd.data.sfdc.net:8080'
]) {
    runUnitTestsWithCoverage(currentBuild)
}