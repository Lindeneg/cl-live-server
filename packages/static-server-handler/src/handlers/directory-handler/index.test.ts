import type { IncomingMessage } from 'connect';
import type { ServerResponse } from 'http';
import directoryHandler from '.';
import { cast } from '../../utils';

describe('@static-server-handler/directory-handler', () => {
    let req: IncomingMessage;
    let res: ServerResponse;
    let setHeader: () => void;
    let end: () => void;
    beforeEach(() => {
        setHeader = jest.fn();
        end = jest.fn();
        req = cast<IncomingMessage>({});
        res = cast<ServerResponse>({
            setHeader,
            end,
        });
    });
    test('can set header and end request with originalUrl property set', () => {
        req.originalUrl = '/hello';
        directoryHandler(req, res);
        expect(setHeader).toHaveBeenCalledWith('Location', '/hello/');
        expect(end).toHaveBeenCalledWith('Redirecting to /hello/');
    });
    test('can set header and end request without originalUrl property set', () => {
        req.originalUrl = '';
        directoryHandler(req, res);
        expect(setHeader).toHaveBeenCalledWith('Location', '/');
        expect(end).toHaveBeenCalledWith('Redirecting to /');
    });
});
