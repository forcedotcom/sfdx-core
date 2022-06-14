#!/usr/bin/env node

/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { ConfigAggregator, ConfigInfo, OrgConfigProperties } from '@salesforce/core';
import chalk from 'chalk';

/**
 * Format a default user using a ConfigInfo.
 */
export function formatUser(label: string, configInfo: ConfigInfo) {
  const name = configInfo.value || 'N/A';

  let out = `${label}(${chalk.bold(name)})`;

  // Only show the location if there is one
  if (configInfo.location) {
    out += chalk.dim(`[${configInfo.location}]`);
  }
  return chalk.green(out);
}

// Run with await
export async function displayDefaultUsernames() {
  // Get the aggregated config values
  const aggregator = await ConfigAggregator.create();

  // Display the default user info
  console.log(
    [
      formatUser('hub', aggregator.getInfo(OrgConfigProperties.TARGET_DEV_HUB)),
      formatUser('user', aggregator.getInfo(OrgConfigProperties.TARGET_ORG)),
    ].join(' ')
  );
}
