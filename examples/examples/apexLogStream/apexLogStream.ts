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

import { StateAggregator, Org, StatusResult, StreamingClient } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import chalk from 'chalk';
import * as inquirer from 'inquirer';

export async function run() {
  let org: Org;

  function streamProcessor(message: JsonMap): StatusResult {
    console.log(chalk.blue('Apex Log Found:'), chalk.green(message.sobject['Id']));
    console.log(org.getConnection().request(`/sobjects/ApexLog/${message.sobject['Id']}/Body`));
    // Listen forever to get all the logs until the stream timesout
    return { completed: false };
  }

  async function startStream(username: string) {
    org = await Org.create({ aliasOrUsername: username });
    const options = new StreamingClient.DefaultOptions(org, '/systemTopic/Logging', streamProcessor);

    const asyncStatusClient = await StreamingClient.create(options);

    await asyncStatusClient.handshake();
    console.log('Handshaked!');
    await asyncStatusClient.subscribe(async () => {
      console.log('Subscribed!');
    });
  }

  const stateAggregator = await StateAggregator.getInstance();
  const usernames = (await stateAggregator.orgs.readAll()).map((org) => org.username);

  // Have the user select a user
  const username = await select('Select an org to connect to:', usernames);

  console.log(`Connecting to ${username} `);

  await startStream(username);
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
