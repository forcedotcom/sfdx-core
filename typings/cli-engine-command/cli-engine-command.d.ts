// Type definitions for cli-engine-command v5.1.19
// Project: https://github.com/heroku/cli-engine-command

declare module "cli-engine-command" {
    import { Config, ConfigOptions } from "cli-engine-config"

    type AlphabetUppercase = | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "X" | "Y" | "Z"
    type AlphabetLowercase = | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "x" | "y" | "z"

    export type Flag<T> = {
        char?: AlphabetLowercase | AlphabetUppercase | null,
        description?: string | null,
        hidden?: boolean | null,
        default?: (() => (Promise<T | void> | T | void)) | null,
        required?: boolean | null,
        optional?: boolean | null,
        parse?: ((s1: string | null, c: Command<any> | null, s2: string) => (Promise<T | void> | T | void)) | null,
        completion?: Completion | null
    }

    export type BooleanFlag = {
        char?: (AlphabetLowercase | AlphabetUppercase),
        description?: string,
        parse?: null,
        hidden?: boolean
    }

    export class RequiredFlagError extends Error {
        constructor(name: string);
    }

    export namespace flags {
        const boolean: (options: BooleanFlag | null) => BooleanFlag;
        const string: (options: Flag<string> | null) => Flag<string>;
        const number: (options: Flag<number> | null) => Flag<number>;
    }

    export type InputFlags = {[name: string]: Flag<any> | BooleanFlag}
    export type Input<Flags extends InputFlags> = {
        flags: Flags,
        args: Arg[],
        variableArgs: boolean,
        cmd?: Command<Flags>
    }

    export type OutputFlags<Flags extends InputFlags> = {[name: string]: any} // TODO? s/string/$Enum<Flags>
    export type OutputArgs = {[name: string]: string}

    export type Arg = {
        name: string,
        description?: string,
        required?: boolean,
        optional?: boolean,
        hidden?: boolean,
        completion?: Completion | null
    }

    export type RunOptions = {
        argv?: string[],
        mock?: boolean,
        output?: Output,
        config?: ConfigOptions
    }

    export namespace Command {
        const namespace: string | null;
        const topic: string;
        const command: string | null;
        const description: string | null;
        const hidden: boolean | null;
        const usage: string | null;
        const help: string | null;
        const aliases: string[];
        const variableArgs: boolean;
        const flags: InputFlags;
        const args: Arg[];

        const id: () => string;
        const mock: (...argv: string[]) => Promise<Command<any>>;
        const run: (options: RunOptions | null) => Promise<Command<any>>;
        const buildHelp: (config: Config) => string;
        const buildHelpLine: (config: Config) => [string, string | null];
    }

    export class Command<Flags extends InputFlags> {
        config: Config;
        http: HTTP;
        out: Output;
        flags: OutputFlags<Flags> | null;
        argv: string[];
        args: {[name: string]: string} | null;

        constructor(options: {config?: ConfigOptions, output?: Output} | null);
        init(): Promise<any>;
        run(...rest: void[]): Promise<void>;
        stdout(): string;
        stderr(): string;
    }

    export type CompletionContext = {
        args?: {[name: string]: string} | null,
        flags?: {[name: string]: string} | null,
        argv?: string[] | null,
        out: Output
    }

    export type Completion = {
        cacheDuration?: number | null,
        cacheKey?: ((context: CompletionContext) => Promise<string>) | null,
        options: ((context: CompletionContext) => Promise<string[]>) | null
    }

    export class ExitError extends Error {
        code: number;

        constructor(code: number);
    }

    export namespace CustomColors {
        const supports: any;
        const gray: (s: string) => string;
        const grey: (s: string) => string;
        const attachment: (s: string) => string;
        const addon: (s: string) => string;
        const configVar: (s: string) => string;
        const release: (s: string) => string;
        const cmd: (s: string) => string;
        const app: (s: string) => string;
        const heroku: (s: string) => string;
    }

    export function wrap(msg: string): string;

    export function bangify(msg: string, c: string): string;

