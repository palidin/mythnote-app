import ClassicEditor from '@palidin/ckeditor5-markdown-build'
import {useEffect, useState} from "react";
import {markdownConfig} from "../ckeditor/markdownPlugin";
import LocalFileUploadAdapter from "../ckeditor/localFileUploadAdapter";
import {replaceRemoteHostImage} from "../utils/CkEditorUtils";
import {sharedVariables} from "../store/state";
import {useMount} from "../utils/HookUtils";


export function RichTextEditor({content, updateBody, seed = 0}) {

  const [editor, setEditor] = useState(null);
  const [sourceEditing, setSourceEditing] = useState();

  useMount(() => {
    ClassicEditor
      .create(document.getElementById('ckeditor-box'), {
        htmlEscaper: markdownConfig,
        simpleUpload: {
          adapter: LocalFileUploadAdapter,
          settings: {
            uploadUrl: 'http://demo.com/upload',
          },
        },
        codeBlock: {
          languages: [
            {language: 'plaintext', label: 'TXT'},
            {language: 'rust', label: 'Rust'},
            {language: 'javascript', label: 'Javascript'},
            {language: 'c', label: 'C'},
            {language: 'cpp', label: 'C++'},
            {language: 'json', label: 'Json'},
            {language: 'css', label: 'CSS'},
            {language: 'java', label: 'Java'},
            {language: 'php', label: 'PHP'},
            {language: 'xml', label: 'XML'},
            {language: 'sql', label: 'SQL'},
          ]
        }
      })
      .then(ins => {
        sharedVariables.editor = ins;
        setEditor(ins)
        initEditor(ins);
      })


    return () => {
      // @ts-ignore
      document.querySelector('.ck-editor__editable').ckeditorInstance.destroy()
    }
  })

  useEffect(() => {
    if (!editor) return
    editor.setData(content)
  }, [content, editor])

  useEffect(() => {
    if (!seed) return;
    if (!editor) return;
    onDataChange(editor.getData())
  }, [seed, editor])

  function onDataChange(data: string) {
    updateBody(data)
  }

  function initEditor(editor) {

    editor.editing.view.change(writer => {
      writer.setAttribute('spellcheck', 'false', editor.editing.view.document.getRoot());
    });

    editor.model.document.on('change:data', () => {
      onDataChange(editor.getData())
    });

    editor.editing.view.document.on('clipboardInput', (evt, data) => {
      const dataTransfer = data.dataTransfer;
      let content = dataTransfer.getData('text/html');
      if (content) {
        replaceRemoteHostImage(content)
      }
    }, {level: 'high'});


    const sourceEditingPlugin = editor.plugins.get('SourceEditing');
    sourceEditingPlugin.on('change:isSourceEditingMode', (evt, name, isSourceEditingMode) => {
      setSourceEditing(isSourceEditingMode)
    });
  }


  return (
    <>
      <div id={'ckeditor-box'}></div>
      <div id={'ckeditor-word-counter'} className={sourceEditing ? 'hide' : ''}></div>
    </>
  )
}
