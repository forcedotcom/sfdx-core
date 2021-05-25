/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { set } from '@salesforce/kit';
import { PartialDeep } from '@salesforce/kit/lib/nodash/support';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { GlobalInfo, SfData } from '../../../src/config/globalInfoConfig';
import { ConfigFile } from '../../../src/config/configFile';
import { AuthHandler, SfdxDataHandler } from '../../../src/config/sfdxDataHandler';
import { fs } from '../../../src/exported';

describe('SfdxDataHandler', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('write', () => {
    it('should call .write on all registered handlers', async () => {
      const sfdxDataHandler = new SfdxDataHandler();
      const writeStubs = sfdxDataHandler.handlers.map((handler) => sandbox.stub(handler, 'write').resolves(null));

      await sfdxDataHandler.write();
      for (const stub of writeStubs) {
        expect(stub.callCount).to.equal(1);
      }
    });
  });

  describe('merge', () => {
    const username = 'myAccount@salesforce.com';
    const timestamp = new Date().toISOString();

    const createData = (partial: PartialDeep<SfData> = {}): SfData => {
      const base = GlobalInfo.emptyDataModel;
      base.orgs = {
        [username]: {
          orgId: '12345_SF',
          username,
          timestamp,
          instanceUrl: 'https://login.salesforce.com',
          alias: 'myOrg',
        },
      };
      const merged: SfData = GlobalInfo.emptyDataModel;
      for (const [key, value] of Object.entries(partial).concat(Object.entries(base))) {
        for (const [k, v] of Object.entries(value)) {
          const target = partial[key] && partial[key][k] ? partial[key][k] : base[key][k];
          set(merged, `${key}["${k}"]`, Object.assign({}, target, v));
        }
      }
      return merged;
    };

    it('should merge newer sfdx data into sf data', async () => {
      const sfData = createData({
        orgs: {
          [username]: {
            timestamp: new Date('2000-01-01').toISOString(),
            orgId: '12345_SF',
          },
        },
      });
      const sfdxData = createData({
        orgs: {
          [username]: { orgId: '12345_SFDX' },
        },
      });
      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);
      const sfdxDataHandler = new SfdxDataHandler();
      const merged = await sfdxDataHandler.merge(sfData);
      expect(merged).to.deep.equal(sfdxData);
    });

    it('should not merge older sfdx data into sf data', async () => {
      const sfData = createData({
        orgs: {
          [username]: {
            orgId: '12345_SF',
          },
        },
      });
      const sfdxData = createData({
        orgs: {
          [username]: {
            timestamp: new Date('2000-01-01').toISOString(),
            orgId: '12345_SFDX',
          },
        },
      });
      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);

      const sfdxDataHandler = new SfdxDataHandler();
      const merged = await sfdxDataHandler.merge(sfData);
      expect(merged).to.deep.equal(sfData);
    });

    it('should merge new sfdx data into sf data', async () => {
      const newSfdxAuthUsername = 'newAccount@salesforce.com';
      const sfData = createData();
      const sfdxData = createData({
        orgs: {
          [newSfdxAuthUsername]: {
            orgId: '12345_NEW_SFDX',
            username: newSfdxAuthUsername,
            instanceUrl: 'https://login.salesforce.com',
            alias: 'newUser',
          },
        },
      });

      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);

      const sfdxDataHandler = new SfdxDataHandler();
      const merged = await sfdxDataHandler.merge(sfData);
      const expected = GlobalInfo.emptyDataModel;
      expected.orgs = {
        [username]: sfData.orgs[username],
        [newSfdxAuthUsername]: sfdxData.orgs[newSfdxAuthUsername],
      };
      expect(merged).to.deep.equal(expected);
    });

    it('should delete data that exists in sf but not in sfdx', async () => {
      const newSfdxAuthUsername = 'newAccount@salesforce.com';
      const sfData = createData({
        orgs: {
          [newSfdxAuthUsername]: {
            orgId: '12345_NEW_SFDX',
            username: newSfdxAuthUsername,
            instanceUrl: 'https://login.salesforce.com',
            alias: 'newUser',
          },
        },
      });
      const sfdxData = createData();

      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);

      const sfdxDataHandler = new SfdxDataHandler();
      const merged = await sfdxDataHandler.merge(sfData);
      const expected = GlobalInfo.emptyDataModel;
      expected.orgs = {
        [username]: sfData.orgs[username],
      };
      expect(merged).to.deep.equal(expected);
    });

    it('should not touch new keys that are not handled', async () => {
      const newSfdxAuthUsername = 'newAccount@salesforce.com';
      const sfData = createData({
        orgs: {
          [newSfdxAuthUsername]: {
            orgId: '12345_NEW_SFDX',
            username: newSfdxAuthUsername,
            instanceUrl: 'https://login.salesforce.com',
            alias: 'newUser',
          },
        },
        tokens: {
          myToken: { token: 'XXX', user: 'functions@salesforce.com', url: 'auth.functions.heroku.com' },
        },
      });
      const sfdxData = createData({
        orgs: {
          [newSfdxAuthUsername]: {
            orgId: '12345_NEW_SFDX',
            username: newSfdxAuthUsername,
            instanceUrl: 'https://login.salesforce.com',
            alias: 'newUser',
          },
        },
      });

      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);

      const sfdxDataHandler = new SfdxDataHandler();
      const merged = await sfdxDataHandler.merge(sfData);
      expect(merged).to.deep.equal(sfData);
    });
  });

  describe('load', () => {
    it('should call migrate on all registered handlers', async () => {
      const sfdxDataHandler = new SfdxDataHandler();
      const migrateStubs = sfdxDataHandler.handlers.map((handler) => {
        return sandbox.stub(handler, 'migrate').resolves({ [handler.sfKey]: {} });
      });

      await sfdxDataHandler.merge();
      for (const stub of migrateStubs) {
        expect(stub.callCount).to.equal(1);
      }
    });
  });
});

