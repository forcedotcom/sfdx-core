<!-- 8e9eb00f-1a6c-432d-a852-a718940639e1 2384c1dc-8c92-4057-b7e9-23e6310d742b -->

# GHA Workflow for Schema Updates

## Implementation

### 1. Add npm scripts to `package.json`

```json
"update:features": "ts-node scripts/schemas/update-features.ts",
"update:settings": "ts-node scripts/schemas/update-settings.ts"
```

### 2. Create `.github/workflows/update-schema-sources.yml`

Following the [SDR supportedMetadataUpdate.yml](https://github.com/forcedotcom/source-deploy-retrieve/blob/main/.github/workflows/supportedMetadataUpdate.yml) pattern:

```yaml
name: update-schema-sources

on:
  workflow_dispatch:
  schedule:
    - cron: '0 9 * * 6' # Saturday 9am UTC

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.SVC_CLI_BOT_GITHUB_TOKEN }}
      - uses: salesforcecli/github-workflows/.github/actions/getGithubUserInfo@main
        id: github-user-info
        with:
          SVC_CLI_BOT_GITHUB_TOKEN: ${{ secrets.SVC_CLI_BOT_GITHUB_TOKEN }}
      - uses: salesforcecli/github-workflows/.github/actions/gitConfig@main
        with:
          username: ${{ steps.github-user-info.outputs.username }}
          email: ${{ steps.github-user-info.outputs.email }}
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
          cache: yarn
      - uses: salesforcecli/github-workflows/.github/actions/yarnInstallWithRetries@main
      - run: yarn update:features
      - run: yarn update:settings
      - run: |
          if [[ -n $(git status --short src/schema/project-scratch-def/) ]]; then
            git add src/schema/project-scratch-def/
            git commit -m "chore: update features and settings from docs [no ci]" --no-verify
            git push --no-verify
          else
            echo "Already up to date"
          fi
```

Uses org's bot token and shared actions; commits directly to main with `[no ci]` to skip CI.

### To-dos

- [ ] Add update:features, update:settings, update:schema-sources scripts to package.json
- [ ] Create .github/workflows/update-schema-sources.yml with schedule + workflow_dispatch
