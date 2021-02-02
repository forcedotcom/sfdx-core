import { JsonMap } from '@salesforce/ts-types';
import { Logger } from '../logger';
/**
 * Renders schema properties.  By default, this is simply an identity transform.  Subclasses may provide more
 * interesting decorations of each values, such as ANSI coloring.
 */
export declare class SchemaPropertyRenderer {
  /**
   * Renders a name.
   *
   * @param name The name value to render.
   */
  renderName(name: string): string;
  /**
   * Renders a title.
   *
   * @param title The title value to render.
   */
  renderTitle(title: string): string;
  /**
   * Renders a description.
   *
   * @param description The description value to render.
   */
  renderDescription(description: string): string;
  /**
   * Renders a type.
   *
   * @param propertyType The type value to render.
   */
  renderType(propertyType: string): string;
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
export declare class SchemaPrinter {
  private schema;
  private propertyRenderer;
  private logger;
  private lines;
  /**
   * Constructs a new `SchemaPrinter`.
   *
   * @param logger The logger to use when emitting the printed schema.
   * @param schema The schema to print.
   * @param propertyRenderer The property renderer.
   */
  constructor(logger: Logger, schema: JsonMap, propertyRenderer?: SchemaPropertyRenderer);
  /**
   * Gets a read-only array of ready-to-display lines.
   */
  getLines(): ReadonlyArray<string>;
  /**
   * Gets a ready-to-display line by index.
   *
   * @param index The line index to get.
   */
  getLine(index: number): string;
  /**
   * Prints the accumulated set of schema lines as info log lines to the logger.
   */
  print(): void;
  private addFn;
  private parseProperty;
}
