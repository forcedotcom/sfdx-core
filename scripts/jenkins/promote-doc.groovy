library identifier: 'salesforcedx-library'

node {
    withProxy() {
        withHome() {
            stage('checkout') {
                deleteDir()
                checkout scm
            }

            stage('install') {
                sh 'yarn'
            }

            stage('promote doc') {
                withEnv([
                ]) {
                    sh "node_modules/.bin/ts-node scripts/publishDocs.ts"
                }
            }
        }
    }
}