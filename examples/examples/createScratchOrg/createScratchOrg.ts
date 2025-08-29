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
