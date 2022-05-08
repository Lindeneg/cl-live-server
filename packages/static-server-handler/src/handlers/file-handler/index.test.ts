import fs from 'fs';
import fileHandler from '.';

jest.mock('fs');

const mockedFs = jest.mocked(fs, true);

describe('@static-server-handler/file-handler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    test('can set injectTag to null if no inject candidates can be found', () => {
        mockedFs.readFileSync.mockReturnValue('');
        const state = { injectTag: '' };
        fileHandler(true, state, 'example.html');
        expect(state.injectTag).toBe(null);
    });
    test('can set injectTag to target if inject candidate can be found', () => {
        mockedFs.readFileSync.mockReturnValue('<body><div></div></body>');
        const state = { injectTag: null };
        fileHandler(true, state, 'example.html');
        expect(state.injectTag).toBe('</body>');
    });
});
