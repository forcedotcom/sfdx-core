import { writeFileSync } from 'node:fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const prettier = require('prettier');
import { z } from 'zod';
import { ScratchOrgDefSchema } from '../../src/schema/project-scratch-def/scratchOrgDef';
import { schemaSchema, target } from './consts';

/**
 * Build script for project-scratch-def.schema.json using Zod's native JSON Schema generation
 */

const run = async (): Promise<void> => {
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
  const scratchDefSchemaJson = await prettier.format(JSON.stringify(scratchDefSchema), { parser: 'json' });

  console.log('writing project-scratch-def schema to src/');
  writeFileSync('src/schema/project-scratch-def/project-scratch-def.schema.json', scratchDefSchemaJson);

  console.log('done');
};

void run();
