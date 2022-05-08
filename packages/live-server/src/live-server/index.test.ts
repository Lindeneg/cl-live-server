/* eslint-disable indent */
import path from 'path';
import fs from 'fs';
import https from 'https';
import axios, { AxiosError } from 'axios';
import open from 'open';
import Logger from '@cl-live-server/logger';
import LiveServer from '.';
import { cast, getInjectedCode } from '@cl-live-server/static-server-handler';

jest.mock('open');
jest.mock('faye-websocket');
jest.mock('@cl-live-server/logger');

const mockedOpen = jest.mocked(open, true);
const mockedLogger = jest.mocked(Logger, true);

const isRootTest = process.env.CL_LIVE_SERVER_ROOT_TEST === '1';

const projectRoot = isRootTest ? ['..', '..', '..', '..'] : ['..', '..'];

const root = path.join(__dirname, '../../mock');

describe('@live-server/live-server', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
        jest.clearAllMocks();
        mockedOpen.mockImplementation(jest.fn());
    });

    test('can serve directory and ignore files that starts with a dot', async () => {
        const server = new LiveServer().startSync();

        const res = await axios.get('http://127.0.0.1:8080');

        expect(res?.data).toEqual(
            fs
                .readdirSync(path.join(__dirname, ...projectRoot))
                .filter((e) => !e.startsWith('.'))
        );
        expect(res.status).toEqual(200);
        expect(res.headers['content-type']).toEqual(
            'application/json; charset=utf-8'
        );

        await server.shutdown();
    });
    test('can inject code into requested html', async () => {
        const server = new LiveServer({
            root,
            logLevel: 0,
        }).startSync();

        const res = await axios.get('http://127.0.0.1:8080');

        expect(res?.data).toEqual(`<!DOCTYPE html>
<html lang="en">
    <head>
        <title>Test</title>
    </head>
    <body>Root File${getInjectedCode(
        path.join(
            __dirname,
            '..',
            '..',
            '..',
            'static-server-handler',
            'html',
            'index.html'
        )
    )}</body>
</html>
`);
        expect(res.status).toEqual(200);
        expect(res.headers['content-type']).toEqual('text/html; charset=UTF-8');

        await server.shutdown();
    });
    test('can serve with https module over https protocol', async () => {
        const server = new LiveServer({
            root,
            https: path.join(__dirname, '..', '..', 'mock', 'https', 'index'),
            httpsModule: 'https',
            logLevel: 4,
        }).startSync();

        const res = await axios.get('https://127.0.0.1:8080', {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });

        expect(res?.status).toEqual(200);
        expect(res?.headers['content-type']).toEqual('text/html; charset=UTF-8');

        await server.shutdown();
    });
    test('can configure and serve mount paths', async () => {
        const server = new LiveServer({
            root,
            mount: [
                ['/test-a', root + '/mounts/a.html'],
                ['/test-b', root + '/mounts/b.html'],
            ],
            watch: [],
            logLevel: 2,
        }).startSync();

        const resA = await axios.get('http://127.0.0.1:8080/test-a');
        const resB = await axios.get('http://127.0.0.1:8080/test-b');

        let resC;
        try {
            await axios.get('http://127.0.0.1:8080/test-c');
        } catch (err) {
            resC = (<AxiosError>err).message;
        }

        expect(resA?.status).toEqual(200);
        expect(resB?.status).toEqual(200);
        expect(resC).toEqual('Request failed with status code 404');

        await server.shutdown();
    });

    test('can require and use middleware', async () => {
        const mw = jest.fn((_, __, next) => next());
        const server = new LiveServer({
            root,
            spa: true,
            middleware: [
                mw,
                path.join(__dirname, '..', '..', 'mock', 'middleware', 'mw'),
            ],
        }).startSync();

        const res = await axios.get('http://127.0.0.1:8080');

        expect(res.status).toBe(200);
        expect(mw).toHaveBeenCalledTimes(1);

        await server.shutdown();
    });

    test('can configure proxies', async () => {
        const server1 = new LiveServer({
            root,
            host: 'localhost',
            mount: [['/', root + '/proxy/index.html']],
        }).startSync();
        const server2 = new LiveServer({
            root,
            host: 'localhost',
            port: 8081,
            proxy: [['/server1', 'http://localhost:8080']],
        }).startSync();

        const res = await axios.get('http://localhost:8081/server1');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toBe('text/html; charset=UTF-8');
        expect(res.data).toMatch(/proxy working/i);

        await Promise.all([server1.shutdown(), server2.shutdown()]);
    });

    describe('can configure cors', () => {
        test('should respond with appropriate header', async () => {
            const server = new LiveServer({
                root,
                cors: true,
            }).startSync();

            const res = await axios.get('http://127.0.0.1:8080', {
                headers: { Origin: 'http://example.com' },
            });

            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toBe('text/html; charset=UTF-8');
            expect(res.headers['access-control-allow-origin']).toBe(
                'http://example.com'
            );
            expect(res.data).toMatch(/root file/i);

            await server.shutdown();
        });
        test('should support preflighted requests', async () => {
            const server = new LiveServer({
                root,
                cors: true,
            }).startSync();

            const res = await axios.options('http://127.0.0.1:8080', {
                headers: {
                    Origin: 'http://example.com',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'X-PINGOTHER',
                },
            });

            expect(res.status).toBe(204);
            expect(res.headers['access-control-allow-origin']).toBe(
                'http://example.com'
            );
            expect(res.headers['access-control-allow-methods']).toMatch(/POST/);
            expect(res.headers['access-control-allow-headers']).toBe('X-PINGOTHER');

            await server.shutdown();
        });
        test('should support requests with credentials', async () => {
            const server = new LiveServer({
                root,
                cors: true,
            }).startSync();

            const res = await axios.options('http://127.0.0.1:8080', {
                headers: {
                    Origin: 'http://example.com',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'X-PINGOTHER',
                },
            });

            expect(res.status).toBe(204);
            expect(res.headers['access-control-allow-origin']).toBe(
                'http://example.com'
            );
            expect(res.headers['access-control-allow-credentials']).toBe('true');

            await server.shutdown();
        });
    });

    test('can use entry file', async () => {
        const server = new LiveServer({
            root,
            file: 'index.html',
        }).startSync();
        const res = await axios.get('http://127.0.0.1:8080/test-c');

        expect(res.status).toEqual(200);
        expect(res.data).toMatch(/root file/i);
        expect(res.headers['content-type']).toBe('text/html; charset=UTF-8');

        await server.shutdown();
    });
    describe('can listen to error events', () => {
        test('can listen to EADDRINUSE errors and setTimeout to retry serve', async () => {
            const logError = jest.fn();
            const spy = jest
                .spyOn(global, 'setTimeout')
                .mockImplementation((f) => cast(f()));
            mockedLogger.error.mockImplementation(logError);
            const server = new LiveServer({
                root,
            }).startSync();
            const _server = server.getServer();

            _server.emit('error', { code: 'EADDRINUSE' });

            expect(logError).toHaveBeenCalledWith(
                'http://0.0.0.0:8080 is already in use. Trying another port.'
            );

            expect(spy).toHaveBeenCalledTimes(1);

            await server.shutdown();
        });

        test('can listen to non-EADDRINUSE errors and respond accordingly', async () => {
            const logError = jest.fn();
            mockedLogger.error.mockImplementation(logError);
            const server = new LiveServer({
                root,
            }).startSync();
            const _server = server.getServer();

            _server.emit('error', {
                code: 'some-error',
                toString: () => 'test-error',
            });

            expect(logError).toHaveBeenCalledWith('test-error');

            await server.shutdown();
        });
    });
    describe('can listen to upgrade events', () => {
        test('sends message to client when onopen', async () => {
            const server = new LiveServer({
                root,
            }).startSync();
            const _server = server.getServer();
            const clients = server.getClients();

            _server.emit('upgrade');

            const client = clients[0];
            const sendSpy = jest.spyOn(client, 'send');

            client.onopen && client.onopen(<Event>{});
            expect(sendSpy).toHaveBeenCalledWith('connected');

            await server.shutdown();
        });
        test('sets timeout if not already set when onsend', async () => {
            const server = new LiveServer({
                root,
            }).startSync();
            const _server = server.getServer();
            const clients = server.getClients();

            _server.emit('upgrade');

            const client = clients[0];
            const setTimeoutSpy = jest
                .spyOn(global, 'setTimeout')
                .mockImplementation((f) => cast(f()));

            client.send('');
            expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

            await server.shutdown();
        });

        test('clears timeout if already set when onsend', (done) => {
            const server = new LiveServer({
                root,
            }).startSync();
            const _server = server.getServer();
            const clients = server.getClients();

            _server.emit('upgrade');

            const client = clients[0];
            const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
            jest.spyOn(global, 'setTimeout').mockImplementation((f) => {
                cast(f());
                return cast('test-id');
            });

            // set timeout
            client.send('');
            // clear timeout
            client.send('');

            expect(clearTimeoutSpy).toHaveBeenCalledWith('test-id');

            server.shutdownSync();
            done();
        });
        test('filters clients when onclose', async () => {
            const server = new LiveServer({
                root,
            }).startSync();
            const _server = server.getServer();

            _server.emit('upgrade');

            expect(server.getClients().length).toEqual(1);

            const client = server.getClients()[0];
            client.onclose && client.onclose(cast({}));

            expect(server.getClients().length).toEqual(0);

            await server.shutdown();
        });
    });
    test('can call open with array of urls', async () => {
        mockedOpen.mockClear();
        mockedOpen.mockImplementationOnce(jest.fn());
        const server = new LiveServer({
            root,
            port: 8081,
            open: ['/miles', '/davis', '/bill', '/evans'],
        });
        await server.start().then(() => null);

        expect(mockedOpen).toHaveBeenCalledTimes(4);

        await server.shutdown();
    });
    test('prints error if watcher emits error', async () => {
        const logError = jest.fn();
        mockedLogger.error.mockImplementation(logError);
        const server = new LiveServer({
            root,
        }).startSync();

        const watcher = server.getWatcher();

        watcher.emit('error', 'some-error');

        expect(logError).toHaveBeenCalledWith('some-error');

        await server.shutdown();
    });
    test('can handle watch change with non-css-file', async () => {
        const logDebug = jest.fn();
        mockedLogger.debug.mockImplementation(logDebug);
        const server = new LiveServer({
            root,
        }).startSync();

        server.getServer().emit('upgrade');

        const clients = server.getClients();

        const client = clients[0];
        const sendSpy = jest.spyOn(client, 'send');

        const watcher = server.getWatcher();

        watcher.emit('change', '/some-path/index.html');

        expect(sendSpy).toHaveBeenCalledWith('reload');
        expect(logDebug).toHaveBeenCalledWith('Change detected');

        await server.shutdown();
    });
    test('can handle watch change with css-file', async () => {
        const logDebug = jest.fn();
        mockedLogger.debug.mockImplementation(logDebug);
        const server = new LiveServer({
            root,
        }).startSync();

        server.getServer().emit('upgrade');

        const clients = server.getClients();

        const client = clients[0];
        const sendSpy = jest.spyOn(client, 'send');

        const watcher = server.getWatcher();

        watcher.emit('change', '/some-path/index.css');

        expect(sendSpy).toHaveBeenCalledWith('refreshcss');
        expect(logDebug).toHaveBeenCalledWith('CSS change detected');

        await server.shutdown();
    });
    describe('can configure basic auth', () => {
        test('should respond with 401 when no password is given', async () => {
            const server = new LiveServer({
                root,
                port: 8090,
                htpasswd: path.join(
                    __dirname,
                    '..',
                    '..',
                    'mock',
                    'htpasswd',
                    'htpasswd-test'
                ),
            }).startSync();

            let error: AxiosError | null = null;

            try {
                await axios.get('http://127.0.0.1:8090');
            } catch (err) {
                error = cast(err);
            }

            expect(error?.response?.status).toBe(401);
            expect(error?.response?.statusText).toBe('Unauthorized');

            await server.shutdown();
        });

        test('should respond with 401 when wrong password is given', async () => {
            const server = new LiveServer({
                root,
                port: 8090,
                htpasswd: path.join(
                    __dirname,
                    '..',
                    '..',
                    'mock',
                    'htpasswd',
                    'htpasswd-test'
                ),
            }).startSync();

            let error: AxiosError | null = null;

            try {
                await axios.get('http://127.0.0.1:8090', {
                    auth: {
                        username: 'test',
                        password: 'not-real-password',
                    },
                });
            } catch (err) {
                error = cast(err);
            }

            expect(error?.response?.status).toBe(401);
            expect(error?.response?.statusText).toBe('Unauthorized');

            await server.shutdown();
        });
        test('should respond with 200 when correct password is given', async () => {
            const server = new LiveServer({
                root,
                port: 8090,
                htpasswd: path.join(
                    __dirname,
                    '..',
                    '..',
                    'mock',
                    'htpasswd',
                    'htpasswd-test'
                ),
            }).startSync();

            const res = await axios.get('http://127.0.0.1:8090', {
                auth: {
                    username: 'test',
                    password: 'test',
                },
            });

            expect(res.status).toBe(200);
            expect(res.statusText).toBe('OK');

            await server.shutdown();
        });
    });
});
