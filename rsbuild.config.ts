import {defineConfig} from '@rsbuild/core';
import {pluginReact} from '@rsbuild/plugin-react';
import {pluginSass} from '@rsbuild/plugin-sass';

console.log( process.env.NODE_ENV)
export default defineConfig({
  html: {
    title: '我的笔记本',
  },

  source: {
    define: {
      // 注意：值必须经过 JSON.stringify，否则会被当做变量名执行
      'import.meta.env': {
        'IS_Dev': process.env.NODE_ENV == "development" ? 1 : 0,
      }
    },
  },
  output: {
    legalComments: 'none',
    polyfill: 'off',
    distPath: {
      font: 'assets/font',
      js: 'assets/js',
      css: 'assets/css',
    },
  },
  plugins: [pluginReact(), pluginSass()],
});
