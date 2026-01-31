import {defineConfig} from '@rsbuild/core';
import {pluginReact} from '@rsbuild/plugin-react';
import {pluginSass} from '@rsbuild/plugin-sass';


export default defineConfig({
  html: {
    title: '我的笔记本',
  },

  source: {
    define: {
      // 注意：值必须经过 JSON.stringify，否则会被当做变量名执行
      'import.meta.env': {
        'IS_Packed': process.argv.slice(2).find(arg => arg.includes('--pack')) ? 1 : 0,
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
