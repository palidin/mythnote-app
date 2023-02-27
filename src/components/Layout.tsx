import '../assets/style/layout.scss';
import React from "react";
import '../assets/style/contextmenu.css'
import {useMount} from "../utils/HookUtils";
import {Left} from "./layout/Left";
import {Middle} from "./layout/Middle";
import {Right} from "./layout/Right";
import {useAppStore, useNoteStore} from "../store/store";
import {checkStatusTask, isCopyable, selectStart} from "../utils/utils";


export function Layout() {

  function onKeydown(e) {
    let activeElement = document.activeElement;
    if (activeElement && activeElement.tagName == 'BODY') {
      let key = e.key;
      if (key == 'ArrowDown' || key == 'ArrowUp') {
        let isDown = key == 'ArrowDown';
        let itemIndex = useNoteStore.getState().itemIndex;
        itemIndex = isDown
          ? itemIndex + 1
          : itemIndex - 1;

        if (itemIndex < useNoteStore.getState().itemList.length
          && itemIndex >= 0) {
          useNoteStore.setState({itemIndex})
          selectStart(itemIndex)
        }

        e.preventDefault();
        return false;
      }
    }
  }

  useMount(() => {
    document.oncontextmenu = (e) => {
      if (!isCopyable(e)) {
        return false;
      }
    }

    window.addEventListener('keydown', onKeydown);


    checkStatusTask()
      .then((ok) => {
        if (ok) {
          useAppStore.getState().setDataRebuilding(false);
        }
      })

    return () => {
      document.oncontextmenu = null
      window.removeEventListener('keydown', onKeydown)
    };
  });

  const dataRebuilding = useAppStore(state => state.dataRebuilding)

  if (dataRebuilding) {
    return <div>数据索引中...</div>;
  }

  return (
    <div className={"layout"}>
      <Left/>
      <Middle/>
      <Right/>
      <div id={'popup'}></div>
      <div id={'contextmenu'}></div>
    </div>
  )
}

