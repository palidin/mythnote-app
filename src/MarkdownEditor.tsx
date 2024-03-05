import React, {Suspense} from "react";
import {useDialogStateStore} from "$source/store/dialog";

const MonacoMarkdownEditor = React.lazy(() => import('@mythnote/markdown-editor/MonacoMarkdownEditor'));
const CodemirrorMarkdownEditor = React.lazy(() => import('@mythnote/markdown-editor/CodemirrorMarkdownEditor'));


interface MarkdownEditorProps {
  text: string;
  onUpdate: (data: string) => void;
}

export function MarkdownEditor({text, isVscode = false}) {

  const onUpdate = useDialogStateStore(state => state.onUpdate);

  let Editor: React.FC<MarkdownEditorProps> = isVscode ? MonacoMarkdownEditor : CodemirrorMarkdownEditor;


  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Editor onUpdate={onUpdate} text={text}/>
    </Suspense>
  );
}
