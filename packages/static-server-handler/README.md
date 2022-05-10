#### @cl-live-server/static-server-handler

Middleware handler used by [@cl-live-server/live-server](https://github.com/lindeneg/cl-live-server/tree/master/packages/live-server), essentially to inject `HTML` (with some `JavaScript`) into a response given a HTML request. 

#### Install

`yarn add @cl-live-server/static-server-handler`

#### Usage

```ts
import path from 'path';
import staticServerHandler from '@cl-live-server/static-server-handler';

const rootPath = './path/to/some/folder/or/file';
const injectRoot = __dirname;
const injectTarget = 'index.html';
// default values                  '.'        __dirname   '../index.html'
const handler = staticServerHandler(rootPath, injectRoot, injectTarget);

// setup server, for example with 'connect'
const app = connect();

// register handler
app.use(this.staticServerHandler);
```
