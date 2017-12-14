
import { InputFlags, Command } from 'cli-engine-command';
import Logger from './logger';
import UX from './ux';
import SfdxError from './sfdxError';
import Connection from './connection';


export default class SfdxCommand extends Command<InputFlags> {

    static requireUser : boolean = true;
    private logger : Logger;
    private ux : UX;

    static get flags() {
        const flags : any = {
            'json': {}
        };

        if (this.requireUser) {
            // add targetusername flags
        }
        return flags;
    }

    async init() {
        await (super.init());

        this.logger = await Logger.child(this.constructor.name);
        this.logger.setLevel(SfdxCommand.flags.loglevel || process.env.SFDX_LOG_LEVEL);

        this.ux = new UX(this.logger, !!SfdxCommand.flags.json);

        // const myOrg = await Org.instantiate('myUsername');
        // in org.instantiate(), gets auth info and creates a connection...
        //    this.authInfo = await AuthInfo.create('myUsername');
        //    this.connection = await Connection.create(authInfo);
        // myOrg.connection.request();
        // myOrg.connection.query();

        // Do additional stuff, like set up org context
    }

    run() {
        // @TODO: should we have consumers override an execute method so we can wrap
        //        in a try/catch to ensure all errors from a command are SfdxErrors???
        try {
            // return await this.execute()
        } catch (e) {
            if (!(e instanceof SfdxError)) {
                e = SfdxError.wrap(e);
            }
            return this.endWithError(e);
        }

    }

    endWithError(error : SfdxError) {
        process.exitCode = process.exitCode || error.exitCode || 1;

        const userDisplayError = {
            warnings: UX.warnings
        }

        if (!SfdxCommand.flags.json) {
            this.ux.error(error.format());
        } else {
            this.ux.errorJson(userDisplayError);
        }
        return Promise.reject(userDisplayError);
    }
}

// How will customers extend SfdxCommand and get all the
// default flags? Soemthing like this?
class MyCommand extends SfdxCommand {
    static requireUser : boolean = false;

    static get flags() {
        return Object.assign({}, super.flags, {
            // Custom flags
        });
    }

    async run() : Promise<never> {
        // here's an example of how a plugin would add a logger stream to the root logger
        // to do something like stream all root logging to a service.
        //(await Logger.root()).addStream(/* config for a http stream */)

        // Here's an example of how a plugin would add a file stream to their child logger
        // so that their logger would write to another file.
        //this.logger.addLogFileStream('myLogFile.txt');
        //this.logger.debug('bla');

        return await super.run();
    }
}