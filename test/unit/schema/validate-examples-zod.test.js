const fs = require('fs');
const path = require('path');
const { ProjectJsonSchema, ScratchOrgDefSchema } = require('../lib/index.js');

function testFile(path, zodSchema, shouldValidate) {
  return () => {
    const data = require(path);
    const result = zodSchema.safeParse(data);

    if (shouldValidate && !result.success) {
      console.log(result.error.issues);
    }
    expect(result.success).toBe(shouldValidate);
  };
}

const zodSchemas = {
  'sfdx-project': ProjectJsonSchema,
  'project-scratch-def': ScratchOrgDefSchema,
};

Object.entries(zodSchemas).forEach(([schemaName, zodSchema]) => {
  const examplePath = path.join(__dirname, '..', 'examples', schemaName);
  const examples = fs.readdirSync(examplePath);

  if (examples && examples.length) {
    describe(`${schemaName} (Zod validation)`, () => {
      for (const example of examples) {
        test(`${example}`, testFile(path.join(examplePath, example), zodSchema, !example.includes('invalid')));
      }
    });
  }
});
