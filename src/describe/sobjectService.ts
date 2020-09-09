/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Connection } from '../connection';
import { DescribeSObjectResult, SObject, SObjectDescribeAPI } from './sobjectApi';

export enum SObjectType {
  ALL,
  STANDARD,
  CUSTOM
}

export class SObjectService {
  public readonly connection: Connection;

  public constructor(connection: Connection) {
    this.connection = connection;
  }

  public async describeSObject(name: string): Promise<SObject> {
    const result = await new SObjectDescribeAPI(this.connection).describeSObject(name);
    return result.result ? Promise.resolve(result.result) : Promise.reject();
  }

  public async describeSObjects(names: string[]): Promise<SObject[]> {
    // TODO: make cancellable?
    const describeAPI = new SObjectDescribeAPI(this.connection);
    let fetchedResults: DescribeSObjectResult[] = [];
    let j = 0;
    while (j < names.length) {
      try {
        fetchedResults = fetchedResults.concat(await describeAPI.describeSObjectBatch(names, j));
        j = fetchedResults.length;
      } catch (error) {
        return Promise.reject(error);
      }
    }
    // tslint:disable-next-line:no-unnecessary-type-assertion
    return fetchedResults.map(result => result.result).filter(sobject => !!sobject) as SObject[];
  }

  public async retrieveSObjectNames(type: SObjectType = SObjectType.ALL): Promise<string[]> {
    const describeResult = await this.connection.describeGlobal();
    return describeResult.sobjects
      .filter(
        sobject =>
          type === SObjectType.ALL ||
          (type === SObjectType.CUSTOM && sobject.custom === true) ||
          (type === SObjectType.STANDARD && sobject.custom !== true)
      )
      .map(sobject => sobject.name);
  }
}
