library identifier: 'salesforcedx-library'

node {
    withProxy() {
        withHome() {

            String endPointUrlEnvName
            String bucketEnvName
            String credentialsIdEnvName
            String regionEnvName

            stage('validate') {
                if (!env.releaseType) {
                    error "The release type is not set."
                }

                endPointUrlEnvName = "__S3_${env.releaseType}_ENDPOINT_URL"
                bucketEnvName = "__S3_${env.releaseType}_BUCKET"
                credentialsIdEnvName = "__S3_${env.releaseType}_CREDENTIALS_ID"
                regionEnvName = "__S3_${env.releaseType}_REGION"

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

            def packageDotJson;
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
                def path = "docs/${packageDotJson.name}/latest"
                debug "path ${path}"
                // create an empty file the we will assign redirect metadata to.
                sh "touch ${path}"

                def targetPath = "${env.targetS3Path}/${path}"
                debug "targetPath ${targetPath}"

                def latestTargetPath = "${env.targetS3Path}/docs/${packageDotJson.name}/${packageDotJson.version}"
                debug "latestTargetPath: ${latestTargetPath}"

                withAWS(region: env[regionEnvName], endpointUrl: env[endPointUrlEnvName], credentials: env[credentialsIdEnvName]) {
                    s3Upload(bucket:env[bucketEnvName], file:path, path: targetPath, metadatas:["x-amz-website-redirect-location:${latestTargetPath}"])
                }
            }
        }
    }
}