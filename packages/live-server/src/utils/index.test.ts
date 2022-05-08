import type { IncomingMessage, NextFunction } from 'connect';
import type { ServerResponse } from 'http';
import { cast } from '@cl-live-server/static-server-handler';
import { getOpenPath, parseConfig, checkModule, spaMiddleware } from '.';
import type { LiveServerOptions } from '../types';

const getConfig = (overrides: LiveServerOptions = {}) => {
    const root = process.cwd();
    return {
        browser: null,
        cors: false,
        file: '',
        host: '0.0.0.0',
        htpasswd: null,
        https: null,
        httpsModule: null,
        ignore: [],
        middleware: [],
        mount: [],
        noCssInject: false,
        open: '',
        port: 8080,
        proxy: [],
        root,
        spa: false,
        wait: 100,
        watch: [root],
        ...overrides,
    };
};

describe('@live-server/utils', () => {
    describe('getOpenPath', () => {
        test('can get openPath with null open and undefined noBrowser', () => {
            expect(getOpenPath(null)).toBe(null);
        });
        test('can get openPath with true open and true noBrowser', () => {
            expect(getOpenPath(true, true)).toBe(null);
        });
        test('can get openPath with undefined open and undefined noBrowser', () => {
            expect(getOpenPath()).toBe('');
        });
        test('can get openPath with true open and undefined noBrowser', () => {
            expect(getOpenPath(true)).toBe('');
        });
        test('can get openPath with string open and undefined noBrowser', () => {
            expect(getOpenPath('hello-there')).toBe('hello-there');
        });
    });
    describe('parseConfig', () => {
        test('can get default config', () => {
            expect(parseConfig({})).toEqual(getConfig());
        });
        test('can get config with port and wait', () => {
            const config = { port: 1000, wait: 2000 };
            expect(parseConfig(config)).toEqual(getConfig(config));
        });
    });
    describe('checkModule', () => {
        test('returns true on valid module', () => {
            expect(checkModule('fs')).toBe(true);
        });
        test('returns false on invalid module', () => {
            expect(checkModule('fs1241251251251')).toBe(false);
            expect(checkModule('fs1241251251251', 'some-context')).toBe(false);
        });
    });
    describe('spaMiddleware', () => {
        let req: IncomingMessage;
        let res: ServerResponse;
        let next: NextFunction;
        let setHeader: () => void;
        let end: () => void;

        beforeEach(() => {
            jest.clearAllMocks();
            jest.resetModules();
            setHeader = jest.fn();
            end = jest.fn();
            next = cast<NextFunction>(jest.fn());
            req = cast<IncomingMessage>({});
            res = cast<ServerResponse>({
                setHeader,
                end,
            });
        });

        test('calls next if method not get or head', () => {
            spaMiddleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(setHeader).toHaveBeenCalledTimes(0);
            expect(end).toHaveBeenCalledTimes(0);
        });
        test('calls next on get method if url is root path', () => {
            req.method = 'GET';
            req.url = '/';
            spaMiddleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(1);
            expect(setHeader).toHaveBeenCalledTimes(0);
            expect(end).toHaveBeenCalledTimes(0);
        });
        test('sets header, adds hashtag and calls end on get method with non-root path ', () => {
            req.method = 'GET';
            req.url = '/hello';
            spaMiddleware(req, res, next);
            expect(next).toHaveBeenCalledTimes(0);
            expect(setHeader).toHaveBeenCalledWith('Location', '/#/hello');
            expect(end).toHaveBeenCalledTimes(1);
        });
    });
});
