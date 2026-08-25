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

import { expect } from 'chai';
import {
  apexSymbolCategories,
  apexTypeKinds,
  ApexSymbolsMaterializedControls,
  ApexSymbolsRequest,
  ApexSymbolsRequestControls,
  ApexSymbolsStreamControls,
  ApexTypeStubResponse,
} from '../../../src';
import { buildApexSymbolsUrl } from '../../../src/org/apexSymbols';

describe('Apex Symbols', () => {
  describe('request contract', () => {
    it('exposes every Apex symbol category and type kind', () => {
      expect(apexSymbolCategories).to.deep.equal(['BUILTIN', 'DATABASE', 'DYNAMIC']);
      expect(apexTypeKinds).to.deep.equal(['CLASS', 'INTERFACE', 'ENUM', 'TRIGGER']);
    });

    it('uses a discriminated union for materialized and streaming controls', () => {
      const materialized: ApexSymbolsMaterializedControls = {
        mode: 'materialized',
        maxResponseBytes: 1_000,
        maxTypeStubs: 10,
        maxStubBytes: 500,
      };
      const stream: ApexSymbolsStreamControls = {
        mode: 'stream',
        maxResponseBytes: 1_000,
      };
      const controls: ApexSymbolsRequestControls[] = [materialized, stream];

      expect(controls.map(({ mode }) => mode)).to.deep.equal(['materialized', 'stream']);
    });

    it('does not expose a result format selector', () => {
      const request: ApexSymbolsRequest = { category: 'DATABASE' };
      // @ts-expect-error TYPE_STUB is implicit and format is intentionally not part of the request.
      const invalidRequest: ApexSymbolsRequest = { category: 'DATABASE', format: 'TYPE_STUB' };

      expect(request).to.deep.equal({ category: 'DATABASE' });
      expect(invalidRequest).to.have.property('format', 'TYPE_STUB');
    });
  });

  describe('buildApexSymbolsUrl', () => {
    it('builds the route for every category', () => {
      expect(
        apexSymbolCategories.map((category) =>
          buildApexSymbolsUrl('https://example.my.salesforce.com', '68.0', { category })
        )
      ).to.deep.equal([
        'https://example.my.salesforce.com/services/data/v68.0/tooling/symbols?category=BUILTIN',
        'https://example.my.salesforce.com/services/data/v68.0/tooling/symbols?category=DATABASE',
        'https://example.my.salesforce.com/services/data/v68.0/tooling/symbols?category=DYNAMIC',
      ]);
    });

    it('preserves and encodes exact lookup filters', () => {
      const url = buildApexSymbolsUrl('https://example.my.salesforce.com/path', '68.0', {
        category: 'DATABASE',
        namespace: 'My Package/Name',
        name: 'Outer.Inner?',
      });

      expect(url).to.equal(
        'https://example.my.salesforce.com/services/data/v68.0/tooling/symbols?category=DATABASE&namespace=My+Package%2FName&name=Outer.Inner%3F'
      );
    });

    it('omits undefined filters without changing case', () => {
      const url = buildApexSymbolsUrl('https://example.my.salesforce.com', '68.0', {
        category: 'BUILTIN',
        namespace: 'SyStEm',
        name: 'sTrInG',
      });

      expect(url).to.equal(
        'https://example.my.salesforce.com/services/data/v68.0/tooling/symbols?category=BUILTIN&namespace=SyStEm&name=sTrInG'
      );
    });

    it('preserves explicitly empty filters', () => {
      const url = buildApexSymbolsUrl('https://example.my.salesforce.com', '68.0', {
        category: 'DYNAMIC',
        namespace: '',
        name: '',
      });

      expect(url).to.equal(
        'https://example.my.salesforce.com/services/data/v68.0/tooling/symbols?category=DYNAMIC&namespace=&name='
      );
    });
  });

  it('models resolved, recursive, generic, and compile-error type stubs', () => {
    const response: ApexTypeStubResponse = {
      typeStubs: [
        {
          name: 'List',
          namespacePrefix: 'System',
          kind: 'CLASS',
          modifiers: ['global'],
          annotations: [],
          superClass: null,
          interfaces: [{ namespacePrefix: 'System', name: 'Iterable', typeParameters: null }],
          typeParameters: [{ namespacePrefix: null, name: 'T', typeParameters: null }],
          fields: [],
          properties: [],
          methods: [],
          innerTypes: [
            {
              name: 'List.Iterator',
              namespacePrefix: 'System',
              kind: 'INTERFACE',
              modifiers: ['global'],
              annotations: [],
              interfaces: [],
              fields: [],
              properties: [],
              methods: [],
              innerTypes: [],
              compileError: null,
            },
          ],
          triggerOperations: null,
          triggerObjectType: null,
          documentation: 'A generic collection.',
          compileError: null,
        },
        {
          name: 'BrokenClass',
          namespacePrefix: 'Example',
          compileError: 'Compilation failed.',
          kind: null,
          modifiers: [],
          annotations: [],
          interfaces: [],
          fields: [],
          properties: [],
          methods: [],
          innerTypes: [],
        },
      ],
    };

    expect(response.typeStubs[0].name).to.equal('List');
    expect(response.typeStubs[1].compileError).to.equal('Compilation failed.');
  });
});
