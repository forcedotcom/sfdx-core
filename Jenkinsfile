library identifier: 'salesforcedx-library'
/**
 * Jenkinsfile for sfdx-core project.
 *
 * This Jenkinsfile is for use in a Multibranch Jenkins pipeline job ONLY.
 * The Entry-point into this code will attempt to run the current set of pipeline steps
 * according to the Jenkins job name. If the job name includes the word "unit", then unit
 * tests will be run.
 *
 * So a Jenkins job name of SFDX CLI Unit Test will run the unit test.
 */

enum PLATFORM {
    LINUX, WINDOWS, MAC
}

/**
 * Run tests in shell environment
 */
def runCommands(PLATFORM os, String testResultsName) {
    try {
        runTheJob(os)
    } finally {
        stash includes: '*xunit.xml,*checkstyle.xml,*coverage/*, **/stderr.txt, **/stdout.txt, **/test-result*.*, success.txt', name: testResultsName
    }
}

def jobMatches(String regex) {
    return env.JOB_NAME.toLowerCase().matches(regex)
}

def runTheJob(PLATFORM os) {
    properties([
        buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '', numToKeepStr: '10')),
        pipelineTriggers([])
    ])

    step([$class: 'GitHubSetCommitStatusBuilder'])

    runYarn();

    if (jobMatches(/.*unit.*/) && os == PLATFORM.LINUX) {
        doUnitTests(os);
    }
}

def runYarn() {
    stage('Run yarn')
    {
        sh 'node --version'
        sh 'echo $PATH'
        rc = sh returnStatus: true, script: 'yarn'
    }
}

/**
 * The stages necessary to accomplish unit tests
 */
def doUnitTests() {
    stage('Run Unit tests/checkstyle/coverage')
    {
        rc = sh returnStatus: true, script: 'yarn test-with-coverage'
        if (rc != 0)
        {
            currentBuild.result = 'Unstable'
        }
    }
}

/**
 * post results to github
 */
def postResultsToGithub() {
    // post back to Github
    echo 'postResultsToGithub'
    stage('Post results to Github') {
        currentBuild.result = currentBuild.result?: 'SUCCESS'
        step([
            $class: 'GitHubCommitStatusSetter',
            errorHandlers: [
                [$class: 'ShallowAnyErrorHandler']
            ],
            statusResultSource: [
                $class: 'ConditionalStatusResultSource',
                results: [
                    [$class: 'BetterThanOrEqualBuildResult', result: 'SUCCESS', state: 'SUCCESS', message: currentBuild.description],
                    [$class: 'BetterThanOrEqualBuildResult', result: 'FAILURE', state: 'FAILURE', message: currentBuild.description],
                    [$class: 'AnyBuildResult', state: 'FAILURE', message: 'The state of the build could not be determined!']
                ]
            ]
        ])
    }
}

/**
 * post the test results
 */
def collectTestResults() {
    stage('Collect Test Results') { junit '*xunit.xml,**/test-result*.xml' }
}

def coverageNotifications(coverageDir, threshold = 70) {
	def coverageExists = fileExists "${coverageDir}/coverage-summary.json"
	if (coverageExists) {
		def summary = readJSON file: "${coverageDir}/coverage-summary.json"
		if (summary && summary['total']) {
            currentBuild.result = currentBuild?.result ?: 'SUCCESS'
            currentBuild.result = (summary?.total?.lines?.pct ?: 0) < threshold ? 'Unstable' : currentBuild.result
            currentBuild.result = (summary?.total?.statements?.pct ?: 0) < threshold ? 'Unstable' : currentBuild.result
            currentBuild.result = (summary?.total?.functions?.pct ?: 0) < threshold ? 'Unstable' : currentBuild.result
            currentBuild.result = (summary?.total?.branches?.pct ?: 0) < threshold ? 'Unstable' : currentBuild.result
		}
	}
}


/**
 * post the code coverage results - only done in HTML format since cobertura plugin is not yet supported in pipelines
 */
def collectCoverageResults() {
    stage('Collect Coverage Results') {
        publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'linuxunitcoverage', reportFiles: 'index.html', reportName: 'Linux Unit Test Coverage Report'])
        // publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: true, reportDir: 'linuxintegrationcoverage', reportFiles: 'index.html', reportName: 'Linux Integration Test Coverage Report'])
        // publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'windowsunitcoverage', reportFiles: 'index.html', reportName: 'Windows Unit Test Coverage Report'])
        // publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'integration-coverage', reportFiles: 'index.html', reportName: 'Windows Integration Test Coverage Report'])
        // publishHTML([allowMissing: true, alwaysLinkToLastBuild: false, keepAll: true, reportDir: 'teamcoverage', reportFiles: 'index.html', reportName: 'Code Coverage by Team (Integration)'])

        echo 'Publish Coverage Notifications for entire project'
        coverageNotifications('./linuxunitcoverage', 60)

        // by team coverage health
        // def teamSummaryFiles = findFiles glob: 'teamcoverage/**/coverage-summary.json'
        // for (int i = 0; i < teamSummaryFiles.length; i++) {
        //     def teamSummaryFile = new File(teamSummaryFiles[i].path)
        //     echo "Publish Coverage Notifications for team ${teamSummaryFile.getParent()}"
        //     coverageNotifications(teamSummaryFile.getParent())
        // }
    }
}

/**
 * post checkstyle results
 */
