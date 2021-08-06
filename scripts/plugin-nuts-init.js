#!/usr/bin/env node
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const assert = require('assert').strict;

const nutsFolder = `${process.env.PWD}/test/nuts-from-plugins`;
const repos = [
  'https://github.com/salesforcecli/plugin-alias',
  'https://github.com/salesforcecli/plugin-limits',
  'https://github.com/salesforcecli/plugin-config',
  'https://github.com/salesforcecli/plugin-org',
  'https://github.com/salesforcecli/plugin-user',
  'https://github.com/salesforcecli/plugin-schema',
  'https://github.com/salesforcecli/plugin-telemetry',
  'https://github.com/salesforcecli/plugin-auth',
  'https://github.com/salesforcecli/toolbelt',
  // TODO:
  // 'https://github.com/salesforcecli/plugin-data',
];

const repoSetup = async (repo) => {
  const repoName = repo.substr(repo.lastIndexOf('/') + 1);
  const folderPath = `${nutsFolder}/${repoName}`;
  console.log(`cloning/building ${repoName} at ${folderPath}`);

  await exec(`git clone ${repo} ${folderPath}`);
  await exec('mkdir .yarncache', { cwd: folderPath });

  await exec(`yarn install --cache-folder ./.yarncache`, { cwd: folderPath });
  await exec('yarn link "@salesforce/core"', { cwd: folderPath });
  await exec(`yarn compile`, { cwd: folderPath });
  const { stdout, stderr } = await exec(`yarn test:nuts`, { cwd: folderPath });

  // should be all clear
  if (!stderr) {
    console.log(`all NUTs for ${repoName} passed`);
  } else {
    console.log(stdout);
    assert(!stderr, `NUTs for ${repoName} failed ${stderr}`);
  }
};

(async () => {
  await exec('yarn link');
  try {
    await Promise.all(repos.map((repo) => repoSetup(repo)));
  } finally {
    await Promise.all([
      fs.promises.rm(`${process.env.PWD}/test/nuts-from-plugins`, { recursive: true, force: true }),
      exec('yarn unlink'),
    ]);
    await fs.promises.rm(`${process.env.PWD}/test/nuts-from-plugins`, { recursive: true, force: true });
  }
})();
