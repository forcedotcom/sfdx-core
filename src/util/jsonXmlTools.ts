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

const standardOptions: IOptions = {
  declaration: {
    include: true,
    encoding: 'UTF-8',
    version: '1.0',
  },
  format: {
    doubleQuotes: true,
  },
};

const writeJSONasXML = async ({ path, json, type, options = standardOptions }: WriteJSONasXMLInputs): Promise<void> => {
  const xml = jsToXml.parse(type, fixExistingDollarSign(json), options);
  return await fs.writeFile(path, xml);
};

interface WriteJSONasXMLInputs {
  path: string;
  json: JsonMap;
  type: string;
  options?: IOptions;
}

const fixExistingDollarSign = (existing: WriteJSONasXMLInputs['json']): Record<string, unknown> => {
  const existingCopy = { ...existing } as Record<string, unknown>;
  if (existingCopy.$) {
    const temp = existingCopy.$;
    delete existingCopy.$;
    existingCopy['@'] = temp;
  }
  return existingCopy;
};

export { writeJSONasXML, standardOptions, fixExistingDollarSign };
