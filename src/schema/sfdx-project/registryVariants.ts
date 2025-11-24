/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
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

export const MetadataRegistrySchema = z.object({
  types: TypeIndexSchema,
  suffixes: SuffixIndexSchema,
  strictDirectoryNames: z.record(z.string(), z.string()),
  childTypes: z.record(z.string(), z.string()),
});

export type MetadataRegistry = z.infer<typeof MetadataRegistrySchema>;

type SuffixIndex = z.infer<typeof SuffixIndexSchema>;
type TypeIndex = z.infer<typeof TypeIndexSchema>;
type DirectoryIndex = z.infer<typeof DirectoryIndexSchema>;
