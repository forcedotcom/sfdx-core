/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

const fs = require('fs');
const util = require('util');
const path = require('path');

let messages = {};

const ENGLISH_LOCALE = 'en_US';

// The toolbelt only supports US english. When we support more, we can
// attempt to get the locale from a os or a config. NOTE: that we can not
// use workspace.js as it will create a circular dependency.
const getLocale = function() {
    return ENGLISH_LOCALE;
};

function loadMessages(...paths) {
    paths.forEach(msgPath =>
        fs.readdirSync(msgPath).forEach(file => {
            file = path.join(msgPath, file);
            const stat = fs.statSync(file);

            if (stat && stat.isFile()) {
                messages = Object.assign(require(file), messages); // eslint-disable-line global-require
            }
        })
    );
}

module.exports = function(locale) {
    /**
     *
     *
     */
    function loadMessagePaths(...paths) {
        const pathsToLoad = [];
        paths.forEach(msgPath => {
            // Support all translations to be in a subfolder with the locale
            // name, except english is in the main directory.
            if (locale !== ENGLISH_LOCALE) {
                msgPath = path.join(msgPath, locale);
            }
            if (fs.existsSync(msgPath)) {
                pathsToLoad.push(msgPath);
            } else {
                // This is the lowest level error the cli can throw, since the
                // plugin will rely on it's message keys. This is likely a dev
                // error or a lack of translations on the files.
                throw new Error(`FETAL: Missing label file at path ${msgPath} for locale ${locale}`);
            }

        });
        loadMessages(...pathsToLoad);
    }

    // Add the root module
    loadMessagePaths(path.join(__dirname, '..', 'messages'));

    return {
        loadMessagePaths,

        /**
         *
         *
         */
        getMessage(label, args, bundle = 'default') {
            const bundleLocale = messages[bundle];

            if (util.isNullOrUndefined(bundleLocale)) {
                return null;
            }

            if (util.isNullOrUndefined(bundleLocale[label])) {
                throw new Error(util.format(bundleLocale.UndefinedLocalizationLabel, bundle, label, locale));
            }

            if (util.isNullOrUndefined(args)) {
                return bundleLocale[label];
            }
            else {
                const everyone = [].concat(bundleLocale[label], args);
                return util.format(...everyone);
            }
        }
    };
}(getLocale());
