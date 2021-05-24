import { Aliases, GlobalInfo } from '@salesforce/core';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as _ from 'lodash';
import * as strip from 'strip-ansi';

export async function run() {
  const config = await GlobalInfo.getInstance();
  const orgs = Object.keys(config.getOrgs());
  const orgsWithAliases = {};
  const aliases = await Aliases.create();

  // Map the aliases onto the orgs
  for (const org of orgs) {
    const aliasKeys = aliases.getKeysByValue(org);
    orgsWithAliases[org] = _.get(aliasKeys, 0);
  }

  // Buffer length for displaying to the user
  const len = (_.max(_.map(_.values(orgsWithAliases), (element) => element || 0)) as string).length + 4;

  // Have the user select a user to add or remove alias
  const answer = await select(
    "Select a user's alias to edit:",
    Object.keys(orgsWithAliases).map((org) => {
      const _alias = orgsWithAliases[org];
      let aliasText = '';

      if (_alias) {
        aliasText = chalk.green.bold(_.padEnd(_alias, len));
      } else {
        aliasText = chalk.red(_.padEnd('N/A', len));
      }

      return `${aliasText}: ${org}`;
    })
  );

  const [alias, username] = strip(answer).split(/\s*: /);

  // Enter a new alias
  const { newAlias } = await inquirer.prompt([{ name: 'newAlias', message: 'Enter a new alias (empty to remove):' }]);

  if (alias !== 'N/A') {
    // Remove the old one
    aliases.unset(alias);
    console.log(`Unset alias ${chalk.red(alias)}`);
  }

  if (newAlias) {
    aliases.set(newAlias, username);
    console.log(`Set alias ${chalk.green(newAlias)} to username ${chalk.green(username)}`);
  }
  await aliases.write();
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
