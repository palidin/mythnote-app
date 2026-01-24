import React, {useEffect, useState} from "react";

import {EditorDataDo, MarkdownEditorDataDo} from "$source/type/note";
import {useUpdateEffect} from "ahooks";
import AEditor from "$source/components/MilkdownEditor";
import TiptapEditor from "$source/components/TiptapEditor";


interface MyEditorProps {
  data: EditorDataDo,
  updateBody: (data: any) => void
}

export const WysiwygEditor = React.memo(WysiwygEditorInner);

function WysiwygEditorInner({data, updateBody}: MyEditorProps) {

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
    <div className="flex flex-col flex-1  absolute w-full h-full">
      <div className="flex-1 overflow-y-auto rounded-xl bg-white">
        <TiptapEditor markdown={state.markdown} updateBody={state.onUpdate}/>
      </div>
    </div>
  )
}

