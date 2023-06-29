/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { promises as fs } from 'fs';
import * as jsToXml from 'js2xmlparser';
import { JsonMap } from '@salesforce/ts-types';
import { IOptions } from 'js2xmlparser/lib/options';

export interface JSONasXML {
  json: JsonMap;
  type: string;
  options?: IOptions;
}

export interface WriteJSONasXMLInputs extends JSONasXML {
  path: string;
}

export const standardOptions: IOptions = {
  declaration: {
    include: true,
    encoding: 'UTF-8',
    version: '1.0',
  },
  format: {
    doubleQuotes: true,
  },
};

export const writeJSONasXML = async ({
  path,
  json,
  type,
  options = standardOptions,
}: WriteJSONasXMLInputs): Promise<void> => {
  const xml = jsToXml.parse(type, fixExistingDollarSign(json), options);
  return fs.writeFile(path, xml);
};

export const JsonAsXml = ({ json, type, options = standardOptions }: JSONasXML): string => jsToXml.parse(type, fixExistingDollarSign(json), options);

export const fixExistingDollarSign = (existing: WriteJSONasXMLInputs['json']): Record<string, unknown> => {
  const existingCopy = { ...existing } as Record<string, unknown>;
  if (existingCopy.$) {
    const temp = existingCopy.$;
    delete existingCopy.$;
    existingCopy['@'] = temp;
  }
  return existingCopy;
};
