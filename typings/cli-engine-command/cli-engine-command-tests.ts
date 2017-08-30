import { ConfigOptions } from "cli-engine-config"
import { InputFlags, Output, Command } from "cli-engine-command"

class TestCommand extends Command<InputFlags> {
    constructor(options: {config?: ConfigOptions, output?: Output} = {}) {
        super(options);
    }

    async init() {
        // ...
    }

    async run() {
        this.out.debug(`Run: ${this.config.name}`);
        this.out.debug(`  foo? ${this.args && this.args["foo"]}`);
        const data = await test.http.get("https://example.com", {
            headers: {
                "Accept": "application/json"
            }
        });
        test.out.debug(data);
    }
}

const flags: InputFlags = {
    "foo": {
        char: "t",
        description: "test"
    }
}

const test = new TestCommand(flags);
test.run();
