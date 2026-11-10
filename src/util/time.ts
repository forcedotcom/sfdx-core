/*
 * Copyright 2026, Salesforce, Inc.
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

/**
 * A wall-clock timestamp in nanosecond UNITS (not nanosecond resolution), used for last-write-wins
 * conflict resolution in the config CRDT (see LWWRegister/LWWMap). At write time it is compared
 * against the config file's mtimeNs, which is itself real wall-clock time in nanoseconds, so the two
 * must share that clock domain and unit. Date.now() gives whole milliseconds; the * 1_000_000n only
 * converts ms to ns to match mtimeNs, so the low six digits are always zero: resolution is
 * milliseconds, not nanoseconds.
 *
 * This intentionally does NOT use the previous globalThis.performance.now() + performance.timeOrigin.
 * That looks like wall time but is a HYBRID clock: timeOrigin is wall-clock sampled ONCE at process
 * start (a fixed anchor), and performance.now() is a monotonic (CLOCK_MONOTONIC) offset added on top.
 * The sum only equals wall time while the monotonic offset keeps pace with the wall clock, and it
 * stops doing so when the OS is suspended (monotonic FREEZES) or the wall clock steps (NTP / manual
 * change: wall jumps, monotonic does not follow). Because timeOrigin anchors only once, neither event
 * re-anchors the sum. So a process that was asleep stamps its in-memory writes with a timestamp
 * lagging real time, loses the merge against the file's wall-clock mtimeNs, and silently drops the
 * in-memory change (e.g. a refreshed access token): the config-write-loss after sleep in W-24580998.
 * The memory stamp and the file mtime must be read from the SAME clock; Date.now() is that clock (it
 * tracks wall time across suspend and clock steps) and it works in the browser.
 *
 * Tradeoff of millisecond resolution: the file keeps true sub-millisecond mtimeNs, so in a
 * same-millisecond race between two processes writing the same file, the file's finer mtime can beat
 * an in-memory change and drop it. That window is sub-ms, requires concurrent same-ms writers, and
 * self-heals on the next write, acceptable versus the multi-second, persistent suspend bug above.
 * These timestamps are never persisted; they are only ever compared against the wall-clock file mtime.
 */
export const nowBigInt = (): bigint => BigInt(Date.now()) * 1_000_000n;
