/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { Duration } from '@salesforce/kit';

export const validateWaitOptions = ({
  options,
}: {
  options: {
    wait?: Duration;
    interval?: Duration;
    async?: boolean;
  };
}): [Duration, Duration] => {
  const wait = options.wait ?? Duration.minutes(30);
  const interval = options.interval ?? Duration.seconds(30);
  let pollInterval = options.async ? Duration.seconds(0) : interval;
  // pollInterval cannot be > wait.
  pollInterval = pollInterval.seconds > wait.seconds ? wait : pollInterval;
  return [wait, pollInterval];
};
