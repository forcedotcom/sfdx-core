/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { join as pathJoin, sep as pathSep } from 'path';
import { SfdxError } from './sfdxError';
import { SfdxUtil } from './util';

/**
 * Class to compute the proper project directory. You generally find a .git folder in this location.
 */
export class ProjectDir {

    public static WORKSPACE_CONFIG_FILENAME = 'sfdx-project.json';

    /**
     * Computes the path of the project.
     * @throws InvalidProjectWorkspace - If the current folder is not located in a workspace
     * @returns {Promise<string>} -The absolute path to the project
     */
    public static async getPath(): Promise<string> {

        let foundProjectDir: string = null;

        const traverseForFile = async (workingDir: string, file: string) => {
            try {
                await SfdxUtil.stat(pathJoin(workingDir, file));
                foundProjectDir = workingDir;
            } catch (err) {
                if (err && err.code === 'ENOENT') {
                    const indexOfLastSlash: number = workingDir.lastIndexOf(pathSep);
                    if (indexOfLastSlash > 0) {
                        await traverseForFile(workingDir.substring(0, indexOfLastSlash), file);
                    } else {
                        throw await SfdxError.create('sfdx-core-config', 'InvalidProjectWorkspace');
                    }
                }
            }
        };

        await traverseForFile(process.cwd(), ProjectDir.WORKSPACE_CONFIG_FILENAME);

        return foundProjectDir;
    }
}
