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

                String endPointUrlEnvName = "S3_${env.releaseType}_ENDPOINT_URL"
                String bucketEnvName = "S3_${env.releaseType}_BUCKET"
                String credentialsIdEnvName = "S3_${env.releaseType}_CREDENTIALS_ID"
                String regionEnvName = "S3_${env.releaseType}_REGION"

                withAws(region: regionEnvName, endpointUrl: endPointUrlEnvName, credentials: credentialsIdEnvName) {
                    s3Upload(pathStyleAccessEnabled: true, pathfile: 'docs', bucket: bucketEnvName, path: 'media/salesforce-cli/docs')
                }
            }
        }
    }
}