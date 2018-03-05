library identifier: 'salesforcedx-library'

node {
    stage('run unit tests') {
        withEnv([
        	'SFDX_USE_GENERIC_UNIX_KEYCHAIN=true'
        ]) {
            runUnitTestsWithCoverage(currentBuild)
        }
    }
}