import {useMemoizedFn} from "ahooks";
import {ViditorEditor} from "../packages/vditor/ViditorEditor";
import {useEffect, useState} from "react";

export function MyEditor({path, content, updateBody}) {

  const onUpdate = useMemoizedFn((value) => {
    updateBody({
      path: path,
      content: value
    })
  });
  return (
    <ViditorEditor markdown={content} onUpdate={onUpdate}/>
  )
}
