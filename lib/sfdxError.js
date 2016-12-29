/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const path = require('path');

const messages = require(path.join(__dirname, 'messages'));

/**
 * Error generator for all SFDX errors.
 * @param {string} key - The error message key used to get the error message
 * text via messages.getMessage(). This is the same key used to check the
 * SFDXError.keyToNameMap to set the error.name. If no value is found, this key
 * will be used.
 * @param {array} tokens - The tokens for the error message.
 * @param {string} bundle - The bundle of the error message key.
 * @returns {Error} - The appropriate Error based on provided key and tokens.
 */
const SFDXError = (key, tokens, bundle) => {
    const err = new Error(messages.getMessage(key, tokens, bundle));
    err.name = SFDXError.keyToNameMap[key] || key;
    return err;
};

// Hash of message keys to error names, for those that want to override the name.
SFDXError.keyToNameMap = {};

module.exports = SFDXError;
