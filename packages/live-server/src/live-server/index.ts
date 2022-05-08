/* eslint-disable @typescript-eslint/no-var-requires */
import path from 'path';
import os from 'os';
import http from 'http';
import cors from 'cors';
import url from 'url';
import open from 'open';
import FWebSocket from 'faye-websocket';
import reqLogger from 'morgan';
import chokidar from 'chokidar';
import proxyMiddleware from 'proxy-middleware';
import auth from 'http-auth';
import connect from 'connect';
import serveIndex from 'serve-index';
import staticServerHandler, { cast } from '@cl-live-server/static-server-handler';
import Logger, { LogLevel } from '@cl-live-server/logger';
import { checkModule, parseConfig, spaMiddleware } from '../utils';
import type {
    Server,
    Protocol,
    FSWatcher,
    LiveServerOptions,
    NextHandleFunction,
    CServer,
    ParsedOptions,
    AddressInfo,
    WatchOptions,
} from '../types';

export default class LiveServer {
    private clients: WebSocket[];
    private readonly server: Server;
    private readonly app: CServer;
    private readonly config: ParsedOptions;
    private readonly protocol: Protocol;
    private readonly watcher: FSWatcher;
    private readonly staticHandler: NextHandleFunction;

    constructor(opts: LiveServerOptions = {}) {
        if (typeof opts.logLevel !== 'undefined') {
            Logger.logLevel = opts.logLevel;
        }
        this.config = parseConfig(opts);
        this.staticHandler = staticServerHandler(this.config.root);

        if (this.config.httpsModule) {
            checkModule(this.config.httpsModule, 'HTTPS');
        } else {
            this.config.httpsModule = 'https';
        }

        this.app = connect();

        this.clients = [];

        this.setReqLogger();

        this.requireMiddleware();

        this.configureBasicAuth();

        this.configureCors();

        this.configureMountedPaths();

        this.configureProxies();

        [this.server, this.protocol] = this.configureServer();

        this.watcher = this.configureWatcher();

        this.initializeErrorListener();

        this.initializeCoreListener();

        this.initializeUpgradeListener();

        this.initializeWatchListener();
    }

    public start = (): Promise<LiveServer> => {
        return new Promise((resolve) => {
            this.server.listen(this.config.port, this.config.host, undefined, () => {
                resolve(this);
            });
        });
    };

    public startSync = (): LiveServer => {
        this.server.listen(this.config.port, this.config.host);
        return this;
    };

    public shutdown = (): Promise<[Error | null, Error | null]> => {
        Logger.print('Shutting down cl-live-server..');
        return Promise.all([
            new Promise<Error | null>((resolve) => {
                this.watcher.close().then(() => {
                    Logger.debug('Successfully closed chokidar watcher');
                    resolve(null);
                });
            }),
            new Promise<Error | null>((resolve) => {
                this.server.close((err) => {
                    if (!err) {
                        Logger.debug('Successfully closed server');
                        resolve(null);
                    } else {
                        Logger.error(`Failed to close server: ${err.message}`);
                        resolve(err);
                    }
                });
            }),
        ]);
    };

    public shutdownSync = (): void => {
        Logger.print('Shutting down cl-live-server..');
        this.watcher.close();
        this.app.removeAllListeners();
        this.server.close();
    };

    public getServer = (): Server => this.server;
    public getClients = (): WebSocket[] => this.clients;
    public getWatcher = (): FSWatcher => this.watcher;

    private configureServer = (): [Server, Protocol] => {
        this.app
            .use(this.staticHandler)
            .use(this.entryPoint())
            .use(cast(serveIndex(this.config.root, { icons: true })));
        let server: Server;
        let protocol: Protocol;
        if (this.config.https !== null && this.config.httpsModule) {
            let httpsConfig = this.config.https;
            if (typeof this.config.https === 'string') {
                httpsConfig = require(path.resolve(
                    process.cwd(),
                    this.config.https
                ));
            }
            server = require(this.config.httpsModule).createServer(
                httpsConfig,
                this.app
            );
            protocol = 'https';
        } else {
            server = http.createServer(this.app);
            protocol = 'http';
        }
        Logger.debug(`Configuring server with ${protocol} protocol`);
        return [server, protocol];
    };

    private setReqLogger = (): void => {
        const isTest = process.env.NODE_ENV === 'test';
        if (Logger.logLevel === LogLevel.Middle) {
            this.app.use(
                reqLogger('dev', {
                    skip: (_, res) => {
                        return res.statusCode < 400 || isTest;
                    },
                })
            );
        } else if (Logger.logLevel > LogLevel.Middle) {
            this.app.use(reqLogger('dev', { skip: () => isTest }));
        }
    };

    private requireMiddleware = (): void => {
        this.config.spa && this.config.middleware.push(spaMiddleware);
        this.config.middleware.forEach((entry) => {
            let name: string;
            let result: NextHandleFunction;
            if (typeof entry === 'string') {
                name = entry;
                result = require(entry);
            } else {
                name = entry.name;
                result = entry;
            }
            Logger.debug(`Configured middleware ${name}`);
            this.app.use(result);
        });
    };

    private configureBasicAuth = (): void => {
        if (this.config.htpasswd) {
            const opts = {
                realm: 'Please authorize',
                file: this.config.htpasswd,
            };
            const basic = auth.basic(opts);
            this.app.use((req, res, next) => {
                basic.check(() => {
                    next();
                })(req, res);
            });
            Logger.debug('Configured BasicAuth with options', opts);
        }
    };

    private configureCors = (): void => {
        if (this.config.cors) {
            const opts = { origin: true, credentials: true };
            this.app.use(cors(opts));
            Logger.debug('Configured CORS with options', opts);
        }
    };

