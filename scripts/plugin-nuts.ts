import * as shell from 'shelljs';
import { strict as assert } from 'assert';
import * as os from 'os';
import * as path from 'path';

const packageName = '@salesforce/core';

// in order of increasing time/complexity
const repos = [
  'https://github.com/salesforcecli/plugin-alias',
  'https://github.com/salesforcecli/plugin-config',
  'https://github.com/salesforcecli/plugin-schema',
  'https://github.com/salesforcecli/plugin-limits',
  'https://github.com/salesforcecli/plugin-org',
  'https://github.com/salesforcecli/plugin-user',
  'https://github.com/salesforcecli/plugin-auth',
];
// check envs to make sure we can support all auth needed?

// link sfdx-core
shell.exec(`yarn link`);

// iterate repos
for (const repo of repos) {
  const localDir = `${os.tmpdir}${path.sep}${repo.split('/')[repo.split('/').length - 1]}`;
  console.log(`running ${repo} in ${localDir}`);

  // git clone
  shell.exec(`git clone ${repo} ${localDir}`);

  // install, link, and build
  shell.exec(`cd ${localDir} && yarn install && yarn link "${packageName}" && tsc -p . --pretty`);

  // verify that it linked
  shell.exec(`cd ${localDir} && ls -l node_modules/@salesforce/core`);

  // nuts
  const nutResult = shell.exec(`cd ${localDir} && yarn test:nuts`);
  assert(nutResult.code === 0, `${nutResult.stderr}`);

  // remove test folder
  shell.rm('-rf', localDir);
}

shell.exec(`yarn unlink`);
