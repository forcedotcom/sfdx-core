import { AuthInfo } from '../src/authInfo';
import { Connection } from '../src/connection';
import { Org } from '../src/org';

// tslint:disable
JSON.stringify({
  classDoc: async () => {
    // Email username
    const org1: Org = await Org.create({ aliasOrUsername: 'foo@example.com' }); //tslint:disable-line:no-unused-variable
    // The defaultusername config property
    const org2: Org = await Org.create({});
    // Full Connection
    const org3: Org = await Org.create({
      connection: await Connection.create(
        await AuthInfo.create({ username: 'username' })
      )
    });

    console.log(org1);
    console.log(org2);
    console.log(org3);
  }
});
