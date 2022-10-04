/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable class-methods-use-this */

import * as fs from 'fs';
import * as path from 'path';
import { JsonMap } from '@salesforce/ts-types';
import { expect } from 'chai';
import { LoggerLevel } from '../../../src/logger';
import { SchemaPrinter, SchemaPropertyRenderer } from '../../../src/schema/printer';
import { testSetup } from '../../../src/testSetup';

const $$ = testSetup();

const SCHEMA_DIR = path.join(__dirname, '..', '..', '..', 'test', 'unit', 'fixtures', 'schemas');

const getIndent = (level: LoggerLevel) => ' '.repeat(level * 4);

const getLine = (schema: JsonMap, line = 0) => new SchemaPrinter($$.TEST_LOGGER, schema).getLine(line);

describe('SchemaPrinter', () => {
  it('throws with no schema properties', () => {
    const expected = 'no properties';
    const actual = () => getLine({});

    expect(actual).to.throw(expected);
  });

  it('includes schema header', () => {
    const expected = 'schema description';
    const schema = {
      description: expected,
      properties: {},
    };
    const actual = getLine(schema);

    expect(actual).to.be.equal(expected);
  });

  describe('property headers', () => {
    it('should include property name', () => {
      const expected = 'testProperty';
      const schema = {
        properties: {
          testProperty: {},
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    it('should include property type', () => {
      const type = 'string';
      const expected = `(${type})`;
      const schema = {
        properties: {
          testProperty: {
            type,
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    it('should include property title and description', () => {
      const title = 'my title';
      const description = 'my description';
      const expected = `${title}: ${description}`;
      const schema = {
        properties: {
          testProperty: {
            title,
            description,
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });
  });

  describe('object properties', () => {
    const getPropertyLine = (properties: JsonMap, line = 0) =>
      getLine(
        {
          properties: {
            testProperty: {
              type: 'object',
              properties,
            },
          },
        },
        1 + line
      );

    it('should list out a single property', () => {
      const name = 'testProperty';
      const jsType = 'boolean';
      const title = 'myTitle';
      const description = 'my description';
      // Check the entire line
      const expected = `${getIndent(1)}${name}(${jsType}) - ${title}: ${description}`;
      const properties = {
        testProperty: {
          title,
          description,
          type: jsType,
        },
      };
      const actual = getPropertyLine(properties);
      expect(actual).to.equal(expected);
    });

    it('should list out required', () => {
      const required = ['req1', 'req2'];
      const expected = `${getIndent(1)}Required: ${required.join(', ')}`;
      const properties = {
        testProperty: {
          required,
        },
      };
      const actual = getPropertyLine(properties, 1);
      expect(actual).to.equal(expected);
    });

    it('should list out multiple properties', () => {
      const expected = 'testProperty';
      const properties = {
        firstProp: {},
        testProperty: {},
      };
      const actual = getPropertyLine(properties, 1);
      expect(actual).to.contain(expected);
    });
  });

  describe('definition references', () => {
    it('should use top level definition', () => {
      const jsType = 'string';
      const expected = `(${jsType})`;
      const schema = {
        definitions: {
          myDef: {
            type: jsType,
          },
        },
        properties: {
          testProperty: {
            $ref: '#/definitions/myDef',
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    it('should use relative definition', () => {
      const jsType = 'string';
      const expected = `(${jsType})`;
      const schema = {
        properties: {
          testProperty: {
            myDef: {
              type: jsType,
            },
            $ref: 'myDef',
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    it('should use original values over definition', () => {
      const title = 'myTitle';
      const jsType = 'string';
      const expected = `(${jsType}) - ${title}`;
      const schema = {
        definitions: {
          myDef: {
            title: 'someOtherTitle',
            type: jsType,
          },
        },
        properties: {
          testProperty: {
            title,
            $ref: '#/definitions/myDef',
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    it('should use oneOf type', () => {
      const jsType = 'string';
      const expected = `(${jsType}|${jsType})`;
      const schema = {
        definitions: {
          myDef: {
            oneOf: [
              {
                type: jsType,
              },
              {
                type: jsType,
              },
            ],
          },
        },
        properties: {
          testProperty: {
            $ref: '#/definitions/myDef',
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    it('should use item references', () => {
      const jsType = 'string';
      const expected = `(${jsType})`;
      const schema = {
        definitions: {
          myDef: {
            type: jsType,
          },
        },
        properties: {
          testProperty: {
            type: 'array',
            items: {
              $ref: '#/definitions/myDef',
            },
          },
        },
      };
      const actual = getLine(schema, 1);

      expect(actual).to.contain(expected);
    });
  });

  describe('oneOf', () => {
    it('should show type', () => {
      const jsType1 = 'string';
      const jsType2 = 'object';
      // TODO maybe we should show type oneOf with the types listed below for objects?
      const expected = `(${jsType1}|${jsType2})`;
      const schema = {
        properties: {
          testProperty: {
            oneOf: [
              {
                type: jsType1,
              },
              {
                type: jsType2,
              },
            ],
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    it('should show type from strings', () => {
      const jsType1 = 'string';
      const jsType2 = 'object';
      // TODO maybe we should show type oneOf with the types listed below for objects?
      const expected = `(${jsType1}|${jsType2})`;
      const schema = {
        properties: {
          testProperty: {
            oneOf: [jsType1, jsType2],
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    // Implementation TODO
    it.skip('should show object titles', () => {
      const title1 = 'title1';
      const title2 = 'title2';

      const expected = title1;
      const schema = {
        properties: {
          testProperty: {
            oneOf: [
              {
                title: title1,
                type: 'boolean',
              },
              {
                title: title2,
                type: 'string',
              },
            ],
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });

    // Implementation TODO
    it.skip('should show object properties', () => {
      const title = 'my inner property title';

      const expected = title;
      const schema = {
        properties: {
          testProperty: {
            oneOf: [
              {
                type: 'object',
                properties: {
                  innerProp: {
                    title,
                    type: 'string',
                  },
                },
              },
              {
                type: 'boolean',
              },
            ],
          },
        },
      };
      const actual = getLine(schema);

      expect(actual).to.contain(expected);
    });
  });

  const loadSchema = (schemaName: string, schemaPath: string) => {
    const fileContents = fs.readFileSync(schemaPath, 'utf8');
    let schema;

    try {
      schema = JSON.parse(fileContents);
    } catch (err) {
      const position = parseInt(err.message.match(/position (\d+)/)[1], 10);

      const start = position - 20 >= 0 ? position - 20 : 0;
      const end = position + 20 > fileContents.length ? fileContents.length : position + 20;
      const errorPortion = fileContents.substring(start, end);

      let totalCharCount = 0;
      let lineNumber = -1;
      fileContents.split('\n').reduce((curLineNumber, line) => {
        totalCharCount += line.length + 1; // +1 for newline
        if (totalCharCount > position && lineNumber < 0) {
          lineNumber = curLineNumber;
        }

        return curLineNumber + 1;
      }, 1);
      throw new Error(
        `Parse error in file ${schemaName} on line ${lineNumber}\n${errorPortion}\n${' '.repeat(position - start)}^`
      );
    }
    return schema;
  };

  describe('schemas', () => {
    it('should not contain undefined', () => {
      fs.readdirSync(SCHEMA_DIR).forEach((schemaName) => {
        const schemaPath = path.join(SCHEMA_DIR, schemaName);
        const schema = loadSchema(schemaName, schemaPath);

        new SchemaPrinter($$.TEST_LOGGER, schema)
          .getLines()
          .forEach((line) => expect(line).to.not.contain('undefined', `in ${schemaName}`));
      });
    });
  });

  describe('renderers', () => {
    it('should be called using default', () => {
      class MyRenderer extends SchemaPropertyRenderer {
        public renderName(name: string) {
          return `${name}Test`;
        }
      }

      const schema = { properties: { testProperty: {} } };
      const printer = new SchemaPrinter($$.TEST_LOGGER, schema, new MyRenderer());
      expect(printer.getLine(0)).to.equal('testPropertyTest() - : ');
    });
    it('should be called using the defined renderer', () => {
      class MyRender implements SchemaPropertyRenderer {
        public renderName(name: string) {
          return `${name}Name`;
        }
        public renderTitle(name: string) {
          return `${name}Title`;
        }
        public renderDescription(name: string) {
          return `${name}Description`;
        }
        public renderType(name: string) {
          return `${name}Type`;
        }
      }

      const schema = {
        properties: {
          testProperty: {
            title: 'title',
            description: 'description',
            type: 'type',
          },
        },
      };
      const printer = new SchemaPrinter($$.TEST_LOGGER, schema, new MyRender());
      expect(printer.getLine(0)).to.equal('testPropertyName(typeType) - titleTitle: descriptionDescription');
    });
  });
});
