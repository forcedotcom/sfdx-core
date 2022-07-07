#!/usr/bin/env node

/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Org, scratchOrgCreate } from '@salesforce/core';
import { Duration } from '@salesforce/kit';
import * as inquirer from 'inquirer';

export async function createScratchOrg() {
  const devhub = await prompt('Username or alias of devhub');
  const { username, scratchOrgInfo } = await scratchOrgCreate({
    hubOrg: await Org.create({ aliasOrUsername: devhub }),
    durationDays: 1,
    wait: Duration.minutes(10),
    orgConfig: { edition: 'DEVELOPER' },
  });
  console.log('Successfully created scratch org');
  console.log('Username:', username);
  console.log('Scratch Org Info:', JSON.stringify(scratchOrgInfo, null, 2));
}

async function prompt(question: string): Promise<string> {
  const prompt = inquirer.prompt([
    {
      name: 'answer',
      message: question,
      type: 'input',
    },
  ]);
  const { answer } = await prompt;
  return answer;
}
