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

// docs: https://github.com/moxystudio/node-proper-lockfile
import { fs } from '../fs/fs';

export const lockOptions = { stale: 10_000 };
export const lockRetryOptions = {
  ...lockOptions,
  retries: { retries: 10, maxTimeout: 1000, factor: 2 },
  fs, // lockfile supports injectable fs, which is needed for browser use
};
