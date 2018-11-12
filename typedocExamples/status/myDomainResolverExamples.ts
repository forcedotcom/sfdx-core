import { MyDomainResolver } from '../../src/status/myDomainResolver';

import { URL } from 'url';
import { Time, TIME_UNIT } from '../../src/util/time';

import { AnyJson } from '@salesforce/ts-types';

JSON.stringify({
  classDoc: async () => {
    const options: MyDomainResolver.Options = {
      url: new URL('http://mydomain.salesforce.com'),
      timeout: new Time(5, TIME_UNIT.MINUTES),
      frequency: new Time(10, TIME_UNIT.SECONDS)
    };

    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ipAddress: AnyJson = await resolver.resolve();
    console.log(
      `Successfully resolved host: ${options.url} to address: ${ipAddress}`
    );
  }
});
