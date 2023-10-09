/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

type LWWRegisterState<T> = { peer: string; timestamp: bigint; value: T };

/** a CRDT implementation.  Uses timestamps to resolve conflicts when updating the value (last write wins)
 * mostly based on https://jakelazaroff.com/words/an-interactive-intro-to-crdts/
 *
 * @param T the type of the value stored in the register
 */
export class LWWRegister<T> {
  public readonly id: string;
  public state: LWWRegisterState<T>;

  public constructor(id: string, state: LWWRegisterState<T>) {
    this.id = id;
    this.state = state;
  }

  public get value(): T {
    return this.state.value;
  }

  public set(value: T): void {
    // set the peer ID to the local ID, timestamp it and set the value
    this.state = { peer: this.id, timestamp: process.hrtime.bigint(), value };
  }

  public merge(incoming: LWWRegisterState<T>): LWWRegisterState<T> {
    // only update if the incoming timestamp is greater than the local timestamp
    // console.log(`incoming: ${}`);
    // console.log(`local: ${JSON.stringify(this.state)}`);
    if (incoming.timestamp > this.state.timestamp) {
      this.state = incoming;
    }
    // TODO: if the timestamps match, use the peer ID to break the tie (prefer self?)
    return this.state;
  }
}
