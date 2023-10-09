/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Dictionary, AnyJson } from '@salesforce/ts-types';

export type Key<P extends ConfigContents> = Extract<keyof P, string>;
/**
 * The allowed types stored in a config store.
 */

export type ConfigValue = AnyJson;
/**
 * The type of entries in a config store defined by the key and value type of {@link ConfigContents}.
 */

export type ConfigEntry = [string, ConfigValue];
/**
 * The type of content a config stores.
 */

export type ConfigContents<T = ConfigValue> = Dictionary<T>;