describe('AuthHandler', () => {
  let sandbox: sinon.SinonSandbox;
  const username = 'myAccount@salesforce.com';
  const timestamp = new Date().toISOString();
  const auth = {
    orgId: '12345_SF',
    accessToken: 'token_12345',
    username,
    instanceUrl: 'https://login.salesforce.com',
    alias: 'myOrg',
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('migrate', () => {
    it('should migrate auth files into new authorization format', async () => {
      const migratedAuth = Object.assign({}, auth, { timestamp });
      sandbox.stub(AuthHandler.prototype, 'listAllAuthorizations').resolves([migratedAuth]);
      const handler = new AuthHandler();
      const migrated = await handler.migrate();
      expect(migrated).to.deep.equal({ orgs: { [username]: migratedAuth } });
    });
  });

  describe('write', () => {
    it('should write auth files for any changed authorizations', async () => {
      const writeStub = sinon.stub().returns(null);
      const unlinkStub = sinon.stub().returns(null);
      sandbox.replace(ConfigFile.prototype, 'write', writeStub);
      sandbox.replace(ConfigFile.prototype, 'unlink', unlinkStub);

      const latest = GlobalInfo.emptyDataModel;
      latest.orgs = {
        [username]: Object.assign({}, auth, { timestamp, accessToken: 'token_XXXXX' }),
      };
      const original = GlobalInfo.emptyDataModel;
      original.orgs = {
        [username]: Object.assign({}, auth, { timestamp }),
      };
      const handler = new AuthHandler();
      await handler.write(latest, original);
      expect(writeStub.callCount).to.equal(1);
      expect(unlinkStub.callCount).to.equal(0);
    });

    it('should delete auth files for any deleted authorizations', async () => {
      const writeStub = sinon.stub().returns(null);
      const unlinkStub = sinon.stub().returns(null);
      sandbox.replace(ConfigFile.prototype, 'write', writeStub);
      sandbox.replace(ConfigFile.prototype, 'unlink', unlinkStub);

      const latest = GlobalInfo.emptyDataModel;
      const original = GlobalInfo.emptyDataModel;
      original.orgs = {
        [username]: Object.assign({}, auth, { timestamp }),
      };
      const handler = new AuthHandler();
      await handler.write(latest, original);
      expect(writeStub.callCount).to.equal(0);
      expect(unlinkStub.callCount).to.equal(1);
    });
  });

  describe('listAllAuthFiles', () => {
    it('should return all auth files under .sfdx directory', async () => {
      // @ts-ignore
      sandbox.stub(fs, 'readdir').resolves([`${username}.json`, 'notAnAuthFile.json']);
      const handler = new AuthHandler();
      const authFiles = await handler.listAllAuthFiles();
      expect(authFiles).to.deep.equal([`${username}.json`]);
    });
  });

  describe('listAllAuthorizations', () => {
    it('should return all authorizations from .sfdx directory', async () => {
      sandbox.stub(AuthHandler.prototype, 'listAllAuthFiles').resolves([`${username}.json`]);
      const getContentsStub = sinon.stub().returns(auth);
      sandbox.replace(ConfigFile.prototype, 'getContents', getContentsStub);
      const mtime = new Date();
      const statStub = sinon.stub().resolves({ mtime });
      sandbox.replace(ConfigFile.prototype, 'stat', statStub);
      const handler = new AuthHandler();
      const auths = await handler.listAllAuthorizations();
      expect(auths).to.deep.equal([Object.assign({}, auth, { timestamp: mtime.toISOString() })]);
    });
  });
});
