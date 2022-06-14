/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { StateAggregator } from '@salesforce/core';
import { green, red } from 'chalk';
import * as inquirer from 'inquirer';
import _ from 'lodash';
import strip from 'strip-ansi';

export async function run() {
  const stateAggregator = await StateAggregator.getInstance();
  const orgs = await stateAggregator.orgs.readAll();

  // Buffer length for displaying to the user
  const len = (_.max(_.map(_.values(orgs), (element) => element || 0)) as string).length + 4;

  // Have the user select a user to add or remove alias
  const answer = await select(
    "Select a user's alias to edit:",
    orgs.map(({ username }) => {
      const alias = stateAggregator.aliases.get(username);
      let aliasText = '';

      if (alias) {
        aliasText = green.bold(_.padEnd(alias, len));
      } else {
        aliasText = red(_.padEnd('N/A', len));
      }

      return `${aliasText}: ${username}`;
    })
  );

  const [alias, username] = strip(answer).split(/\s*: /);

  // Enter a new alias
  const { newAlias } = await inquirer.prompt([{ name: 'newAlias', message: 'Enter a new alias (empty to remove):' }]);

  if (alias !== 'N/A') {
    // Remove the old one
    stateAggregator.aliases.unset(alias);
    console.log(`Unset alias ${red(alias)}`);
  }

  if (newAlias) {
    stateAggregator.aliases.set(newAlias, username);
    console.log(`Set alias ${green(newAlias)} to username ${green(username)}`);
  }
  await stateAggregator.aliases.write();
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
