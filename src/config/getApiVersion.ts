/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigAggregator, Messages, SfdxError } from '@salesforce/core';
import { Optional } from '@salesforce/ts-types';
import pjson = require('../../package.json');

Messages.importMessagesDirectory(__dirname);
const messages = Messages.loadMessages('getApiVersion', 'scratchOrgInfoApi');

const throwUnexpectedVersionFormat = function (incorrectVersion: string) {
  const errorName = 'UnexpectedVersionFormat';
  throw new SfdxError(messages.getMessage(errorName, [incorrectVersion]), 'versionCommand');
};

export default function getApiVersion(): Optional<string> {
  let result;
  try {
    const apiVersion = ConfigAggregator.getValue('apiVersion').value as string;
    const apiVersionRegEx = /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)/;

    if (apiVersionRegEx.test(apiVersion)) {
      result = apiVersion;
    }
    // If there is something in workspace config and it didn't validate throw an error.
    else if (apiVersion) {
      throwUnexpectedVersionFormat(apiVersion);
    }
    // else proceed
  } catch (error) {
    const sfdxError = error as SfdxError;
    if (sfdxError.code !== 'ENOENT') {
      throw sfdxError;
    }
  }

  // Not globally defined so the apiVersion comes off of package.json version.
  if (!result) {
    // No version specified in pjson - unlikely but...
    if (pjson.version == null) {
      const errorName = 'MissingVersionAttribute';
      throw new SfdxError(messages.getMessage(errorName, [null]), 'versionCommand');
    }

    const versionTrimmed = pjson.version.trim();

    const sfdxValidVersionRegEx =
      /\bv?(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[\da-z-]+(?:\.[\da-z-]+)*)?(?:\+[\da-z-]+(?:\.[\da-z-]+)*)?\b/gi;

    if (sfdxValidVersionRegEx.test(versionTrimmed)) {
      result = `${versionTrimmed.split('.')[0]}.0`;
    } else {
      throwUnexpectedVersionFormat(versionTrimmed);
    }
  }

  return result;
}
