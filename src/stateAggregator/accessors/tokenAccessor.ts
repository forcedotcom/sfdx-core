/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AsyncOptionalCreatable } from '@salesforce/kit';
import { JsonMap, Optional } from '@salesforce/ts-types';
import { TokensConfig } from '../../config/tokensConfig';

export type SfToken = {
  token: string;
  url: string;
  user?: string;
  timestamp: string;
} & JsonMap;

export type SfTokens = {
  [key: string]: SfToken;
};

export class TokenAccessor extends AsyncOptionalCreatable {
  private config!: TokensConfig;

  /**
   * Return all tokens.
   *
   * @param decrypt
   * @returns {SfTokens}
   */
  public getAll(decrypt = false): SfTokens {
    return this.config.getContents(decrypt) || {};
  }

  /**
   * Return a token for the provided name.
   *
   * @param name
   * @param decrypt
   * @returns {Optional<SfToken>}
   */
  public get(name: string, decrypt = false): Optional<SfToken> {
    return this.config.get(name, decrypt);
  }

  /**
   * Return true if a given name has a token associated with it.
   *
   * @param name
   * @returns {boolean}
   */
  public has(name: string): boolean {
    return !!this.getAll()[name];
  }

  /**
   * Set the token for the provided name.
   *
   * @param name
   * @param token
   */
  public set(name: string, token: SfToken): void {
    this.config.set(name, token);
  }

  /**
   * Update the token for the provided name.
   *
   * @param name
   * @param token
   */
  public update(name: string, token: Partial<SfToken>): void {
    this.config.update(name, token);
  }

  /**
   * Unet the token for the provided name.
   *
   * @param name
   */
  public unset(name: string): void {
    this.config.unset(name);
  }

  /**
   * Write the contents to the token file.
   *
   * @returns {Promise<SfTokens>}
   */
  public async write(): Promise<SfTokens> {
    return this.config.write();
  }

  protected async init(): Promise<void> {
    this.config = await TokensConfig.create();
  }
}
