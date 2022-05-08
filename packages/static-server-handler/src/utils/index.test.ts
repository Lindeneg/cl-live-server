import path from 'path';
import { cast, isRootFile, escapeTarget } from '.';

type TestFuncArgPrimitiveType = 'hello' | 'there';

type TestFuncArgType = {
    something: TestFuncArgPrimitiveType;
    else: TestFuncArgPrimitiveType;
};

const testFunc = <T>(arg: T) => {
    return arg;
};

describe('@static-server-handler/utils', () => {
    describe('cast', () => {
        test('can cast primitive type', () => {
            // eslint-disable-next-line @typescript-eslint/no-inferrable-types
            const target: string = 'hello';

            //@ts-expect-error should give TS error
            testFunc<TestFuncArgPrimitiveType>(target);

            // should not give TS error
            testFunc<TestFuncArgPrimitiveType>(cast(target));
        });
        test('can cast reference type', () => {
            const target = { something: 'hello', else: 'there' };

            //@ts-expect-error should give TS error
            testFunc<TestFuncArgType>(target);

            // should not give TS error
            testFunc<TestFuncArgType>(cast(target));
        });
    });
    describe('isRootFile', () => {
        test('can detect if target is file', () => {
            expect(isRootFile(path.join(__dirname, './index.ts'))).toBe(true);
        });
        test('can detect if target is not file', () => {
            expect(isRootFile(__dirname)).toBe(false);
        });
        test('does not throw error on invalid target', () => {
            //@ts-expect-error testing invalid arg
            expect(isRootFile(null)).toBe(false);
        });
    });
    describe('escapeTarget', () => {
        test('can escape target', () => {
            expect(escapeTarget('hello&there<miles>"davis"')).toEqual(
                'hello&amp;there&lt;miles&gt;&quot;davis&quot;'
            );
        });
    });
});
