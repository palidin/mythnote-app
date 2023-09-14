import './assets/style/layout.scss';
import React, {useRef} from "react";
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
    <div className={"layout flex-row"}>
      <ToastContainer/>
      <Left/>
      <DivideLine/>
      <Middle/>
      <DivideLine/>

      <Right/>
      <div id={'popup'}></div>
      <div id={'contextmenu'}></div>
    </div>
  )
}

interface AxDom {
  left: number
  style: {
    width: string
  }
}

function DivideLine() {

  const ref = useRef();

  useMount(() => {
    const divider = ref.current as HTMLDivElement & AxDom;
    const el = divider.previousElementSibling as Omit<HTMLDivElement, "style"> & AxDom;
    divider.onmousedown = function (e) {
      const disX = e.clientX;
      divider.left = divider.offsetLeft;
      el.left = el.offsetLeft;
      document.onmousemove = function (e) {
        let middleLeft = divider.left + (e.clientX - disX);
        let maxWidth = document.body.clientWidth;
        middleLeft < 0 && (middleLeft = 0);
        middleLeft > maxWidth && (middleLeft = maxWidth);
        el.style.width = (middleLeft - el.left) + 'px'
        return false;
      };
      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
        // @ts-ignore
        divider.releaseCapture && divider.releaseCapture();
      };
      // @ts-ignore
      divider.setCapture && divider.setCapture();
      return false;
    };
  })
  return (
    <div ref={ref} className="divide-line"></div>
  )
}
