const fs = require('fs');
const path = require('path');
const schemas = fs.readdirSync(path.join(__dirname, '..')).filter((filename) => filename.endsWith('schema.json'));
const Ajv = require('ajv');

function testFile(path, validate, shouldValidate) {
  return async () => {
    const data = require(path);
    const result = await validate(data);

    if (shouldValidate && !result) {
      console.log(validate.errors);
    }
    expect(result).toBe(shouldValidate);
  };
}

schemas.forEach((schema) => {
  const schemaPath = path.join(__dirname, '..', schema);
  const examplePath = path.join(__dirname, '..', 'examples', schema.replace('.schema.json', ''));
  const examples = fs.readdirSync(examplePath);

  if (examples && examples.length) {
    const ajv = new Ajv();
    const validate = ajv.compile(require(schemaPath));

    describe(`${schema} example`, () => {
      for (const example of examples) {
        test(`${example}`, testFile(path.join(examplePath, example), validate, !example.includes('invalid')));
      }
    });
  } else {
    process.stderr(`Warning! No examples for ${schema}`);
  }
});
