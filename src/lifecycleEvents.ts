/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { AnyJson, Dictionary } from '@salesforce/ts-types';
import * as Debug from 'debug';

type callback = (data: AnyJson) => Promise<void>;

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
  private listeners: Dictionary<callback[]>;

  private constructor() {
    this.listeners = {};
  }

  public removeAllListeners(eventName: string) {
    this.listeners[eventName] = [];
  }

  public getListeners(eventName: string): callback[] {
    const listeners = this.listeners[eventName];
    if (listeners) {
      return listeners;
    } else {
      this.listeners[eventName] = [];
      return [];
    }
  }

  public on<T extends AnyJson>(eventName: string, cb: (data: T | AnyJson) => Promise<void>) {
    const listeners = this.getListeners(eventName);
    if (listeners.length !== 0) {
      this.debug(
        `${listeners.length +
          1} lifecycle events with the name ${eventName} have now been registered. When this event is emitted all ${listeners.length +
          1} listeners will fire.`
      );
    }
    listeners.push(cb);
    this.listeners[eventName] = listeners;
  }

  public async emit(eventName: string, data: AnyJson) {
    const listeners = this.getListeners(eventName);
    if (listeners.length === 0) {
      this.debug(
        `A lifecycle event with the name ${eventName} does not exist. An event must be registered before it can be emitted.`
      );
    } else {
      listeners.forEach(async cb => {
        await cb(data);
      });
    }
  }
}
