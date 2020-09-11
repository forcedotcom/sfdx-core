import { DefaultUserFields, User, UserFields } from '../src/user';
import { Org } from '../src/org';
import { Connection } from '../src/connection';
import { AuthInfo } from '../src/authInfo';

export const userExamples = {
  defaultUserFieldsClassDoc: async () => {
    const connection: Connection = await Connection.create({
      authInfo: await AuthInfo.create({ username: 'user@example.com' }),
    });
    const org: Org = await Org.create({ connection });
    const options: DefaultUserFields.Options = {
      templateUser: org.getUsername(),
    };
    const fields = (await DefaultUserFields.create(options)).getFields();
    console.log(fields);
  },

  assignPermissionSets: async () => {
    const username = 'user@example.com';
    const connection: Connection = await Connection.create({ authInfo: await AuthInfo.create({ username }) });
    const org = await Org.create({ connection });
    const user: User = await User.create({ org });
    const fields: UserFields = await user.retrieve(username);
    await user.assignPermissionSets(fields.id, ['sfdx', 'approver']);
  },

  createUser: async () => {
    const connection: Connection = await Connection.create({
      authInfo: await AuthInfo.create({ username: 'user@example.com' }),
    });
    const org = await Org.create({ connection });

    const defaultUserFields = await DefaultUserFields.create({ templateUser: 'devhub_user@example.com' });
    const user: User = await User.create({ org });
    const info: AuthInfo = await user.createUser(defaultUserFields.getFields());
    console.log(info);
  },

  retrieve: async () => {
    const username = 'boris@thecat.com';
    const connection: Connection = await Connection.create({ authInfo: await AuthInfo.create({ username }) });
    const org = await Org.create({ connection });
    const user: User = await User.create({ org });
    const fields: UserFields = await user.retrieve(username);
    console.log(fields);
  },
};
