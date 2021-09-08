# forceOpenUrl

Specifies the web page that opens in your browser when you run force:org:open. For example, to open Lightning Experience, set to lightning.

# forceShowSpinner

Set to true to show a spinner animation on the command line when running asynchronous CLI commands. Default is false.

# forceSpinnerDelay

Specifies the speed of the spinner in milliseconds. Default is 60.

# httpProxy

Set this variable to your http proxy server if behind a corporate firewall

# httpsProxy

Set this variable to your https proxy server if behind a corporate firewall

# nodeExtraCaCerts

Installs your self-signed certificate. Indicate the fully qualified path to the certificate file name. Then run sfdx update.

# nodeTlsRejectUnauthorized

Indicate 0 to allow Node.js to use the self-signed certificate in the certificate chain.

# sfdxAccessToken

Specifies an access token when using the auth:accesstoken:store command.

# sfdxApiVersion

The API version for a specific project or all projects.

# sfdxAudienceUrl

Overrides the aud (audience) field used for JWT authentication so that it matches the expected value of the authorization server URL for the org you’re logging into.

# sfdxCodeCoverageRequirement

Specifies the code coverage percentages that are displayed in green when you run force:apex:test:run or force:apex:test:report with the --codecoverage parameter.

# sfdxContentType

When set to JSON, specifies that all CLI commands output results in JSON format.

# sfdxDefaultdevhubusername

Specifies the username of your default Dev Hub org so you don’t have to use the --targetdevhubusername CLI parameter. Overrides the value of the defaultdevhubusername runtime configuration value.

# sfdxDefaultusername

Specifies the username of your default org so you don’t have to use the --targetusername CLI parameter. Overrides the value of the defaultusername runtime configuration value.

# sfdxDisableAutoupdate

Set to true to disable the auto-update feature of the CLI.

# sfdxAutoupdateDisable

Set to true to disable the auto-update feature of the CLI.

# sfdxDisableSourceMemberPolling

Set to true to disable polling of your org’s SourceMember object when you run the force:source:push|pull commands.

# sfdxDisableTelemetry

Set to true to disable the CLI from collecting usage information, user environment information, and crash reports.

# sfdxDnsTimeout

Specifies the number of seconds that the force:org:\* commands wait for a response when checking whether an org is connected. If the commands don’t receive a response in that time, they time out. Default value is 3.

# sfdxDomainRetry

Specifies the time, in seconds, that the CLI waits for the Lightning Experience custom domain to resolve and become available in a newly created scratch org.

# sfdxImprovedCodeCoverage

Scopes Apex test results to the classes entered during a test run when running force:apex:test:run and force:apex:test:report. Set to true to improve code coverage.

# sfdxInstanceUrl

The URL of the Salesforce instance that is hosting your org.

# sfdxJsonToStdout

Sends messages when Salesforce CLI commands fail to stdout instead of stderr.

# sfdxLogLevel

Sets the level of messages that the CLI writes to the log file.

# sfdxMaxQueryLimit

The maximum number of Salesforce records returned by a CLI command. Default value is 10,000.

# sfdxMdapiTempDir

Places the files (in metadata format) in the specified directory when you run some CLI commands, such as force:source:<name>.

# sfdxNpmRegistry

Sets the URL to a private npm server, where all packages that you publish are private.

# sfdxPrecompileEnable

Set to true to enable Apex pre-compile before the tests are run. Default is false.

# sfdxProjectAutoupdateDisableForPackageCreate

For force:package:create, disables automatic updates to the sfdx-project.json file.

# sfdxProjectAutoupdateDisableForPackageVersionCreate

For force:package:version:create, disables automatic updates to the sfdx-project.json file.

# sfdxRestDeploy

Set to true to make Salesforce CLI use the Metadata REST API for deployments. By default, the CLI uses SOAP.

# sfdxSourceMemberPollingTimeout

Set to the number of seconds you want the force:source:push command to keep polling the SourceMember object before the command times out.

# sfdxUseGenericUnixKeychain

(Linux and macOS only) Set to true if you want to use the generic UNIX keychain instead of the Linux libsecret library or macOS keychain.

# sfdxUseProgressBar

For force:mdapi:deploy, force:source:deploy, and force:source:push, set to false to disable the progress bar.

# sfTargetOrg

Specifies the username of your default target org you don’t have to use the --target-org CLI parameter. Overrides the value of the target-org runtime configuration value.

# sfTargetDevHub

Specifies the username of your default Dev Hub org so you don’t have to use the --target-dev-hub CLI parameter. Overrides the value of the target-dev-hub runtime configuration value.

# sfAccessToken

Specifies an access token when using the login accesstoken command.

# sfApiVersion

The API version for a specific environment or all environments.

# sfAudienceUrl

Overrides the aud (audience) field used for JWT authentication so that it matches the expected value of the authorization server URL for the org you’re logging into.

# sfCodeCoverageRequirement

Specifies the code coverage percentages that are displayed in green when you run force:apex:test:run or force:apex:test:report with the --codecoverage parameter.

# sfContentType

When set to JSON, specifies that all CLI commands output results in JSON format.

# sfDisableAutoupdate

Set to true to disable the auto-update feature of the CLI.

# sfAutoupdateDisable

Set to true to disable the auto-update feature of the CLI.

# sfDisableSourceMemberPolling

Set to true to disable polling of your org’s SourceMember object when you run the force:source:push|pull commands.

# sfDisableTelemetry

Set to true to disable the CLI from collecting usage information, user environment information, and crash reports.

# sfDnsTimeout

Specifies the number of seconds that the force:org:\* commands wait for a response when checking whether an org is connected. If the commands don’t receive a response in that time, they time out. Default value is 3.

# sfDomainRetry

Specifies the time, in seconds, that the CLI waits for the Lightning Experience custom domain to resolve and become available in a newly created scratch org.

# sfImprovedCodeCoverage

Specifies the time, in seconds, that the CLI waits for the Lightning Experience custom domain to resolve and become available in a newly created scratch org.

# sfInstanceUrl

The URL of the Salesforce instance that is hosting your org.

# sfJsonToStdout

Sends messages when Salesforce CLI commands fail to stdout instead of stderr.

# sfLogLevel

Sets the level of messages that the CLI writes to the log file.

# sfMaxQueryLimit

The maximum number of Salesforce records returned by a CLI command. Default value is 10,000.

# sfMdapiTempDir

Places the files (in metadata format) in the specified directory when you run some CLI commands, such as force:source:<name>.

# sfNpmRegistry

Sets the URL to a private npm server, where all packages that you publish are private.

# sfPrecompileEnable

Set to true to enable Apex pre-compile before the tests are run. Default is false.

# sfProjectAutoupdateDisableForPackageCreate

For force:package:create, disables automatic updates to the sfdx-project.json file.

# sfProjectAutoupdateDisableForPackageVersionCreate

For force:package:create, disables automatic updates to the sfdx-project.json file.

# sfSourceMemberPollingTimeout

Set to the number of seconds you want the force:source:push command to keep polling the SourceMember object before the command times out.

# sfUseGenericUnixKeychain

(Linux and macOS only) Set to true if you want to use the generic UNIX keychain instead of the Linux libsecret library or macOS keychain.

# sfUseProgressBar

For force:mdapi:deploy, force:source:deploy, and force:source:push, set to false to disable the progress bar.
