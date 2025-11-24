/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { z } from 'zod';
import { FeaturesSchema } from './features';
import { SettingsSchema } from './settings';

/**
 * Scratch Org Definition Configuration
 * The scratch org definition file contains the configuration values that determine the shape of the scratch org.
 */
export const ScratchOrgDefSchema = z
  .object({
    orgName: z.string().optional().describe('The name of the scratch org.').meta({ title: 'Organization Name' }),
    edition: z
      .enum([
        'Developer',
        'Enterprise',
        'Group',
        'Partner Developer',
        'Partner Enterprise',
        'Partner Group',
        'Partner Professional',
        'Professional',
      ])
      .describe('The Salesforce edition of the scratch org.'),
    country: z
      .string()
      .max(2)
      .optional()
      .describe(
        "Dev Hub's country. If you want to override this value, enter the two-character, upper-case ISO-3166 country code (Alpha-2 code). You can find a full list of these codes at several sites, such as: https://www.iso.org/obp/ui/#search. This value sets the locale of the scratch org."
      ),
    username: z.string().optional().describe('A user name formatted like test-unique_identifier@orgName.net.'),
    adminEmail: z
      .string()
      .optional()
      .describe('Email address of the Dev Hub user making the scratch org creation request.')
      .meta({ title: 'Administrator Email Address' }),
    description: z
      .string()
      .optional()
      .describe(
        "The description is a good way to document the scratch org's purpose. You can view or edit the description in the Dev Hub. From App Launcher, select Scratch Org Info or Active Scratch Orgs, then click the scratch org number."
      )
      .meta({ title: 'Description of the Org' }),
    hasSampleData: z
      .boolean()
      .default(false)
      .optional()
      .describe('Valid values are true and false. False is the default, which creates an org without sample data.')
      .meta({ title: 'Include Sample Data' }),
    language: z
      .string()
      .max(5)
      .optional()
      .describe(
        'Default language for the country. To override the language set by the Dev Hub locale, see Supported Languages (https://help.salesforce.com/articleView?id=faq_getstart_what_languages_does.htm&type=5&language=en_US) for the codes to use in this field.'
      )
      .meta({ title: 'Default Language' }),
    features: FeaturesSchema.optional().describe('Features to enable in the scratch org.'),
    template: z
      .string()
      .optional()
      .describe('The template id for the scratch org shape. (Pilot)')
      .meta({ title: 'Template ID' }),
    settings: SettingsSchema.optional().describe('Settings for the scratch org.'),
    release: z
      .enum(['preview', 'previous'])
      .optional()
      .describe(
        'Same Salesforce release as the Dev Hub org. Options are preview or previous. Can use only during Salesforce release transition periods.'
      ),
  })
  .catchall(z.unknown());

export type ScratchOrgDef = z.infer<typeof ScratchOrgDefSchema>;
