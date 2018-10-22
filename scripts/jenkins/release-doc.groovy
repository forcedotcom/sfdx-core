/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
library identifier: 'salesforcedx-library'

final String htmlRedirectTemplate =
"""<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <title>SFDX Developer Documentation Redirect</title>
    <meta http-equiv="refresh" content="0;URL='./%%packageVersion%%/index.html'"/>
    </head>
    <body/>
</html>""".toString();

node {
    withProxy() {
        withHome() {

            final String endPointUrlEnvName
            final String bucketEnvName
            final String credentialsIdEnvName
            final String regionEnvName

            stage("validate") {
                if (!env.releaseType) {
                    error "The release type is not set."
                }

                loadProperties()

                endPointUrlEnvName = "S3_${env.releaseType}_ENDPOINT_URL".toString()
                bucketEnvName = "S3_${env.releaseType}_BUCKET".toString()
                credentialsIdEnvName = "S3_${env.releaseType}_CREDENTIALS_ID".toString()
                regionEnvName = "S3_${env.releaseType}_REGION".toString()

                if (!env[endPointUrlEnvName]) {
                    error "Missing aws endpoint url"
                }

                if (!env[bucketEnvName]) {
                    error("Missing aws bucket")
                }

                if (!env[credentialsIdEnvName]) {
                    error("Missing aws credentials")
                }

                debug("endPointUrlEnvName: ${endPointUrlEnvName} : ${env[endPointUrlEnvName]}")
                debug("bucketEnvName: ${bucketEnvName} : ${env[bucketEnvName]}")
                debug("credentialsIdEnvName: ${credentialsIdEnvName} : ${env[credentialsIdEnvName]}")
                debug("regionEnvName: ${regionEnvName} : ${env[regionEnvName]}")
            }

            stage("checkout") {
                deleteDir()
                checkout scm
            }

            def packageDotJson
            stage("install") {
                sh "npm install"
                sh "npm run build"
                packageDotJson = loadPackageJson("package.json")
                if (!packageDotJson) {
                    error "Failed to find package.json file for project"
                }
            }

            stage("promote doc") {

                final String filePath = "docs/${packageDotJson.name}/index.html".toString()
                sh "echo '${htmlRedirectTemplate.replace("%%packageVersion%%", packageDotJson.version)}' >> ${filePath}"
                sh "cat ${filePath}"

                withAWS(region: env[regionEnvName], endpointUrl: env[endPointUrlEnvName], credentials: env[credentialsIdEnvName]) {
                    s3Upload(pathStyleAccessEnabled: true, file: "docs", bucket: env[bucketEnvName], path: env.targetS3Path)
                }
            }
        }
    }
}