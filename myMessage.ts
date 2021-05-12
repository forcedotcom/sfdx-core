/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * Licensed under the BSD 3-Clause license.
 * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// declare global {
//   interface String {
//     apply(length: number): string;
//   }
// }

// import { Messages } from './messages';

// const msgs = Messages.loadMessages('a', 'b');
// const a = msgs.getMessage('sdf');

// const typeSafeMessages = Messages.load('a', 'b', ['adf']);
// typeSafeMessages.getMessage('adf');

type TokenString<T> = T & { apply: (tokens: string[]) => string };

// type MessageString = string & { apply: (tokens: string[]) => string };

// class S<T extends string = string> extends String {
//   public constructor(val: T) {
//     super(val);
//   }

//   public apply() {
//     return this;
//   }
// }

// const s: S = new S<'asdf'>('asdf');

// const a: string = s;

function createTokenString<T extends string>(a: T): TokenString<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (a as any).apply = (tokens: string[]) => a.replace(tokens.join(''), '');
  return a as TokenString<T>;
}

function createString<T extends string>(a: T): T {
  return a;
}

const myMsg: 'Hello World' = 'Hello World';

import { createString, createParamertizedString } from `@salesforce/core`;

export const messages = {
  myMsg: createString('Hello World'),
  myParameterizedMsg: createTokenString('Hello %s'),
};

let description: string = messages.myMsg; // .apply(['World']);
description = messages.myMsg;
description = messages.myParameterizedMsg.apply(['World']);

console.log(description);
