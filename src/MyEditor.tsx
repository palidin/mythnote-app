import {useMemoizedFn} from "ahooks";
import ExEditor from "../packages/eeditor/EditableEditor";
import React, {useEffect, useState} from "react";

import './MyEditor.scss'


export function MyEditor({path, content, updateBody}) {

  const onUpdate = useMemoizedFn((value) => {
    value = value.replace(/(\s*$)/g, "");
    updateBody({
      path: path,
      content: value
    })
  });

  const [text, setText] = useState(null);

  useEffect(() => {
    setText(null)
    setTimeout(() => setText(content), 100)
  }, [content])

  if (text === null) {
    return <></>;
  }
  return (
    <div className={'ax-editor-wrapper'}>
      <BaseEditor markdown={text} onUpdate={onUpdate}/>
    </div>
  )
}


const BaseEditor = React.memo(ExEditor)
