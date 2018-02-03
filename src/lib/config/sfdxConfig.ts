/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

// Node
import { homedir as osHomedir } from 'os';
import { isNil as _isNil } from 'lodash';
import { join as pathJoin} from 'path';
import Messages from '../messages';
import { ConfigFile } from './configFile';
import { SfdxConstant as consts } from '../sfdxConstants';
import { SfdxUtil } from '../util';
import { SfdxError } from '../sfdxError';
import { ProjectDir } from '../projectDir';

const SFDX_CONFIG_FILE_NAME = 'sfdx-config.json';

export const ORG_DEFAULTS = {
    DEVHUB: consts.DEFAULT_DEV_HUB_USERNAME,
    USERNAME: consts.DEFAULT_USERNAME,

    list() {
        return [ORG_DEFAULTS.DEVHUB, ORG_DEFAULTS.USERNAME];
    }
};

const _checkEnoent = function(err) {
    if (err.code === 'ENOENT') {
        this.contents = {};
        return this.contents;
    } else {
        throw err;
    }
};

export class SfdxConfig extends ConfigFile {

    public static async getRootFolder(isGlobal: boolean): Promise<string> {
        return isGlobal ? osHomedir() : await ProjectDir.getPath();
    }

    public static async create(isGlobal: boolean = true,
                               rootPathRetriever?: (isGlobal: boolean) => Promise<string>): Promise<SfdxConfig> {

        if (!SfdxConfig.messages) {
            Messages.importMessageFile(pathJoin(__dirname, '..', '..', '..', 'messages', 'sfdx-core-config.json'));
            SfdxConfig.messages = await Messages.loadMessages('sfdx-core-config');
        }

        if (!SfdxConfig.allowedProperties) {
            SfdxConfig.allowedProperties = [
                {
                    key: 'instanceUrl',
                    input: {
                        // If a value is provided validate it otherwise no value is unset.
                        validator: (value) => _isNil(value) || SfdxUtil.isSalesforceDomain(value),
                        failedMessage: SfdxConfig.messages.getMessage('invalidInstanceUrl')
                    }
                },
                {
                    key: 'apiVersion',
                    hidden: true,
                    input: {
                        // If a value is provided validate it otherwise no value is unset.
                        validator: (value) => _isNil(value) || /[1-9]\d\.0/.test(value),
                        failedMessage: SfdxConfig.messages.getMessage('invalidApiVersion')
                    }
                },
                { key: consts.DEFAULT_DEV_HUB_USERNAME },
                { key: consts.DEFAULT_USERNAME }
            ];
        }

        return rootPathRetriever ?
            new SfdxConfig(await rootPathRetriever(isGlobal) , isGlobal) :
            new SfdxConfig(await SfdxConfig.getRootFolder(isGlobal) , isGlobal);
    }

    public static getAllowedProperties(): any {
        if (!SfdxConfig.allowedProperties) {
            throw new SfdxError('SfdxConfig meta information has not been initialized. Use SfdxConfigcreate()');
        }
        return SfdxConfig.allowedProperties;
    }

    public static async setPropertyValue(isGlobal: boolean, property: string, value?: any, rootPathRetriever?: (isGlobal: boolean) => Promise<string>) {

        const rootFolder = rootPathRetriever ?
            await rootPathRetriever(isGlobal) : await SfdxConfig.getRootFolder(isGlobal);

        const config = new SfdxConfig(rootFolder, isGlobal);

        const content = await config.read();

        if (_isNil(value)) {
            delete content[property];
        } else {
            content[property] = value;
        }

        return await config.write(content);
    }

    public static async clear(): Promise<void> {
        let config  = await SfdxConfig.create(true);
        await config.write({});

        config = await SfdxConfig.create(false);
        await config.write({});
    }

    private static allowedProperties: any;
    private static messages: Messages;

    protected constructor(rootFolder: string, isGlobal: boolean) {
        super(rootFolder, SFDX_CONFIG_FILE_NAME, isGlobal, true);
    }

    public async read(): Promise<any> {
        try {
            await this.setContents(await SfdxUtil.readJSON(this.path, false));
            return this.getContents();
        } catch (err) {
            _checkEnoent.call(this, err);
        }
    }

    public async setPropertyValue(propertyName: string, value: any) {

        const property = SfdxConfig.allowedProperties.find((allowedProp) => allowedProp.key === propertyName);
        if (!property) {
            throw await SfdxError.create('sfdx-core-config', 'UnknownConfigKey', [propertyName]);
        }
        if (property.input) {
            if (property.input && property.input.validator(value)) {
                this.contents[property.key] = value;
            } else {
                throw await SfdxError.create('sfdx-core-config', 'invalidConfigValue', [property.input.failedMessage]);
            }
        } else {
            this.contents[property.key] = value;
        }
    }
}
