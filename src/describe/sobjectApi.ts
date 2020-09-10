/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { RequestInfo } from 'jsforce';
import { Connection } from '../connection';
import { Logger } from '../logger';
import { DescribeSObjectResult, SObject } from './sobjectTypes';

export type SubRequest = { method: string; url: string };
export type BatchRequest = { batchRequests: SubRequest[] };
export type DescribeResponse = {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
};
export type SubResponse = { statusCode: number; result: SObject };
export type BatchRawResponse = {
  statusCode: number;
  headers: { [key: string]: string };
  body: string;
};
export type BatchResponse = { hasErrors: boolean; results: SubResponse[] };

export class SObjectDescribeAPI {
  private readonly connection: Connection;

  // URL constants
  private readonly SERVICESPATH: string = 'services/data';
  // the targetVersion should be consistent with the Cli even if only using REST calls
  private readonly TARGETVERSION = '49.0';
  private readonly VERSIONPREFIX = 'v';
  private readonly SOBJECTS: string = 'sobjects';
  private readonly BATCH: string = 'composite/batch';
  private readonly DESCRIBE: string = 'describe';

  private readonly CLIENT_ID: string = 'sfdx-vscode';

  private readonly commonHeaders = {
    'User-Agent': 'salesforcedx-extension',
    'Sforce-Call-Options': `client=${this.CLIENT_ID}`
  };

  private logger: Logger;

  public constructor(connection: Connection) {
    this.connection = connection;
    this.logger = Logger.childFromRoot('SObjectDescribeAPI');
  }

  public async describeSObject(sObjectName: string, lastRefreshDate?: string): Promise<DescribeSObjectResult> {
    try {
      let response: DescribeResponse;
      let options: RequestInfo;
      options = this.buildSingleXHROptions(sObjectName, lastRefreshDate);
      response = ((await this.connection.requestRaw(options)) as unknown) as DescribeResponse;

      const sObject = response.body ? (JSON.parse(response.body) as SObject) : undefined;

      return Promise.resolve({
        sObjectName,
        result: sObject,
        timestamp: response.headers['date']
      });
    } catch (error) {
      const errorMsg = 'responseText' in error ? error.responseText : error.message;
      return Promise.reject(errorMsg);
    }
  }

  public async describeSObjectBatch(types: string[], nextToProcess: number): Promise<DescribeSObjectResult[]> {
    try {
      let response: BatchRawResponse;
      let options: RequestInfo;
      options = this.buildBatchXHROptions(types, nextToProcess);
      response = ((await this.connection.requestRaw(options)) as unknown) as BatchRawResponse;

      const timestamp: string = response.headers['date'];
      const batchResponse = JSON.parse(response.body) as BatchResponse;
      const fetchedObjects: DescribeSObjectResult[] = [];
      let i = nextToProcess;
      for (const sr of batchResponse.results) {
        if (sr.result instanceof Array) {
          if (sr.result[0].errorCode && sr.result[0].message) {
            this.logger.error(`Error: ${sr.result[0].message} - ${types[i]}`);
          }
        }
        i++;
        fetchedObjects.push({
          sObjectName: sr.result.name,
          result: sr.result,
          timestamp
        });
      }
      return Promise.resolve(fetchedObjects);
    } catch (error) {
      const errorMsg = 'responseText' in error ? error.responseText : error.message;
      return Promise.reject(errorMsg);
    }
  }

  protected buildSObjectDescribeURL(sObjectName: string, fullUrl?: boolean): string {
    const urlElements = [];
    if (fullUrl) {
      urlElements.push(this.connection.instanceUrl, this.SERVICESPATH);
    }
    urlElements.push(this.getVersion(), this.SOBJECTS, sObjectName, this.DESCRIBE);
    return urlElements.join('/');
  }

  protected buildBatchRequestURL(): string {
    const batchUrlElements = [this.connection.instanceUrl, this.SERVICESPATH, this.getVersion(), this.BATCH];
    return batchUrlElements.join('/');
  }

  protected buildBatchRequestBody(types: string[], nextToProcess: number): BatchRequest {
    const batchSize = 25;
    const batchRequest: BatchRequest = { batchRequests: [] };

    for (let i = nextToProcess; i < nextToProcess + batchSize && i < types.length; i++) {
      batchRequest.batchRequests.push({
        method: 'GET',
        url: this.buildSObjectDescribeURL(types[i])
      });
    }

    return batchRequest;
  }

  protected buildSingleXHROptions(sObjectName: string, lastRefreshDate?: string): RequestInfo {
    // tslint:disable-next-line:no-any
    let additionalHeaders: any = {};
    if (lastRefreshDate) {
      additionalHeaders = {
        'If-Modified-Since': lastRefreshDate
      };
    }
    return {
      method: 'GET',
      url: this.buildSObjectDescribeURL(sObjectName, true),
      headers: {
        ...this.commonHeaders,
        ...additionalHeaders
      }
    };
  }

  protected buildBatchXHROptions(types: string[], nextToProcess: number): RequestInfo {
    const batchRequest = this.buildBatchRequestBody(types, nextToProcess);
    return {
      method: 'POST',
      url: this.buildBatchRequestURL(),
      headers: {
        ...this.commonHeaders
      },
      body: JSON.stringify(batchRequest)
    };
  }

  protected getVersion(): string {
    return `${this.VERSIONPREFIX}${this.TARGETVERSION}`;
  }
}
