library identifier: 'salesforcedx-library'

node {
    stage('promote doc') {
        withEnv([
        ]) {
            sh "../node_modules/.bin/ts-node ../scripts/publishDocs.ts"
        }
    }
}
