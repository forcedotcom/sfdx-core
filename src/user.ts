import { SecureBuffer } from './secureBuffer';
import { Connection } from './connection';
import { Logger } from './logger';
import * as _ from 'lodash';

export interface UserFields {
    username: string;
    lastName: string;
    alias: string;
    timeZoneSidKey: string;
    localeSidKey: string;
    emailEncodingKey: string;
    profileId: string;
    languageLocaleKey: string;
    fixCase(): object;
}

export class DefaultUserFields implements UserFields {
    public alias: string;
    public emailEncodingKey: string;
    public languageLocaleKey: string;
    public lastName: string;
    public localeSidKey: string;
    public profileId: string;
    public timeZoneSidKey: string;
    public username: string;

    constructor(username: string) {
        this.profileId = '00exx000000n3y0AAA';
        this.username = username;
        this.lastName = 'User';
        this.alias = 'UUser';
        this.timeZoneSidKey = 'America/Denver';
        this.localeSidKey = 'en_US';
        this.emailEncodingKey = 'ISO-8859-1';
        this.languageLocaleKey = 'en_US';
    }

    public fixCase() {
        const fixedObject = {};
        _.forEach(this, (value, key) => {
            if (typeof value !== 'function') {
                fixedObject[_.upperFirst(key)] = value;
            }
        });

        return fixedObject;
    }
}

export class User {

    private connection: Connection;
    private logger: Logger;

    public static async init(connection: Connection): Promise<User> {
        return new User(connection, await Logger.child('User'));
    }

    private constructor(connection: Connection, logger: Logger) {
        this.connection = connection;
        this.logger = logger;
    }

    public async create(fields: UserFields ): Promise<UserFields> {
        const result = await this.connection.sobject('User').create(fields);
        this.logger.debug(JSON.stringify(result));
        return fields;
    }
}
