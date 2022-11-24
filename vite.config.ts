import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'

import * as  webpackConfig from './webpack.config.js';
import inject from "@rollup/plugin-inject";


export default defineConfig(({command, mode}) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '')

    return {
        define: {
            __APP_ENV__: `(${JSON.stringify(env)})`,
            'process.env': {},
            // __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })', // 禁用开发工具，热加载，开发工具下载提示
        },
        optimizeDeps: {
            include: [
                "ckeditor",
            ]
        },
        build: {
            commonjsOptions: {
                // transformMixedEsModules: false,
                // esmExternals: true,
                // requireReturnsDefault: '',
                // defaultIsModuleExports: "auto",
                exclude: ['ckeditor'],
                include: []
            },
            rollupOptions: {
                plugins: [
                    inject({Buffer: ['buffer', 'Buffer']})
                ],
            }
        },
        plugins: [
            react(),
        ],
        resolve: webpackConfig.default.resolve,

    }
})


declare const process: any;