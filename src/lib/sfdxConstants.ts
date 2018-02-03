/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * DEFAULT_DEV_HUB_USERNAME - The attribute key for defaultdevhubusername
 * DEFAULT_USERNAME - The attribute key for the default username
 * STATE_FOLDER - The name of the folder which stores sfdx specific global and project level state
 * WORKSPACE_CONFIG_FILENAME - The name for the workspace config file
 */
export enum SfdxConstant {
    DEFAULT_DEV_HUB_USERNAME = 'defaultdevhubusername',
    DEFAULT_USERNAME = 'defaultusername',
    STATE_FOLDER = '.sfdx',
    WORKSPACE_CONFIG_FILENAME = 'sfdx-project.json'
}
