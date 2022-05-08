import { exit } from 'process';
import Logger, { LogSeverity } from '@cl-live-server/logger';
import configure from '.';
import type { Options } from '../types';

jest.mock('@cl-live-server/logger');

jest.mock('process', () => ({
    exit: jest.fn(),
}));


const mockedExit = jest.mocked(exit);
const mockedLogger = jest.mocked(Logger, true);

const getOptions = (overrides: Partial<Options> = {}): Options => ({
    host: '0.0.0.0',
    port: 8080,
    root: '/some/root',
    logLevel: 2,
    ...overrides,
});

describe('@cli/configure-server', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test('can configure default options', () => {
        const logPrint = jest.fn();
        mockedLogger.print.mockImplementation(logPrint);
        const options = getOptions();
        configure([], options);
        expect(options).toEqual(options);
        expect(mockedLogger).toHaveBeenCalledTimes(0);
    });
    test('calls helpAndExit on --help', () => {
        const options = getOptions();
        configure(['', '', '--help'], options);
        expect(mockedExit).toHaveBeenCalledTimes(1);
    });
    test('can print parsed config if logLevel is appropriate', () => {
        const logPrint = jest.fn();
        mockedLogger.print.mockImplementation(logPrint);
        const options = getOptions({ logLevel: 3 });
        configure([], options);
        expect(logPrint).toHaveBeenCalledWith(
            `Parsed config:\n${JSON.stringify(options, null, 4)}`,
            LogSeverity.Default
        );
    });
    test('can use custom options', () => {
        const r = process.cwd();
        const options = getOptions();
        const expectedOptions = getOptions({
            browser: 'chrome',
            file: 'index.html',
            host: 'localhost',
            htpasswd: './htpasswd-file',
            https: './https-config',
            httpsModule: 'spyder',
            ignore: ['test/root/hello', 'test/root/there'],
            middleware: ['./path/to/middleware'],
            logLevel: 3,
            mount: [
                ['/some-path', r + '/test/root/some-file'],
                ['/some-other-path', r + '/test/root/some-other-file'],
            ],
            open: ['/hello', '/there'],
            port: 8000,
            proxy: [
                ['/some-path', 'https://some-proxy.com'],
                ['/some-other-path', 'http://other-proxy.com'],
            ],
            root: './test/root',
            wait: 5,
            watch: ['test/root/hello', 'test/root/there'],
            cors: true,
            noCssInject: true,
            noBrowser: true,
            spa: true,
        });
        configure(
            [
                '',
                '',
                '-B',
                'chrome',
                '-F',
                'index.html',
                '-H',
                'localhost',
                '-Y',
                './htpasswd-file',
                '-S',
                './https-config',
                '-T',
                'spyder',
                '-I',
                'hello,there',
                '-D',
                './path/to/middleware',
                '-L',
                '3',
                '-M',
                '/some-path:./some-file,/some-other-path:./some-other-file',
                '-O',
                'hello,/there',
                '-P',
                '8000',
                '-X',
                '/some-path:https://some-proxy.com,/some-other-path:http://other-proxy.com',
                '-R',
                './test/root',
                '-Z',
                '5',
                '-W',
                'hello,there',
                '-C',
                '-N',
                '-A',
                '-U',
            ],
            options
        );
        expect(options).toEqual(expectedOptions);
    });
});
