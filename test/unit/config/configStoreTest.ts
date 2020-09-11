/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { BaseConfigStore } from '../../../src/config/configStore';

class TestConfig extends BaseConfigStore<BaseConfigStore.Options> {
  public async init(): Promise<void> {}
}

describe('ConfigStore', () => {
  it('for each value', async () => {
    const config = await TestConfig.create({});
    config.set('1', 'a');
    config.set('2', 'b');

    let st = '';
    config.forEach((key, val) => {
      st += `${key}${val}`;
    });
    expect(st).to.equal('1a2b');
  });
  it('await each value', async () => {
    const config = await TestConfig.create({});
    config.set('1', 'a');
    config.set('2', 'b');

    let st = '';
    await config.awaitEach(async (key, val) => {
      st += `${key}${val}`;
    });
    expect(st).to.equal('1a2b');
  });
});
