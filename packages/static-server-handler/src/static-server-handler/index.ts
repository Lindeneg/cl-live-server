import url from 'url';
import path from 'path';
import send from 'send';
import type { NextHandleFunction } from 'connect';
import handlers from '../handlers';
import { isRootFile } from '../utils';
import type { State } from '../types';

export default (
    root = '.',
    injectRoot = __dirname,
    injectTarget = '../html/index.html'
) => {
    const isFile = isRootFile(root);
    const src = path.join(injectRoot, injectTarget);
    const handler: NextHandleFunction = (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
        }

        const reqPath = isFile ? '' : url.parse(req.url || '').pathname || '';
        const hasNoOrigin = !req.headers.origin;
        const state: State = { injectTag: null };

        send(req, reqPath, { root })
            .on('error', handlers.errorHandler.bind(null, next))
            .on('directory', handlers.directoryHandler.bind(null, req, res))
            .on('file', handlers.fileHandler.bind(null, hasNoOrigin, state))
            .on('stream', handlers.injectHandler.bind(null, state, src, res))
            .pipe(res);
    };
    return handler;
};
