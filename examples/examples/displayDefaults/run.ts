#!/usr/bin/env node

import { displayDefaultUsernames } from './';

// Run with await
(async () => {
  await displayDefaultUsernames();
})().catch(console.error);
