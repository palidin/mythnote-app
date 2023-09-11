import './assets/style/layout.scss';
import React from "react";
import './assets/style/contextmenu.css'
import {useHotkeyMove, useMount} from "./utils/HookUtils";
import {Left} from "$source/layout/Left";
import {Middle} from "$source/layout/Middle";
import {Right} from "$source/layout/Right";
import {useAppStore} from "./store/store";
import {checkStatusTask, isCopyable} from "./utils/utils";

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export function Layout() {

  useMount(() => {
    document.oncontextmenu = (e) => {
      if (!isCopyable(e)) {
        return false;
      }
    }

    checkStatusTask()
      .then((ok) => {
        if (ok) {
          useAppStore.getState().setDataRebuilding(false);
        }
      })
  })

  useHotkeyMove();

  const dataRebuilding = useAppStore(state => state.dataRebuilding)

  if (dataRebuilding) {
    return <div>数据索引中...</div>;
  }

  return (
    <div className={"layout"}>
      <ToastContainer/>
      <Left/>
      <Middle/>
      <Right/>
      <div id={'popup'}></div>
      <div id={'contextmenu'}></div>
    </div>
  )
}

