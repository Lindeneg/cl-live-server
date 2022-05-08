import typescript from 'rollup-plugin-typescript2';
import cleaner from 'rollup-plugin-cleaner';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const getFolderPath = (name) => {
    return name.startsWith('/') ? name : '/' + name;
};

const getOutput = (root, cjsFolder, esmFolder, isProd) => {
    const output = [];
    if (typeof cjsFolder === 'string') {
        const file = '/dist' + getFolderPath(cjsFolder) + '/index.js';
        output.push({
            file: root + file,
            format: 'cjs',
            exports: 'named',
            sourcemap: !isProd,
        });
        console.log('PUSHED CJS FILE', file);
    }
    if (typeof esmFolder === 'string') {
        const file = '/dist' + getFolderPath(esmFolder) + '/index.js';
        output.push({
            file: root + file,
            format: 'esm',
            exports: 'named',
            sourcemap: !isProd,
        });
        console.log('PUSHED ESM FILE', file);
    }
    return output;
};

const getPlugins = (root, isProd) => {
    const plugins = [
        cleaner({
            targets: [root + '/dist'],
        }),
        resolve(),
        commonjs(),
        typescript({
            tsconfig: root + '/tsconfig-build.json',
        }),
    ];

    if (isProd) {
        plugins.push(terser());
    }
    console.log(
        'PLUGINS',
        plugins.map((e) => e.name)
    );
    return plugins;
};

const getExternal = (pkg) => {
    const external = Object.keys(pkg.dependencies || []).map((key) => key);
    console.log('EXTERNAL', external);
    return external;
};

export default (cjsFolder = null, esmFolder = null) => {
    const root = process.cwd();
    const pkg = require(root + '/package.json');
    const isProd = process.env.NODE_ENV === 'production';

    console.log('BUILDING PACKAGE', pkg.name, 'IS PROD', isProd);

    return {
        input: root + '/src/index.ts',
        output: getOutput(root, cjsFolder, esmFolder, isProd),
        external: getExternal(pkg),
        plugins: getPlugins(root, isProd),
    };
};
