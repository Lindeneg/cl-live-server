import fs from 'fs';
import Logger from '@cl-live-server/logger';

export const cast = <T>(arg: unknown): T => {
    return <T>arg;
};

export const isRootFile = (root: string): boolean => {
    try {
        return fs.statSync(root).isFile();
    } catch (e) {
        // silent
    }
    return false;
};

export const escapeTarget = (target: unknown): string => {
    return String(target)
        .replace(/&(?!\w+;)/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
};

export const getInjectedCode = (targetPath: string): string => {
    try {
        return fs.readFileSync(targetPath, 'utf8');
    } catch (e) {
        Logger.error(`failed to find injectTarget ${targetPath}`);
    }
    return '';
};
