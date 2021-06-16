/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { URL } from 'url';
import { Env, Duration } from '@salesforce/kit';
import { MyDomainResolver } from '../status/myDomainResolver';

export class SfdcUrl extends URL {
  /**
   * Salesforce URLs.
   */
  public static SANDBOX = 'https://test.salesforce.com';
  public static PRODUCTION = 'https://login.salesforce.com';

  public constructor(input: string, base?: string | URL) {
    super(input, base);
    if (this.protocol !== 'https:') {
      this.emitWarning('Using insecure protocol: ' + this.protocol + ' on url: ' + this.origin);
    }
  }

  /**
   * Returns the appropiate jwt audience url for this url.
   */
  public async getJwtAudienceUrl(): Promise<string> {
    // environment variable is used as an override
    if (process.env.SFDX_AUDIENCE_URL) {
      return process.env.SFDX_AUDIENCE_URL;
    }

    if (this.isInternalUrl()) {
      // This is for internal developers when just doing authorize;
      return this.origin;
    }

    if (await this.resolvesToSandbox()) {
      return SfdcUrl.SANDBOX;
    }

    if (/^gs1/gi.test(this.origin) || /(gs1.my.salesforce.com)/gi.test(this.origin ?? '')) {
      return 'https://gs1.salesforce.com';
    }

    return SfdcUrl.PRODUCTION;
  }

  /**
   * Returns `true` if this url is a sandbox url
   */
  public isSandboxUrl(): boolean {
    return (
      /^cs|s$/gi.test(this.origin) ||
      /sandbox\.my\.salesforce\.com/gi.test(this.origin) || // enhanced domains >= 230
      /(cs[0-9]+(\.my|)\.salesforce\.com)/gi.test(this.origin) || // my domains on CS instance OR CS instance without my domain
      /([a-z]{3}[0-9]+s\.sfdc-.+\.salesforce\.com)/gi.test(this.origin) || // falcon sandbox ex: usa2s.sfdc-whatever.salesforce.com
      /([a-z]{3}[0-9]+s\.sfdc-.+\.force\.com)/gi.test(this.origin) || // falcon sandbox ex: usa2s.sfdc-whatever.salesforce.com
      this.hostname === 'test.salesforce.com'
    );
  }

  /**
   * Returns `true` if this url contains a Salesforce owned domain.
   */
  public isSalesforceDomain(): boolean {
    // Source https://help.salesforce.com/articleView?id=000003652&type=1
    const allowlistOfSalesforceDomainPatterns: string[] = [
      '.cloudforce.com',
      '.content.force.com',
      '.force.com',
      '.salesforce.com',
      '.salesforceliveagent.com',
      '.secure.force.com',
    ];

    const allowlistOfSalesforceHosts: string[] = ['developer.salesforce.com', 'trailhead.salesforce.com'];

    return allowlistOfSalesforceDomainPatterns.some((pattern) => {
      return this.hostname.endsWith(pattern) || allowlistOfSalesforceHosts.includes(this.hostname);
    });
  }

  /**
   * Tests whether this url is an internal Salesforce domain
   */
  public isInternalUrl(): boolean {
    const INTERNAL_URL_PARTS = [
      '.vpod.',
      'stm.salesforce.com',
      'stm.force.com',
      '.blitz.salesforce.com',
      '.stm.salesforce.ms',
      '.pc-rnd.force.com',
      '.pc-rnd.salesforce.com',
    ];
    return (
      this.origin.startsWith('https://gs1.') ||
      this.isLocalUrl() ||
      INTERNAL_URL_PARTS.some((part) => this.origin.includes(part))
    );
  }

  /**
   * Tests whether this url runs on a local machine
   *
   * @param url
   */
  public isLocalUrl(): boolean {
    const LOCAL_PARTS = ['localhost.sfdcdev.', '.internal.'];
    return LOCAL_PARTS.some((part) => this.origin.includes(part));
  }

  /**
   * Tests whether this url has the lightning domain extension
   *
   * @param url
   */
  public async checkLightningDomain(): Promise<boolean> {
    const domain = `https://${/https?:\/\/([^.]*)/.exec(this.origin)?.slice(1, 2).pop()}.lightning.force.com`;
    const quantity = new Env().getNumber('SFDX_DOMAIN_RETRY', 240) ?? 0;
    const timeout = new Duration(quantity, Duration.Unit.SECONDS);

    if (this.isInternalUrl() || timeout.seconds === 0) {
      return true;
    }

    const resolver = await MyDomainResolver.create({
      url: new URL(domain),
      timeout,
      frequency: new Duration(1, Duration.Unit.SECONDS),
    });

    await resolver.resolve();
    return true;
  }

  /**
   * Returns `true` if this url domain is or resolves to a sandbox url.
   */
  private async resolvesToSandbox(): Promise<boolean> {
    if (this.isSandboxUrl()) {
      return true;
    }
    const myDomainResolver = await MyDomainResolver.create({ url: this });
    const cnames: string[] = (await myDomainResolver.getCnames()) ?? [];
    return cnames.some((cname) => new SfdcUrl(cname).isSandboxUrl());
  }

  private emitWarning(warning: string): void {
    process.emitWarning(warning);
  }
}
