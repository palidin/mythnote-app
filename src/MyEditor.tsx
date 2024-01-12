import React, {useEffect, useState} from "react";

import './MyEditor.scss'
import {EditorDataDo, MarkdownEditorDataDo} from "$source/type/note";
import {useUpdateEffect} from "ahooks";

const ExEditor = React.lazy(() => import("../packages/eeditor/EditableEditor"))


interface MyEditorProps {
  data: EditorDataDo,
  updateBody
}

export const MyEditor = React.memo(MyEditorInner);

function MyEditorInner({data, updateBody}: MyEditorProps) {

  const [state, setState] = useState<MarkdownEditorDataDo>(null);

  const [isLoading, setIsLoading] = useState<boolean>(null);

  useEffect(() => {
    if (!data) return;
    setIsLoading(true)
  }, [data])

  useUpdateEffect(() => {
    if (!isLoading) return;
    const {path, content} = data;
    const onUpdate = (value) => {
      value = value.replace(/(\s*$)/g, "");
      updateBody({
        path: path,
        content: value
      });
    };
    setState({
      markdown: content,
      onUpdate,
    })

    setIsLoading(false);
  }, [isLoading]);


  if (isLoading !== false) {
    return <></>;
  }

  return (
    <div className={'ax-editor-wrapper'}>
      <BaseEditor markdown={state.markdown} onUpdate={state.onUpdate}/>
    </div>
  )
}


const BaseEditor = React.memo(ExEditor)
