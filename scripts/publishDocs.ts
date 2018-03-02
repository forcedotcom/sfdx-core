#!/usr/bin/env ts-node

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

function validateEnvVar(envValue: string): void {
    if (!envValue || envValue.length < 1) {
        throw new Error();
    }
}

const s3EndpointUrl = process.env['S3_ENDPOINT_URL'];
validateEnvVar(s3EndpointUrl);

const s3Target = process.env['S3_TARGET'];
validateEnvVar(s3Target);


const cpSource = process.env['CP_SOURCE'];
validateEnvVar(cpSource);

const awsProfile = process.env['AWS_PROFILE'];
validateEnvVar(awsProfile);

shell.exec(`aws s3 cp --endpoint-url ${s3EndpointUrl} --recursive  ${cpSource} ${s3Target} --profile ${awsProfile}`);