# forceOpenUrl

Web page that opens in your browser when you connect to an org. For example, to open Lightning Experience, set to "lightning".

# forceShowSpinner

Set to true to show a spinner animation on the command line when running asynchronous CLI commands. Default is false.

# forceSpinnerDelay

Speed of the spinner in milliseconds. Default is 60.

# httpProxy

HTTP URL and port of the proxy server when using Salesforce CLI behind a corporate firewall or web proxy.

# httpsProxy

HTTPS URL and port of the proxy server when using Salesforce CLI behind a corporate firewall or web proxy.

# nodeExtraCaCerts

Fully qualified path to your self-signed certificate. Will be installed after you run "sfdx update".

# nodeTlsRejectUnauthorized

Set to 0 to allow Node.js to use the self-signed certificate in the certificate chain.

# sfdxAccessToken

Specifies an access token when using the auth:accesstoken:store command.

# sfdxApiVersion

The API version for a specific project or all projects. Default value is the API version of your Dev Hub. Overrides the apiVersion config value.

# sfdxAudienceUrl

URL that overrides the aud (audience) field used for JWT authentication so that it matches the expected value of the authorization server URL for the org you’re logging into.

# sfdxCodeCoverageRequirement

Code coverage percentages that are displayed in green when you run force:apex:test:\* with the --codecoverage parameter.

# sfdxContentType

Set to JSON so that all CLI commands output results in JSON format.

# sfdxDefaultdevhubusername

Username or alias of your default Dev Hub org. Overrides the defaultdevhubusername configuration value.

# sfdxDefaultusername

Username or alias of your default org. Overrides the defaultusername configuration value.

# sfdxDisableAutoupdate

Set to true to disable the auto-update feature of Salesforce CLI. Default value is false.

# sfdxAutoupdateDisable

Set to true to disable the auto-update feature of Salesforce CLI. Default value is false.

# sfdxDisableSourceMemberPolling

Set to true to disable polling of your org’s SourceMember object when you run the force:source:push|pull commands. Default value is false.

# sfdxDisableTelemetry

Set to true to disable Salesforce CLI from collecting usage information, user environment information, and crash reports. Default value is false. Overrides the disableTelemetry configration variable.

# sfdxDnsTimeout

Number of seconds that the force:org:\* commands wait for a response when checking whether an org is connected. Default value is 3.

# sfdxDomainRetry

Time, in seconds, that Salesforce CLI waits for the Lightning Experience custom domain to resolve and become available in a scratch org. Default value is 240.

# sfdxImprovedCodeCoverage

Set to true to scope Apex test results to the classes entered during a test run when running force:apex:test:\*.

# sfdxInstanceUrl

URL of the Salesforce instance that is hosting your org. Default value is https://login.salesforce.com. Overrides the instanceUrl configuration value.

# sfdxJsonToStdout

Set to true to send messages resulting from failed Salesforce CLI commands to stdout instead of stderr.

# sfdxDisableLogFile

Set to true to disable log file writing

# sfdxLogLevel

Level of messages that the CLI writes to the log file. Valid values are trace, debug, info, warn, error, fatal. Default value is warn.

# sfdxLogRotationCount

The default rotation period for logs. Example '1d' will rotate logs daily (at midnight).

# sfdxLogRotationPeriod

The number of backup rotated log files to keep. Example: '3' will have the base sf.log file, and the past 3 (period) log files.

# sfdxMaxQueryLimit

Maximum number of Salesforce records returned by a CLI command. Default value is 10,000. Overrides the maxQueryLimit configuration value.

# sfdxMdapiTempDir

Directory that contains files (in metadata format) when running certain Salesforce CLI commands, such as force:source:\*.

# sfdxNpmRegistry

URL to a private npm server, where all packages that you publish are private.

# sfdxPrecompileEnable

Set to true to enable Apex pre-compile before the tests are run with the force:apex:test:run command. Default is false.

# sfdxProjectAutoupdateDisableForPackageCreate

Set to true to disable automatic updates to sfdx-project.json when running force:package:create.

# sfdxProjectAutoupdateDisableForPackageVersionCreate

Set to true to disable automatic updates to sfdx-project.json when running force:package:version:create.

# sfdxRestDeploy

Set to true to make Salesforce CLI use the Metadata REST API for deployments. By default, the CLI uses SOAP.

# sfdxSourceMemberPollingTimeout

Number of seconds you want the force:source:push command to keep polling the SourceMember object before the command times out.

# sfdxUseGenericUnixKeychain

(Linux and macOS only) Set to true if you want to use the generic UNIX keychain instead of the Linux libsecret library or macOS keychain.

