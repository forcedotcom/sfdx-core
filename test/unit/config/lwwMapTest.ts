/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect, config } from 'chai';
import { LWWMap, SYMBOL_FOR_DELETED } from '../../../src/config/lwwMap';

config.truncateThreshold = 0;
describe('LWWMap', () => {
  describe('all properties are known', () => {
    const state = {
      foo: { value: 'bar', timestamp: process.hrtime.bigint(), peer: 'a' },
      baz: { value: 'qux', timestamp: process.hrtime.bigint(), peer: 'a' },
    };
    let lwwMap: LWWMap<{ foo: string; baz: string; opt?: number; optNull?: null }>;

    beforeEach(() => {
      lwwMap = new LWWMap('test', state);
    });

    it('should initialize with the correct state', () => {
      expect(lwwMap.state).to.deep.equal(state);
    });

    it('should get the correct value for the entire object', () => {
      expect(lwwMap.value).to.deep.equal({ foo: 'bar', baz: 'qux' });
    });

    it('has when it has', () => {
      expect(lwwMap.has('foo')).to.be.true;
    });

    it('sets a new key', () => {
      lwwMap.set('opt', 4);
      expect(lwwMap.has('opt')).to.be.true;
    });

    it('get by key', () => {
      expect(lwwMap.get('foo')).to.equal('bar');
    });

    it('get missing by key', () => {
      expect(lwwMap.get('opt')).to.equal(undefined);
    });

    it('has when it does not have', () => {
      expect(lwwMap.has('nope')).to.be.false;
      expect(lwwMap.state).to.deep.equal(state);
    });

    it('has is false for deleted', () => {
      lwwMap.delete('foo');
      expect(lwwMap.has('foo')).to.be.false;
    });

    it('deletes a key that exists', () => {
      lwwMap.delete('foo');
      expect(lwwMap.has('foo')).to.be.false;
      expect(lwwMap.value).to.deep.equal({ baz: 'qux' });
      expect(lwwMap.state.baz).to.deep.equal(state.baz);
      expect(lwwMap.state.foo.value).to.equal(SYMBOL_FOR_DELETED);
    });

    it('set and get an optional null', () => {
      lwwMap.set('optNull', null);
      expect(lwwMap.get('optNull')).to.be.null;
    });

    describe('merge', () => {
      beforeEach(() => {
        lwwMap = new LWWMap('test', state);
      });
      it('all are updated', () => {
        const remoteState = {
          foo: { value: 'bar2', timestamp: process.hrtime.bigint(), peer: 'b' },
          baz: { value: 'qux2', timestamp: process.hrtime.bigint(), peer: 'b' },
        };
        lwwMap.merge(remoteState);
        expect(lwwMap.state).to.deep.equal(remoteState);
        expect(lwwMap.get('foo')).to.equal('bar2');
      });
      it('all are deleted', () => {
        const remoteState = {
          foo: { value: SYMBOL_FOR_DELETED, timestamp: process.hrtime.bigint(), peer: 'b' },
          baz: { value: SYMBOL_FOR_DELETED, timestamp: process.hrtime.bigint(), peer: 'b' },
        };
        lwwMap.merge(remoteState);
        expect(lwwMap.state).to.deep.equal(remoteState);
        expect(lwwMap.get('foo')).to.equal(undefined);
      });
      it('none are updated', () => {
        const remoteState = {
          foo: { value: 'bar2', timestamp: process.hrtime.bigint() - BigInt(10000000000), peer: 'b' },
          baz: { value: 'qux2', timestamp: process.hrtime.bigint() - BigInt(10000000000), peer: 'b' },
        };
        lwwMap.merge(remoteState);
        expect(lwwMap.state).to.deep.equal(state);
        expect(lwwMap.get('foo')).to.equal('bar');
      });
      it('one is update, one is added, one is deleted', () => {
        lwwMap.set('opt', 4);
        const remoteState = {
          foo: { value: 'bar2', timestamp: process.hrtime.bigint(), peer: 'b' },
          baz: { value: 'qux2', timestamp: process.hrtime.bigint() - BigInt(10000000000), peer: 'b' },
          opt: { value: SYMBOL_FOR_DELETED, timestamp: process.hrtime.bigint(), peer: 'b' },
          optNull: { value: null, timestamp: process.hrtime.bigint(), peer: 'b' },
        };
        lwwMap.merge(remoteState);
        expect(lwwMap.get('foo')).to.equal('bar2');
        expect(lwwMap.get('baz')).to.equal('qux');
        expect(lwwMap.state.opt?.value).to.equal(SYMBOL_FOR_DELETED);
        expect(lwwMap.get('opt')).to.be.undefined;
      });
    });
  });

  describe('nested objects', () => {
    const state = {
      foo: { value: 'bar', timestamp: process.hrtime.bigint(), peer: 'a' },
      baz: { value: 'qux', timestamp: process.hrtime.bigint(), peer: 'a' },
      obj: { value: { a: 1, b: 2, c: 3 }, timestamp: process.hrtime.bigint(), peer: 'a' },
    };
    let lwwMap: LWWMap<{ foo: string; baz: string; opt?: number; optNull?: null }>;

    beforeEach(() => {
      lwwMap = new LWWMap('test', state);
    });

    it('should initialize with the correct state', () => {
      expect(lwwMap.state).to.deep.equal(state);
    });

    it('should get the correct value for the entire object', () => {
      expect(lwwMap.value).to.deep.equal({ foo: 'bar', baz: 'qux', obj: { a: 1, b: 2, c: 3 } });
    });
  });
});
