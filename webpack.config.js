import * as path from 'path';


const getPath = dir => path.resolve(__dirname, dir)

export default {
    resolve: {
        alias: {
            // 'use-sync-external-store/shim': 'use-sync-external-store/cjs/use-sync-external-store.development.js',
            'root@': getPath('src')
        }
    }
};