const util = require('util');

const messages = {};

// The toolbelt only supports US english. When we support more, we can
// attempt to get the locale from a os or a config. NOTE: that we can not
// use workspace.js for this as it will create a circular dependency.
const getLocale = function() {
    return 'en_US';
};

module.exports = function(locale) {
    return {
        /**
         * Added messages to the message map that getMessage reads from.
         * Should be used when loaded from messages/ and  subModules/messages.
         *
         */
        addMessages(obj) {
            // Don't allow sub modules to override?
            messages = Object.assign(obj, messages);
        },
        /**
         *
         *
         */
        getMessage(label, args, bundle = 'default') {

            const bundleLocale = messages[bundle][locale];

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
