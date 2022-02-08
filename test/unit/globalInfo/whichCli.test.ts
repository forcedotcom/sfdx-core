/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { whichCli, WhichCli, WhichCliFactory, WhichCliInterface } from '../../../src/exported';

class TestWhichCli extends WhichCli {}
const createWhoAmI = (cliName = 'sf'): WhichCliInterface => {
  WhichCliFactory.whichCli = undefined;
  const me = WhichCliFactory.instance(TestWhichCli);
  me.cliName = cliName;
  return me;
};
describe('whoAmI', () => {
  it('should be set by default', () => {
    expect(whichCli).to.be.ok;
    expect(whichCli.isOther()).to.be.true;
  });
  it('should be sf', () => {
    const me = createWhoAmI('sf');
    expect(me).to.be.ok;
    expect(me.isSf()).to.be.true;
  });
  it('should be sfdx', () => {
    const me = createWhoAmI('sfdx');
    expect(me).to.be.ok;
    expect(me.isSfdx()).to.be.true;
  });
});
