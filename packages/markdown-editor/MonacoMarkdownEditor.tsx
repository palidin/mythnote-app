import Editor, {loader} from '@monaco-editor/react';

import * as monaco from 'monaco-editor';


const options = {
  minimap: {
    enabled: false
  },
  unicodeHighlight: {
    ambiguousCharacters: false,
  },
}

loader.config({monaco});

export default function MonacoMarkdownEditor({text, onUpdate}) {

  function onChange(text) {
    onUpdate(text)
  }

  return (
    <Editor height="75vh" options={options} defaultLanguage="markdown" defaultValue={text} onChange={onChange}/>
  );
}
