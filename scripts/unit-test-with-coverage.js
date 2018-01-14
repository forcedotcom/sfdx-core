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

shell.exec(`${istanbulExecutable} cover --report cobertura node_modules/mocha/bin/_mocha -- -t 2000 --recursive dist/test/unit -R xunit-file`);
shell.exec(`${istanbulExecutable} report --report html json-summary`);

let prefix = process.platform;

shell.mv(`checkstyle.xml`, `${prefix}-checkstyle.xml`);
shell.cp(`xunit.xml`, `${prefix}-unit-xunit.xml`);
shell.rm('-rf', `${prefix}unitcoverage`);
shell.mv(`coverage`, `${prefix}unitcoverage`);