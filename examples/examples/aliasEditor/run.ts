#!/usr/bin/env node

import { run } from './';

// Run with await
(async () => {
  await run();
})().catch(console.error);
