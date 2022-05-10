#### @cl-live-server/live-server

Development server with reload capabilities. The code in this project contains modifications to [live-server](https://github.com/tapio/live-server) created by [Tapio Vierros](https://github.com/tapio).

#### Install

`yarn add @cl-live-server/live-server`

#### Usage

```ts
// esm import
import LiveServer from '@cl-live-server/live-server';

// or cjs import
const { LiveServer } = require('@cl-live-server/live-server');

(async () => {
    // see options below
    const server = new LiveServer(options);

    // or server.startSync();
    await server.start();

    // or server.shutdownSync();
    await server.shutdown();
})();
```

#### Options

```ts
/**
 * Configuration options to @cl-live-server/live-server.
 * All object properties are optional
 */
type Options = {
    /**
     * specify browser to use instead of system default
     */
    browser?: string | null;
    /**
     * enables CORS for any origin (requests with credentials are supported)
     */
    cors?: boolean;
    /**
     * serve this file (server root relative) in place of missing files
     */
    file?: string;
    /**
     * host address to bind to (default: IP env var or 0.0.0.0)
     */
    host?: string;
    /**
     * path to htpasswd file to enable HTTP Basic authentication
     */
    htpasswd?: string | null;
    /**
     * path to a HTTPS configuration module
     */
    https?: string | null;
    /**
     * custom HTTPS module (e.g. spdy)
     */
    httpsModule?: string | null;
    /**
     * comma-separated string of paths to ignore
     */
    ignore?: string[];
    /**
     * paths to file exporting a middleware function or functions themselves
     */
    middleware?: Array<string | NextHandleFunction>;
    /**
     * 0 = silent, 1 = less, 2 = middle, 3 = more, 4 = verbose (default: 1)
     */
    logLevel?: LogLevel;
    /**
     * mount directories onto a route, e.g. [['/components', './node_modules']]
     */
    mount?: [string, string][];
    /**
     * don't inject CSS changes, reload as any other file change (default: false)
     */
    noCssInject?: boolean;
    /**
     * suppress automatic web browser launching
     */
    noBrowser?: boolean;
    /**
     * subpath(s) to open in browser, (default: server root)
     */
    open?: string | string[] | boolean | null;
    /**
     * port to use (default: PORT env var or 8080)
     */
    port?: number;
    /**
     * proxy all requests for ROUTE to URL
     */
    proxy?: [string, string][];
    /**
     * path to root directory (default: cwd)
     */
    root?: string;
    /**
     *  translate requests from /abc to /#/abc (default: false)
     */
    spa?: boolean;
    /**
     * wait for all changes before reloading (default: 100ms)
     */
    wait?: number;
    /**
     * paths to exclusively watch for changes (default: watch everything)
     */
    watch?: string[];
};
```
