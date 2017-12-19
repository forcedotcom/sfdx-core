#!/usr/bin/env node

const shell = require('shelljs');
shell.set('-e');
shell.set('+v');

const path = require('path');

const istanbulExecutable = path.join(
  __dirname,
  '..',
  'node_modules',
  'istanbul',
  'lib',
  'cli.js'
);

shell.exec('yarn test')
shell.exec(`${istanbulExecutable} cover --report cobertura _mocha -- -t 2000 --recursive dist/test/unit`);
shell.exec(`${istanbulExecutable} report --report html json-summary`);// -- --config unitTestCoverageTargets.yaml`);

let prefix;

if (process.platform.match(/win/)) {
    prefix = 'windows';
} else if (process.platform.match(/darwin/)) {
    prefix = 'darwin';
} else {
    prefix = 'linux';
}

shell.mv(`checkstyle.xml`, `${prefix}-checkstyle.xml`);
shell.mv(`xunit.xml`, `${prefix}-unit-xunit.xml`);
shell.rm('-rf', `${prefix}unitcoverage`);
shell.mv(`coverage`, `${prefix}unitcoverage`);