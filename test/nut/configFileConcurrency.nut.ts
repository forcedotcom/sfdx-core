/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rm } from 'node:fs/promises';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { expect } from 'chai';
import { sleep } from '@salesforce/kit';
import { TestConfig, FILENAME } from './concurrencyConfig';

const execProm = promisify(exec);

const sharedLocation = join('sfdx-core-ut', 'test', 'configFile');

/* file and node - clock timestamps aren't precise enough to run in a UT.
 *  the goal of this and the `sleep` is to put a bit of space between operations
 *  to simulate real-world concurrency where it's unlikely to hit the same ms
 */
const SLEEP_FUDGE_MS = 5;

describe('concurrency', () => {
  beforeEach(async () => {
    await rm(join(tmpdir(), '.sfdx', 'sfdx-core-ut'), { recursive: true, force: true });
  });
  afterEach(async () => {
    await rm(join(tmpdir(), '.sfdx', 'sfdx-core-ut'), { recursive: true, force: true });
  });

  it('merges in new props from file saved since a prop was set in memory', async () => {
    const config1 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config1.set('x', 0);
    await sleep(SLEEP_FUDGE_MS);
    const config2 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config2.set('x', 1);
    await config2.write();

    const c1output = await config1.write();
    expect(c1output.x).to.equal(1);
  });

  it('newer props beat older files', async () => {
    const config1 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));

    const config2 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config2.set('x', 1);
    await config2.write();
    await sleep(SLEEP_FUDGE_MS);

    config1.set('x', 0);
    await sleep(SLEEP_FUDGE_MS);

    const c1output = await config1.write();
    expect(c1output.x).to.equal(0);
  });

  it('"deleted" (missing) props in a file do not delete from contents"', async () => {
    const config1 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config1.set('x', 0);
    await sleep(SLEEP_FUDGE_MS);

    const config2 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config2.set('x', 1);
    config2.unset('x');
    await sleep(SLEEP_FUDGE_MS);

    await config2.write();
    await sleep(SLEEP_FUDGE_MS);

    const c1output = await config1.write();
    expect(c1output.x).to.equal(0);
  });

  it('newer deleted props beat older files', async () => {
    const config1 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config1.set('x', 0);
    await sleep(SLEEP_FUDGE_MS);

    const config2 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config2.set('x', 1);

    await config2.write();
    await sleep(SLEEP_FUDGE_MS);

    config1.unset('x');

    const c1output = await config1.write();
    expect(c1output.x).to.equal(undefined);
  });

  it('deleted in both memory and file', async () => {
    const config1 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config1.set('x', 0);
    await sleep(SLEEP_FUDGE_MS);

    const config2 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    config2.set('x', 1);

    await config2.write();
    await sleep(SLEEP_FUDGE_MS);

    config2.unset('x');
    await config2.write();

    await sleep(SLEEP_FUDGE_MS);
    config1.unset('x');

    const c1output = await config1.write();
    expect(c1output.x).to.equal(undefined);
  });

  it('parallel writes from different processes produce valid json when file exists', async () => {
    const config1 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    await config1.write();
    const config2 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    const config3 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));
    const config4 = new TestConfig(TestConfig.getOptions(FILENAME, true, true, sharedLocation));

    config1.set('x', 0);
    await sleep(SLEEP_FUDGE_MS);
    config2.set('x', 1);
    config2.set('b', 2);
    await sleep(SLEEP_FUDGE_MS);
    config3.set('x', 2);
    config3.set('c', 3);
    await sleep(SLEEP_FUDGE_MS);
    config4.set('x', 3);
    await sleep(SLEEP_FUDGE_MS);

    // simulate non-deterministic parallel operations from different processes.  We can't guarantee the order of files,
    // so this might result in a set prop being deleted.
    await Promise.all([config1.write(), config2.write(), config3.write(), config4.write()]);
    await Promise.all([config1.read(), config2.read(), config3.read(), config4.read()]);
    // timestamps on the files are treated as the stamp for all props,
    // since we lose the CRDT prop - level timestamps when writing to json
    expect(config1.get('x')).to.be.greaterThanOrEqual(0).and.lessThanOrEqual(3);
    if (config1.has('b')) {
      expect(config1.get('b')).to.equal(2);
    }
    if (config1.has('c')) {
      expect(config1.get('c')).to.equal(3);
    }
    if (config2.has('b')) {
      expect(config2.get('b')).to.equal(2);
    }
    if (config2.has('c')) {
      expect(config2.get('c')).to.equal(3);
    }
  });

  it('parallel writes, reverse order, with deletes', async () => {
    const config1 = new TestConfig(TestConfig.getOptions('test', true, true, sharedLocation));
    const config2 = new TestConfig(TestConfig.getOptions('test', true, true, sharedLocation));
    const config3 = new TestConfig(TestConfig.getOptions('test', true, true, sharedLocation));
    const config4 = new TestConfig(TestConfig.getOptions('test', true, true, sharedLocation));

    config1.set('x', 7);
    await sleep(SLEEP_FUDGE_MS);
    config2.set('x', 8);
    await sleep(SLEEP_FUDGE_MS);
    config3.set('x', 9);
    await sleep(SLEEP_FUDGE_MS);
    config4.unset('x');

    await Promise.all([config4.write(), config3.write(), config2.write(), config1.write()]);
    await Promise.all([config1.read(), config2.read(), config3.read(), config4.read()]);
    if (config4.has('x')) {
      expect(config4.get('x')).to.be.greaterThanOrEqual(7).and.lessThanOrEqual(9);
    }
  });

  it('safe reads on parallel writes', async () => {
    const configOriginal = new TestConfig(TestConfig.getOptions('test', true, true, sharedLocation));
    configOriginal.set('x', 0);
    await configOriginal.write();
    await sleep(SLEEP_FUDGE_MS);

    await Promise.all(
      Array.from({ length: 20 }).map((_, i) => execProm(`yarn ts-node test/nut/concurrencyReadWrite.ts ${i}`))
    );
  });
});
