library identifier: 'salesforcedx-library'

node {
    withProxy() {
        withHome() {

            final String endPointUrlEnvName
            final String bucketEnvName
            final String credentialsIdEnvName
            final String regionEnvName

            stage('validate') {
                if (!env.releaseType) {
                    error "The release type is not set."
                }

                endPointUrlEnvName = "__S3_${env.releaseType}_ENDPOINT_URL".toString()
                bucketEnvName = "__S3_${env.releaseType}_BUCKET".toString()
                credentialsIdEnvName = "__S3_${env.releaseType}_CREDENTIALS_ID".toString()
                regionEnvName = "__S3_${env.releaseType}_REGION".toString()

                if (!env[endPointUrlEnvName]) {
                    error "Missing aws endpoint url"
                }

                if (!env[bucketEnvName]) {
                    error("Missing aws bucket")
                }

                if (!env[credentialsIdEnvName]) {
                    error("Missing aws credentials")
                }

                debug "endPointUrlEnvName: ${endPointUrlEnvName} : ${env[endPointUrlEnvName]}"
                debug("bucketEnvName: ${bucketEnvName} : ${env[bucketEnvName]}")
                debug("credentialsIdEnvName: ${credentialsIdEnvName} : ${env[credentialsIdEnvName]}")
                debug("regionEnvName: ${regionEnvName} : ${env[regionEnvName]}")
            }

            stage('checkout') {
                deleteDir()
                checkout scm
            }

            def packageDotJson
            stage('install') {
                sh 'yarn'
                packageDotJson = loadPackageJson('package.json')
                if (!packageDotJson) {
                    error 'Failed to find package.json file for project'
                }
            }

            stage('promote doc') {
                withAWS(region: env[regionEnvName], endpointUrl: env[endPointUrlEnvName], credentials: env[credentialsIdEnvName]) {
                    s3Upload(pathStyleAccessEnabled: true, file: 'docs', bucket: env[bucketEnvName], path: env.targetS3Path)
                }
            }

            stage('Upload latest redirect object') {
                final String filePath = "docs/${packageDotJson.name}/latest".toString()
                debug "filePath: ${filePath}"
                sh "touch ${filePath}"

                final String targetPath = "${env.targetS3Path}/${packageDotJson.name}/latest".toString()
                debug "targetPath: ${targetPath}"

                final String redirectPath = "${env.targetS3Path}/${packageDotJson.name}/${packageDotJson.version}".toString()
                debug "targetPath: ${targetPath}"

                withAWS(region: env[regionEnvName], endpointUrl: env[endPointUrlEnvName], credentials: env[credentialsIdEnvName]) {
                    s3Upload(bucket:env[bucketEnvName], file:filePath, path: targetPath, metadatas:["x-amz-website-redirect-location:${redirectPath}"])
                }
            }
        }
    }
}