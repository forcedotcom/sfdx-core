/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { Optional } from '@salesforce/ts-types';
import { TokensConfig } from '../../config/tokensConfig';
import { GlobalInfo } from '../globalInfoConfig';
import { SfTokens, SfToken, Timestamp, SfInfoKeys } from '../types';

/**
 * @deprecated
 */
export class GlobaInfoTokenAccessor {
  public constructor(private globalInfo: GlobalInfo) {}

  public getAll(decrypt = false): SfTokens {
    return this.globalInfo.get(SfInfoKeys.TOKENS, decrypt) || {};
  }

  public get(name: string, decrypt = false): Optional<SfToken & Timestamp> {
    return this.globalInfo.get(`${SfInfoKeys.TOKENS}["${name}"]`, decrypt);
  }

  public has(name: string): boolean {
    return !!this.getAll()[name];
  }

  public set(name: string, token: SfToken): void {
    this.globalInfo.set(`${SfInfoKeys.TOKENS}["${name}"]`, token);
  }

  public update(name: string, token: Partial<SfToken>): void {
    this.globalInfo.update(`${SfInfoKeys.TOKENS}["${name}"]`, token);
  }

  public unset(name: string): void {
    delete this.globalInfo.get(SfInfoKeys.TOKENS)[name];
  }
}

export class TokenAccessor extends AsyncOptionalCreatable {
  private config!: TokensConfig;

  public getAll(decrypt = false): SfTokens {
    return this.config.getContents(decrypt) || {};
  }

  public get(name: string, decrypt = false): Optional<SfToken & Timestamp> {
    return this.config.get(name, decrypt);
  }

  public has(name: string): boolean {
    return !!this.getAll()[name];
  }

  public set(name: string, token: SfToken): void {
    this.config.set(name, token);
  }

  public update(name: string, token: Partial<SfToken>): void {
    this.config.update(name, token);
  }

  public unset(name: string): void {
    this.config.unset(name);
  }
  public async write(): Promise<SfTokens> {
    return this.config.write();
  }

  protected async init(): Promise<void> {
    this.config = await TokensConfig.create();
  }
}