    private configureMountedPaths = (): void => {
        this.config.mount.forEach(([source, target]) => {
            const mountPath = path.resolve(process.cwd(), target);
            if (this.config.watch.length === 0) {
                this.config.watch.push(mountPath);
            }
            this.app.use(source, staticServerHandler(mountPath));
            Logger.debug(`Mapping mounted paths from '${source}' to '${mountPath}'`);
        });
    };

    private configureProxies = (): void => {
        this.config.proxy.forEach(([source, target]) => {
            this.app.use(
                source,
                proxyMiddleware({
                    ...url.parse(target),
                    via: true,
                    preserveHost: true,
                })
            );
            Logger.debug(`Mapping proxies '${source}' to '${target}'`);
        });
    };

    private configureWatcher = (): FSWatcher => {
        const ignored: WatchOptions['ignored'] = [];
        this.config.ignore && ignored.push(...this.config.ignore);
        return chokidar.watch(this.config.watch, {
            ignored,
            ignoreInitial: true,
        });
    };

    private entryPoint = (): NextHandleFunction => {
        if (!this.config.file)
            return (_, __, next) => {
                next();
            };
        return (req, res, next) => {
            req.url = '/' + this.config.file;
            this.staticHandler(req, res, next);
        };
    };

    private initializeErrorListener = (): void => {
        this.server.addListener('error', (err: Record<string, unknown>) => {
            if (err.code === 'EADDRINUSE') {
                const serveURL =
                    this.protocol +
                    '://' +
                    this.config.host +
                    ':' +
                    this.config.port;
                Logger.error(`${serveURL} is already in use. Trying another port.`);
                setTimeout(() => {
                    this.server.listen(0, this.config.host);
                }, 1000);
            } else {
                Logger.error(err.toString());
                this.shutdown();
            }
        });
    };

    private initializeCoreListener = (): void => {
        this.server.addListener('listening', () => {
            const address = <AddressInfo>this.server.address();
            const serveHost =
                address.address === '0.0.0.0' ? '127.0.0.1' : address.address;
            const openHost =
                this.config.host === '0.0.0.0' ? '127.0.0.1' : this.config.host;

            const serveURL = this.protocol + '://' + serveHost + ':' + address.port;
            const openURL = this.protocol + '://' + openHost + ':' + address.port;

            let serveURLs = [serveURL];
            if (Logger.logLevel > LogLevel.Middle && address.address === '0.0.0.0') {
                const ifaces = os.networkInterfaces();
                serveURLs = Object.keys(ifaces)
                    .reduce<os.NetworkInterfaceInfo[]>((acc, key) => {
                        const iface = ifaces[key];
                        if (iface) {
                            iface
                                .filter((addr) => addr.family === 'IPv4')
                                .forEach((entry) => {
                                    acc.push(entry);
                                });
                        }
                        return acc;
                    }, [])
                    .map(
                        (addr) =>
                            this.protocol + '://' + addr.address + ':' + address.port
                    );
            }

            if (serveURL === openURL) {
                if (serveURLs.length === 1) {
                    Logger.success(
                        `Serving '${this.config.root}' at '${serveURLs[0]}'`
                    );
                } else {
                    Logger.success(
                        `Serving '${this.config.root}' at\n\t'${serveURLs.join(
                            '\n\t'
                        )}'`
                    );
                }
            } else {
                Logger.success(
                    `Serving '${this.config.root}' at\n'${openURL}' ('${serveURL}')`
                );
            }
            this.openBrowser(openURL);
        });
    };

    private filterClients = (ws: WebSocket) => {
        const before = this.clients.length;
        this.clients = this.clients.filter((entry) => entry !== ws);
        Logger.debug(
            JSON.stringify({ before, after: this.clients.length }, null, 4)
        );
    };

    private initializeUpgradeListener = (): void => {
        this.server.addListener('upgrade', (req, socket, head) => {
            const ws: WebSocket = new FWebSocket(req, socket, head);
            ws.onopen = function () {
                ws.send('connected');
            };
            if (this.config.wait > 0) {
                const wssend = ws.send;
                const wait = this.config.wait;
                let waitTimeout: NodeJS.Timeout;
                ws.send = function () {
                    // eslint-disable-next-line prefer-rest-params
                    const args = arguments;
                    if (waitTimeout) {
                        clearTimeout(waitTimeout);
                    }
                    waitTimeout = setTimeout(() => {
                        wssend.apply(ws, cast(args));
                    }, wait);
                };
            }
            ws.onclose = () => {
                this.filterClients(ws);
            };
            this.clients.push(ws);
        });
    };

    private initializeWatchListener = (): void => {
        this.watcher
            .on('change', this.handleWatchChange)
            .on('add', this.handleWatchChange)
            .on('unlink', this.handleWatchChange)
            .on('addDir', this.handleWatchChange)
            .on('unlinkDir', this.handleWatchChange)
            .on('ready', () => {
                Logger.debug('Ready for changes');
            })
            .on('error', (err) => {
                Logger.error(err);
            });
    };

    private handleWatchChange = (changePath: string): void => {
        const cssChange =
            path.extname(changePath) === '.css' && !this.config.noCssInject;
        Logger.debug(`${cssChange ? 'CSS c' : 'C'}hange detected`);
        this.clients.forEach((client) => {
            if (client) {
                client.send(cssChange ? 'refreshcss' : 'reload');
            }
        });
    };

    private openBrowser = (openURL: string): void => {
        if (this.config.open !== null) {
            if (Array.isArray(this.config.open)) {
                this.config.open.forEach((p) => {
                    open(openURL + p, {
                        app: { name: this.config.browser || '' },
                    });
                });
            } else {
                open(openURL + this.config.open, {
                    app: { name: this.config.browser || '' },
                });
            }
        }
    };
}
