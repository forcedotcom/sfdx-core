import { AuthInfo } from '../src/org/authInfo';
import { Connection } from '../src/org/connection';
import { Org } from '../src/org';

// tslint:disable
export const orgExamples = {
  classDoc: async () => {
    // Email username
    const org1: Org = await Org.create({ aliasOrUsername: 'foo@example.com' });
    // The defaultusername config property
    const org2: Org = await Org.create({});
    // Full Connection
    const org3: Org = await Org.create({
      connection: await Connection.create({
        authInfo: await AuthInfo.create({ username: 'username' }),
      }),
    });

    console.log(org1);
    console.log(org2);
    console.log(org3);
  },
};
