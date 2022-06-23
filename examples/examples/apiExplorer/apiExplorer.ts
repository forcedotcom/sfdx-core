#!/usr/bin/env node

/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AuthInfo, Connection, StateAggregator } from '@salesforce/core';
import chalk from 'chalk';
import * as inquirer from 'inquirer';

export async function run() {
  const stateAggregator = await StateAggregator.getInstance();
  const usernames = (await stateAggregator.orgs.readAll()).map((org) => org.username);

  // Have the user select a user
  const username = await select('Select an org to connect to:', usernames);

  console.log(`Connecting to ${username}`);

  // Connect to the user
  const authInfo = await AuthInfo.create({ username });
  const connection = await Connection.create({ authInfo });

  console.log('Connected!\n');

  // Request the base URL
  let response = await connection.request(connection.baseUrl());
  let options = Object.values(response);

  // Keep having the user select a new endpoint url, or the same list if there was an error
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      response = await connection.request(await select('Select endpoint', options));
      console.log('\n', chalk.green(JSON.stringify(response, null, 4)), '\n');

      // Only change the options if they are urls
      const opts = Object.values(response);
      if ((opts[0] as string).match(/^\//)) {
        options = opts;
      }
    } catch (err) {
      console.log('\n', chalk.red(err.message), '\n');
    }
  }
}

/**
 * Simple wrapper around inquirer list prompt
 */
async function select(question, options) {
  const prompt = inquirer.prompt([
    {
      name: 'answer',
      message: question,
      type: 'list',
      pageSize: '20',
      choices: options,
    },
  ]);
  const { answer } = await prompt;
  return answer;
}
