import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { ProjectJsonSchema } from '../../lib/schema/sfdx-project/sfdxProjectJson.js';
import { schemaSchema, target } from './consts';

/**
 * Build script for sfdx-project.schema.json using Zod's native JSON Schema generation
 */

console.log('generating sfdx-project schema from Zod schema');

const projectSchema = z.toJSONSchema(ProjectJsonSchema, {
  target,
  override: (ctx) => {
    if (ctx.path.length === 0) {
      ctx.jsonSchema.$schema = schemaSchema;
      ctx.jsonSchema.$id = 'http://schemas.salesforce.com/sfdx-project.json';
      ctx.jsonSchema.title = 'Salesforce DX Project File';
    }
  },
});
const projectSchemaJson = JSON.stringify(projectSchema, null, 2);

console.log('writing sfdx-project schema to lib/');
writeFileSync('lib/sfdx-project.schema.json', projectSchemaJson);

console.log('done');
