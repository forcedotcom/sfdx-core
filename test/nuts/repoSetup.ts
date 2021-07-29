/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as shell from 'shelljs';
const packageName = '@salesforce/core';

export const repoSetup = (repo: string, localDir: string): void => {
  let result = shell.exec(`git clone ${repo} ${localDir}`);
  expect(result.code).to.equal(0);

  // on circle, when you have multiple `yarn install`s running, you'll get corrupt file warnings like
  // error https://registry.yarnpkg.com/cli-ux/-/cli-ux-4.9.3.tgz: Extracting tar content of undefined failed, the file appears to be corrupt: "ENOENT: no such file or directory, chmod '/home/circleci/.cache/yarn/v6/npm-cli-ux-4.9.3-4c3e070c1ea23eef010bbdb041192e0661be84ce-integrity/node_modules/cli-ux/lib/action/base.js'"
  result = shell.exec('mkdir .yarncache', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec('yarn install --cache-folder ./.yarncache', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec(`yarn link "${packageName}"`, { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec('yarn build', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec('ls -l node_modules/@salesforce/core', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);
};
