// import Vditor from 'vditor/src/index'
// import {setEditMode} from 'vditor/src/ts/toolbar/EditMode'

import Vditor from 'vditor'
import 'vditor/dist/index.css'
import {useEffect, useState} from "react";
import {useMemoizedFn, useMount, useUpdateEffect} from "ahooks";

type ViewMode = "wysiwyg" | "ir" | "sv";
// type ViewMode = "sv" | "wysiwyg";

const DEFAULT_VIEW_MODE = 'ir';

const modeKeyMap = {
  wysiwyg: 7,
  ir: 8,
  sv: 9,
};

const ax = [
  "emoji",
  "headings",
  "bold",
  "italic",
  "strike",
  "link",
  "|",
  "list",
  "ordered-list",
  "check",
  "outdent",
  "indent",
  "|",
  "quote",
  "line",
  "code",
  "inline-code",
  "insert-before",
  "insert-after",
  "br",
  "|",
  "upload",
  "record",
  "table",
  "|",
  "undo",
  "redo",
  "|",
  "edit-mode",
  {
    name: "more",
    toolbar: [
      "both",
      "code-theme",
      "content-theme",
      "export",
      "outline",
      "preview",
      "devtools",
      "info",
      "help",
    ],
  },
];

export function ViditorEditor({markdown, onUpdate}) {


  const [editor, setEditor] = useState(null);

  const [mode, setMode] = useState<ViewMode>(DEFAULT_VIEW_MODE);

  const [init, setInit] = useState(false);

  const toggleMode = useMemoizedFn(() => {
    setMode(mode == 'sv' ? DEFAULT_VIEW_MODE : 'sv')
  })

  function gotoNextLine() {
    const event = new KeyboardEvent("keydown", {
      "key": "E",
      "ctrlKey": true,
      "shiftKey": true,
    });
    triggerKeyboard(event)
  }

  function triggerKeyboard(event: KeyboardEvent) {
    const ele = document.getElementsByClassName('vditor-reset')[0]
    ele.dispatchEvent(event);
  }

  useMount(() => {
    const editor = new Vditor('viditor-editor', {
      toolbar: [
        ...ax,
        "|",
        {
          name: 'html-br',
          tipPosition: 'n',
          tip: '插入换行',
          className: 'insert-br-btn',
          icon: '<svg t="1691647045102" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="21827" width="32" height="32"><path d="M864 192c-19.2 0-32 12.8-32 32v224c0 89.6-70.4 160-160 160H236.8l105.6-105.6c12.8-12.8 12.8-32 0-44.8s-32-12.8-44.8 0l-160 160c-3.2 3.2-6.4 6.4-6.4 9.6-3.2 6.4-3.2 16 0 25.6 3.2 3.2 3.2 6.4 6.4 9.6l160 160c6.4 6.4 12.8 9.6 22.4 9.6s16-3.2 22.4-9.6c12.8-12.8 12.8-32 0-44.8L236.8 672H672c124.8 0 224-99.2 224-224V224c0-19.2-12.8-32-32-32z" p-id="21828" fill="#2c2c2c"></path></svg>',
          click() {
            gotoNextLine();
            editor.insertValue('&#60;br&#62;', true);
            gotoNextLine();
          }
        },
        {
          name: 'toggle-mode',
          tipPosition: 'n',
          tip: '显示源码',
          className: 'md-toggle-btn',
          icon: '<svg t="1691646370426" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8134" width="32" height="32"><path d="M950 128H74C33.16 128 0 162.76 0 205.54v612.84C0 861.18 33.16 896 74 896h876c40.76 0 74-34.82 74-77.62V205.54C1024 162.76 990.84 128 950 128zM576 736h-128V512l-96 128-96-128v224H128V288h128l96 160 96-160h128z m192 0l-160-224h96.1L704 288h128v224h96z" p-id="8135"></path></svg>',
          click() {
            toggleMode();
          }
        },
      ],
      mode: mode,
      preview: {
        mode: 'editor',
      },
      input(value: string) {
        onUpdate(value)
      }
    })
    setEditor(editor)
  })

  useUpdateEffect(() => {
    const value = modeKeyMap[mode];
    const event = new KeyboardEvent("keydown", {
      altKey: true,
      ctrlKey: true,
      code: 'Digit' + value,
    });
    triggerKeyboard(event)
  }, [mode])


  useUpdateEffect(() => {
    setTimeout(() => {
      setInit(true)
    }, 500)
  }, [editor])

  useEffect(() => {
    if (!init) return;
    editor.setValue(markdown, true)
  }, [markdown, init])


  return (
    <div id='viditor-editor'></div>
  )
}



