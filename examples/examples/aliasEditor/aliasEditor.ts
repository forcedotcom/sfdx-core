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
