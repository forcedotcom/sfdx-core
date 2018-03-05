library identifier: 'salesforcedx-library'

node {
    withProxy() {
        withHome() {
            stage('install') {
                sh 'yarn .'
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
