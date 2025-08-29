/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { promisify } from 'node:util';
import { exec } from 'node:child_process';
import * as fs from 'node:fs';
import path from 'node:path';
import { expect } from 'chai';
import { ConfigAggregator } from '../../src';

const execProm = promisify(exec);
const testDir = 'config-aggregator-nut-projects';
const testDir1 = path.join(testDir, 'test-project-1');
const testDir2 = path.join(testDir, 'test-project-2');
const testDir1Abs = path.resolve(testDir1);
const testDir2Abs = path.resolve(testDir2);

describe('configAggregator unique by paths', () => {
  before(async () => {
    // ensure a global config exists
    // create 2 projects, each with a different target org
    await fs.promises.mkdir(testDir, { recursive: true });
    await Promise.all([
      execProm(`sf project generate --name test-project-1 --output-dir ${testDir}`),
      execProm(`sf project generate --name test-project-2 --output-dir ${testDir}`),
    ]);

    // config a target-org in each project
    await Promise.all([
      execProm('sf config set org-max-query-limit=1', { cwd: testDir1 }),
      execProm('sf config set org-max-query-limit=2', { cwd: testDir2 }),
    ]);
  });

  it('verify project 1 config', async () => {
    const config = await ConfigAggregator.create({ projectPath: testDir1 });
    expect(config.getPropertyValue('org-max-query-limit')).to.equal('1');
  });

  it('verify project 2 config', async () => {
    const config = await ConfigAggregator.create({ projectPath: testDir2 });
    expect(config.getPropertyValue('org-max-query-limit')).to.equal('2');
  });

  it('add a prop to only project 2, verify both projects are as expected after reloading', async () => {
    await execProm('sf config set org-metadata-rest-deploy=true', { cwd: testDir2 });
    const config = await ConfigAggregator.create({ projectPath: testDir2 });
    expect(config.getPropertyValue('org-max-query-limit')).to.equal('2');

    // undefined because singleton behavior prevents a reread
    expect(config.getPropertyValue('org-metadata-rest-deploy')).to.equal(undefined);

    // reload the config
    await config.reload();
    expect(config.getPropertyValue('org-max-query-limit')).to.equal('2');
    expect(config.getPropertyValue('org-metadata-rest-deploy')).to.equal('true');
  });

  describe('clearInstance', () => {
    it('clearInstance with specific path should only clear that project', async () => {
      const [config1, config2] = await Promise.all([
        ConfigAggregator.create({ projectPath: testDir1Abs }),
        ConfigAggregator.create({ projectPath: testDir2Abs }),
      ]);

      // Verify they have different values
      expect(config1.getPropertyValue('org-max-query-limit')).to.equal('1');
      expect(config2.getPropertyValue('org-max-query-limit')).to.equal('2');

      // Clear only project 1
      await ConfigAggregator.clearInstance(testDir1Abs);

      // Project 1 should get a new instance, project 2 should be same
      const newConfig1 = await ConfigAggregator.create({ projectPath: testDir1Abs });
      const sameConfig2 = await ConfigAggregator.create({ projectPath: testDir2Abs });

      // Verify behavior: new instance for project 1, same instance for project 2
      expect(newConfig1).to.not.equal(config1);
      expect(sameConfig2).to.equal(config2);

      // Values should still be correct
      expect(newConfig1.getPropertyValue('org-max-query-limit')).to.equal('1');
      expect(sameConfig2.getPropertyValue('org-max-query-limit')).to.equal('2');
    });

    it('clearInstance without path should clear all instances', async () => {
      const config1 = await ConfigAggregator.create({ projectPath: testDir1Abs });
      const config2 = await ConfigAggregator.create({ projectPath: testDir2Abs });

      // Clear all instances
      await ConfigAggregator.clearInstance();

      // Both projects should get new instances
      const newConfig1 = await ConfigAggregator.create({ projectPath: testDir1Abs });
      const newConfig2 = await ConfigAggregator.create({ projectPath: testDir2Abs });

      // Verify both are new instances
      expect(newConfig1).to.not.equal(config1);
      expect(newConfig2).to.not.equal(config2);

      // Values should still be correct
      expect(newConfig1.getPropertyValue('org-max-query-limit')).to.equal('1');
      expect(newConfig2.getPropertyValue('org-max-query-limit')).to.equal('2');
    });
  });

  it('absolute and relative paths to same project should return same instance', async () => {
    // Clear any existing instances to start fresh
    await ConfigAggregator.clearInstance();

    const config1 = await ConfigAggregator.create({ projectPath: testDir1Abs });
    const config2 = await ConfigAggregator.create({ projectPath: testDir1 });

    // Should be the same instance (after path normalization)
    expect(config1).to.equal(config2);

    // Both should have the same config value
    expect(config1.getPropertyValue('org-max-query-limit')).to.equal('1');
    expect(config2.getPropertyValue('org-max-query-limit')).to.equal('1');
  });

  describe('static getValue with project paths', () => {
    it('getValue should work with different project paths', async () => {
      const value1 = ConfigAggregator.getValue('org-max-query-limit', testDir1);
      const value2 = ConfigAggregator.getValue('org-max-query-limit', testDir2);

      expect(value1.value).to.equal('1');
      expect(value2.value).to.equal('2');
      expect(value1.location).to.equal('Local');
      expect(value2.location).to.equal('Local');
    });

    it('getValue without project path should use current working directory', async () => {
      // Change to project 1 directory
      const originalCwd = process.cwd();
      try {
        process.chdir(testDir1Abs);
        const value = ConfigAggregator.getValue('org-max-query-limit');
        expect(value.value).to.equal('1');
        expect(value.location).to.equal('Local');
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('getValue should normalize relative and absolute paths consistently', async () => {
      const value1 = ConfigAggregator.getValue('org-max-query-limit', testDir1Abs);
      const value2 = ConfigAggregator.getValue('org-max-query-limit', testDir1);

      expect(value1.value).to.equal(value2.value);
      expect(value1.location).to.equal(value2.location);
      expect(value1.path).to.equal(value2.path);
    });
  });

  after(async () => {
    // remove the test projects
    await fs.promises.rm(testDir, { recursive: true });
  });
});
