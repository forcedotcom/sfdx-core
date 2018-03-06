library identifier: 'salesforcedx-library'

node {
    withProxy() {
        withHome() {
            stage('validate') {
                if (!env.releaseType) {
                    error "The release type is not set."
                }
            }

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

                println("endPointUrlEnvName: ${endPointUrlEnvName} : ${env[endPointUrlEnvName]}")
                println("bucketEnvName: ${bucketEnvName} : ${env[bucketEnvName]}")
                println("credentialsIdEnvName: ${credentialsIdEnvName} : ${env[credentialsIdEnvName]}")
                println("regionEnvName: ${regionEnvName} : ${env[regionEnvName]}")

                withAWS(region: env[regionEnvName], endpointUrl: env[endPointUrlEnvName], credentials: env[credentialsIdEnvName]) {
                    s3Upload(pathStyleAccessEnabled: true, file: 'docs', bucket: env[bucketEnvName], path: 'media/salesforce-cli/docs')
                }
            }
        }
    }
}