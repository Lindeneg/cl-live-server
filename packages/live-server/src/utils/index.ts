import path from 'path';
import { sync as resolve } from 'resolve';
import Logger from '@cl-live-server/logger';
import type {
    LiveServerOptions,
    NextHandleFunction,
    ParsedOptions,
    Server,
} from '../types';

export const getOpenPath = (
    open?: LiveServerOptions['open'],
    noBrowser?: LiveServerOptions['noBrowser']
): string | string[] | null => {
    if (noBrowser || open === null || open === false) {
        return null;
    }
    if (typeof open === 'undefined' || open === true) {
        return '';
    }
    return open;
};

export const parseConfig = (opts: LiveServerOptions): ParsedOptions => {
    const root = opts.root || process.cwd();
    return {
        browser: opts.browser || null,
        cors: opts.cors || false,
        file: opts.file || '',
        host: opts.host || '0.0.0.0',
        htpasswd: opts.htpasswd || null,
        https: opts.https || null,
        httpsModule: opts.httpsModule || null,
        ignore: opts.ignore || [],
        middleware: opts.middleware || [],
        mount: opts.mount || [],
        noCssInject: !!opts.noCssInject,
        open: getOpenPath(opts.open, opts.noBrowser),
        port: opts.port !== undefined ? opts.port : 8080,
        proxy: opts.proxy || [],
        root,
        spa: opts.spa || false,
        wait: opts.wait === undefined ? 100 : opts.wait,
        watch: opts.watch || [root],
    };
};

export const checkModule = (target: string, context = ''): boolean => {
    try {
        resolve(target);
        return true;
    } catch (e) {
        const module = context ? context + ' module ' : 'Module ';
        Logger.error(`${module}${target} you've provided was not found.`);
        Logger.error(`Did you do "npm install ${target}"?`);
    }
    return false;
};

export const spaMiddleware: NextHandleFunction = (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        next();
    } else {
        if (req.url && req.url !== '/' && path.extname(req.url) === '') {
            const route = req.url;
            req.url = '/';
            res.statusCode = 302;
            res.setHeader('Location', req.url + '#' + route);
            res.end();
        } else {
            next();
        }
    }
};

export const destroyable = (
    server: Server & { destroy?: (cb: (err?: Error) => void) => void }
): void => {
    const connections: Record<string, { destroy: () => void }> = {};

    server.on('connection', (conn) => {
        const key = conn.remoteAddress + ':' + conn.remotePort;
        connections[key] = conn;
        conn.on('close', function () {
            delete connections[key];
        });
    });

    server.destroy = (cb) => {
        server.close(cb);
        for (const key in connections) connections[key].destroy();
    };
};
