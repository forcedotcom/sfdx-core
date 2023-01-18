/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable no-console */

import * as ts from 'typescript';
import { Messages } from './src/messages';

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => (sourceFile) => {
  Messages.importMessagesDirectory(__dirname);
  const messagesConstMap: Map<string, Messages<string>> = new Map();

  const visitor = (node: ts.Node): ts.Node | undefined => {
    if (ts.isVariableDeclaration(node) && node.getText().includes('Messages.importMessagesDirectory')) {
      // remove the messages imports
      return undefined;
    } else if (ts.isVariableDeclaration(node) && node.getText().includes('Messages.load')) {
      const rightSide = node.getChildAt(node.getChildCount() - 1).getText();
      const matches = rightSide.match(/\('(.*)'\s*,\s*'([^']*)'/)?.map((s) => s.trim());
      if (matches?.length === 3) {
        messagesConstMap.set(node.name.getText(), Messages.loadMessages(matches[1], matches[2]));
      }
      // remove the messages vars
      return undefined;
    } else if (
      // we have loaded some messages and now looking for usages of them
      messagesConstMap.size &&
      ts.isCallExpression(node) &&
      messagesConstMap.has(node.expression.getText().split('.')[0])
    ) {
      // TODO: getMessage, getMessages, createError
      const messagesVar = node.expression.getText().split('.')[0];

      // resolve the message
      const messageKey = node.arguments[0].getText().replace(/'/g, '');
      // verify the number of placeholders in the message matches the arguments
      const actualMessage = messagesConstMap.get(messagesVar)?.getMessage(messageKey);
      const placeholderCount = actualMessage?.match(/%s/g)?.length ?? 0;
      if (placeholderCount > 0) {
        // ensure import of util.format
        return context.factory.updateSourceFile(sourceFile, [
          context.factory.createImportDeclaration(
            /* decorators */ undefined,
            /* modifiers */ undefined,
            context.factory.createImportClause(
              false,
              context.factory.createIdentifier('DefaultImport'),
              context.factory.createNamedImports([
                context.factory.createImportSpecifier(false, context.factory.createIdentifier('namedImport')),
              ]),
              undefined
            ),
            context.factory.createStringLiteral('package')
          ),
          // Ensures the rest of the source files statements are still defined.
          ...sourceFile.statements,
        ]);
      }
      // console.log(node.arguments.map((arg) => ` - ${arg.getText()}`));
      return ts.visitEachChild(node, visitor, context);
    } else {
      // it might be a node that contains one of the things we're interested in, so keep digging
      return ts.visitEachChild(node, visitor, context);
    }
  };

  return ts.visitNode(sourceFile, visitor);
};
export default transformer;
