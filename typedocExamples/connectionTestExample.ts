import { AuthInfo } from '../src/org/authInfo';
import { Connection } from '../src/org/connection';

export const connectionExamples = {
  classDoc: async () => {
    // Uses latest API version
    const connection = await Connection.create({
      authInfo: await AuthInfo.create({ username: 'myAdminUsername' }),
    });
    connection.query('SELECT Name from Account');

    // Use different API version
    connection.setApiVersion('42.0');
    connection.query('SELECT Name from Account');
  },
};
