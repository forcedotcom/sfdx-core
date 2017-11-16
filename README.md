# Salesforce DX Core Library
This library provides sfdx project management, org authentication and connection to Salesforce APIs.

## Messages
It's not a good idea to hard code messages in code, which makes it hard for localization and for others
to edit messages across the entire repository. Messages can be used for anything from user output
(like the console), to error messages, to returned data from a method.

The [core message framework](./src/lib/messages.ts) manages messages and allows them to be accessible by
all plugins and consumers of sfdx-core. It is setup to handle localization down the road, at no additional
effort to the consumer.

First, add your messages to the `<moduleRoot>/messages` directory. Message files must be in `.json`. See
[sfdx-core.json](./messages/sfdx-core.json) as an example.

Next, tell sfdx-core where to load message files from. You want to add this to the index.js
or whatever is loaded when the package is required.
```javascript
Messages.importMessagesDirectory(__dirname);
```
Before using the messages in your code, load the bundle you wish to use. If `Messages.importMessagesDirectory`
was used, then the bundle name is the message file name.
```javascript
const messages : Messages = await Messages.loadMessages('sfdx-core');
```
Now you can use them freely.
```javascript
messages.getMessage('JsonParseError');
```
When running unit tests individually, you may see errors that the messages aren't found. This is because
`index.js` isn't loaded when tests run like they are when the package is required. To allow tests to run, add
the message file individually for that test.
```javascript
Messages.importMessageFile(`${__dirname}/${pathFromTestFile}`);
```
