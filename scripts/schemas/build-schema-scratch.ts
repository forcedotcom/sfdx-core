import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { ScratchOrgDefSchema } from '../../src/schema/project-scratch-def/scratchOrgDef';
import { schemaSchema, target } from './consts';

/**
 * Build script for project-scratch-def.schema.json using Zod's native JSON Schema generation
 */

console.log('generating project-scratch-def schema from Zod schema');

const scratchDefSchema = z.toJSONSchema(ScratchOrgDefSchema, {
  target,
  override: (ctx) => {
    if (ctx.path.length === 0) {
      ctx.jsonSchema.$schema = schemaSchema;
      ctx.jsonSchema.$id = 'https://schemas.salesforce.com/project-scratch-def.json';
      ctx.jsonSchema.title = 'Scratch Org Definition Configuration';
      ctx.jsonSchema.description =
        'The scratch org definition file contains the configuration values that determine the shape of the scratch org.';
    }
  },
});
const scratchDefSchemaJson = JSON.stringify(scratchDefSchema, null, 2);

console.log('writing project-scratch-def schema to src/');
writeFileSync('src/schema/project-scratch-def/project-scratch-def.schema.json', scratchDefSchemaJson);

console.log('done');
