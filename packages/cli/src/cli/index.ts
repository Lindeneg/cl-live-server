import LiveServer from '@cl-live-server/live-server';
import Logger from '@cl-live-server/logger';
import configureServer from '../configure-server';
import { configureCleanup } from '../utils';
import type { Options } from '../types';

export const cli = (args: string[]) => {
    const options: Options = {
        host: process.env.IP || '0.0.0.0',
        port: Number(process.env.PORT) || 8080,
        root: process.cwd(),
        logLevel: Logger.logLevel,
    };

    configureServer(args, options);

    configureCleanup(new LiveServer(options).startSync());
};

export default cli;
