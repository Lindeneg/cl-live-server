import type { IncomingMessage, NextFunction, NextHandleFunction } from 'connect';
import type { ServerResponse } from 'http';
import send, { SendStream } from 'send';
import staticServerHandler from '.';
import { cast } from '../utils';

jest.mock('send');

const mockedSend = jest.mocked(send, true);

describe('@static-server-handler/static-server-handler', () => {
    let req: IncomingMessage;
    let res: ServerResponse;
    let pipe: (res: IncomingMessage) => IncomingMessage;
    let on: () => SendStream;
    let handler: NextHandleFunction;
    let next: NextFunction;
    let setHeader: () => void;
    let end: () => void;
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
        pipe = jest.fn((res: IncomingMessage) => res);
        on = jest.fn(
            (): SendStream =>
                cast<SendStream>({
                    on,
                    pipe,
                })
        );
        mockedSend.mockReturnValue(
            cast({
                on,
            })
        );
        handler = staticServerHandler(__dirname);
        setHeader = jest.fn();
        end = jest.fn();
        next = cast<NextFunction>(jest.fn());
        req = cast<IncomingMessage>({});
        res = cast<ServerResponse>({
            setHeader,
            end,
        });
    });
    test('calls next on non-get and non-head method', () => {
        handler(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(setHeader).toHaveBeenCalledTimes(0);
        expect(end).toHaveBeenCalledTimes(0);
    });
    test('calls send correctly when origin is specified without url', () => {
        const customReq = cast<IncomingMessage>({
            method: 'GET',
            headers: { origin: 'some-origin' },
        });

        handler(customReq, res, next);

        expect(mockedSend).toHaveBeenCalledWith(
            {
                headers: {
                    origin: 'some-origin',
                },
                method: 'GET',
            },
            '',
            { root: __dirname }
        );
    });
    test('calls send correctly when origin is specified with url', () => {
        const customReq = cast<IncomingMessage>({
            method: 'GET',
            url: 'example.com',
            headers: { origin: 'some-origin' },
        });

        handler(customReq, res, next);

        expect(mockedSend).toHaveBeenCalledWith(
            {
                headers: {
                    origin: 'some-origin',
                },
                method: 'GET',
                url: 'example.com',
            },
            'example.com',
            { root: __dirname }
        );
    });
    test('calls send correctly when origin is specified with url and root file', () => {
        const _root = __dirname + '/index.ts';
        const _handler = staticServerHandler(_root);
        const customReq = cast<IncomingMessage>({
            method: 'GET',
            url: 'example.com/index.ts',
            headers: { origin: 'some-origin' },
        });

        _handler(customReq, res, next);

        expect(mockedSend).toHaveBeenCalledWith(
            {
                headers: {
                    origin: 'some-origin',
                },
                method: 'GET',
                url: 'example.com/index.ts',
            },
            '',
            { root: _root }
        );
    });
    test('uses default arguments if none are given', () => {
        const _handler = staticServerHandler();
        const customReq = cast<IncomingMessage>({
            method: 'GET',
            url: 'example.com/index.ts',
            headers: { origin: 'some-origin' },
        });

        _handler(customReq, res, next);

        expect(mockedSend).toHaveBeenCalledWith(
            {
                headers: {
                    origin: 'some-origin',
                },
                method: 'GET',
                url: 'example.com/index.ts',
            },
            'example.com/index.ts',
            { root: '.' }
        );
    });
});
