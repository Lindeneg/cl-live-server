module.exports = function (_root, _targetDir, _tsconfig, optsRoot = '.') {
    const root = _root.endsWith('/') ? _root.slice(0, _root.length - 1) : _root;
    const target = _targetDir.replace(/\//g, '');
    const tsconfig = _tsconfig.replace(/\//g, '');
    return {
        roots: [root],
        testMatch: [`**/${target}/**/*.test.+(ts|tsx|js)`],
        testPathIgnorePatterns: ['/dist/', '/node_modules/'],
        transform: {
            '^.+\\.(ts|tsx)$': 'ts-jest',
        },
        globals: {
            'ts-jest': {
                tsconfig: `${root}/${tsconfig}`,
            },
        },
        setupFiles: [`${optsRoot}/jest.setup.js`],
        globalTeardown: `${optsRoot}/jest-global-teardown`,
        verbose: true,
        collectCoverage: false,
        collectCoverageFrom: [`**/${target}/**/*.ts`],
        coveragePathIgnorePatterns: ['/dist/', '/node_modules/'],
        coverageReporters: ['lcov', 'text'],
        coverageThreshold: {
            global: {
                branches: 90,
                functions: 90,
                lines: 90,
            },
        },
    };
};
