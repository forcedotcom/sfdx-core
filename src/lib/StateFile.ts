import { constants as fsConstants } from 'fs';
import { join as pathJoin } from 'path';

import { isNil as _isNil } from 'lodash';

import { SfdxUtil } from './util';
import { SfdxConfig } from './config/sfdxConfig';
import { Global } from './global';
import { SfdxError } from '../../dist/lib/sfdxError';

/**
 * Represents a config json file in the state folder that consumers can interact with.
 *
 */
export class StateFile {

    /**
     * Static initializer
     * @param {string} relativePath - The relative path from the root to the state file.
     * @param contents - The contents to store.
     * @returns {Promise<StateFile>}
     */
    public static async create(relativePath: string, contents: any, rootFolder?: string) {
        const _rootFolder: string = rootFolder ? rootFolder : await SfdxConfig.getRootFolder(false);

        const path = pathJoin(_rootFolder, Global.STATE_FOLDER, relativePath);
        return new StateFile(path, contents);
    }

    private path: string;
    private backupPath: string;
    private contents: any;

    /**
     * constructor
     * @param {string} path - The absolute path to the state file
     * @param contents
     */
    protected constructor(path: string, contents: any) {
        this.path = path;
        this.backupPath = `${this.path}.bak`;
        this.contents = contents;
    }

    public async read(): Promise<any> {
        this.contents = await SfdxUtil.readJSON(this.path, false);
    }

    public async write(newContents: any): Promise<any> {
        if (!_isNil(newContents)) {
            this.contents = newContents;
        }

        await SfdxUtil.writeJSON(this.path, this.contents);
        return this.contents;
    }

    public async exists(): Promise<any|boolean> {
        try {
            return await SfdxUtil.access(this.path, fsConstants.R_OK | fsConstants.W_OK);
        } catch (e) {
            return false;
        }
    }

    public async deleteStateFile(): Promise<void> {
        await SfdxUtil.unlink(this.path);
    }

    public async backup(): Promise<void> {
        if (this.exists()) {
            return await SfdxUtil.writeJSON(this.backupPath, this.read());
        }
        throw new SfdxError(`Back of file path: ${this.path} failed`, 'BackupFailed');
    }

    public async restore(): Promise<void> {

        try {
            await SfdxUtil.access(this.backupPath, fsConstants.R_OK);
        } catch (err) {
            if (err.code === 'ENOENT') {
                throw new SfdxError(`No backup file found. expected path: ${this.backupPath}`, 'NoStateFileBackup');
            }
            throw err;
        }

        await SfdxUtil.writeJSON(this.path, await SfdxUtil.readJSON(this.backupPath));

        await SfdxUtil.unlink(this.backupPath);
    }
}
