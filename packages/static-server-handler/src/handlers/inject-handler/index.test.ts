import path from 'path';
import type { ServerResponse } from 'http';
import type { SendStream } from 'send';
import injectHandler from '.';
import { cast } from '../../utils';

jest.mock('event-stream', () => ({
    replace: () => 'test-replace',
}));

describe('@static-server/inject-handler', () => {
    let res: ServerResponse;
    let stream: SendStream;
    let setHeader: () => void;
    let getHeader: () => void;
    let pipe: <T>(e: T) => T;
    beforeEach(() => {
        setHeader = jest.fn();
        getHeader = jest.fn(() => '1000');
        pipe = cast(
            jest.fn(() => ({
                pipe,
            }))
        );
        stream = cast({ pipe });
        res = cast({
            setHeader,
            getHeader,
        });
    });

    test('does nothing if injectTag is null in state', () => {
        injectHandler(
            { injectTag: null },
            path.join(__dirname, '..', '..', 'html', 'index.html'),
            res,
            stream
        );
        expect(setHeader).toHaveBeenCalledTimes(0);
        expect(pipe).toHaveBeenCalledTimes(0);
    });

    test('gets and sets Content-Length header if injectTag is truthy', () => {
        injectHandler(
            { injectTag: '</body>' },
            path.join(__dirname, '..', '..', 'html', 'index.html'),
            res,
            stream
        );
        expect(getHeader).toHaveBeenCalledWith('Content-Length');
        expect(setHeader).toHaveBeenCalledWith('Content-Length', 1000);
        expect(pipe).toHaveBeenCalledTimes(0);
    });

    test('overrides stream.pipe and calls with stream and es.replace return value', () => {
        const spy = jest.spyOn(cast<{ call: () => void }>(pipe), 'call');
        injectHandler(
            { injectTag: '</body>' },
            path.join(__dirname, '..', '..', 'html', 'index.html'),
            res,
            stream
        );
        stream.pipe(res);
        expect(spy).toHaveBeenCalledWith(stream, 'test-replace');
    });
});
