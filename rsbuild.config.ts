import {defineConfig} from '@rsbuild/core';
import {pluginReact} from '@rsbuild/plugin-react';

export default defineConfig({
  html: {
    title: '我的笔记本',
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
  plugins: [pluginReact()],
});
