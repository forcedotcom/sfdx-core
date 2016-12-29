/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const util = require('util');
const path = require('path');

const AppcloudCrypto = require(path.join(__dirname, 'appcloudCrypto'));

/**
 * Ensures all the attribute values are present and have a value.
 * @param config - the object to validate
 * @param attributes - attribute object to validate against
 * @throws MissingConfigObject - if the config object is null or undefined
 * @throws MissingAttributeFromConfig - if the config object is missing an attribute defined in attributes.
 * @private
 */
const _validate = function(config, attributes) {

    if (util.isNullOrUndefined(config)) {
        const error =  new Error('Missing config object.');
        error.name = 'MissingConfigObject';
        throw error;
    }

    Object.keys(attributes).forEach((key) => {
        if (attributes[key].required === false) { return; }

        const value = config[attributes[key].name];

        if (util.isNullOrUndefined(value) || !util.isString(value) || value.trim().length < 1) {
            const error =  new Error(`${attributes[key].name} is missing or invalid for this org definition.`);
            error.name = 'MissingAttributeFromConfig';
            throw error;
        }
    });
};

module.exports = {

    /**
     * clones a validated config object. this will automatically decrypt or encrypt those attributes defined as secret.
     * @param config - the object to validate
     * @param attributes - attribute object to validate config against
     * {NAME: {name: [attribute name] secret: [true if the field should be encrypted.]}}
     * @param encrypt - See appcloudCrypto.js
     * @returns {Promise.<*>}
     */
    getCleanObject(config, attributes, encrypt) {

        _validate(config, attributes);

        const crypto = new AppcloudCrypto();
        return crypto.init().then(() => {
            const dataToSave = {};

            Object.keys(attributes).forEach((key) => {
                const attributeValue = attributes[key];
                if (!util.isNullOrUndefined(config[attributeValue.name])) {
                    if (!util.isNullOrUndefined(attributeValue.secret) && attributeValue.secret === true) {
                        dataToSave[attributeValue.name] = encrypt ?
                            crypto.encrypt(config[attributeValue.name].trim()) :
                            crypto.decrypt(config[attributeValue.name].trim());
                    }
                    else {
                        dataToSave[attributeValue.name] = config[attributeValue.name].trim();
                    }
                }
            });
            return dataToSave;
        }).finally(() => { crypto.close(); });
    }
};
