import path from 'path';
import { exit } from 'process';
import Logger, { LogSeverity } from '@cl-live-server/logger';
import { HELP } from '../constants';
import type { LiveServer } from '@cl-live-server/live-server';

export const kill = (code = 1): void => {
    exit(code);
};

export const errorAndExit = (msg: string): void => {
    Logger.error('ERROR: ' + msg);
    kill();
};

export const helpAndExit = (): void => {
    Logger.print(HELP, LogSeverity.None);
    kill(0);
};

export const next = (args: string[], currentIdx: number): string => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= args.length) {
        errorAndExit(`A required argument from '${args[currentIdx]}' was omitted.`);
    }
    return args.splice(nextIdx)[0];
};

export const getTuplesFromStrings = (
    entries: string[],
    callback: (match: RegExpMatchArray) => [string, string] = (m) => [m[1], m[2]]
): [string, string][] => {
    const result: [string, string][] = [];
    entries.forEach((entry) => {
        const match = entry.match(/([^:]+):(.+)$/);
        if (match) {
            result.push(callback(match));
        }
    });
    return result;
};

export const configureRelativePath = (root: string, target?: string[]): string[] => {
    if (target) {
        return target.map((e) => path.join(root, e));
    }
    return [];
};

export const configureCleanup = (server: LiveServer): void => {
    process.on('SIGINT', () => {
        Logger.print('Please wait for cleanup to finish..');
        server.shutdown().then(([watcher, server]) => {
            if (watcher !== null) {
                Logger.error(`Could not close watcher: ${watcher}`);
            }
            if (server !== null) {
                Logger.error(`Could not close server: ${server}`);
            }
            exit();
        });
    });
};

export const parseIntOrExit = (target: string, context?: string): number => {
    const parsedTarget = parseInt(target);
    if (Number.isNaN(parsedTarget)) {
        errorAndExit(target + ' is not an integer as required by ' + context);
    }
    return parsedTarget;
};