# sfdxUseProgressBar

Set to false to disable the progress bar when running force:mdapi:deploy, force:source:deploy, or force:source:push.

# sfdxLazyLoadModules

Set to true to enable lazy loading of sfdx modules

# sfdxS3Host

URL to S3 host

# sfdxUpdateInstructions

Text that describes how to update sfdx

# sfdxInstaller

Boolean indicating that the installer is running

# sfdxEnv

Describes if sfdx is in "demo" mode

# sfTargetOrg

Username or alias of your default org. Overrides the target-org configuration variable.

# sfTargetDevHub

Username or alias of your default Dev Hub org. Overrides the target-dev-hub configuration variable.

# sfAccessToken

Specifies an access token when using a login command that uses access tokens.

# sfOrgApiVersion

API version for a specific project or all projects. Default value is the API version of your Dev Hub. Overrides the apiVersion configuration variable.

# sfAudienceUrl

URL that overrides the aud (audience) field used for JWT authentication so that it matches the expected value of the authorization server URL for the org you’re logging into.

# sfCodeCoverageRequirement

Code coverage percentages that are displayed in green when you run the Apex test CLIcommands with the --code-coverage flag.

# sfContentType

Set to JSON so that all CLI commands output results in JSON format.

# sfDisableAutoupdate

Set to true to disable the auto-update feature of Salesforce CLI. Default value is false.

# sfAutoupdateDisable

Set to true to disable the auto-update feature of Salesforce CLI. Default value is false.

# sfDisableSourceMemberPolling

Set to true to disable polling of your org’s SourceMember object when you run the commands to push and pull source. Default value is false.

# sfDisableTelemetry

Set to true to disable Salesforce CLI from collecting usage information, user environment information, and crash reports. Default value is false. Overrides the disableTelemetry configration variable.

# sfDnsTimeout

Number of seconds that the env commands wait for a response when checking whether an org is connected. Default value is 3.

# sfDomainRetry

Time, in seconds, that Salesforce CLI waits for the Lightning Experience custom domain to resolve and become available in a scratch org. Default value is 240.

# sfImprovedCodeCoverage

Set to true to scope Apex test results to the classes entered during a test run when running the Apex test commands.

# sfOrgInstanceUrl

URL of the Salesforce instance that is hosting your org. Default value is https://login.salesforce.com. Overrides the instanceUrl configuration variable.

# sfJsonToStdout

Set to true to send messages resulting from failed Salesforce CLI commands to stdout instead of stderr.

# sfDisableLogFile

Set to true to disable log file writing

# sfLogLevel

Level of messages that the CLI writes to the log file. Valid values are trace, debug, info, warn, error, fatal. Default value is warn.

# sfLogRotationCount

The default rotation period for logs. Example '1d' will rotate logs daily (at midnight).

# sfLogRotationPeriod

The number of backup rotated log files to keep. Example: '3' will have the base sf.log file, and the past 3 (period) log files.

# sfOrgMaxQueryLimit

Maximum number of Salesforce records returned by a CLI command. Default value is 10,000. Overrides the maxQueryLimit configuration variable.

# sfMdapiTempDir

Directory that contains files (in metadata format) when running certain Salesforce CLI commands.

# sfNpmRegistry

URL to a private npm server, where all packages that you publish are private.

# sfPrecompileEnable

Set to true to enable Apex pre-compile before the tests are run with the Apex test run command. Default is false.

# sfProjectAutoupdateDisableForPackageCreate

Set to true to disable automatic updates to sfdx-project.json when running the package create command.

# sfProjectAutoupdateDisableForPackageVersionCreate

Set to true to disable automatic updates to sfdx-project.json when running the package version create command.

# sfSourceMemberPollingTimeout

Number of seconds you want the source push command to keep polling the SourceMember object before the command times out.

# sfUseGenericUnixKeychain

(Linux and macOS only) Set to true if you want to use the generic UNIX keychain instead of the Linux libsecret library or macOS keychain.

# sfUseProgressBar

Set to false to disable the progress bar when running the metadata deploy command.

# sfLazyLoadModules

Set to true to enable lazy loading of sf modules

# sfS3Host

URL to S3 host

# sfUpdateInstructions

Text that describes how to update sf

# sfInstaller

Boolean indicating that the installer is running

# sfEnv

Describes if sf is in "demo" mode

# deprecatedEnv

Deprecated environment variable: %s. Please use %s instead.

# deprecatedEnvDisagreement

Deprecated environment variable: %s. Please use %s instead.

Your environment has both variables populated, and with different values. The value from %s will be used.

# sfCapitalizeRecordTypes

Whether record types are capitalized on scratch org creation.
