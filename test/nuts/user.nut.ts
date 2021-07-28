/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as os from 'os';
import * as path from 'path';
import * as shell from 'shelljs';
import { expect } from 'chai';

const packageName = '@salesforce/core';

const repo = 'https://github.com/salesforcecli/plugin-user';
const localDir = `${os.tmpdir}${path.sep}${repo.split('/')[repo.split('/').length - 1]}`;

describe(repo, () => {
  before(() => {
    shell.exec(`git clone ${repo} ${localDir}`);
    shell.exec('yarn install', { cwd: localDir });
    shell.exec(`yarn link "${packageName}"`, { cwd: localDir });
    shell.exec('yarn build', { cwd: localDir });
    shell.exec('ls -l node_modules/@salesforce/core', { cwd: localDir });
  });

  it('executes the nuts', () => {
    const nutResult = shell.exec('yarn test:nuts', { cwd: localDir }) as shell.ExecOutputReturnValue;
    expect(nutResult.code, `${nutResult.stderr}`).to.equal(0);
  });

  after(() => {
    shell.rm('-rf', localDir);
  });
});
