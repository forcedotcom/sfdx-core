import { Duration } from '@salesforce/kit';
import { AnyJson } from '@salesforce/ts-types';
import { URL } from 'url';
import { MyDomainResolver } from '../../src/status/myDomainResolver';

JSON.stringify({
  classDoc: async () => {
    const options: MyDomainResolver.Options = {
      url: new URL('http://mydomain.salesforce.com'),
      timeout: Duration.minutes(5),
      frequency: Duration.seconds(10)
    };

    const resolver: MyDomainResolver = await MyDomainResolver.create(options);
    const ipAddress: AnyJson = await resolver.resolve();
    console.log(
      `Successfully resolved host: ${options.url} to address: ${ipAddress}`
    );
  }
});
