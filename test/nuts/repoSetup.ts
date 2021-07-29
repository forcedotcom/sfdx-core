/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import * as shell from 'shelljs';

export const repoSetup = (repo: string, localDir: string, packageName: string) => {
  let result = shell.exec(`git clone ${repo} ${localDir}`);
  expect(result.code).to.equal(0);
  result = shell.exec('yarn install', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec(`yarn link "${packageName}"`, { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec('yarn build', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec('ls -l node_modules/@salesforce/core', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);
};
