import Logger from '.';
import { LogLevel, LogSeverity } from '../enums';

describe('@logger/logger', () => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLogLevel = Logger.logLevel;
    const mockedLog = (...output: unknown[]) => consoleOutput.push(...output);
    const mockedWarn = (...output: unknown[]) => consoleOutput.push(...output);
    const mockedError = (...output: unknown[]) => consoleOutput.push(...output);
    let consoleOutput: unknown[] = [];
    beforeEach(() => {
        console.log = mockedLog;
        console.warn = mockedWarn;
        console.error = mockedError;
        consoleOutput = [];
        Logger.logLevel = originalLogLevel;
    });
    afterEach(() => {
        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
    });

    test('can set custom log level', () => {
        Logger.logLevel = LogLevel.Verbose;
        expect(Logger.logLevel).toBe(LogLevel.Verbose);
    });

    test('can use default log level', () => {
        expect(Logger.logLevel).toBe(originalLogLevel);
    });
    test('can print to stdout with none color', () => {
        Logger.print('test-message', LogSeverity.None);
        expect(consoleOutput[0]).toBe('\x1b[0m%s\x1b');
        expect(consoleOutput[1]).toBe('test-message');
    });
    test('can print to stdout with default debug color', () => {
        Logger.print('test-message');
        expect(consoleOutput[0]).toBe('\x1b[36m%s\x1b');
        expect(consoleOutput[1]).toBe('test-message');
    });
    test('can print to stdout with default warning color', () => {
        Logger.print('test-warning', LogSeverity.Warning);
        expect(consoleOutput[0]).toBe('\x1b[33m%s\x1b');
        expect(consoleOutput[1]).toBe('test-warning');
    });
    test('can print to stdout with default success color', () => {
        Logger.print('test-success', LogSeverity.Success);
        expect(consoleOutput[0]).toBe('\x1b[32m%s\x1b');
        expect(consoleOutput[1]).toBe('test-success');
    });
    test('can print to stderr with default error color', () => {
        Logger.print('test-error', LogSeverity.Error);
        expect(consoleOutput[0]).toBe('\x1b[31m%s\x1b');
        expect(consoleOutput[1]).toBe('test-error');
    });
    test('can use debug if level is appropiate', () => {
        Logger.logLevel = LogLevel.More;
        Logger.debug('test-debug');
        expect(consoleOutput[0]).toBe('\x1b[36m%s\x1b');
        expect(consoleOutput[1]).toBe('test-debug');
    });
    test('cannot use debug if level is not appropiate', () => {
        Logger.logLevel = LogLevel.Less;
        Logger.debug('test-debug');
        expect(consoleOutput.length).toBe(0);
    });

    test('can use warning if level is appropiate', () => {
        Logger.logLevel = LogLevel.Middle;
        Logger.warning('test-warning');
        expect(consoleOutput[0]).toBe('\x1b[33m%s\x1b');
        expect(consoleOutput[1]).toBe('test-warning');
    });
    test('cannot use warning if level is not appropiate', () => {
        Logger.logLevel = LogLevel.Less;
        Logger.warning('test-warning');
        expect(consoleOutput.length).toBe(0);
    });

    test('can use success if level is appropiate', () => {
        Logger.logLevel = LogLevel.Less;
        Logger.success('test-success');
        expect(consoleOutput[0]).toBe('\x1b[32m%s\x1b');
        expect(consoleOutput[1]).toBe('test-success');
    });
    test('cannot use success if level is not appropiate', () => {
        Logger.logLevel = LogLevel.Silent;
        Logger.success('test-success');
        expect(consoleOutput.length).toBe(0);
    });

    test('can use error if level is appropiate', () => {
        Logger.logLevel = LogLevel.Less;
        Logger.error('test-error');
        expect(consoleOutput[0]).toBe('\x1b[31m%s\x1b');
        expect(consoleOutput[1]).toBe('test-error');
    });
    test('cannot use error if level is not appropiate', () => {
        Logger.logLevel = LogLevel.Silent;
        Logger.error('test-error');
        expect(consoleOutput.length).toBe(0);
    });
});
