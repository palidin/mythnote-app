import React, {useEffect, useRef} from "react";
import {useDialogStateStore} from "$source/store/dialog";


export function MarkdownEditor({text}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const onUpdate = useDialogStateStore(state => state.onUpdate);

  // 外部 text 更新 → 同步到编辑器
  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerText !== text) {
      editorRef.current.innerText = text ?? "";
    }
  }, [text]);

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      onInput={e => {
        onUpdate((e.target as HTMLDivElement).innerText);
      }}
      className="w-full min-h-[300px] p-3 rounded-md border border-slate-200
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 whitespace-pre-wrap break-words"
      style={{
        fontFamily:
          "Consolas, Monaco, monospace"
      }}
    />
  );
}
