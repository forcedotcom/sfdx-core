# Migrating `@salesforce/core` from v7 to v8

v8 contains the types that used to be in `@salesforce/schemas`, for SfProject/SfProjectJson.

The schemas types are more accurate about the PackageDir type (what `sfdx-project.json` packageDirectories is an array of). It is a union type of

1. simply `path`, with an optional default property
1. 1, along with the `package` property and lots of optional properties used for packaging.

To support differentiating between the two structures, 2 type guards are now importable:

1. isPackagingDirectory
1. isNamedPackagingDirectory
