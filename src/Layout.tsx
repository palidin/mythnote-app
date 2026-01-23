import React, {useCallback, useEffect, useRef} from "react";
import {useHotkeyMove, useMount} from "./utils/HookUtils";
import {Left} from "$source/layout/Left";
import {Middle} from "$source/layout/Middle";
import {Right} from "$source/layout/Right";
import {useAppStore, useTokenStore} from "./store/store";
import {checkStatusTask, isCopyable} from "./utils/utils";

import {ToastContainer} from 'react-toastify';
import {LoginModal} from "$source/components/LoginModal";

import 'react-toastify/dist/ReactToastify.css';
import MilkdownEditor from "$source/components/MilkdownEditor";


export function Layout() {


  const dataRebuilding = useAppStore(state => state.dataRebuilding)
  const token = useTokenStore(state => state.token)


  useMount(() => {
    document.oncontextmenu = (e) => {
      if (!isCopyable(e)) {
        return false;
      }
    }
  })

  useEffect(() => {
    if (!token) {
      return;
    }
    checkStatusTask()
      .then((ok) => {
        if (ok) {
          useAppStore.getState().setDataRebuilding(false);
        }
      })
  }, [token]);

  useHotkeyMove();

  const Page = useCallback(() => {

    if (!token) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
          <LoginModal/>
        </div>
      )
    }

    if (dataRebuilding) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="text-slate-600 text-lg">数据索引中...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-row h-screen overflow-hidden select-none">
        <Left/>
        <DivideLine/>
        <Middle/>
        <DivideLine/>
        <Right/>
        <div id={'popup'} className="absolute"></div>
        <div id={'contextmenu'} className="absolute"></div>
      </div>
    )
  }, [token, dataRebuilding]);


  return (
    <>
      <ToastContainer/>
      <Page/>
    </>
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
    <div
      ref={ref}
      className="w-0.5 bg-transparent hover:bg-slate-300 transition-colors cursor-col-resize relative z-10"
      style={{ minWidth: '2px' }}
    ></div>
  )
}
