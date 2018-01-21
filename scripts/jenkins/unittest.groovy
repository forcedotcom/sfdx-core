library identifier: 'salesforcedx-library'

env.OPS_HTTP_PROXY = env.SFDX_PUBLIC_PROXY

getProxyConfigFromEnv()

runUnitTestsWithCoverage(currentBuild)