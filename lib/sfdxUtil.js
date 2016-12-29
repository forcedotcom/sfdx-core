/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const util = require('util');
const Promise = require('bluebird');

module.exports = {
    /**
     * Return true is the url is a local or vpod url and not a production url.
     * @param url - url to host resource
     * @returns {boolean}
     */
    isInternalUrl(url) {
        if (util.isNullOrUndefined(url)) {
            return false;
        }
        return (url.indexOf('.internal.') > -1  || url.indexOf('.vpod.') > -1);
    },

    /**
     * Helper function that returns true if a value is an integer.
     * @param value the value to compare
     * @returns {boolean} true if value is an integer. this is not a mathematical definition. that is -0 returns true.
     * this is in intended to be followed up with parseInt.
     */
    isInt(value) {
        return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value));
    },

    /**
     * Execute each function in the array sequentially.
     *
     * @param promiseFactories  An array of functions to be executed that return Promises.
     * @returns {Promise.<T>}
     */
    sequentialExecute(promiseFactories) {
        let result = Promise.resolve();
        promiseFactories.forEach(promiseFactory => {
            result = result.then(promiseFactory);
        });
        return result;
    },

    /**
     * Execute each function in the array in parallel.
     *
     * @param promiseFactories  An array of functions to be executed that return Promises.
     * @returns {Promise.<*>}
     */
    parallelExecute(promiseFactories) {
        return Promise.all(promiseFactories.map(factory => factory()));
    },

    urls: {
        'sandbox': 'https://test.salesforce.com',
        'production': 'https://login.salesforce.com'
    }
};
