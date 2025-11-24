/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { z } from 'zod';
import { PackageDirSchema } from './packageDir';
import { RegistryPresetsSchema } from './registryPresets';
import { MetadataRegistrySchema } from './registryVariants';
import { ReplacementsSchema } from './replacements';
import { BundleEntrySchema } from './bundleEntry';

/**
 * The properties and shape of the SFDX project
 */
export const ProjectJsonSchema = z.strictObject({
  name: z.string().optional().describe('The name of your Salesforce project.'),
  packageDirectories: z
    .array(PackageDirSchema)
    .min(1)
    .meta({ title: 'Package Directories' })
    .describe(
      'Package directories indicate which directories to target when syncing source to and from the scratch org. These directories can contain source from your managed package, unmanaged package, or unpackaged source, for example, ant tool or change set.'
    ),
  namespace: z
    .string()
    .optional()
    .describe(
      "A namespace is an alphanumeric identifier that distinguishes your package and its contents from other packages in your customer's org. For steps on how to register a namespace and link it to your Dev Hub org, see Create and Register Your Namespace for Second-Generation Managed Packages on developer.salesforce.com. If you're creating an unlocked package, you can create it without a namespace."
    ),
  sourceApiVersion: z
    .string()
    .default('48.0')
    .optional()
    .meta({ title: 'Source API Version' })
    .describe('The API version that the source is compatible with. By default it matches the API version.'),
  sfdcLoginUrl: z
    .string()
    .optional()
    .meta({ title: 'SFDC Login URL' })
    .describe(
      'The login URL that the force:auth commands use. If not specified, the default is login.salesforce.com. Override the default value if you want users to authorize to a specific Salesforce instance. For example, if you want to authorize into a sandbox org, set this parameter to test.salesforce.com.'
    ),
  signupTargetLoginUrl: z
    .string()
    .optional()
    .describe(
      'The url that is used when creating new scratch orgs. This is typically only used for testing prerelease environments.'
    ),
  oauthLocalPort: z
    .number()
    .default(1717)
    .optional()
    .describe(
      'By default, the OAuth port is 1717. However, change this port if this port is already in use, and you plan to create a connected app in your Dev Hub org to support JWT-based authorization.'
    ),
  plugins: z
    .record(z.string(), z.unknown())
    .optional()
    .meta({ title: 'CLI Plugins custom settings' })
    .describe('Salesforce CLI plugin configurations used with this project.'),
  packageAliases: z
    .record(z.string(), z.string())
    .optional()
    .meta({ title: 'Aliases for packaging ids' })
    .describe(
      'The Salesforce CLI updates this file with the aliases when you create a package or package version. You can also manually update this section for existing packages or package versions. You can use the alias instead of the cryptic package ID when running CLI force:package commands.'
    ),
  packageBundles: z
    .array(BundleEntrySchema)
    .optional()
    .meta({ title: 'Package Bundles' })
    .describe('Package bundle entries for managing package bundles.'),
  packageBundleAliases: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional()
    .meta({ title: 'Package Bundle Aliases' })
    .describe('Aliases for package bundles.'),
  registryPresets: RegistryPresetsSchema.optional()
    .meta({ title: 'Custom predefined presets for decomposing metadata types' })
    .describe(
      '@deprecated use `sourceBehaviorOptions`. Filenames from https://github.com/forcedotcom/source-deploy-retrieve/tree/main/src/registry/presets'
    ),
  sourceBehaviorOptions: RegistryPresetsSchema.optional()
    .meta({ title: 'Custom predefined presets for decomposing metadata types' })
    .describe('Filenames from https://github.com/forcedotcom/source-deploy-retrieve/tree/main/src/registry/presets'),
  registryCustomizations: MetadataRegistrySchema.optional(),
  replacements: z
    .array(ReplacementsSchema)
    .optional()
    .meta({
      title: 'Replacements for metadata that are executed during deployments',
    })
    .describe('The Salesforce CLI will conditionally replace portions of your metadata during a deployment'),
  pushPackageDirectoriesSequentially: z
    .boolean()
    .optional()
    .describe(
      '@deprecated only works with deprecated commands. See https://github.com/forcedotcom/cli/discussions/2402'
    ),
});

export type ProjectJson = z.infer<typeof ProjectJsonSchema>;
