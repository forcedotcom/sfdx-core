#!/usr/bin/env node
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const shell = require('shelljs');
shell.set('-e');
shell.set('+v');

shell.rm('-rf', `lib`);
shell.rm('-rf', `docs`);

shell.rm('-f', `*xunit.xml`);
shell.rm('-f', `*checkstyle.xml`);
shell.rm('-rf', `*coverage`);
shell.rm('-rf', `.nyc_output`);

// We don't check-in lock files, so just remove them in clean
shell.rm('-f', `yarn.lock`);
shell.rm('-f', `package-lock.json`);
