module.exports = {
    ...require('../../scripts/get-jest-config')(
        '.',
        'src',
        'tsconfig.json',
        '../..'
    ),
};
