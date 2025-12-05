/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { z } from 'zod';

const PackageDirDependencySchema = z
  .object({
    package: z.string(),
    versionNumber: z.string().optional(),
    branch: z.string().optional(),
  })
  .catchall(z.unknown());

/** Base properties for all package directories */
const BasePackageDirPropsSchema = z.object({
  default: z
    .boolean()
    .default(true)
    .optional()
    .describe(
      'If you have specified more than one path, include this parameter for the default path to indicate which is the default package directory.'
    ),
  path: z
    .string()
    .meta({ title: 'Path' })
    .describe("If you don't specify a path, the Salesforce CLI uses a placeholder when you create a package."),
});

/** Package directory without package (simple) */
const BasePackageDirSchema = BasePackageDirPropsSchema;

/** Package directory with package (requires versionNumber) */
const PackagePackageDirSchema = BasePackageDirPropsSchema.extend({
  ancestorId: z
    .string()
    .optional()
    .meta({ title: 'Ancestor ID' })
    .describe(
      "The ancestor that's the immediate parent of the version that you're creating. The package version ID to supply starts with '05i'."
    ),
  ancestorVersion: z
    .string()
    .optional()
    .meta({ title: 'Ancestor Version' })
    .describe(
      "The ancestor that's the immediate parent of the version that you're creating. The ancestor version uses the format major.minor.patch.build."
    ),
  apexTestAccess: z
    .object({
      permissionSets: z
        .union([z.array(z.string()), z.string()])
        .meta({ title: 'Permission Sets' })
        .describe('The list of permission sets to enable while running Apex tests'),
      permissionSetLicenses: z
        .union([z.array(z.string()), z.string()])
        .meta({ title: 'Permission Set Licenses' })
        .describe('The list of permission sets licenses to enable while running Apex tests'),
    })
    .optional()
    .describe('Additional access that should be granted to the user when running package Apex tests'),
  definitionFile: z
    .string()
    .optional()
    .meta({ title: 'Definition File' })
    .describe(
      'Reference an external .json file to specify the features and org preferences required for the metadata of your package, such as the scratch org definition.'
    ),
  dependencies: z
    .array(PackageDirDependencySchema)
    .optional()
    .describe(
      'To specify dependencies for 2GP within the same Dev Hub, use either the package version alias or a combination of the package name and the version number.'
    ),
  includeProfileUserLicenses: z
    .boolean()
    .default(false)
    .optional()
    .meta({ title: 'Include Profile User Licenses' })
    .describe('Whether to include <userLicense> elements in profile metadata. Defaults to false.'),
  package: z
    .string()
    .meta({ title: 'Package Identifier' })
    .describe('The package name you specified when creating the package.'),
  packageMetadataAccess: z
    .object({
      permissionSets: z
        .union([z.string(), z.array(z.string())])
        .meta({ title: 'Permission Sets' })
        .describe('The list of permission sets to enable while deploying package metadata'),
      permissionSetLicenses: z
        .union([z.string(), z.array(z.string())])
        .meta({ title: 'Permission Set Licenses' })
        .describe('The list of permission set licenses to enable while deploying package metadata'),
    })
    .optional()
    .meta({ title: 'Package Metadata Access' })
    .describe(
      'Additional access that should be granted to the user while deploying package metadata, available in Salesforce API version 61.0 and above'
    ),
  postInstallScript: z.string().optional().meta({ title: 'Post Install Script' }).describe('The post install script.'),
  postInstallUrl: z.string().optional().meta({ title: 'Post Install Url' }).describe('The post install url.'),
  releaseNotesUrl: z.string().optional().meta({ title: 'Release Notes Url' }).describe('The release notes url.'),
  scopeProfiles: z
    .boolean()
    .default(false)
    .optional()
    .meta({ title: 'Scope Profiles' })
    .describe(
      'Determines whether to include profile settings from only the directory being packaged (true), or whether to include profile settings from all package directories (false). If not specified, the default is false.'
    ),
  uninstallScript: z.string().optional().meta({ title: 'Uninstall Script' }).describe('The uninstall script.'),
  calculateTransitiveDependencies: z
    .boolean()
    .default(false)
    .optional()
    .meta({ title: 'Calculate Transitive Dependencies' })
    .describe(
      'Set to true if only specifing direct package dependencies and the transitive (i.e., indirect) dependencies should be calculated by Salesforce.'
    ),
  versionDescription: z
    .string()
    .optional()
    .meta({ title: 'Version Description' })
    .describe('Human readable version information, format not specified.'),
  versionName: z
    .string()
    .optional()
    .meta({ title: 'Version Name' })
    .describe('If not specified, the CLI uses versionNumber as the version name.'),
  versionNumber: z
    .string()
    .meta({ title: 'Version Number' })
    .describe(
      'Version numbers are formatted as major.minor.patch.build. For example, 1.2.1.8. Required when package is specified.'
    ),
  unpackagedMetadata: z
    .object({
      path: z
        .string()
        .meta({ title: 'Path' })
        .describe('The path name of the package directory containing the unpackaged metadata'),
    })
    .optional()
    .meta({ title: 'Unpackaged Metadata' })
    .describe('Metadata not meant to be packaged, but deployed when testing packaged metadata'),
  seedMetadata: z
    .object({
      path: z
        .string()
        .meta({ title: 'Path' })
        .describe('The path name of the package directory containing the seed metadata'),
    })
    .optional()
    .meta({ title: 'Seed Metadata' })
    .describe('Metadata not meant to be packaged, but deployed before deploying packaged metadata'),
  functions: z.array(z.string()).optional().describe('@deprecated'),
});

// Use union with strict schemas to generate proper JSON Schema anyOf
// Base schema has only path+default, Package schema has all package fields
// This generates JSON Schema with proper required fields and additionalProperties: false
export const PackageDirSchema = z.union([BasePackageDirSchema.strict(), PackagePackageDirSchema.strict()]);

export type PackagePackageDir = z.infer<typeof PackagePackageDirSchema>;
export type PackageDir = z.infer<typeof PackageDirSchema>;
