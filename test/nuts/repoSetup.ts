/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { writeFileSync } from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import * as shell from 'shelljs';
import { fs } from '../../src/util/fs';

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

  // yarn:link doesn't like classes in two different packages with private properties.  kit is the most common violator.
  // updating tsconfig.json to find the dependency in the correct place helps
  // comments need to be removed to avoid errors
  const tsConfigPath = `${localDir}${path.sep}tsconfig.json`;
  const tsconfig = JSON.parse(stripJSONComments(fs.readFileSync(tsConfigPath)));
  tsconfig.compilerOptions.paths = tsconfig.compilerOptions.paths ?? {
    '@salesforce/kit': ['./node_modules/@salesforce/kit'],
  };
  tsconfig.compilerOptions.baseUrl = './';
  writeFileSync(tsConfigPath, JSON.stringify(tsconfig));
  result = shell.exec('yarn build', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);

  result = shell.exec('ls -l node_modules/@salesforce/core', { cwd: localDir }) as shell.ExecOutputReturnValue;
  expect(result.code).to.equal(0);
};

const stripJSONComments = (data: Buffer) => {
  const re = new RegExp('//(.*)', 'g');
  return data.toString().replace(re, '');
};
