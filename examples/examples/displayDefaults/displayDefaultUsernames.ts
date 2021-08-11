#!/usr/bin/env node

import { ConfigAggregator } from '@salesforce/core';
import chalk from 'chalk';

/**
 * Format a default user using a ConfigInfo.
 */
export function formatUser(label, configInfo) {
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
      formatUser('hub', aggregator.getInfo('target-dev-hub')),
      formatUser('user', aggregator.getInfo('target-org')),
    ].join(' ')
  );
}
