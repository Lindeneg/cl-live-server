/* eslint-disable quotes */
import { exit } from 'process';
import Logger, { LogSeverity } from '@cl-live-server/logger';
import {
    errorAndExit,
    helpAndExit,
    next,
    getTuplesFromStrings,
    configureRelativePath,
    configureCleanup,
    parseIntOrExit,
} from '.';
import { HELP } from '../constants';

jest.mock('process', () => ({
    exit: jest.fn(),
}));

jest.mock('@cl-live-server/logger');
jest.mock('@cl-live-server/live-server');

const mockedExit = jest.mocked(exit);
const mockedLogger = jest.mocked(Logger, true);

describe('@cli/utils', () => {
    beforeEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
        jest.clearAllMocks();
    });

    test('errorAndExit logs error and calls process.exit with code 1', () => {
        const logError = jest.fn();
        mockedLogger.error.mockImplementation(logError);
        errorAndExit('test-error');
        expect(logError).toHaveBeenCalledWith('ERROR: test-error');
        expect(mockedExit).toHaveBeenCalledWith(1);
    });
    test('helpAndExit logs help message and calls process.exit with code 0', () => {
        const logPrint = jest.fn();
        mockedLogger.print.mockImplementation(logPrint);
        helpAndExit();
        expect(logPrint).toHaveBeenCalledWith(HELP, LogSeverity.None);
        expect(mockedExit).toHaveBeenCalledWith(0);
    });
    test('next removes and returns next array element', () => {
        const args = ['hello', 'there'];

        expect(next(args, 0)).toBe('there');
        expect(args.length).toBe(1);
    });
    test('next throws error if no next array element', () => {
        const logError = jest.fn();
        mockedLogger.error.mockImplementation(logError);
        const args = ['hello'];

        next(args, 0);

        expect(logError).toHaveBeenCalledWith(
            "ERROR: A required argument from 'hello' was omitted."
        );
        expect(mockedExit).toHaveBeenCalledWith(1);
    });
    test('getTuplesFromString returns tuples without callback', () => {
        expect(getTuplesFromStrings(['miles:davis', 'bill:evans'])).toEqual([
            ['miles', 'davis'],
            ['bill', 'evans'],
        ]);
    });
    test('configureRelativePath joins root to paths', () => {
        expect(
            configureRelativePath('./some-root', ['/some/path', '/hello-there/sir'])
        ).toEqual(['some-root/some/path', 'some-root/hello-there/sir']);
    });
    test('configureRelativePath returns empty array if no paths', () => {
        expect(configureRelativePath('./some-root')).toEqual([]);
    });
    test('configureCleanup sets listener for SIGINT', (done) => {
        const logPrint = jest.fn();
        mockedLogger.print.mockImplementation(logPrint);

        //@ts-expect-error test
        configureCleanup({
            shutdown: () => new Promise((resolve) => resolve([null, null])),
        });

        process.emit('SIGINT');

        setTimeout(() => {
            expect(logPrint).toHaveBeenCalledWith(
                'Please wait for cleanup to finish..'
            );
            done();
        }, 500);
    });
    test('configureCleanup can react to watcher error', (done) => {
        const logError = jest.fn();
        mockedLogger.error.mockImplementation(logError);

        //@ts-expect-error test
        configureCleanup({
            shutdown: () =>
                new Promise((resolve) => resolve([new Error('test-error'), null])),
        });

        process.emit('SIGINT');

        setTimeout(() => {
            expect(logError).toHaveBeenCalledWith(
                'Could not close watcher: Error: test-error'
            );
            done();
        }, 500);
    });
    test('configureCleanup can react to server error', (done) => {
        const logError = jest.fn();
        mockedLogger.error.mockImplementation(logError);

        //@ts-expect-error test
        configureCleanup({
            shutdown: () =>
                new Promise((resolve) => resolve([null, new Error('test-error')])),
        });

        process.emit('SIGINT');

        setTimeout(() => {
            expect(logError).toHaveBeenCalledWith(
                'Could not close server: Error: test-error'
            );
            done();
        }, 500);
    });

    test('parseIntOrExit can call errorAndExit on NaN', () => {
        const logError = jest.fn();
        mockedLogger.error.mockImplementation(logError);

        parseIntOrExit('test-error', '-t --test');

        expect(logError).toHaveBeenCalledWith(
            'ERROR: test-error is not an integer as required by -t --test'
        );

        expect(mockedExit).toHaveBeenCalledWith(1);
    });
});
