import { ensureJsonMap, ensureString, JsonCollection, JsonMap } from '@salesforce/ts-types';
import { Org } from '../../src/org';
import { StatusResult } from '../../src/status/client';
import { StreamingClient } from '../../src/status/streamingClient';

import { RequestInfo } from 'jsforce';

export const streamingClientExamples = {
  classDoc: async () => {
    const streamProcessor = (message: JsonMap): StatusResult => {
      const payload = ensureJsonMap(message.payload);
      const id = ensureString(payload.id);

      if (payload.status !== 'Active') {
        return { completed: false };
      }

      return {
        completed: true,
        payload: id
      };
    };

    const org = await Org.create({});
    const options = new StreamingClient.DefaultOptions(org, 'MyPushTopics', streamProcessor);

    const asyncStatusClient = await StreamingClient.create(options);

    await asyncStatusClient.handshake();

    const info: RequestInfo = {
      method: 'POST',
      url: `${org.getField(Org.Fields.INSTANCE_URL)}/SomeService`,
      headers: { HEADER: 'HEADER_VALUE' },
      body: 'My content'
    };

    await asyncStatusClient.subscribe(async () => {
      const connection = await org.getConnection();
      // Now that we are subscribed, we can initiate the request that will cause the events to start streaming.
      const requestResponse: JsonCollection = await connection.request(info);
      const id = ensureJsonMap(requestResponse).id;
      console.log(`id: ${JSON.stringify(ensureString(id), null, 4)}`);
    });
  }
};
