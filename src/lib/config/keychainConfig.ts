
import { ConfigFile } from './configFile';
import { isNil as _isNil } from 'lodash';
import { SfdxUtil } from '../util';
import { dirname as pathDirname } from 'path';

/**
 * Represent a keychain config backed by a json file.
 * @private
 */
export class KeychainConfig extends ConfigFile {
    public static getFileName(): string {
        return 'key.json';
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
