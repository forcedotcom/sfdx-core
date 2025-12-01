import { writeFileSync } from 'node:fs';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const prettier = require('prettier');
import { z } from 'zod';
import { ProjectJsonSchema } from '../../src/schema/sfdx-project/sfdxProjectJson';
import { schemaSchema, target } from './consts';

/**
 * Build script for sfdx-project.schema.json using Zod's native JSON Schema generation
 */

const run = async (): Promise<void> => {
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
  const projectSchemaJson = await prettier.format(JSON.stringify(projectSchema), { parser: 'json' });

  console.log('writing sfdx-project schema to src/');
  writeFileSync('src/schema/sfdx-project/sfdx-project.schema.json', projectSchemaJson);

  console.log('done');
};

void run();
