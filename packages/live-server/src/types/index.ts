/* istanbul ignore file */
import type { Server as HttpServer } from 'http';
import type { NextHandleFunction } from 'connect';
import type { LogLevel } from '@cl-live-server/logger';

export type Maybe<T> = T | null;

export type Protocol = 'http' | 'https';

/**
 * Configuration options to @cl-live-server/live-server.
 * All object properties are optional
 */
export type LiveServerOptions = {
    /**
     * specify browser to use instead of system default
     */
    browser?: Maybe<string>;
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
    htpasswd?: Maybe<string>;
    /**
     * path to a HTTPS configuration module
     */
    https?: Maybe<string>;
    /**
     * custom HTTPS module (e.g. spdy)
     */
    httpsModule?: Maybe<string>;
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
    open?: Maybe<string | string[] | boolean>;
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

export type ParsedOptions = Required<
    Omit<LiveServerOptions, 'noBrowser' | 'logLevel'>
>;

export type Destroyable = {
    destroy: (cb?: (err?: Error) => void) => void;
};

export type Server = HttpServer & Destroyable;

export type { AddressInfo } from 'net';
export type { Server as CServer, NextHandleFunction } from 'connect';
export type { FSWatcher, WatchOptions } from 'chokidar';
export type { Stream } from 'stream';
