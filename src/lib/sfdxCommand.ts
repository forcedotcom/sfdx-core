
import { InputFlags, Command } from 'cli-engine-command';


export default class SfdxCommand extends Command<InputFlags> {
    static requireUser : boolean = true;

    static get flags() {
        const flags = {
            'json': {}
        };

        if (this.requireUser) {
            // add targetusername flags
        }
        return flags;
    }

    async init() {
        await (super.init());

        // Do additional stuff, like setup set up org context
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
}