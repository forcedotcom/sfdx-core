'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var index = require('../index-ffe6ca9f.js');
var sfdxError = require('../sfdxError.js');
require('../_commonjsHelpers-49936489.js');
require('../index-aea73a28.js');
require('../messages.js');
require('fs');
require('os');
require('path');
require('util');

/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/**
 * Renders schema properties.  By default, this is simply an identity transform.  Subclasses may provide more
 * interesting decorations of each values, such as ANSI coloring.
 */
class SchemaPropertyRenderer {
  /**
   * Renders a name.
   *
   * @param name The name value to render.
   */
  renderName(name) {
    return name;
  }
  /**
   * Renders a title.
   *
   * @param title The title value to render.
   */
  renderTitle(title) {
    return title;
  }
  /**
   * Renders a description.
   *
   * @param description The description value to render.
   */
  renderDescription(description) {
    return description;
  }
  /**
   * Renders a type.
   *
   * @param propertyType The type value to render.
   */
  renderType(propertyType) {
    return propertyType;
  }
}
/**
 * Prints a JSON schema in a human-friendly format.
 *
 * ```
 * import chalk from 'chalk';
 * class MyPropertyRenderer extends SchemaPropertyRenderer {
 *   renderName(name) { return chalk.bold.blue(name); }
 * }
 *
 * const printer = new SchemaPrinter(logger, schema, new MyPropertyRenderer());
 * printer.getLines().forEach(console.log);
 * ```
 */
