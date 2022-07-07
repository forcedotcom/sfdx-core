/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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
