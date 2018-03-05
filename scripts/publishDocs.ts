#!/usr/bin/env ../node_modules/.bin/ts-node

import * as shell from 'shelljs';
import { ShellString, ExecOutputReturnValue } from 'shelljs';

const awsInfo: ShellString = shell.which('aws');

if (!awsInfo) {
    shell.echo('The aws command is not found exiting.');
    shell.exit(1);
} else {
    const awsVersionResult: ExecOutputReturnValue =
        shell.exec('aws --version', { silent: true }) as ExecOutputReturnValue;

    if (awsVersionResult && awsVersionResult.code === 0) {
        shell.echo('Using aws version:');
        shell.echo(awsVersionResult.stdout);
    } else {
        shell.echo('Couldn\'t get the AWS CLI version.');
        shell.exit(1);
    }
}

function validateEnvVar(envName: string): string {
    const envValue: string = process.env[envName];

    if (!envValue || envValue.length < 1) {
        throw new Error('Invalid ');
    }
    return envValue;
}

const s3EndpointUrl = validateEnvVar('S3_ENDPOINT_URL');

const s3Target = validateEnvVar('S3_TARGET');

const cpSource = validateEnvVar('CP_SOURCE');

const awsProfile = validateEnvVar('AWS_PROFILE');

const cmd = `aws s3 cp --endpoint-url ${s3EndpointUrl} --recursive  ${cpSource} ${s3Target} --profile ${awsProfile}`;

shell.echo(`Running aws Command: ${cmd}`);

shell.exec(cmd);