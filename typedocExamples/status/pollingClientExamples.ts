import { Duration } from '@salesforce/kit';
import { StatusResult } from '../../src/status/client';
import { PollingClient } from '../../src/status/pollingClient';

export const pollingClientExamples = {
  classDoc: async () => {
    const options: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        return Promise.resolve({ completed: true, payload: 'Hello World' });
      },
      frequency: Duration.milliseconds(10),
      timeout: Duration.minutes(1)
    };
    const client = new PollingClient(options);
    const pollResult = await client.subscribe();
    console.log(`pollResult: ${pollResult}`);
  }
};
