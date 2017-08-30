import { Config } from "cli-engine-config"

const config: Config = {
    name: 'test',
    dirname: 'test',
    bin: 'test',
    s3: {
        host: 'test',
        bucket: 'test'
    },
    namespaces: [],
    root: 'test',
    home: 'test',
    pjson: {
        name: 'test',
        version: 'test',
        dependencies: {
            test: 'test'
        },
        'cli-engine': {
            dirname: 'test',
            defaultCommand: 'test',
            bin: 'test',
            namespaces: [],
            s3: {
                host: 'test',
                bucket: 'test'
            },
            plugins: [
                'test'
            ]
        }
    },
    updateDisabled: 'test',
    defaultCommand: 'test',
    channel: 'test',
    version: 'test',
    debug: 1,
    dataDir: 'test',
    cacheDir: 'test',
    configDir: 'test',
    arch: 'test',
    platform: 'test',
    windows: false,
    skipAnalytics: false,
    install: 'test',
    userAgent: 'test',
    shell: 'test'
};
