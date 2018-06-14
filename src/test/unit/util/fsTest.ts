/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { assert, expect } from 'chai';
import { testSetup } from '../../testSetup';
import { tmpdir as osTmpdir } from 'os';
import { join as pathJoin } from 'path';
import * as fs from '../../../lib/util/fs';
import { writeJson } from '../../../lib/util/json';

// Setup the test environment.
const $$ = testSetup();

describe('util/fs', () => {
    describe('remove', () => {
        it ('should throw an error on falsy', async () => {
            try {
                await fs.remove(undefined);
                assert.fail('This test is designed to throw an error');
            } catch (e) {
                expect(e).to.have.property('name', 'PathIsNullOrUndefined');
            }
        });

        it ('should remove a folder with no files', async () => {
            const folderToDelete = pathJoin(osTmpdir(), 'foo');
            await fs.mkdirp(folderToDelete);
            await fs.remove(folderToDelete);

            try {
                await fs.access(folderToDelete);
                assert.fail('This test is design to throw and error');
            } catch (e) {
                expect(e).to.have.property('code', 'ENOENT');
            }
        });

        it ('should remove a folder with one file', async () => {
            const folderToDelete = pathJoin(osTmpdir(), 'foo');
            const fileToDelete = pathJoin(folderToDelete, 'test.json');

            await fs.mkdirp(folderToDelete);
            await writeJson(fileToDelete, {});
            await fs.remove(folderToDelete);

            for (const path of [folderToDelete, fileToDelete]) {
                try {
                    await fs.access(path);
                    assert.fail('This test is design to throw and error');
                } catch (e) {
                    expect(e).to.have.property('code', 'ENOENT');
                }
            }
        });

        it ('should remove nested sub dirs', async () => {
            const folderToDelete = pathJoin(osTmpdir(), 'alpha');
            const sub1 = pathJoin(folderToDelete, 'bravo');
            const sub2 = pathJoin(folderToDelete, 'charlie');
            const nestedSub1 = pathJoin(sub1, 'echo');
            const file1 = pathJoin(nestedSub1, 'foo.txt');
            const file2 = pathJoin(sub2, 'foo.txt');

            await fs.mkdirp(sub2);
            await fs.mkdirp(nestedSub1);

            await writeJson(file1, {});
            await writeJson(file2, {});

            await fs.remove(folderToDelete);

            for (const path of [file1, file2, nestedSub1, sub2, sub1]) {
                try {
                    await fs.access(path);
                    assert.fail('This test is designed to throw and error');
                } catch (e) {
                    expect(e).to.have.property('code', 'ENOENT');
                }
            }

        });
    });

    describe('traverseForFile', () => {
        let statFileStub;
        let statError;

        beforeEach(() => {
            statFileStub = $$.SANDBOX.stub(fs, 'stat');
            statError = new Error('test');
            statError['code'] = 'ENOENT';
        });

        it('should find a file in the starting dir', async () => {
            const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
            expect(path).to.equal('/foo/bar/baz');
        });

        it('should find a file in a parent dir', async () => {
            statFileStub.withArgs('/foo/bar/baz/fizz').returns(Promise.reject(statError));
            const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
            expect(path).to.equal('/foo/bar');
        });

        it('should find a file in the root dir', async () => {
            statFileStub.withArgs('/foo/bar/baz/fizz').returns(Promise.reject(statError));
            statFileStub.withArgs('/foo/bar/fizz').returns(Promise.reject(statError));
            statFileStub.withArgs('/foo/fizz').returns(Promise.reject(statError));
            const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
            expect(path).to.equal('/');
        });

        it('should return null if not found', async () => {
            statFileStub.returns(Promise.reject(statError));
            const path = await fs.traverseForFile('/foo/bar/baz', 'fizz');
            expect(path).to.equal(null);
        });
    });
});
