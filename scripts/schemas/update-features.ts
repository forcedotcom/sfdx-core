/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { writeFileSync } from 'node:fs';
import { get } from 'node:https';
import { simpleFeaturesList } from '../../src/schema/project-scratch-def/simpleFeaturesList';
import { patternFeaturesList } from '../../src/schema/project-scratch-def/patternFeaturesList';

const DOCS_URL = 'https://developer.salesforce.com/docs/get_document/atlas.en-us.sfdx_dev.meta';
const FEATURES_SECTION_ID = 'sfdx_dev_scratch_orgs_def_file_config_values-sfdx_dev_scratch_orgs_def_file_config_values';

type TocNode = {
  text: string;
  id: string;
  children?: TocNode[];
};

type DocsResponse = {
  toc: TocNode[];
};

const COPYRIGHT_HEADER = `/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
`;

// Find the features section in the TOC tree
const findFeaturesSection = (nodes: TocNode[]): TocNode | undefined =>
  nodes.reduce<TocNode | undefined>(
    (found, node) =>
      found ??
      (node.id === FEATURES_SECTION_ID ? node : node.children ? findFeaturesSection(node.children) : undefined),
    undefined
  );

// Extract feature name from text (handles both simple and pattern features)
const parseFeature = (text: string): { name: string; isPattern: boolean } =>
  text.endsWith(':<value>') ? { name: text.slice(0, -8), isPattern: true } : { name: text, isPattern: false };

// Generate TS file content for a features list
const generateFileContent = (varName: string, features: readonly string[]): string =>
  `${COPYRIGHT_HEADER}export const ${varName} = [\n${features.map((f) => `  '${f}',`).join('\n')}\n];\n`;

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
  console.log('Fetching features from Salesforce documentation...');

  const data = await fetchJson(DOCS_URL);

  const featuresSection = findFeaturesSection(data.toc);
  if (!featuresSection?.children) {
    throw new Error(`Could not find features section with id: ${FEATURES_SECTION_ID}`);
  }

  console.log(`Found ${featuresSection.children.length} features in documentation`);

  // Parse and classify features from docs
  const docFeatures = featuresSection.children.map((node) => parseFeature(node.text));

  const docSimpleFeatures = docFeatures.filter((f) => !f.isPattern).map((f) => f.name);
  const docPatternFeatures = docFeatures.filter((f) => f.isPattern).map((f) => f.name);

  // Merge with existing (additive only)
  const existingSimple = new Set(simpleFeaturesList);
  const existingPattern = new Set(patternFeaturesList);

  const newSimple = docSimpleFeatures.filter((f) => !existingSimple.has(f));
  const newPattern = docPatternFeatures.filter((f) => !existingPattern.has(f));

  // Union and sort
  const mergedSimple = [...new Set([...simpleFeaturesList, ...docSimpleFeatures])].sort();
  const mergedPattern = [...new Set([...patternFeaturesList, ...docPatternFeatures])].sort();

  // Write files only if there are additions
  if (newSimple.length > 0) {
    console.log(`Adding ${newSimple.length} new simple features:`, newSimple);
    writeFileSync(
      'src/schema/project-scratch-def/simpleFeaturesList.ts',
      generateFileContent('simpleFeaturesList', mergedSimple)
    );
    console.log('Updated simpleFeaturesList.ts');
  } else {
    console.log('No new simple features to add');
  }

  if (newPattern.length > 0) {
    console.log(`Adding ${newPattern.length} new pattern features:`, newPattern);
    writeFileSync(
      'src/schema/project-scratch-def/patternFeaturesList.ts',
      generateFileContent('patternFeaturesList', mergedPattern)
    );
    console.log('Updated patternFeaturesList.ts');
  } else {
    console.log('No new pattern features to add');
  }

  console.log('Done');
};

main().catch((err: unknown) => {
  console.error('Error:', err);
  process.exit(1);
});
