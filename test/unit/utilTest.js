/*
 * Copyright (c) 2016, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

'use strict';

const path = require('path');

// Thirdparty
const Promise = require('bluebird');

// const sinon = require('sinon');

const { expect } = require('chai');

// Local Module
const util = require(path.join(__dirname, '..', '..', 'lib', 'sfdxUtil'));

/**
 *
 */
function createFnPromise(index, msDelay, executedOrder, doReject) {
    return () => new Promise((resolve, reject) => {
        setTimeout(() => {
            executedOrder.push(index);
            if (doReject) {
                reject(new Error());
            }
            else {
                resolve();
            }
        }, msDelay);
    });
}

describe('util', () => {
    let arrayOfFunctions;
    let executedOrder;

    beforeEach(() => {
        executedOrder = [];

        arrayOfFunctions = [
            createFnPromise(1, 100, executedOrder),
            createFnPromise(2, 0, executedOrder),
            createFnPromise(3, 50, executedOrder),
            createFnPromise(4, 200, executedOrder),
            createFnPromise(5, 20, executedOrder)
        ];
    });

    afterEach(() => {
        // testWorkspace.clean();
    });

    describe('parallelExecute', () => {
        it('should execute functions in parallel', () => {
            const rv = util.parallelExecute(arrayOfFunctions);
            return rv.then(() => expect(executedOrder).to.eql([2, 5, 3, 1, 4]));
        });

        it('should short circuit execution upon first promise rejection', () => {
            arrayOfFunctions[2] = createFnPromise(3, 50, executedOrder, true);
            const rv = util.parallelExecute(arrayOfFunctions);
            return rv.then(null, () => expect(executedOrder).to.eql([2, 5, 3]));
        });

        it('should return a promise', () => {
            expect(util.parallelExecute(arrayOfFunctions)).to.be.instanceof(Promise);
        });
    });

    describe('sequentialExecute', () => {
        it('should execute functions sequentially', () => {
            const rv = util.sequentialExecute(arrayOfFunctions);
            return rv.then(() => expect(executedOrder).to.eql([1, 2, 3, 4, 5]));
        });

        it('should short circuit execution upon first promise rejection', () => {
            arrayOfFunctions[2] = createFnPromise(3, 50, executedOrder, true);
            const rv = util.sequentialExecute(arrayOfFunctions);
            return rv.then(null, () => expect(executedOrder).to.eql([1, 2, 3]));
        });

        it('should return a promise', () => {
            expect(util.sequentialExecute(arrayOfFunctions)).to.be.instanceof(Promise);
        });
    });
});
