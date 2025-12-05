<!-- 6d536412-f5ef-4fe3-bd74-5990a8721760 7058f38d-5781-4f94-a9ea-b28236f67d63 -->

# Move Schemas Into sfdx-core

## 1. Copy schemas repo content

Copy contents from schemas repo into existing sfdx-core structure:

- `/Users/shane.mclaughlin/eng/forcedotcom/schemas/src/sfdx-project/*.ts` → `/Users/shane.mclaughlin/eng/forcedotcom/sfdx-core/src/schema/sfdx-project/*.ts`
- `/Users/shane.mclaughlin/eng/forcedotcom/schemas/src/project-scratch-def/*.ts` → `/Users/shane.mclaughlin/eng/forcedotcom/sfdx-core/src/schema/project-scratch-def/*.ts`
- `/Users/shane.mclaughlin/eng/forcedotcom/schemas/src/index.ts` → `/Users/shane.mclaughlin/eng/forcedotcom/sfdx-core/src/schema/schemas.ts` (rename to avoid conflict with validator.ts)

Copy build script: `/Users/shane.mclaughlin/eng/forcedotcom/schemas/scripts/build.js` → `/Users/shane.mclaughlin/eng/forcedotcom/sfdx-core/scripts/build-schemas.js`

Copy tests from schemas repo:

- `/Users/shane.mclaughlin/eng/forcedotcom/schemas/tests/*.test.js` → `/Users/shane.mclaughlin/eng/forcedotcom/sfdx-core/test/unit/schema/*.test.ts` (convert to TypeScript if needed)

Copy example files (used by tests):

- `/Users/shane.mclaughlin/eng/forcedotcom/schemas/examples/` → `/Users/shane.mclaughlin/eng/forcedotcom/sfdx-core/test/unit/schema/examples/`

## 3. Add zod dependency

Add `zod` to dependencies in `package.json` (currently in schemas repo as `"zod": "^4.1.12"`).

## 4. Set up wireit build tasks

Create two independent wireit tasks in `package.json`:

- `build:schema:project` - generates `lib/sfdx-project.schema.json` from zod schema
- `build:schema:scratch` - generates `lib/project-scratch-def.schema.json` from zod schema

- `build:schema:project` - generates `lib/sfdx-project.schema.json` from zod schema

  - Input files: `src/schema/sfdx-project/**/*.ts`, `src/schema/schemas.ts`
  - Depends on: `compile`
  - Output: `lib/sfdx-project.schema.json`

- `build:schema:scratch` - generates `lib/project-scratch-def.schema.json` from zod schema
  - Input files: `src/schema/project-scratch-def/**/*.ts`, `src/schema/schemas.ts`
  - Depends on: `compile`
  - Output: `lib/project-scratch-def.schema.json`

Update the main `build` task to depend on these new schema tasks.

## 5. Update build script

Adapt `/Users/shane.mclaughlin/eng/forcedotcom/schemas/scripts/build.js` to work with sfdx-core's structure:

- Remove the TypeScript compilation step (wireit handles this)
- Adjust paths to read from `lib/schemas/` instead of `lib/`
- Output schema files to `lib/` directory (not root)
- Make it runnable as individual schema generators (project vs scratch-def)

## 6. Update package.json exports

Add exports for the schema JSON files (in lib directory, not in a schemas subfolder):

```json
"./sfdx-project.schema.json": "./lib/sfdx-project.schema.json",
"./project-scratch-def.schema.json": "./lib/project-scratch-def.schema.json"
```

## 7. Update type imports in sfProject.ts

Change line 10 in `src/sfProject.ts` from:

```typescript
import { PackageDir, ProjectJson as ProjectJsonSchema, PackagePackageDir, BundleEntry } from '@salesforce/schemas';
```

to:

```typescript
import { PackageDir, ProjectJson as ProjectJsonSchema, PackagePackageDir, BundleEntry } from './schemas';
```

Relative import path since schemas will be in the same repo.

## 8. Replace ajv validation with zod in SfProjectJson

In `src/sfProject.ts`, update `schemaValidate()` and `schemaValidateSync()` methods (lines 123-178):

- Import `ProjectJsonSchema` from local schemas
- Replace ajv validation with zod's `safeParse()`
- Use `Lifecycle.getInstance().emitWarning()` for validation errors instead of throwing
- Keep the `SFDX_PROJECT_JSON_VALIDATION` env var behavior for backward compatibility (still throw if set to true)

Reference: `Lifecycle` is imported and used elsewhere in the codebase, see `src/lifecycleEvents.ts` lines 205-212 for `emitWarning()`.

## 9. Add zod validation for scratch org definitions

In `src/org/scratchOrgInfoGenerator.ts`, update `parseDefinitionFile()` function (lines 321-335):

- Import `ScratchOrgDefSchema` from local schemas
- After parsing JSON, use `ScratchOrgDefSchema.safeParse()` to validate
- Emit warnings via `Lifecycle.getInstance().emitWarning()` for validation errors
- Don't throw errors (maintain current non-throwing behavior)
- Remove `$schema` key after validation

## 10. Deprecate SchemaValidator

In `src/schema/validator.ts`:

- Add `@deprecated` JSDoc tags to the class and all public methods
- Include deprecation message: "For sfdx-project.json and scratch org definitions, use the exported zod schemas (ProjectJsonSchema, ScratchOrgDefSchema) from '@salesforce/core'. For custom schemas, use a schema validator library like zod directly."

In `src/index.ts` (line 83):

- Add deprecation comment above the export with the same message

## 11. Update src/index.ts exports

Add new named exports for the main schemas only:

```typescript
export { ProjectJson, ProjectJsonSchema, ScratchOrgDef, ScratchOrgDefSchema } from './schema/schemas';
```

Users who need the child types (PackageDir, BundleEntry, etc.) can already get them via the existing imports, or can import from `@salesforce/core/schema/schemas` if needed.

## 12. Update examples directory (if needed)

Check if any examples in `examples/` use `@salesforce/schemas` and update them to use the local schemas instead.

## 13. Update messages

Check `messages/config.md` for schema validation error messages and ensure they're appropriate for the new zod-based validation.

### To-dos

- [ ] Copy schemas repo src and scripts to sfdx-core/schemas
- [ ] Add schemas to tsconfig include array
- [ ] Add zod dependency to package.json
- [ ] Create wireit build:schema:project and build:schema:scratch tasks
- [ ] Adapt build.js for sfdx-core structure
- [ ] Add schema exports to package.json
- [ ] Change @salesforce/schemas imports to local ./schemas
- [ ] Replace ajv with zod validation in SfProjectJson
- [ ] Add zod validation to scratch org def parsing
- [ ] Mark SchemaValidator as deprecated
- [ ] Add schema exports to src/index.ts
- [ ] Test that wireit build generates schemas correctly
