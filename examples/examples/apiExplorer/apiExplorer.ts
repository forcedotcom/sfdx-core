#!/usr/bin/env node

import { AuthInfo, Connection, GlobalInfo } from '@salesforce/core';
import chalk from 'chalk';
import * as inquirer from 'inquirer';

export async function run() {
  const config = await GlobalInfo.getInstance();
  const orgs = Object.keys(config.authorizations)

  // Have the user select a user
  const connectionOrg = await select('Select an org to connect to:', orgs);

  console.log(`Connecting to ${connectionOrg} `);

  // Connect to the user
  const authInfo = await AuthInfo.create(connectionOrg);
  const connection = await Connection.create({ authInfo });

  console.log('Connected!\n');

  // Request the base URL
  let response = await connection.request(connection.baseUrl());
  let options = Object.values(response);

  // Keep having the user select a new endpoint url, or the same list if there was an error
  // noinspection InfiniteLoopJS
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
      choices: options
    }
  ]);
  const { answer } = await prompt;
  return answer;
}
