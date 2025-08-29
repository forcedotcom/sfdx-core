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
      const first = opts[0];
      if (typeof first === 'string' && first.match(/^\//)) {
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
