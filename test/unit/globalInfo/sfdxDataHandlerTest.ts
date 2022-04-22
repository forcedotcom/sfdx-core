/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import * as fs from 'fs';
import { set } from '@salesforce/kit';
import { PartialDeep } from '@salesforce/kit/lib/nodash/support';
import { expect } from 'chai';
import * as sinon from 'sinon';
import {
  AliasesHandler,
  AuthHandler,
  GlobalInfo,
  SfdxDataHandler,
  SfInfo,
  SfInfoKeys,
  SandboxesHandler,
  SfOrg,
} from '../../../src/globalInfo';
import { ConfigFile } from '../../../src/config/configFile';
import { SfSandbox } from '../../../lib/globalInfo';

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

    const createData = (partial: PartialDeep<SfInfo> = {}): SfInfo => {
      const base = GlobalInfo.emptyDataModel;
      base.orgs = {
        [username]: {
          orgId: '12345_SF',
          username,
          timestamp,
          instanceUrl: 'https://login.salesforce.com',
          aliases: ['myOrg'],
        },
      };
      base.sandboxes = {
        '12345_SF': {
          prodOrgUsername: 'admin@prod.org',
          sandboxUsername: username,
          timestamp,
          sandboxName: '',
          sandboxOrgId: '1234_SF',
        },
      };
      const merged: SfInfo = GlobalInfo.emptyDataModel;
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
      sandbox.stub(AliasesHandler.prototype, 'migrate').resolves({ aliases: {} });
      sandbox.stub(SandboxesHandler.prototype, 'migrate').resolves(sfdxData);
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
        sandboxes: {
          '12345_SF': { prodOrgUsername: 'admin@prod.org', timestamp: new Date().toISOString() },
        },
      });
      const sfdxData = createData({
        orgs: {
          [username]: {
            timestamp: new Date('2000-01-01').toISOString(),
            orgId: '12345_SF',
          },
        },
        sandboxes: {
          '12345_SF': { prodOrgUsername: 'admin@prod.org', timestamp: new Date('2000-01-01').toISOString() },
        },
      });
      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);
      sandbox.stub(AliasesHandler.prototype, 'migrate').resolves({ aliases: {} });
      sandbox.stub(SandboxesHandler.prototype, 'migrate').resolves(sfdxData);

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
            aliases: ['newUser'],
          },
        },
        sandboxes: {
          '12345_NEW_SFDX': {
            prodOrgUsername: 'admin@prod.org',
            sandboxUsername: newSfdxAuthUsername,
            sandboxOrgId: '12345_NEW_SFDX',
            sandboxName: '',
          },
        },
      });

      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);
      sandbox.stub(AliasesHandler.prototype, 'migrate').resolves({ aliases: {} });
      sandbox.stub(SandboxesHandler.prototype, 'migrate').resolves(sfdxData);

      const sfdxDataHandler = new SfdxDataHandler();
      const merged = await sfdxDataHandler.merge(sfData);
      const expected = GlobalInfo.emptyDataModel;
      expected.orgs = {
        [username]: sfData.orgs[username],
        [newSfdxAuthUsername]: sfdxData.orgs[newSfdxAuthUsername],
      };
      expected.sandboxes = {
        '12345_SF': sfData.sandboxes['12345_SF'],
        '12345_NEW_SFDX': sfdxData.sandboxes['12345_NEW_SFDX'],
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
            aliases: ['newUser'],
          },
        },
      });
      const sfdxData = createData();

      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);
      sandbox.stub(AliasesHandler.prototype, 'migrate').resolves({ aliases: {} });
      sandbox.stub(SandboxesHandler.prototype, 'migrate').resolves({ sandboxes: {} });

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
            aliases: ['newUser'],
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
            aliases: ['newUser'],
          },
        },
      });

      sandbox.stub(AuthHandler.prototype, 'migrate').resolves(sfdxData);
      sandbox.stub(AliasesHandler.prototype, 'migrate').resolves({ aliases: {} });
      sandbox.stub(SandboxesHandler.prototype, 'migrate').resolves(sfdxData);

      const sfdxDataHandler = new SfdxDataHandler();
      const merged = await sfdxDataHandler.merge(sfData);
      expect(merged).to.deep.equal(sfData);
    });
  });

  describe('load', () => {
    it('should call migrate on all registered handlers', async () => {
      const sfdxDataHandler = new SfdxDataHandler();
      const migrateStubs = sfdxDataHandler.handlers.map((handler) => {
        if (handler.sfKey === SfInfoKeys.ALIASES) {
          return sandbox.stub(handler, 'migrate').resolves({ [SfInfoKeys.ALIASES]: {} });
        }
        if (handler.sfKey === SfInfoKeys.SANDBOXES) {
          return sandbox.stub(handler, 'migrate').resolves({ [SfInfoKeys.SANDBOXES]: {} });
        }
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
    aliases: ['myOrg'],
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
      sandbox.stub(fs.promises, 'readdir').resolves([`${username}.json`, 'notAnAuthFile.json']);
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

describe('AliasesHandler', () => {
  let sandbox: sinon.SinonSandbox;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });
  describe('migrate', () => {
    const username = 'myAccount@salesforce.com';
    it('should migrate aliases from sfdx to sf', async () => {
      sandbox.stub(fs.promises, 'readFile').resolves(`{ "orgs": { "myorg": "${username}"}}`);
      const aliasesHandler = new AliasesHandler();
      const migrated = await aliasesHandler.migrate();
      expect(migrated.aliases).to.deep.equal({ ['myorg']: username });
    });
  });
  describe('merge', () => {
    const username = 'myAccount@salesforce.com';
    const timestamp = new Date().toISOString();
    const auth = {
      orgId: '12345_SF',
      accessToken: 'token_12345',
      username,
      instanceUrl: 'https://login.salesforce.com',
    } as SfOrg;
    it('should merge sfdx aliases to aliases', async () => {
      sandbox
        .stub(fs.promises, 'readFile')
        .resolves(`{ "orgs": { "myorg": "${username}", "someOtherAlias": "someOtherAliasValue" } }`);
      const getContentsStub = sinon.stub().returns(auth);
      sandbox.replace(ConfigFile.prototype, 'getContents', getContentsStub);
      const sfInfo = {
        [SfInfoKeys.ORGS]: { [username]: { ...auth, timestamp } },
        [SfInfoKeys.TOKENS]: {},
        [SfInfoKeys.ALIASES]: { someOtherAlias: 'someOtherAliasValue' },
        [SfInfoKeys.SANDBOXES]: {},
      } as SfInfo;
      const aliasesHandler = new AliasesHandler();
      const merged = await aliasesHandler.merge(sfInfo);
      expect(merged.aliases).to.deep.equal({ ['myorg']: username, someOtherAlias: 'someOtherAliasValue' });
    });
    it('should remove alias when deleted from sfdx aliases', async () => {
      sandbox.stub(fs.promises, 'readFile').resolves(`{ "orgs": { "myorg": "${username}" } }`);
      const getContentsStub = sinon.stub().returns(auth);
      sandbox.replace(ConfigFile.prototype, 'getContents', getContentsStub);
      const sfInfo = {
        [SfInfoKeys.ORGS]: { [username]: { ...auth, timestamp } },
        [SfInfoKeys.TOKENS]: {},
        [SfInfoKeys.ALIASES]: { ['myorg']: username, someOtherAlias: 'someOtherAliasValue' },
        [SfInfoKeys.SANDBOXES]: {},
      } as SfInfo;
      const aliasesHandler = new AliasesHandler();
      const merged = await aliasesHandler.merge(sfInfo);
      expect(merged.aliases).to.deep.equal({ ['myorg']: username });
    });
  });
});

describe('SandboxesHandler', () => {
  let sinonSandbox: sinon.SinonSandbox;
  const sandboxUsername = 'myAccount@salesforce.com';
  const sandboxOrgId = '00D123456789XXX';
  const prodOrgUsername = 'admin@prod.org';
  const sandboxName = 'foo';
  const timestamp = new Date().toISOString();
  const sfSandbox = {
    sandboxOrgId,
    sandboxUsername,
    prodOrgUsername,
    sandboxName,
  } as SfSandbox;

  const sfdxSandbox = {
    prodOrgUsername,
  };

  const partialSfSandbox = {
    prodOrgUsername,
    sandboxOrgId,
  };

  beforeEach(() => {
    sinonSandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sinonSandbox.restore();
  });

  describe('migrate', () => {
    it('should migrate sandbox files files into new sandbox format', async () => {
      const migratedSandbox = Object.assign({}, sfSandbox, { timestamp });
      sinonSandbox.stub(SandboxesHandler.prototype, 'listAllSandboxes').resolves([migratedSandbox]);
      const handler = new SandboxesHandler();
      const migrated = await handler.migrate();
      expect(migrated).to.deep.equal({ sandboxes: { [sandboxOrgId]: migratedSandbox } });
    });
  });

  describe('write', () => {
    it('should write sandbox files for any changed sandboxes', async () => {
      const writeStub = sinon.stub().returns(null);
      const unlinkStub = sinon.stub().returns(null);
      sinonSandbox.replace(ConfigFile.prototype, 'write', writeStub);
      sinonSandbox.replace(ConfigFile.prototype, 'unlink', unlinkStub);

      const latest = GlobalInfo.emptyDataModel;
      latest.sandboxes = {
        [sandboxOrgId]: Object.assign({}, sfSandbox, { timestamp, sandboxName: 'bar' }),
      };
      const original = GlobalInfo.emptyDataModel;
      original.sandboxes = {
        [sandboxOrgId]: Object.assign({}, sfSandbox),
      };
      const handler = new SandboxesHandler();
      await handler.write(latest, original);
      expect(writeStub.callCount).to.equal(1);
      expect(unlinkStub.callCount).to.equal(0);
    });

    it('should delete sfdx sandbox files for any deleted sandboxes', async () => {
      const writeStub = sinon.stub().returns(null);
      const unlinkStub = sinon.stub().returns(null);
      sinonSandbox.replace(ConfigFile.prototype, 'write', writeStub);
      sinonSandbox.replace(ConfigFile.prototype, 'unlink', unlinkStub);

      const latest = GlobalInfo.emptyDataModel;
      const original = GlobalInfo.emptyDataModel;
      original.sandboxes = {
        [sandboxOrgId]: Object.assign({}, sfSandbox),
      };
      const handler = new SandboxesHandler();
      await handler.write(latest, original);
      expect(writeStub.callCount).to.equal(0);
      expect(unlinkStub.callCount).to.equal(1);
    });
  });

  describe('listAllSandboxFiles', () => {
    it('should return all auth files under .sfdx directory', async () => {
      // @ts-ignore
      sinonSandbox.stub(fs.promises, 'readdir').resolves([`${sandboxOrgId}.sandbox.json`, `${sandboxUsername}.json`]);
      const handler = new SandboxesHandler();
      const sandboxFiles = await handler.listAllSandboxFiles();
      expect(sandboxFiles).to.deep.equal([`${sandboxOrgId}.sandbox.json`]);
    });
  });

  describe('listAllSandboxes', () => {
    it('should return all sandboxes from .sfdx directory', async () => {
      sinonSandbox.stub(SandboxesHandler.prototype, 'listAllSandboxFiles').resolves([`${sandboxOrgId}.sandbox.json`]);
      const getContentsStub = sinon.stub().returns(sfdxSandbox);
      sinonSandbox.replace(ConfigFile.prototype, 'getContents', getContentsStub);
      const mtime = new Date();
      const statStub = sinon.stub().resolves({ mtime });
      sinonSandbox.replace(ConfigFile.prototype, 'stat', statStub);
      const handler = new SandboxesHandler();
      const sandboxes = await handler.listAllSandboxes();
      expect(sandboxes).to.deep.equal([Object.assign({}, partialSfSandbox, { timestamp: mtime.toISOString() })]);
    });
  });
});
