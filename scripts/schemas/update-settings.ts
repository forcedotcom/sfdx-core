/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { get } from 'node:https';

const DOCS_URL = 'https://developer.salesforce.com/docs/get_document/atlas.en-us.api_meta.meta';
const DOCS_BASE_URL = 'https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta';
const SETTINGS_FILE = 'src/schema/project-scratch-def/settings.ts';

type TocNode = {
  text: string;
  id: string;
  a_attr?: { href: string };
  children?: TocNode[];
};

type DocsResponse = {
  toc: TocNode[];
};

type SettingInfo = {
  propName: string;
  docUrl: string;
};

const COPYRIGHT_HEADER = `/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
`;

// Convert PascalCase to camelCase, stripping any suffix like "(Beta)"
const toCamelCase = (str: string): string => {
  const clean = str.replace(/\s*\(.*\)$/, '');
  return clean.charAt(0).toLowerCase() + clean.slice(1);
};

// Find the Settings node in the TOC tree
const findSettingsNode = (nodes: TocNode[]): TocNode | undefined =>
  nodes.reduce<TocNode | undefined>(
    (found, node) =>
      found ?? (node.text === 'Settings' ? node : node.children ? findSettingsNode(node.children) : undefined),
    undefined
  );

// Extract existing settings property names from the current file
const extractExistingSettings = (content: string): Set<string> => {
  const matches = content.matchAll(/^\s{4}(\w+):\s*z\s*$/gm);
  return new Set([...matches].map((m) => m[1]));
};

// Generate a single setting entry
const generateSettingEntry = ({ propName, docUrl }: SettingInfo): string =>
  `    ${propName}: z
      .record(z.string(), z.unknown())
      .optional()
      .describe(
        'For more details go to ${docUrl}'
      )`;

// Generate the full settings file content
const generateFileContent = (settings: SettingInfo[]): string => {
  const entries = settings.map(generateSettingEntry).join(',\n');
  return `${COPYRIGHT_HEADER}import { z } from 'zod';

/**
 * Settings for scratch org configuration
 * Each settings property corresponds to a metadata type configuration
 */
export const SettingsSchema = z
  .object({
${entries},
  })
  .catchall(z.unknown());

export type Settings = z.infer<typeof SettingsSchema>;
`;
};

// Fetch JSON from URL using node:https
const fetchJson = (url: string): Promise<DocsResponse> =>
  new Promise((resolve, reject) => {
    get(url, (res) => {
      let data = '';
      res.on('data', (chunk: string) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(JSON.parse(data) as DocsResponse);
      });
    }).on('error', reject);
  });

const main = async (): Promise<void> => {
  console.log('Fetching settings from Salesforce Metadata API documentation...');

  const data = await fetchJson(DOCS_URL);

  const settingsNode = findSettingsNode(data.toc);
  if (!settingsNode?.children) {
    throw new Error('Could not find Settings node in documentation TOC');
  }

  console.log(`Found ${settingsNode.children.length} settings in documentation`);

  // Extract settings info from doc children
  const docSettings: SettingInfo[] = settingsNode.children
    .filter((node) => node.a_attr?.href)
    .map((node) => ({
      propName: toCamelCase(node.text),
      docUrl: `${DOCS_BASE_URL}/${node.a_attr!.href}`,
    }));

  // Read existing settings
  const existingContent = readFileSync(SETTINGS_FILE, 'utf-8');
  const existingSettings = extractExistingSettings(existingContent);

  // Find new settings
  const newSettings = docSettings.filter((s) => !existingSettings.has(s.propName));

  if (newSettings.length > 0) {
    console.log(
      `Adding ${newSettings.length} new settings:`,
      newSettings.map((s) => s.propName)
    );

    // Merge and sort all settings
    const allSettings = [...new Map([...docSettings].map((s) => [s.propName, s])).values()];

    // Add any existing settings not in docs (preserve them)
    existingSettings.forEach((propName) => {
      if (!allSettings.some((s) => s.propName === propName)) {
        // Reconstruct URL from propName for preserved settings
        const href = `meta_${propName.toLowerCase()}.htm`;
        allSettings.push({ propName, docUrl: `${DOCS_BASE_URL}/${href}` });
      }
    });

    // Sort alphabetically
    allSettings.sort((a, b) => a.propName.localeCompare(b.propName));

    writeFileSync(SETTINGS_FILE, generateFileContent(allSettings));
    console.log('Updated settings.ts');
  } else {
    console.log('No new settings to add');
  }

  console.log('Done');
};

main().catch((err: unknown) => {
  console.error('Error:', err);
  process.exit(1);
});
