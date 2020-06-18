/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson } from '@salesforce/ts-types';
import * as Debug from 'debug';

type callback = (data: AnyJson) => Promise<void>;

interface CallbackDictionary {
  [key: string]: callback[];
}

/**
 * An asynchronous event listener and emitter that follows the singleton pattern.
 */
export class Lifecycle {
  public static getInstance(): Lifecycle {
    if (!this.instance) {
      this.instance = new Lifecycle();
    }
    return this.instance;
  }

  private static instance: Lifecycle;
  private debug = Debug(`sfdx:${this.constructor.name}`);
  private listeners: CallbackDictionary;

  private constructor() {
    this.listeners = {};
  }

  public removeAllListeners(eventName: string) {
    this.listeners[eventName] = [];
  }

  public getListeners(eventName: string): callback[] {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    return this.listeners[eventName];
  }

  public on<T extends AnyJson>(eventName: string, cb: (data: T | AnyJson) => Promise<void>) {
    if (this.getListeners(eventName).length !== 0) {
      this.debug(
        `${this.listeners[eventName].length +
          1} lifecycle events with the name ${eventName} have now been registered. When this event is emitted all ${this
          .listeners[eventName].length + 1} listeners will fire.`
      );
    }
    this.listeners[eventName].push(cb);
  }

  public async emit(eventName: string, data: AnyJson) {
    if (this.getListeners(eventName).length === 0) {
      this.debug(
        `A lifecycle event with the name ${eventName} does not exist. An event must be registered before it can be emitted.`
      );
    } else {
      this.listeners[eventName].forEach(async cb => {
        await cb(data);
      });
    }
  }
}
