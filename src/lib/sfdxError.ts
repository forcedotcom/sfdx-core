/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as path from 'path';
import * as _ from 'lodash';

import Messages from './messages';

/**
 * A class to manage all the keys and tokens for SfdxErrors. Assumes the messages are stored
 * as "<key>Error" and "<key>Action" unless otherwise noted.
 * 
 * @example
 * SfdxError.create(new ErrorMessages('apex', 'runTest').setActionTokens([className]));
 */
export class ErrorMessages {
    readonly bundle : string;
    readonly key : string;
    readonly errorKey : string;
    readonly actionKey : string;
    private messages : Messages;

    errorTokens : Array<any>;
    actionTokens : Array<any>;

    /**
     * Create a new ErrorMessages.
     * @param bundle The messages bundle.
     * @param key The messages key. Defaults to bundle if one is not provided.
     * @param errorTokens The tokens to use when getting the error message
     * @param actionTokens The tokens to use when getting the action message
     */
    constructor(bundle : string, key? : string, errorTokens : Array<any> = [], actionTokens : Array<any> = []) {
        this.bundle = bundle;
        this.key = key || bundle;
        this.errorKey = `${key}Error`;
        this.actionKey = `${key}Action`;
        this.errorTokens = errorTokens;
        this.actionTokens = actionTokens;
    }

    /**
     * Set the error key. Returns the ErrorMessages for chaining.
     * @param tokens Set the error key is something other than "<key>Error" is required.
     */
    setErrorKey(tokens : Array<any>) : ErrorMessages {
        this.errorTokens = tokens;
        return this;
    }

    /**
     * Set the action key. Returns the ErrorMessages for chaining.
     * @param tokens Set the action key is something other than "<key>Action" is required.
     */
    setActionKey(tokens : Array<any>) : ErrorMessages {
        this.actionTokens = tokens;
        return this;
    }

    /**
     * Set the error tokens. Returns the ErrorMessages for chaining.
     * @param tokens The error tokens
     */
    setErrorTokens(tokens : Array<any>) : ErrorMessages {
        this.errorTokens = tokens;
        return this;
    }

    /**
     * Set the action tokens. Returns the ErrorMessages for chaining.
     * @param tokens The action tokens
     */
    setActionTokens(tokens : Array<any>) : ErrorMessages {
        this.actionTokens = tokens;
        return this;
    }

    /**
     * Load the messages using Messages.loadMessages
     */
    async load() : Promise<Messages> {
        this.messages = await Messages.loadMessages(this.bundle);
        return this.messages;
    }

    /**
     * Get the error message using messages.getMessage.
     * @throws AlmError If errorMessages.load was not called first
     */
    getError() : string {
        if (!this.messages) {
            throw new SfdxError('ErrorMessages not loaded.');
        }
        return this.messages.getMessage(this.errorKey, this.errorTokens);
    }

    /**
     * Get the action message using messages.getMessage.
     * @throws AlmError If errorMessages.load was not called first
     */
    getAction() : string {
        if (!this.messages) {
            throw new SfdxError('ErrorMessages not loaded.');
        }

        try {
            return this.messages.getMessage(this.actionKey, this.actionTokens);
        } catch(error) {
            if (this.actionKey !== `${this.key}Action`) {
                throw error;
            }
            // NoOp. It is ok if the default action doesn't exist
        }
    }
    
}

/*
 *  A generalized sfdx error which also contains an action. The action is used in the
 *  CLI to help guide users past the error.
 */
export class SfdxError extends Error {
    name : string;
    message : string;
    action : string;
    exitCode : number;

    /**
     * Create an SfdxError.
     * @param message The error message 
     * @param name The error name. Defaults to 'SfdxError'
     * @param action The action message
     * @param exitCode The exit code which will be used by the CLI.
     */
    constructor(message : string, name? : string, action? : string, exitCode? : number) {
        super(message);
        this.name = name || 'SfdxError';
        this.action = action;
        this.exitCode = exitCode || 1;
    }

    /**
     * Create a new SfdxError. Needs to be async to load messages from message files.
     * @param keyNameOrErrorMessages The message bundle and key or a errorMessages used to create the SfdxError
     */
    static async create(keyNameOrErrorMessages : string | ErrorMessages) : Promise<SfdxError> {
        let messages : ErrorMessages;

        if (_.isString(keyNameOrErrorMessages)) {
            messages = new ErrorMessages(<string>keyNameOrErrorMessages);
        } else {
            messages = <ErrorMessages>keyNameOrErrorMessages;
        }

        await messages.load();
        return new SfdxError(messages.getError(), messages.key, messages.getAction());
    }
}

export default SfdxError;
