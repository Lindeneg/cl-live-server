import type { NextFunction } from 'connect';
import errorHandler from '.';

describe('@static-server-handler/error-handler', () => {
    let next: NextFunction;
    beforeEach(() => {
        next = jest.fn();
    });
    test('calls next without error if status is 404', () => {
        errorHandler(next, { msg: 'test', status: 404 });
        expect(next).toHaveBeenCalledWith();
    });
    test('calls next with error if status is not 404', () => {
        const obj = { msg: 'test', status: 500 };
        errorHandler(next, obj);
        expect(next).toHaveBeenCalledWith(obj);
    });
});
