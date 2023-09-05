import {javascript} from "@codemirror/lang-javascript";
import {cpp} from "@codemirror/lang-cpp";
import {php} from "@codemirror/lang-php";
import {rust} from "@codemirror/lang-rust";
import {html} from "@codemirror/lang-html";
import {java} from "@codemirror/lang-java";
import {python} from "@codemirror/lang-python";
import {LanguageSupport, StreamLanguage} from "@codemirror/language";
import {shell} from "@codemirror/legacy-modes/mode/shell";
import {powerShell} from "@codemirror/legacy-modes/mode/powershell";
import {markdown} from "@codemirror/lang-markdown";
import {go} from "@codemirror/legacy-modes/mode/go";
import {javascript as json} from "@codemirror/legacy-modes/mode/javascript";
import {yaml} from "@codemirror/legacy-modes/mode/yaml";
import {properties} from "@codemirror/legacy-modes/mode/properties";
import {standardSQL} from "@codemirror/legacy-modes/mode/sql";
import {xml} from "@codemirror/legacy-modes/mode/xml";

export const languages = [
  {
    value: 'plaintext',
    content: 'Plain text',
  },
  {
    value: 'javascript',
    content: 'JavaScript',
    plugin: javascript({
      jsx: true,
      typescript: true,
    }),
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
    plugin: php({
      plain: true,
    }),
  },
  {
    value: 'html',
    content: 'HTML',
    plugin: html(),
  },
  {
    value: 'python',
    content: 'Python',
    plugin: python(),
  },
  {
    value: 'bash',
    content: 'Bash',
    plugin: new LanguageSupport(StreamLanguage.define(shell)),
  },
  {
    value: 'ps1',
    content: 'PowerShell',
    plugin: new LanguageSupport(StreamLanguage.define(powerShell)),
  },
  {
    value: 'xml',
    content: 'XML',
    plugin: new LanguageSupport(StreamLanguage.define(xml)),
  },
  {
    value: 'sql',
    content: 'SQL',
    plugin: new LanguageSupport(StreamLanguage.define(standardSQL)),
  },
  {
    value: 'md',
    content: 'Markdown',
    plugin: markdown(),
  },
  {
    value: 'json',
    content: 'Json',
    plugin: new LanguageSupport(StreamLanguage.define(json)),
  },
  {
    value: 'yaml',
    content: 'Yaml',
    plugin: new LanguageSupport(StreamLanguage.define(yaml)),
  },
  {
    value: 'ini',
    content: 'Properties',
    plugin: new LanguageSupport(StreamLanguage.define(properties)),
  },
  {
    value: 'go',
    content: 'Golang',
    plugin: new LanguageSupport(StreamLanguage.define(go)),
  },
];
