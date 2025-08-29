/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { expect } from 'chai';
import { SinonSpy, SinonStub } from 'sinon';
import { spyMethod, stubMethod } from '@salesforce/ts-sinon';
import { Env } from '@salesforce/kit';
import { shouldThrow, TestContext } from '../../../src/testSetup';
import { getLoginAudienceCombos, SfdcUrl } from '../../../src/util/sfdcUrl';
import { MyDomainResolver } from '../../../src/status/myDomainResolver';

describe('util/sfdcUrl', () => {
  const $$ = new TestContext();
  const TEST_IP = '1.1.1.1';
  describe('isValidUrl', () => {
    it('should return true if given a valid url', () => {
      expect(SfdcUrl.isValidUrl('https://www.salesforce.com')).to.be.true;
    });

    it('should return false if given an invalid url', () => {
      expect(SfdcUrl.isValidUrl('salesforce.com')).to.be.false;
    });
  });

  describe('toLightningdomain', () => {
    describe('official test cases from domains team', () => {
      it('SFDC (non-propagated)', () => {
        expect(new SfdcUrl('https://na44.salesforce.com').toLightningDomain()).to.equal(
          'https://na44.lightning.force.com'
        );
      });

      it('SFDC/DB/CLOUDFORCE (legacy instanceless domains) ', () => {
        expect(new SfdcUrl('https://org62.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62--sbox1.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62--sbox1.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.database.com').toLightningDomain()).to.equal(
          'https://org62.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62--sbox1.database.com').toLightningDomain()).to.equal(
          'https://org62--sbox1.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.cloudforce.com').toLightningDomain()).to.equal(
          'https://org62.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62--sbox1.cloudforce.com').toLightningDomain()).to.equal(
          'https://org62--sbox1.lightning.force.com'
        );
      });
      it('alternative domains with weird hyphen pattern', () => {
        expect(new SfdcUrl('https://org62.my-salesforce.com').toLightningDomain()).to.equal(
          'https://org62.my-lightning.com'
        );
        expect(new SfdcUrl('https://sbox1.org62.sandbox.my-salesforce.com').toLightningDomain()).to.equal(
          'https://sbox1.org62.sandbox.my-lightning.com'
        );
      });
      it('mil', () => {
        expect(new SfdcUrl('https://org62.my.salesforce.mil').toLightningDomain()).to.equal(
          'https://org62.lightning.crmforce.mil'
        );
        expect(new SfdcUrl('https://org62--sbox1.sandbox.my.salesforce.mil').toLightningDomain()).to.equal(
          'https://org62--sbox1.sandbox.lightning.crmforce.mil'
        );
      });
      it('enhanced domains', () => {
        expect(new SfdcUrl('https://org62.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62--sbox1.sandbox.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62--sbox1.sandbox.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.develop.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.develop.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.scratch.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.scratch.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.demo.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.demo.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.patch.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.patch.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.trailblaze.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.trailblaze.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.free.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.free.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.bt.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.bt.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.sfdctest.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.sfdctest.lightning.force.com'
        );
        expect(new SfdcUrl('https://org62.sfdcdot.my.salesforce.com').toLightningDomain()).to.equal(
          'https://org62.sfdcdot.lightning.force.com'
        );
      });
    });
    describe('trailing slashes', () => {
      it('works for com', () => {
        expect(new SfdcUrl('https://some-instance.my.salesforce.com/').toLightningDomain()).to.equal(
          'https://some-instance.lightning.force.com'
        );
      });
      it('works for mil (prod)', () => {
        expect(new SfdcUrl('https://some-instance.my.salesforce.mil/').toLightningDomain()).to.equal(
          'https://some-instance.lightning.crmforce.mil'
        );
      });
      it('works for mil (sandbox)', () => {
        expect(new SfdcUrl('https://some-instance--sboxname.sandbox.my.salesforce.mil/').toLightningDomain()).to.equal(
          'https://some-instance--sboxname.sandbox.lightning.crmforce.mil'
        );
      });
    });
    describe('cnEdition', () => {
      it('prod', () => {
        expect(new SfdcUrl('https://foo.my.sfcrmproducts.cn').toLightningDomain()).to.equal(
          'https://foo.lightning.sfcrmapps.cn'
        );
      });
      it('sbox', () => {
        expect(new SfdcUrl('https://foo--sbox1.sandbox.my.sfcrmproducts.cn').toLightningDomain()).to.equal(
          'https://foo--sbox1.sandbox.lightning.sfcrmapps.cn'
        );
      });
    });
  });

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

    it('cnEdition', () => {
      const url = new SfdcUrl('https://foo.my.sfcrmproducts.cn');
      expect(url.isSalesforceDomain()).to.be.true;
    });

    it('cnEdition with .com returns value', () => {
      const url = new SfdcUrl('https://foo.my.sfcrmproducts.com');
      expect(url.isSalesforceDomain()).to.be.false;
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
    it('workspaces with port is internal but not local', () => {
      const urls = [
        'https://dev.salesforce-com.shane-mclaughlin-0lrfx7zp3l121.wc.crm.dev:6101/',
        'https://dev.salesforce-com.shane-mclaughlin-0lrfx7zp3l121.wb.crm.dev:6101/',
        'https://dev.salesforce-com.shane-mclaughlin-0lrfx7zp3l121.wa.crm.dev:6101/',
      ].map((u) => new SfdcUrl(u));

      urls.map((url) => {
        expect(url.isInternalUrl()).to.equal(true);
        expect(url.isLocalUrl()).to.equal(false);
      });
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

    it('handles .mil domains', async () => {
      const url = new SfdcUrl('https://my-domain.my.salesforce.mil');
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect((e as Error).name).to.equal('Error');
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
    before(() => {});

    afterEach(() => {
      env.unset('SFDX_AUDIENCE_URL');
      env.unset('SF_AUDIENCE_URL');
    });

    it('should use the correct audience URL for createdOrgInstance beginning with "gs1"', async () => {
      const url = new SfdcUrl('https://foo.bar.baz');
      const response = await url.getJwtAudienceUrl('gs1');
      expect(response).to.be.equal('https://gs1.salesforce.com');
    });

    it('should return production URL if domain cannot be resolved', async () => {
      const url = new SfdcUrl('https://foo.bar.baz');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal('https://login.salesforce.com');
    });

    it('should use the correct audience URL for SFDX_AUDIENCE_URL env var', async () => {
      env.setString('SFDX_AUDIENCE_URL', 'http://authInfoTest-sfdx/audienceUrl/test');
      const url = new SfdcUrl('https://login.salesforce.com');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal(process.env.SFDX_AUDIENCE_URL);
    });

    it('should use the correct audience URL for SF_AUDIENCE_URL env var', async () => {
      env.setString('SF_AUDIENCE_URL', 'http://authInfoTest-sf/audienceUrl/test');
      const url = new SfdcUrl('https://login.salesforce.com');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal(process.env.SF_AUDIENCE_URL);
    });

    it('should use the correct audience URL for SF_AUDIENCE_URL and SFDX_AUDIENCE_URL env vars', async () => {
      env.setString('SFDX_AUDIENCE_URL', 'http://authInfoTest-sfdx/audienceUrl/test');
      env.setString('SF_AUDIENCE_URL', 'http://authInfoTest-sf/audienceUrl/test');
      const url = new SfdcUrl('https://login.salesforce.com');
      const response = await url.getJwtAudienceUrl();
      expect(response).to.be.equal(process.env.SF_AUDIENCE_URL);
    });
  });

  describe('lookup', () => {
    it('should be able to do dns lookup', async () => {
      stubMethod($$.SANDBOX, MyDomainResolver.prototype, 'resolve').resolves(TEST_IP);
      const url = new SfdcUrl('https://foo.bar.baz');
      const ip = await url.lookup();
      expect(ip).to.be.equal(TEST_IP);
    });

    it('should throw on dns resolution failure', async () => {
      stubMethod($$.SANDBOX, MyDomainResolver.prototype, 'resolve').rejects();
      const url = new SfdcUrl('https://bad.url.salesforce.com');
      try {
        await shouldThrow(url.lookup());
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect((e as Error).name).to.equal('Error');
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

  describe('isLightningDomain', () => {
    it('returns true if url is a lightning domain', () => {
      const url = new SfdcUrl('https://organization.lightning.force.com');
      const isLightningDomain = url.isLightningDomain();
      expect(isLightningDomain).to.be.true;
    });

    it('returns false if url is not lightning domain', () => {
      const url = new SfdcUrl('https://www.ghostbusters.com');
      const isLightningDomain = url.isLightningDomain();
      expect(isLightningDomain).to.be.false;
    });

    it('mil', () => {
      expect(new SfdcUrl('https://foo.lightning.crmforce.mil').isLightningDomain()).to.be.true;
    });
    it('mil but not lightning', () => {
      expect(new SfdcUrl('https://foo.my.salesforce.mil').isLightningDomain()).to.be.false;
    });
    it('cnEdition', () => {
      expect(new SfdcUrl('https://foo.lightning.sfcrmapps.cn').isLightningDomain()).to.be.true;
    });
    it('cnEdition but not lightning', () => {
      expect(new SfdcUrl('https://foo.my.sfcrmproducts.cn').isLightningDomain()).to.be.false;
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

  describe('getLoginAudienceCombos', () => {
    it('should return 11 combos when login and audience URLs are not test/prod and are different', () => {
      const combos = getLoginAudienceCombos('https://foo.bar.baz', 'https://foo.bar.bat');
      expect(combos).to.have.lengthOf(11);
    });
    it('should return 7 combos when login and audience URLs are not test/prod and are the same', () => {
      const combos = getLoginAudienceCombos('https://foo.bar.baz', 'https://foo.bar.baz');
      expect(combos).to.have.lengthOf(7);
    });
    it('should return 2 combos when login and audience URLs are prod URL', () => {
      const combos = getLoginAudienceCombos(SfdcUrl.PRODUCTION, SfdcUrl.PRODUCTION);
      expect(combos).to.have.lengthOf(2);
    });
    it('should return 2 combos when login and audience URLs are sandbox URL', () => {
      const combos = getLoginAudienceCombos(SfdcUrl.SANDBOX, SfdcUrl.SANDBOX);
      expect(combos).to.have.lengthOf(2);
    });
  });
});