    export function getErrorMessage(err: Error): string;

    export const arrow: string;

    export class Output {
        mock: boolean;
        config: Config;
        action: ActionBase;
        stdout: StreamOutput;
        stderr: StreamOutput;
        prompter: Prompter;

        constructor(options: {config?: ConfigOptions | null, mock?: boolean} | null);
        public color(): any; // TODO: $Shape<typeof chalk & typeof CustomColors>
        public done(...rest: void[]): Promise<void>;
        public log(data: any, ...args: any[]): void;
        public styledJSON(obj: any): void;
        public styledHeader(header: string): void;
        public styledObject(obj: any, keys: string[]): void;
        public inspect(obj: any, opts: any | null): void;
        public debug(obj: string): void;
        public errlog(): string;
        public autoupdatelog(): string;
        public error(err: Error | string, exitCode?: number | false): void;
        public warn(err: Error | string, prefix?: string): void;
        public logError(err: Error | string): void;
        public prompt(name: string, options: PromptOptions): Promise<string>;
        public table<T extends {height?: number}>(data: Array<T>, options: TableOptions<T>): void;
        public exit(code: number | null): void;
    }

    export type PromptOptions = {
        name: string,
        prompt: string,
        mask: boolean
    }

    export class Prompter {
        out: Output;

        constructor(out: Output);
        public prompt(name: string, options: PromptOptions): Promise<string>;
        public promptMasked(options: PromptOptions): Promise<string>;
    }

    export type TableColumn<T> = {
        key: string,
        label?: string,
        format: (value: string, row: string) => string,
        get: (row: T) => string,
        width: number
    }

    export type TableOptions<T> = {
        columns: TableColumn<T>[],
        after: (row: T, options: TableOptions<T>) => void,
        printRow: (row: any[]) => void,
        printHeader: (row: any[]) => void
    }

    // TODO: types
    export class ActionBase {
        constructor(out: Output);
        start(action: any, status: any): void;
        stop(msg: string | null): void;
        status(): string | null;
        status(status: string): any;
        pause(fn: any, icon: any): any;
        log({ action, status }: { action: any, status: any }): void;
    }

    // TODO: types
    export class SimpleAction extends ActionBase {
        constructor(out: Output);
    }

    // TODO: types
    export class SpinnerAction extends ActionBase {
        constructor(out: Output);
    }

    export namespace StreamOutput {
        var startOfLine: boolean;
    }

    export class StreamOutput {
        output: string | null;
        stream: any; // TODO: stream$Writable?
        out: Output;
        logfile: string | null;

        constructor(stream: any, output: Output); // TODO: stream$Writable?
        write(msg: string, options: {log?: boolean} | null): void;
        timestamp(msg: string): string;
        log(data: string, ...args: any[]): void;
        writeLogFile(msg: string, withTimestamp: boolean): void;
        displayTimestamps(): boolean;
    }

    type Method = | "GET" | "POST" | "PATCH" | "PUT" | "DELETE"
    type Headers = { [key: string]: string }
    type Protocol = | "https:" | "http:"

    export type HTTPRequestOptions = {
        method?: Method,
        headers?: Headers,
        raw?: boolean,
        host?: string,
        port?: number,
        protocol?: Protocol,
        body?: any,
        partial?: boolean
    }

    export class HTTP {
        out: Output;
        config: Config;
        http: any;
        requestOptions: HTTPRequestOptions;

        constructor (output: Output, config: ConfigOptions | null);
        get(url: string, options: HTTPRequestOptions | null): Promise<any>;
        post(url: string, options: HTTPRequestOptions | null): Promise<any>;
        put(url: string, options: HTTPRequestOptions | null): Promise<any>;
        patch(url: string, options: HTTPRequestOptions | null): Promise<any>;
        delete(url: string, options: HTTPRequestOptions | null): Promise<any>;
        stream(url: string, options: HTTPRequestOptions | null): Promise<any>;
        request(url: string, options: HTTPRequestOptions | null): Promise<any>;
    }
}
