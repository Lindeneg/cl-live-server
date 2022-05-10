#### @cl-live-server/logger

Logging utility used by all [@cl-live-server](https://github.com/lindeneg/cl-live-server) packages.

#### Install

`yarn add @cl-live-server/logger`

#### Usage

```ts
import Logger, { LogLevel, LogSeverity } from '@cl-live-server/logger';

// set logLevel
Logger.logLevel = LogLevel.Middle; // logLevel 2

// debug, blueish color
Logger.debug('Some debug message'); // logLevel 3

// warning, yellowish color
Logger.warning('Some warning message'); // logLevel 2

// success, greenish color
Logger.success('Some success message'); // logLevel 1

// error, redish color
Logger.error('Some error message'); // logLevel 1

// flexible, choose severity which dictates color
Logger.print('Some error message', LogSeverity.Success); // logLevel 1
```
