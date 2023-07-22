/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Duration } from '@salesforce/kit';

export const validateWaitOptions = ({
  wait = Duration.minutes(30),
  interval = Duration.seconds(30),
  async = false,
}: {
  wait?: Duration;
  interval?: Duration;
  async?: boolean;
}): [Duration, Duration] => {
  let pollInterval = async ? Duration.seconds(0) : interval;
  // pollInterval cannot be > wait.
  pollInterval = pollInterval.seconds > wait.seconds ? wait : pollInterval;
  return [wait, pollInterval];
};
