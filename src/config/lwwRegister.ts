/*
 * Copyright 2025, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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
