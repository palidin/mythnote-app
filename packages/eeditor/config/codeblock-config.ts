import {javascript} from "@codemirror/lang-javascript";
import {cpp} from "@codemirror/lang-cpp";
import {php} from "@codemirror/lang-php";
import {rust} from "@codemirror/lang-rust";
import {html} from "@codemirror/lang-html";
import {java} from "@codemirror/lang-java";
import {markdown} from "@codemirror/lang-markdown";

export const languages = [
  {
    value: 'plaintext',
    content: 'Plain text',
  },

  {
    value: 'javascript',
    content: 'JavaScript',
    plugin: javascript(),
  },
  {
    value: 'rust',
    content: 'Rust',
    plugin: rust(),
  },
  {
    value: 'cpp',
    content: 'C++',
    plugin: cpp(),
  },
  {
    value: 'c',
    content: 'C',
    plugin: cpp(),
  },
  {
    value: 'java',
    content: 'Java',
    plugin: java(),
  },
  {
    value: 'php',
    content: 'PHP',
    plugin: php(),
  },
  {
    value: 'html',
    content: 'HTML',
    plugin: html(),
  },
  {
    value: 'go',
    content: 'Golang',
  },
  {
    value: 'md',
    content: 'Markdown',
    plugin: markdown(),
  },
];
