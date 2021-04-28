import { GlobalInfo, Org, StatusResult, StreamingClient } from '@salesforce/core';
import { JsonMap } from '@salesforce/ts-types';
import chalk from 'chalk';
import * as inquirer from 'inquirer';

let org: Org;

export async function run() {
  function streamProcessor(message: JsonMap): StatusResult {
    console.log(chalk.blue('Apex Log Found:'), chalk.green(message.sobject['Id']));
    console.log(org.getConnection().request(`/sobjects/ApexLog/${message.sobject['Id']}/Body`));
    // Listen forever to get all the logs until the stream timesout
    return { completed: false };
  }

  async function startStream(username) {
    org = await Org.create(username);
    const options: StreamingClient.Options = new StreamingClient.DefaultOptions(
      org,
      '/systemTopic/Logging',
      streamProcessor
    );

    const asyncStatusClient = await StreamingClient.create(options);

    await asyncStatusClient.handshake();
    console.log('Handshaked!');
    await asyncStatusClient.subscribe(async () => {
      console.log('Subscribed!');
    });
  }

  const config = await GlobalInfo.getInstance();
  const orgs = Object.keys(config.authorizations)

  // Have the user select a user
  const connectionOrg = await select('Select an org to connect to:', orgs);

  console.log(`Connecting to ${connectionOrg} `);

  await startStream(connectionOrg);
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
