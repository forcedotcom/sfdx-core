<!-- d4b16dff-6095-4072-9932-01f017b5bd0a 8e1740e7-8f38-4285-969e-f9b2cdd69d73 -->

# Update Features from Salesforce Docs

## Overview

Create `scripts/schemas/update-features.ts` to sync feature lists with Salesforce documentation.

## Script Logic

1. **Fetch** JSON from `https://developer.salesforce.com/docs/get_document/atlas.en-us.sfdx_dev.meta`

2. **Parse** - navigate to the features children array (under `sfdx_dev_scratch_orgs_def_file_config_values`)

3. **Classify** each feature by checking `text` field:

- `text.endsWith(':<value>')` → pattern feature, extract name before `:`
- Otherwise → simple feature

4. **Merge** with existing lists (additive only - never remove):

- Read current arrays from both TS files
- Union new features with existing
- Log added features

5. **Generate** updated TS files:

- `src/schema/project-scratch-def/simpleFeaturesList.ts`
- `src/schema/project-scratch-def/patternFeaturesList.ts`

6. **Write** files with sorted arrays, preserving copyright header

## Key Implementation Details

- Use `node:fetch` for HTTP request
- Functional approach: `filter`, `map`, no mutation
- Keep existing file structure (copyright header, `export const`, `as const`)
- Sort features alphabetically

### To-dos

- [ ] Create update-features.ts script in scripts/schemas/