def collectCheckstyleResults() {
    // post checkstyle results
    stage('Collect Checkstyle results') {
        step([$class: 'CheckStylePublisher', canComputeNew: false, canRunOnFailed: true, defaultEncoding: '', healthy: '', pattern: '*checkstyle.xml', unHealthy: '95'])
    }
}

/**
* Remove contents of node_modules directory in the workspace
* Needs to be run only on Jenkins Master (assuming Linux)
*/
def cleanupNodeModules() {
    dir('node_modules') {
        treeResults = sh returnStdout: true, script: 'find .'
        sh 'rm -fr .bin'
        sh 'rm -fr *'
        writeFile encoding: 'utf8', file: 'node_dir_tree.txt', text: treeResults
    }
}

/**
 * Create a node execution to be used with parallel function
 */
def createNodeExecution(PLATFORM os, String nodeLabel, String nodeResultsName) {
    return {
        node (nodeLabel) {
            deleteDir()

            checkout scm
            runCommands(os, nodeResultsName)
        }
    }
}

def teamsWithFailedTests = [:]
def shouldCollectResults = true

try {
    // loadProperties(env.TEST_PROPERTIES_BRANCH_OVERRIDE ?: env.CHANGE_TARGET ?: env.BRANCH_NAME)
    currentBuild.result = "SUCCESS"

    // Get all nodes (master & slave)
    def computers = Jenkins.getInstance().getComputers()
    // Map to save the node execution commands. Will be passed to the parallel function
    def nodes = [:]
    // An array to save the nodes map keys to be used to unstash build results later.
    // Cannot just use nodes.keySet because of a bug with .each loops in Pipeline.
    def nodeNames = new String[computers.length]
    // There's a known foreach bug in Pipeline CPS-transformed code, so we use C-style loop here.
    for (int i = 0; i < computers.length; i++) {
        // Make sure the node is online
        if (!computers[i].isOffline()) {
            def props = computers[i].getSystemProperties()
            def osname = props['os.name']

            if (osname.contains('Linux')) {
                nodeNames[i] = "${PLATFORM.LINUX}-test-results".toString()
                nodes[nodeNames[i]] = createNodeExecution(PLATFORM.LINUX, 'linux', nodeNames[i])
            } 
        }
    }

    parallel nodes

    stage('Collect results') {
        node() {
            if (shouldCollectResults) {
                // There's a known foreach bug in Pipeline CPS-transformed, so we use C-style loop here.
                for (int i = 0; i < nodeNames.length; i++) {
                    if (nodeNames[i] != null) {
                        unstash nodeNames[i]
                    }
                }
                // def moduleMap = readJSON file: './src/test/moduleOwner.json'

                // def checkStyleFiles = findFiles glob: '*checkstyle.xml'

                // for (int f= 0; f < checkStyleFiles.size(); f++) {
                //     echo "Processing checkstyle result file ${checkStyleFiles[f].path}"
                //     checkstyleText = readFile encoding: 'utf8', file: checkStyleFiles[f].path
                //     groovy.util.Node checkstyle = new XmlParser().parseText(checkstyleText)
                //     teamsWithFailedTests = mapCheckstyleFailuresToTeam(checkstyle, "${env.WORKSPACE}/src", moduleMap, teamsWithFailedTests)
                // }

                // def xunitFiles = findFiles glob: '*xunit.xml'

                // for (int f= 0; f < xunitFiles.size(); f++) {
                //     echo "Processing test result file ${xunitFiles[f].path}"
                //     xunitText = readFile encoding: 'utf8', file: xunitFiles[f].path
                //     groovy.util.Node testsuite = new XmlParser().parseText(xunitText)
                //     teamsWithFailedTests = mapTestFailuresToTeam(testsuite, "${env.WORKSPACE}/src", moduleMap, teamsWithFailedTests)
                // }

                // def packageJson = loadPackageJson('package.json')
                // saveTestFailures(toJson(teamsWithTestFailuresToArray(teamsWithFailedTests)), 'testFailures.json', packageJson['version'] ?: 'unknown')

                // withCredentials([usernamePassword(credentialsId: 'GUS_UNAME_PASSWORD', passwordVariable: 'gusUserPassword', usernameVariable: 'gusUsername')]) {
                //     if ((env.DO_NOT_CREATE_BUGS ?: 'false') == 'false') { // be able to stop the bug creation process if needed
                //         echo 'creating bugs'
                //         def params = []
                //         if (env.NPM_PUBLIC_PROXY != null) {
                //             params = ["https_proxy=${env.NPM_PUBLIC_PROXY}", "proxy=${env.NPM_PUBLIC_PROXY}"]
                //         }
           		// 		withEnv(params) {
           		// 		    // Only create test failure bugs for base branches
                //             if (!(env.BRANCH_NAME?:'').matches(/^PR-[0-9]{1,10}/)) {
                //                 echo 'creating bugs in branch'
                //                 createTestFailureBugs('Platform - DX', 'sfdx.cli', gusUsername, gusUserPassword, 'testFailures.json')
                //             }
                //         }
                //     }
                // }

                collectTestResults()
                collectCheckstyleResults()
                collectCoverageResults()
            }
            postResultsToGithub()
            cleanupNodeModules()
        }
    }
} finally {
    stage('Send email') {
        node() {
            sendEmails(null, teamsWithFailedTests)
        }
    }
}
