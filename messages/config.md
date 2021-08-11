# unknownConfigKey

Unknown config name: %s.

# deprecatedConfigKey

Deprecated config name: %s. Please use %s instead.

# invalidWrite

The writeSync method is not allowed on SfdxConfig. Use the async write method instead.

# invalidConfigValue

Invalid config value: %s.

# invalidInstanceUrl

Specify a valid Salesforce instance URL.

# invalidApiVersion

Specify a valid Salesforce API version, for example, 42.0.

# invalidIsvDebuggerSid

Specify a valid Debugger SID.

# invalidIsvDebuggerUrl

Specify a valid Debugger URL.

# invalidNumberConfigValue

Specify a valid positive integer, for example, 150000.

# invalidBooleanConfigValue

The config value can only be set to true or false.

# invalidProjectWorkspace

This directory does not contain a valid Salesforce DX project.

# schemaValidationError

The config file "%s" is not schema valid.
Due to: %s

# schemaValidationError.actions

- Fix the invalid entries at %s.

# missingDefaultPath

In sfdx-project.json, be sure to specify which package directory (path) is the default. Example: `[{ "path": "packageDirectory1", "default": true }, { "path": "packageDirectory2" }]`

# missingPackageDirectory

The path "%s", specified in sfdx-project.json, does not exist. Be sure this directory is included in your project root.

# invalidPackageDirectory

The path "%s", specified in sfdx-project.json, must be indicated as a relative path to the project root.

# multipleDefaultPaths

In sfdx-project.json, indicate only one package directory (path) as the default.

# singleNonDefaultPackage

The sfdx-project.json file must include one, and only one, default package directory (path). Because your sfdx-project.json file contains only one package directory, it must be the default. Remove the `"default": false` key and try again.
