/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { whoAmI, WhoAmI, WhoAmIFactory, WhoAmIInterface } from '../../../src/exported';

class TestWhoAmI extends WhoAmI {}
const createWhoAmI = (cliName = 'sf'): WhoAmIInterface => {
  WhoAmIFactory.whoAmI = undefined;
  const me = WhoAmIFactory.instance(TestWhoAmI);
  me.cliName = cliName;
  return me;
};
describe('whoAmI', () => {
  it('should be set by default', () => {
    expect(whoAmI).to.be.ok;
    expect(whoAmI.isOther()).to.be.true;
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
