/*
 * Copyright (c) 2026, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import * as nodeFs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { expect } from 'chai';
import { getVirtualFs } from '../../../src/fs/fs';

describe('fs runtime detection', () => {
  let originalSelf: PropertyDescriptor | undefined;
  let originalForceMemfs: string | undefined;
  let originalBunVersion: string | undefined;

  beforeEach(() => {
    originalSelf = Object.getOwnPropertyDescriptor(globalThis, 'self');
    originalForceMemfs = process.env.FORCE_MEMFS;
    originalBunVersion = process.versions.bun;
    delete process.env.FORCE_MEMFS;
  });

  afterEach(() => {
    if (originalSelf) {
      Object.defineProperty(globalThis, 'self', originalSelf);
    } else {
      delete (globalThis as { self?: unknown }).self;
    }
    if (originalForceMemfs === undefined) {
      delete process.env.FORCE_MEMFS;
    } else {
      process.env.FORCE_MEMFS = originalForceMemfs;
    }
    if (originalBunVersion === undefined) {
      delete (process.versions as { bun?: string }).bun;
    } else {
      (process.versions as { bun?: string }).bun = originalBunVersion;
    }
  });

  it('uses the real filesystem under Node', () => {
    const tmpFile = path.join(os.tmpdir(), `sfdx-core-fs-runtime-${Date.now()}.txt`);
    nodeFs.writeFileSync(tmpFile, 'real');
    try {
      expect(getVirtualFs().readFileSync(tmpFile, 'utf8')).to.equal('real');
    } finally {
      nodeFs.unlinkSync(tmpFile);
    }
  });

  it('uses the real filesystem under Bun even when `self` is on globalThis', () => {
    // Bun exposes `self` on globalThis as an alias for globalThis itself for
    // Web API compatibility, and also sets `process.versions.bun`. Without the
    // server-runtime check, the `'self' in globalThis` branch incorrectly
    // routed Bun to memfs and broke filesystem-dependent functionality
    // (issue #3535).
    Object.defineProperty(globalThis, 'self', {
      value: globalThis,
      configurable: true,
      writable: true,
    });
    (process.versions as { bun?: string }).bun = '1.3.9';

    const tmpFile = path.join(os.tmpdir(), `sfdx-core-fs-runtime-bun-${Date.now()}.txt`);
    nodeFs.writeFileSync(tmpFile, 'real');
    try {
      expect(getVirtualFs().readFileSync(tmpFile, 'utf8')).to.equal('real');
    } finally {
      nodeFs.unlinkSync(tmpFile);
    }
  });

  it('uses memfs when FORCE_MEMFS=true', () => {
    process.env.FORCE_MEMFS = 'true';
    const fs = getVirtualFs();
    const memOnlyPath = '/sfdx-core-fs-runtime-memfs-only.txt';
    fs.writeFileSync(memOnlyPath, 'memfs');
    expect(fs.readFileSync(memOnlyPath, 'utf8')).to.equal('memfs');
    // Confirm the write only landed in memfs, not on the real filesystem.
    expect(nodeFs.existsSync(memOnlyPath)).to.be.false;
  });
});