class SchemaPrinter {
  /**
   * Constructs a new `SchemaPrinter`.
   *
   * @param logger The logger to use when emitting the printed schema.
   * @param schema The schema to print.
   * @param propertyRenderer The property renderer.
   */
  constructor(logger, schema, propertyRenderer = new SchemaPropertyRenderer()) {
    this.schema = schema;
    this.propertyRenderer = propertyRenderer;
    this.lines = [];
    this.logger = logger.child('SchemaPrinter');
    if (!this.schema.properties && !this.schema.items) {
      // No need to add to messages, since this should never happen. In fact,
      // this will cause a test failure if there is a command that uses a schema
      // with no properties defined.
      throw new sfdxError.SfdxError('There is no purpose to print a schema with no properties or items');
    }
    const startLevel = 0;
    const add = this.addFn(startLevel);
    // For object schemas, print out the "header" and first level properties differently
    if (this.schema.properties) {
      if (typeof this.schema.description === 'string') {
        // Output the overall schema description before printing the properties
        add(this.schema.description);
        add('');
      }
      Object.keys(this.schema.properties).forEach(key => {
        const properties = index.lib.asJsonMap(this.schema.properties);
        if (!properties) {
          return;
        }
        this.parseProperty(key, index.lib.asJsonMap(properties[key]), startLevel);
        add('');
      });
    } else {
      this.parseProperty('schema', this.schema, startLevel);
    }
  }
  /**
   * Gets a read-only array of ready-to-display lines.
   */
  getLines() {
    return this.lines;
  }
  /**
   * Gets a ready-to-display line by index.
   *
   * @param index The line index to get.
   */
  getLine(index) {
    return this.lines[index];
  }
  /**
   * Prints the accumulated set of schema lines as info log lines to the logger.
   */
  print() {
    this.lines.forEach(line => this.logger.info(line));
  }
  addFn(level) {
    const indent = ' '.repeat(level * 4);
    return line => {
      this.lines.push(`${indent}${line}`);
    };
  }
  parseProperty(name, rawProperty, level = 0) {
    if (!rawProperty) {
      return;
    }
    const add = this.addFn(level);
    const property = new SchemaProperty(this.logger, this.schema, name, rawProperty, this.propertyRenderer);
    add(property.renderHeader());
    if (property.type === 'object' && property.properties) {
      Object.keys(property.properties).forEach(key => {
        this.parseProperty(key, property.getProperty(key), level + 1);
      });
    }
    if (property.type === 'array') {
      add(`    ${property.renderArrayHeader()}`);
      if (property.items && property.items.type === 'object' && property.items.properties) {
        Object.keys(property.items.properties).forEach(key => {
          const items = index.lib.asJsonMap(property.items);
          if (!items) {
            return;
          }
          const properties = index.lib.asJsonMap(items.properties);
          if (!properties) {
            return;
          }
          this.parseProperty(key, index.lib.asJsonMap(properties[key]), level + 2);
        });
      }
    }
    if (property.required) {
      add(`Required: ${property.required.join(', ')}`);
    }
  }
}
class SchemaProperty {
  constructor(logger, schema, name, rawProperty, propertyRenderer) {
    this.logger = logger;
    this.schema = schema;
    this.name = name;
    this.rawProperty = rawProperty;
    this.propertyRenderer = propertyRenderer;
    this.name = name;
    // Capture the referenced definition, if specified
    if (typeof this.rawProperty.$ref === 'string') {
      // Copy the referenced property while adding the original property's properties on top of that --
      // if they are defined here, they take precedence over referenced definition properties.
      this.rawProperty = Object.assign({}, resolveRef(this.schema, this.rawProperty), rawProperty);
    }
    const oneOfs = index.lib.asJsonArray(this.rawProperty.oneOf);
    if (oneOfs && !this.rawProperty.type) {
      this.rawProperty.type = oneOfs
        .map(value => {
          return index.lib.isJsonMap(value) ? value.type || value.$ref : value;
        })
        .join('|');
    }
    // Handle items references
    if (index.lib.isJsonMap(this.items) && this.items && this.items.$ref) {
      Object.assign(this.items, resolveRef(this.schema, this.items));
    }
  }
  renderName() {
    return this.propertyRenderer.renderName(this.name);
  }
  renderTitle() {
    return this.propertyRenderer.renderTitle(this.title || '');
  }
  renderDescription() {
    return this.propertyRenderer.renderDescription(this.description || '');
  }
  renderType() {
    return this.propertyRenderer.renderType(this.type || '');
  }
  renderHeader() {
    return `${this.renderName()}(${this.renderType()}) - ${this.renderTitle()}: ${this.renderDescription()}`;
  }
  renderArrayHeader() {
    if (!this.items) {
      return '';
    }
    const minItems = this.minItems ? ` - min ${this.minItems}` : '';
    const prop = new SchemaProperty(this.logger, this.schema, 'items', this.items, this.propertyRenderer);
    return `items(${prop.renderType()}${minItems}) - ${prop.renderTitle()}: ${prop.renderDescription()}`;
  }
  get title() {
    return index.lib.asString(this.rawProperty.title);
  }
  get description() {
    return index.lib.asString(this.rawProperty.description);
  }
  get type() {
    return index.lib.asString(this.rawProperty.type);
  }
  get required() {
    return index.lib.asJsonArray(this.rawProperty.required);
  }
  get properties() {
    return index.lib.asJsonMap(this.rawProperty.properties);
  }
  get items() {
    return index.lib.asJsonMap(this.rawProperty.items);
  }
  get minItems() {
    return index.lib.asNumber(this.rawProperty.minItems);
  }
  getProperty(key) {
    const properties = this.getProperties();
    return index.lib.asJsonMap(properties && properties[key]);
  }
  getProperties() {
    return index.lib.asJsonMap(this.rawProperty.properties);
  }
}
/**
 * Get the referenced definition by following the reference path on the current schema.
 *
 * @param schema The source schema containing the property containing a `$ref` field.
 * @param property The property that contains the `$ref` field.
 */
function resolveRef(schema, property) {
  const ref = property.$ref;
  if (!ref || typeof ref !== 'string') {
    return null;
  }
  return ref.split('/').reduce((prev, key) => {
    const next = prev[key];
    return key === '#' ? schema : index.lib.isJsonMap(next) ? next : {};
  }, property);
}

exports.SchemaPrinter = SchemaPrinter;
exports.SchemaPropertyRenderer = SchemaPropertyRenderer;
//# sourceMappingURL=printer.js.map
