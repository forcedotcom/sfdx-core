// Type definitions for cli-engine-config v1.3.8
// Project: https://github.com/heroku/cli-engine-config

declare module "cli-engine-config" {
    type S3 = {
        host?: string,
        bucket?: string
    }

    type CLI = {
        dirname?: string,
        defaultCommand?: string,
        bin?: string,
        namespaces?: (string | null)[] | null,
        s3?: S3,
        plugins?: string[]
    }

    export type PJSON = {
        name?: string | null,
        version?: string | null,
        dependencies?: { [name: string]: string } | null,
        'cli-engine'?: CLI | null
    }

    export type Config = {
        name: string,
        dirname: string,
        bin: string,
        namespaces: (string | null)[] | null,
        s3: S3,
        root: string,
        home: string,
        pjson: PJSON,
        updateDisabled: string | null,
        defaultCommand: string,
        channel: string,
        version: string,
        debug: number,
        dataDir: string,
        cacheDir: string,
        configDir: string,
        arch: string,
        platform: string,
        windows: boolean,
        skipAnalytics: boolean,
        install: string | null,
        userAgent: string,
        shell: string
    }

    export type ConfigOptions = Config;
}
