import { StatusResult } from '../../src/status/client';
import { PollingClient } from '../../src/status/pollingClient';
import { Time, TIME_UNIT } from '../../src/util/time';

JSON.stringify({
  classDoc: async () => {
    const options: PollingClient.Options = {
      async poll(): Promise<StatusResult> {
        return Promise.resolve({ completed: true, payload: 'Hello World' });
      },
      frequency: new Time(10, TIME_UNIT.MILLISECONDS),
      timeout: new Time(1, TIME_UNIT.MINUTES)
    };
    const client = new PollingClient(options);
    const pollResult = await client.subscribe();
    console.log(`pollResult: ${pollResult}`);
  }
});
