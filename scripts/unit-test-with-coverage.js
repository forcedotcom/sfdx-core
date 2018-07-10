#!/usr/bin/env node

const shell = require('shelljs');
shell.set('-e');
shell.set('+v');

const path = require('path');

const istanbulExecutable = path.join(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  'nyc'
);

shell.exec(`${istanbulExecutable} mocha -R xunit-file "test/unit/**/*.ts"`);

let prefix = process.platform;

shell.mv(`checkstyle.xml`, `${prefix}-checkstyle.xml`);
shell.cp(`xunit.xml`, `${prefix}-unit-xunit.xml`);
shell.rm('-rf', `${prefix}unitcoverage`);
shell.mv(`coverage`, `${prefix}unitcoverage`);