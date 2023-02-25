import '../assets/style/layout.scss';
import React from "react";
import '../assets/style/contextmenu.css'
import {useMount} from "../utils/HookUtils";
import {Left} from "./layout/Left";
import {Middle} from "./layout/Middle";
import {Right} from "./layout/Right";
import {useAppStore} from "../store/store";
import {checkStatusTask, isCopyable} from "../utils/utils";


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

    return () => document.oncontextmenu = null;
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

