import React, {useEffect, useState} from 'react';
import {EditorState} from '@codemirror/state';
import {EditorView} from '@codemirror/view';
import {basicSetup} from "codemirror";
import {markdown} from "@codemirror/lang-markdown";
import {useDialogStateStore} from "$source/store/dialog";

const id = 'note-md-edit-container';


export function MarkdownEditor({text}) {
  const [editor, setEditor] = useState<EditorView>(null)

  const onUpdate = useDialogStateStore(state => state.onUpdate);


  const updateListenerExtension = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      const text = update.state.doc.toString();
      onUpdate(text)
    }
  });

  useEffect(() => {
    const view = new EditorView({
      state: EditorState.create({
        doc: text,
        extensions: [updateListenerExtension, basicSetup, markdown()]
      }),
      parent: document.getElementById(id)
    })

    setEditor(view)

    return () => view.dispatch()
  }, [])


  return (
    <div style={{border: '1px solid rgba(0, 0, 0, 0.1)'}} id={id}></div>
  );
}

