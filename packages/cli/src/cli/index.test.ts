import cli from '.';
import configureServer from '../configure-server';

jest.mock(
    '@cl-live-server/live-server',
    () =>
        class Test {
            startSync() {
                // test
            }
        }
);
jest.mock('../configure-server');

const args = ['', ''];

const mockedConfigureServer = jest.mocked(configureServer);

describe('@cli/cli', () => {
    beforeEach(() => {
        mockedConfigureServer.mockReset();
    });

    test('can configure default options', () => {
        mockedConfigureServer.mockImplementation(jest.fn());

        cli(args);

        expect(mockedConfigureServer).toHaveBeenCalledWith(args, {
            host: '0.0.0.0',
            port: 8080,
            root: process.cwd(),
            logLevel: 2,
        });
    });

    test('can configure with IP env set', () => {
        mockedConfigureServer.mockImplementation(jest.fn());

        process.env.IP = '127.0.0.1';

        cli(args);

        expect(mockedConfigureServer).toHaveBeenCalledWith(args, {
            host: '127.0.0.1',
            port: 8080,
            root: process.cwd(),
            logLevel: 2,
        });

        delete process.env.IP;
    });

    test('can configure with PORT env set', () => {
        mockedConfigureServer.mockImplementation(jest.fn());

        process.env.PORT = '9000';

        cli(args);

        expect(mockedConfigureServer).toHaveBeenCalledWith(args, {
            host: '0.0.0.0',
            port: 9000,
            root: process.cwd(),
            logLevel: 2,
        });
    });
});
