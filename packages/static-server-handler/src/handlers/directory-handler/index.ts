import url from 'url';
import type { ServerResponse } from 'http';
import type { IncomingMessage } from 'connect';
import { escapeTarget } from '../../utils';

export default (req: IncomingMessage, res: ServerResponse): void => {
    const pathname = url.parse(req.originalUrl || '').pathname || '';
    res.statusCode = 301;
    res.setHeader('Location', pathname + '/');
    res.end('Redirecting to ' + escapeTarget(pathname) + '/');
};
