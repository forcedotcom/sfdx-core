/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { ConfigFile, ConfigOptions } from './configFile';
import { isNil as _isNil } from 'lodash';
import { SfdxUtil } from '../util';
import { dirname as pathDirname } from 'path';

/**
 * Represent a key chain config backed by a json file.
 * @private
 */
export class KeychainConfig extends ConfigFile {
    public static getFileName(): string {
        return 'key.json';
    }

    public static getDefaultOptions(isGlobal = true, filename?) {
        const config = super.getDefaultOptions(isGlobal);
        // The key file is ALWAYS in the global space.
        config.isGlobal = true;
        return config;
    }

    /**
     * Write the config file with new contents. If no new contents are passed in
     * it will write this.contents that was set from read().
     *
     * @param {object} newContents the new contents of the file
     * @returns {Promise<object>} the written contents
     */
    public async write(newContents?: any): Promise<object> {
        if (!_isNil(newContents)) {
            this.setContents(newContents);
        }

        await SfdxUtil.mkdirp(pathDirname(this.getPath()));

        await SfdxUtil.writeFile(this.getPath(),
            JSON.stringify(this.getContents(), null, 4), { mode: '600' });

        return this.getContents();
    }
}
