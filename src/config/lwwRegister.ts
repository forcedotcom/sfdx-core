/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { nowBigInt } from '../util/time';

type LWWRegisterState<T> = { timestamp: bigint; value: T };

/** a CRDT implementation.  Uses timestamps to resolve conflicts when updating the value (last write wins)
 * mostly based on https://jakelazaroff.com/words/an-interactive-intro-to-crdts/
 *
 * @param T the type of the value stored in the register
 */
export class LWWRegister<T> {
  public constructor(public state: LWWRegisterState<T>) {}

  public get value(): T {
    return this.state.value;
  }

  public get timestamp(): bigint {
    return this.state.timestamp;
  }

  public set(value: T): void {
    this.state = { timestamp: nowBigInt(), value };
  }

  public merge(incoming: LWWRegisterState<T>): LWWRegisterState<T> {
    // only update if the incoming timestamp is greater than the local timestamp
    if (incoming.timestamp > this.state.timestamp) {
      this.state = incoming;
    }
    return this.state;
  }
}
