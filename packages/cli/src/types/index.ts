/* istanbul ignore file */
import type { LiveServerOptions } from '@cl-live-server/live-server';

type DefaultKeys = 'host' | 'port' | 'root' | 'logLevel';

export type Options = Omit<LiveServerOptions, DefaultKeys> & {
    [K in DefaultKeys]-?: NonNullable<LiveServerOptions[K]>;
};

export type RequireOpts<K extends keyof Options> = Omit<Options, K> & {
    [U in K]-?: Options[K];
};
