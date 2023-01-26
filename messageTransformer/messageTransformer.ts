/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable no-console */
/* eslint-disable complexity */

import * as ts from 'typescript';
import { Messages, StoredMessageMap } from '../src/messages';

/**
 *
 * @experimental
 * transforms `messages` references from dynamic run-time to static compile-time values
 */
const transformer = (program: ts.Program, pluginOptions: {}) => {
  Messages.importMessagesDirectory(process.cwd());
  const transformerFactory: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
      // if there are no messages, no transformation is needed
      if (
        !sourceFile.statements.some((i) => ts.isImportDeclaration(i) && i.importClause?.getText().includes('Messages'))
      ) {
        return sourceFile;
      }

      const visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        if (ts.isExpressionStatement(node) && node.getText().includes('importMessagesDirectory')) {
          // importMessagesDirectory now happens at compile, not in runtime
          // returning undefined removes the node
          return undefined;
        }
        if (
          // transform a runtime load call into hardcoded messages values
          // const foo = Messages.load|loadMessages('pluginName', 'messagesFile' ...) =>
          // const foo = new Messages('pluginName', 'messagesFile', new Map([['key', 'value']]))
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.expression.getText() === 'Messages' &&
          node.expression.name.getText().includes('load')
        ) {
          // we always want the first two arguments, which are the plugin name and the messages file name
          const arrayMembers = node.arguments.slice(0, 2);
          const arrayMembersText = arrayMembers.map(getTextWithoutQuotes);

          // Messages doesn't care whether you call messages.load or loadMessages, it loads the whole file
          const messagesInstance = Messages.loadMessages(arrayMembersText[0], arrayMembersText[1]);
          return context.factory.createNewExpression(node.expression.expression, undefined, [
            arrayMembers[0],
            arrayMembers[1],
            context.factory.createNewExpression(context.factory.createIdentifier('Map'), undefined, [
              messageMapToHardcodedMap(messagesInstance.messages),
            ]),
          ]);
        }
        // it might be a node that contains one of the things we're interested in, so keep digging
        return ts.visitEachChild(node, visitor, context);
      };
      return ts.visitNode(sourceFile, visitor);
    };
  };
  return transformerFactory;
};

export default transformer;

const getTextWithoutQuotes = (node: ts.Node): string => node.getText().replace(/'/g, '');

/** turn a loaded message map into  */
const messageMapToHardcodedMap = (messages: StoredMessageMap): ts.ArrayLiteralExpression => {
  return ts.factory.createArrayLiteralExpression(
    Array.from(messages).map(([key, value]) => {
      // case 1: string
      if (typeof value === 'string') {
        return ts.factory.createArrayLiteralExpression([
          ts.factory.createStringLiteral(key),
          ts.factory.createStringLiteral(value),
        ]);
      } else if (Array.isArray(value)) {
        // case 2: string[]
        return ts.factory.createArrayLiteralExpression([
          ts.factory.createStringLiteral(key),
          ts.factory.createArrayLiteralExpression(value.map((v) => ts.factory.createStringLiteral(v))),
        ]);
      } else {
        // turn the object into a map and recurse!
        return messageMapToHardcodedMap(new Map(Object.entries(value)));
      }
    })
  );
};
