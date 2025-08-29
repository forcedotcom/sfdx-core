#!/usr/bin/env node

/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
