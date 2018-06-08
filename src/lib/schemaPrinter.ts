/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root  or https://opensource.org/licenses/BSD-3-Clause
 */

import { Logger } from './logger';
import { SfdxError } from './sfdxError';
import { color } from './ux';
import { JsonMap, JsonArray, isJsonMap, isJsonArray, asJsonMap, asString, asNumber, asJsonArray } from './types';

/**
 * Prints a JSON schema in a human-friendly format.
 */
export class SchemaPrinter {
    private logger: Logger;
    private lines: string[] = [];

    /**
     * Constructs a new `SchemaPrinter`.
     *
     * @param {Logger} logger The logger to use when emitting the printed schema.
     * @param {JsonMap} schema The schema to print.
     */
    public constructor(logger: Logger, private schema: JsonMap) {
        this.logger = logger.child('SchemaPrinter');

        if (!this.schema.properties && !this.schema.items) {
            // No need to add to messages, since this should never happen. In fact,
            // this will cause a test failure if there is a command that uses a schema
            // with no properties defined.
            throw new SfdxError('There is no purpose to print a schema with no properties or items');
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

            Object.keys(this.schema.properties).forEach((key) => {
                const properties = asJsonMap(this.schema.properties);
                if (!properties) {
                    return;
                }
                this.parseProperty(key, asJsonMap(properties[key]), startLevel);
                add('');
            });
        } else {
            this.parseProperty('schema', this.schema, startLevel);
        }
    }

    /**
     * Gets a read-only array of ready-to-display lines.
     *
     * @returns {ReadonlyArray<string>}
     */
    public getLines(): ReadonlyArray<string> {
        return this.lines;
    }

    /**
     * Gets a ready-to-display line by index.
     *
     * @param {number} index The line index to get.
     * @returns {string}
     */
    public getLine(index: number): string {
        return this.lines[index];
    }

    /**
     * Prints the accumulated set of schema lines.
     */
    public print(): void {
        this.lines.forEach((line) => this.logger.info(line));
    }

    private addFn(level: number): (line: string) => void {
        const indent = ' '.repeat(level * 4);
        return (line: string) => {
            this.lines.push(`${indent}${line}`);
        };
    }

    private parseProperty(name: string, rawProperty?: JsonMap, level: number = 0): void {
        if (!rawProperty) {
            return;
        }

        const add = this.addFn(level);
        const property = new SchemaProperty(this.logger, this.schema, name, rawProperty);

        add(property.renderHeader());

        if (property.type === 'object' && property.properties) {
            Object.keys(property.properties).forEach((key) => {
                this.parseProperty(key, property.getProperty(key), level + 1);
            });
        }
        if (property.type === 'array') {
            add(`    ${property.renderArrayHeader()}`);
            if (property.items && property.items.type === 'object' && property.items.properties) {
                Object.keys(property.items.properties).forEach((key) => {
                    const items = asJsonMap(property.items);
                    if (!items) {
                        return;
                    }
                    const properties = asJsonMap(items.properties);
                    if (!properties) {
                        return;
                    }
                    this.parseProperty(key, asJsonMap(properties[key]), level + 2);
                });
            }
        }
        if (property.required) {
            add(`Required: ${property.required.join(', ')}`);
        }
    }
}

class SchemaProperty {
    public constructor(
        private readonly logger: Logger,
        private readonly schema: JsonMap,
        private readonly name: string,
        private rawProperty: JsonMap
    ) {
        this.name = name;

        // Capture the referenced definition, if specified
        if (typeof this.rawProperty.$ref === 'string') {
            // Copy the referenced property while adding the original property's properties on top of that --
            // if they are defined here, they take precedence over referenced definition properties.
            this.rawProperty = Object.assign({}, resolveRef(this.schema, this.rawProperty), rawProperty);
        }

        if (isJsonArray(this.rawProperty.oneOf) && !this.rawProperty.type) {
            this.rawProperty.type = this.rawProperty.oneOf.map((value) => {
                return isJsonMap(value) ? value.type || value.$ref : value;
            }).join('|');
        }

        // Handle items references
        if (isJsonMap(this.items) && this.items && this.items.$ref) {
            Object.assign(this.items, resolveRef(this.schema, this.items));
        }
    }

    public renderName(): string {
        return color.bold(this.name);
    }

    public renderTitle(): string {
        return this.title ? color.underline(this.title) : '';
    }

    public renderDescription(): string {
        return this.description ? color.dim(this.description) : '';
    }

    public renderType(): string {
        return this.type ? color.dim(this.type) : '';
    }

    public renderHeader(): string {
        return `${this.renderName()}(${this.renderType()}) - ${this.renderTitle()}: ${this.renderDescription()}`;
    }

    public renderArrayHeader(): string {
        if (!this.items) {
            return '';
        }
        const minItems = this.minItems ? ` - min ${this.minItems}` : '';
        const prop = new SchemaProperty(this.logger, this.schema, 'items', this.items);
        return `items(${prop.renderType()}${minItems}) - ${prop.renderTitle()}: ${prop.renderDescription()}`;
    }

    public get title(): string | undefined {
        return asString(this.rawProperty.title);
    }

    public get description(): string | undefined {
        return asString(this.rawProperty.description);
    }

    public get type(): string | undefined { // tslint:disable-line:no-reserved-keywords
        return asString(this.rawProperty.type);
    }

    public get required(): JsonArray | undefined {
        return asJsonArray(this.rawProperty.required);
    }

    public get properties(): JsonMap | undefined {
        return asJsonMap(this.rawProperty.properties);
    }

    public get items(): JsonMap | undefined {
        return asJsonMap(this.rawProperty.items);
    }

    public get minItems(): number | undefined {
        return asNumber(this.rawProperty.minItems);
    }

    public getProperty(key: string): JsonMap | undefined {
        const properties = this.getProperties();
        return asJsonMap(properties && properties[key]);
    }

    public getProperties(): JsonMap | undefined {
        return asJsonMap(this.rawProperty.properties);
    }
}

/**
 * Get the referenced definition by following the reference path on the current schema.
 *
 * @param {JsonMap} schema The source schema containing the property containing a `$ref` field.
 * @param {JsonMap} property The property that contains the `$ref` field.
 * @returns {JsonMap}
 */
function resolveRef(schema: JsonMap, property: JsonMap): JsonMap | null {
    const ref = property.$ref;
    if (!ref || typeof ref !== 'string') {
        return null;
    }
    return ref.split('/').reduce((prev, key) => {
        const next = prev[key];
        return key === '#' ? schema : isJsonMap(next) ? next : {};
    }, property);
}
