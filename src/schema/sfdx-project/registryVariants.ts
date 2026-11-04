/*
 * Copyright 2026, Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { z } from 'zod';

const SuffixIndexSchema = z.record(z.string(), z.string());

const DirectoryIndexSchema = z.record(z.string(), z.string());

/**
 * TypeInfoSchema has a circular reference (children.types references TypeIndexSchema,
 * which references TypeInfoSchema). We use z.lazy() to defer schema evaluation until
 * runtime to avoid "Cannot access before initialization" errors. z.ZodType<T> provides
 * an explicit type annotation since TypeScript can't infer recursive types properly.
 */
const TypeInfoSchema: z.ZodType<{
  id: string;
  name: string;
  directoryName: string;
  suffix?: string;
  strictDirectoryName?: boolean;
  ignoreParsedFullName?: boolean;
  folderContentType?: string;
  folderType?: string;
  xmlElementName?: string;
  uniqueIdElement?: string;
  isAddressable?: boolean;
  unaddressableWithoutParent?: boolean;
  supportsWildcardAndName?: boolean;
  supportsPartialDelete?: boolean;
  aliasFor?: string;
  children?: {
    types: TypeIndex;
    suffixes: SuffixIndex;
    directories?: DirectoryIndex;
  };
  strategies?: {
    adapter: 'mixedContent' | 'matchingContentFile' | 'decomposed' | 'bundle' | 'default';
    transformer?: 'decomposed' | 'staticResource' | 'standard';
    decomposition?: 'topLevel' | 'folderPerType';
  };
}> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string(),
    directoryName: z.string(),
    suffix: z.string().optional(),
    strictDirectoryName: z.boolean().optional(),
    ignoreParsedFullName: z.boolean().optional(),
    folderContentType: z.string().optional(),
    folderType: z.string().optional(),
    xmlElementName: z.string().optional(),
    uniqueIdElement: z.string().optional(),
    isAddressable: z.boolean().optional(),
    unaddressableWithoutParent: z.boolean().optional(),
    supportsWildcardAndName: z.boolean().optional(),
    supportsPartialDelete: z.boolean().optional(),
    aliasFor: z.string().optional(),
    children: z
      .object({
        types: TypeIndexSchema,
        suffixes: SuffixIndexSchema,
        directories: DirectoryIndexSchema.optional(),
      })
      .optional(),
    strategies: z
      .object({
        adapter: z.enum(['mixedContent', 'matchingContentFile', 'decomposed', 'bundle', 'default']),
        transformer: z.enum(['decomposed', 'staticResource', 'standard']).optional(),
        decomposition: z.enum(['topLevel', 'folderPerType']).optional(),
      })
      .optional(),
  })
);

const TypeIndexSchema: z.ZodType<{
  [typeId: string]: z.infer<typeof TypeInfoSchema>;
}> = z.lazy(() => z.record(z.string(), TypeInfoSchema));

type SuffixIndex = z.infer<typeof SuffixIndexSchema>;
type DirectoryIndex = z.infer<typeof DirectoryIndexSchema>;
type TypeIndex = { [typeId: string]: z.infer<typeof TypeInfoSchema> };

export const MetadataRegistrySchema = z.object({
  types: TypeIndexSchema,
  suffixes: SuffixIndexSchema,
  strictDirectoryNames: z.record(z.string(), z.string()),
  childTypes: z.record(z.string(), z.string()),
});
