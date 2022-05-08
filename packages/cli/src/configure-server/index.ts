import path from 'path';
import Logger, { LogLevel, LogSeverity } from '@cl-live-server/logger';
import {
    next,
    helpAndExit,
    getTuplesFromStrings,
    configureRelativePath,
    parseIntOrExit,
} from '../utils';
import type { Options } from '../types';

export default (args: string[], options: Options): void => {
    const mounts: string[] = [];
    for (let i = args.length - 1; i >= 2; --i) {
        const arg = args[i];

        switch (arg) {
            case '-B':
            case '--browser':
                options.browser = next(args, i);
                break;
            case '-F':
            case '--file':
                options.file = next(args, i);
                break;
            case '-H':
            case '--host':
                options.host = next(args, i);
                break;
            case '-Y':
            case '--htpasswd':
                options.htpasswd = next(args, i);
                break;
            case '-S':
            case '--https':
                options.https = next(args, i);
                break;
            case '-T':
            case '--https-module':
                options.httpsModule = next(args, i);
                break;
            case '--help':
                helpAndExit();
                break;
            case '-I':
            case '--ignore':
                options.ignore = next(args, i).split(',');
                break;
            case '-D':
            case '--middleware':
                options.middleware = next(args, i).split(',');
                break;
            case '-L':
            case '--log-level':
                options.logLevel = parseIntOrExit(next(args, i), '-L --log-level');
                break;
            case '-M':
            case '--mount':
                mounts.push(...next(args, i).split(','));
                break;
            case '-O':
            case '--open':
                options.open = next(args, i)
                    .split(',')
                    .map((e) => (e.startsWith('/') ? e : '/' + e));
                break;
            case '-P':
            case '--port':
                options.port = parseIntOrExit(next(args, i), '-P --port');
                break;
            case '-X':
            case '--proxy':
                options.proxy = getTuplesFromStrings(next(args, i).split(','));
                break;

            case '-R':
            case '--root':
                options.root = next(args, i);
                break;

            case '-Z':
            case '--wait':
                options.wait = parseIntOrExit(next(args, i), '-Z --wait');
                break;

            case '-W':
            case '--watch':
                options.watch = next(args, i).split(',');
                break;

            case '-C':
            case '--cors':
                options.cors = true;
                break;

            case '-N':
            case '--no-css-inject':
                options.noCssInject = true;
                break;

            case '-A':
            case '--no-browser':
                options.noBrowser = true;
                break;

            case '-U':
            case '--spa':
                options.spa = true;
                break;

            default:
                break;
        }
    }

    if (options.watch) {
        options.watch = configureRelativePath(options.root, options.watch);
    }
    if (options.ignore) {
        options.ignore = configureRelativePath(options.root, options.ignore);
    }

    if (mounts.length > 0) {
        options.mount = getTuplesFromStrings(mounts, (match) => [
            match[1],
            path.resolve(options.root, match[2]),
        ]);
    }

    if (options.logLevel >= LogLevel.More) {
        Logger.print(
            `Parsed config:\n${JSON.stringify(options, null, 4)}`,
            LogSeverity.Default
        );
    }
};
