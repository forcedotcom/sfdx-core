/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from 'chai';
import { SinonSpy, SinonStub } from 'sinon';
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { Env } from '@salesforce/kit';
import { shouldThrow, testSetup } from '../../../src/testSetup';
import { SfdcUrl } from '../../../src/util/sfdcUrl';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';

const $$ = testSetup();
const TEST_IP = '1.1.1.1';
const TEST_CNAMES = ['https://login.salesforce.com', 'https://test.salesforce.com'];

describe('util/sfdcUrl', () => {
  describe('isSalesforceDomain', () => {
    it('is allowlist domain', () => {
      const url = new SfdcUrl('https://www.salesforce.com');
      expect(url.isSalesforceDomain()).to.be.true;
    });

    it('is not allowlist or host', () => {
      const url = new SfdcUrl('https://www.ghostbusters.com');
      expect(url.isSalesforceDomain()).to.be.false;
    });

    it('is allowlist host', () => {
      const url = new SfdcUrl('https://developer.salesforce.com');
      expect(url.isSalesforceDomain()).to.be.true;
    });
  });

  describe('internal domains', () => {
    it('stm is internal but not local', () => {
      const url = new SfdcUrl('https://inttestdevhub02-dev-ed.lightning.stmfa.stm.force.com/');
      expect(url.isInternalUrl()).to.equal(true);
      expect(url.isLocalUrl()).to.equal(false);
    });
    it('pc.rnd is internal but not local', () => {
      const url = new SfdcUrl('https://alm-cidevhubora3test1core4.test1.lightning.pc-rnd.force.com/');
      expect(url.isInternalUrl()).to.equal(true);
      expect(url.isLocalUrl()).to.equal(false);
    });
    it('localhost domain is both internal and local, and tolerates local host ports', () => {
      const url = new SfdcUrl('https://scorpio-ryan-2873-dev-ed.my.localhost.sfdcdev.salesforce.com:6109');
      expect(url.isInternalUrl()).to.equal(true);
      expect(url.isLocalUrl()).to.equal(true);
    });
  });

  describe('checkLightningDomain', () => {
    let resolveStub: SinonStub;
    beforeEach(() => {
      resolveStub = stubMethod($$.SANDBOX, MyDomainResolver.prototype, 'resolve').resolves(TEST_IP);
    });

    afterEach(() => {
      resolveStub.restore();
    });

    it('return true for internal urls', async () => {
      const url = new SfdcUrl('https://my-domain.stm.salesforce.com');
      const response = await url.checkLightningDomain();
      expect(response).to.be.true;
    });

    it('return true for urls that dns can resolve', async () => {
      const url = new SfdcUrl('https://login.salesforce.com');
      const response = await url.checkLightningDomain();
      expect(response).to.be.true;
    });

    it('throws on domain resolution failure', async () => {
      resolveStub.restore();
      resolveStub = stubMethod($$.SANDBOX, MyDomainResolver.prototype, 'resolve').rejects();
      const url = new SfdcUrl('https://login.salesforce.com');
      try {
        await shouldThrow(url.checkLightningDomain());
      } catch (e) {
        expect(e.name).to.equal('Error');
      }
    });
  });

  describe('Insecure HTTP warning', () => {
    let emitWarningSpy: SinonSpy;
    beforeEach(() => {
      emitWarningSpy = spyMethod($$.SANDBOX, process, 'emitWarning');
    });

    afterEach(() => {
      emitWarningSpy.restore();
    });

    it('emits the insecure http signal', () => {
      const site = 'http://insecure.website.com';
      const url = new SfdcUrl(site);
      const { protocol } = url;
      expect(protocol).to.equal('http:');
      expect(emitWarningSpy.callCount).to.equal(1);
      expect(emitWarningSpy.args).to.deep.equal([[`Using insecure protocol: ${protocol} on url: ${site}`]]);
    });

    it('emits the insecure http signal only once per domain', () => {
      const site = 'http://another.insecure.website.com';
      const url1 = new SfdcUrl(site);
      const url2 = new SfdcUrl(site);
      const { protocol: protocol1 } = url1;
      const { protocol: protocol2 } = url2;
      expect(protocol1).to.equal('http:');
      expect(protocol2).to.equal('http:');
      expect(emitWarningSpy.callCount).to.equal(1);
    });
  });

  describe('getJwtAudienceUrl', () => {
    const env = new Env();
    before(() => {
      $$.SANDBOX.stub(MyDomainResolver.prototype, 'getCnames').resolves(TEST_CNAMES);
    });

    it('return the jwt audicence url for sandbox domains', async () => {
      const url = new SfdcUrl('https://organization.my.salesforce.com');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal('https://test.salesforce.com');
    });

    it('return the jwt audicence url for internal domains (same)', async () => {
      const url = new SfdcUrl('https://organization.stm.salesforce.com');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal('https://organization.stm.salesforce.com');
    });

    it('return the jwt audicence url for sandbox domains', async () => {
      const url = new SfdcUrl('https://organization.sandbox.my.salesforce.com');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal('https://test.salesforce.com');
    });

    it('should use the correct audience URL for createdOrgInstance beginning with "gs1"', async () => {
      $$.SANDBOX.stub(MyDomainResolver.prototype, 'getCnames').resolves([]);
      const url = new SfdcUrl('https://foo.bar.baz');
      const response = await url.getJwtAudienceUrl('gs1');
      expect(response).to.be.equal('https://gs1.salesforce.com');
    });

    it('should return production URL if domain cannot be resolved', async () => {
      $$.SANDBOX.stub(MyDomainResolver.prototype, 'getCnames').resolves([]);
      const url = new SfdcUrl('https://foo.bar.baz');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal('https://login.salesforce.com');
    });

    it('should use the correct audience URL for SFDX_AUDIENCE_URL env var', async () => {
      env.setString('SFDX_AUDIENCE_URL', 'http://authInfoTest/audienceUrl/test');
      const url = new SfdcUrl('https://login.salesforce.com');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal(process.env.SFDX_AUDIENCE_URL);
    });
  });

  describe('lookup', () => {
    it('should be able to do dns lookup', async () => {
      stubMethod($$.SANDBOX, MyDomainResolver.prototype, 'resolve').resolves(TEST_IP);
      const url = new SfdcUrl('https://foo.bar.baz');
      const ip = await url.lookup();
      expect(ip).to.be.equal(TEST_IP);
    });

    it('shoult throw on dns resulution failure', async () => {
      stubMethod($$.SANDBOX, MyDomainResolver.prototype, 'resolve').rejects();
      const url = new SfdcUrl('https://bad.url.salesforce.com');
      try {
        await shouldThrow(url.lookup());
      } catch (e) {
        expect(e.name).to.equal('Error');
      }
    });
  });

  describe('isSalesforceDomain', () => {
    it('returns true if url is salesforce domain', () => {
      const url = new SfdcUrl('https://organization.salesforce.com');
      const isSalesforceDomain = url.isSalesforceDomain();
      expect(isSalesforceDomain).to.be.true;
    });

    it('returns false if url is not a salesforce domain', () => {
      const url = new SfdcUrl('https://www.ghostbusters.com');
      const isSalesforceDomain = url.isSalesforceDomain();
      expect(isSalesforceDomain).to.be.false;
    });
  });

  describe('Salesforce standard urls', () => {
    it('sandbox url', () => {
      expect(SfdcUrl.SANDBOX).to.equal('https://test.salesforce.com');
    });

    it('production url', () => {
      expect(SfdcUrl.PRODUCTION).to.equal('https://login.salesforce.com');
    });
  });
});
