import React, {useCallback, useEffect, useRef, useState} from "react";
import {useHotkeyMove, useMount} from "./utils/HookUtils";
import {Left} from "$source/layout/Left";
import {Middle} from "$source/layout/Middle";
import {Right} from "$source/layout/Right";
import {useAppStore, useGitConfigStore, useTokenStore} from "./store/store";
import {checkStatusTask, isCopyable} from "./utils/utils";

import {ToastContainer} from 'react-toastify';
import {LoginModal} from "$source/components/LoginModal";
import {GitConfig} from "$source/components/GitConfig";

import 'react-toastify/dist/ReactToastify.css';
import {myAgent} from "./agent/agentType";


export function Layout() {


  const dataRebuilding = useAppStore(state => state.dataRebuilding)
  const access_token = useTokenStore(state => state.access_token)
  const refresh_token = useTokenStore(state => state.refresh_token)
  const [showGitConfigModal, setShowGitConfigModal] = useState(false)
  const [_, setGitConfigChecked] = useState(false)

  // 列宽状态管理
  const [leftWidth, setLeftWidth] = useState<string>(() => {
    const saved = localStorage.getItem('layout.leftWidth');
    return saved || '15%';
  });

  const [middleWidth, setMiddleWidth] = useState<string>(() => {
    const saved = localStorage.getItem('layout.middleWidth');
    return saved || '15%';
  });


  useMount(() => {
    document.oncontextmenu = (e) => {
      if (!isCopyable(e)) {
        return false;
      }
    }
  })

  useEffect(() => {
    if (!access_token) {
      setGitConfigChecked(false);
      return;
    }
    checkStatusTask()
      .then((ok) => {
        if (ok) {
          useAppStore.getState().setDataRebuilding(false);
        }
      });

    // 检查Git配置
    const checkGitConfig = async () => {
      try {
        const config = await myAgent.getGitConfig();
        const {setRepoUrl, setAuthToken, setSyncInterval, setLastSyncTime} = useGitConfigStore.getState();

        if (config) {
          setRepoUrl(config.repoUrl || '');
          setAuthToken(config.authToken || '');
          setSyncInterval(config.syncInterval || 60);
          setLastSyncTime(config.lastSyncTime || null);
        }

        // 检查是否需要显示Git配置页面
        const {repoUrl, authToken} = useGitConfigStore.getState();
        if (!repoUrl || !authToken) {
          setShowGitConfigModal(true);
        }

        setGitConfigChecked(true);
      } catch (error) {
        console.error('获取Git配置失败:', error);
        setGitConfigChecked(true);
      }
    };

    checkGitConfig();
  }, [access_token]);

  // 保存列宽到本地存储
  useEffect(() => {
    localStorage.setItem('layout.leftWidth', leftWidth);
  }, [leftWidth]);

  useEffect(() => {
    localStorage.setItem('layout.middleWidth', middleWidth);
  }, [middleWidth]);

  // 处理列宽变化
  const handleWidthChange = (index: number, width: string) => {
    if (index === 0) {
      setLeftWidth(width);
    } else if (index === 1) {
      setMiddleWidth(width);
    }
  };


  useHotkeyMove();

  const Page = useCallback(() => {

    if (!access_token) {
      return (
        <div
          className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
        <Left width={leftWidth}/>
        <DivideLine index={0} onWidthChange={handleWidthChange}/>
        <Middle width={middleWidth}/>
        <DivideLine index={1} onWidthChange={handleWidthChange}/>
        <Right/>
        <div id={'popup'} className="absolute"></div>
        <div id={'contextmenu'} className="absolute"></div>
      </div>
    )
  }, [access_token, dataRebuilding, leftWidth, middleWidth, handleWidthChange]);

  // 1. 未登录状态
  if (!access_token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <LoginModal />
        <ToastContainer />
      </div>
    );
  }

  // 2. 数据索引状态
  if (dataRebuilding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="text-slate-600 text-lg">数据索引中...</p>
        </div>
        <ToastContainer />
      </div>
    );
  }


// 3. 标准布局状态
  return (
    <div className="flex flex-row h-screen overflow-hidden select-none">
      <ToastContainer />
      {/* 侧边栏组件 - 现在的 width 变化只会触发子组件更新，而不会导致子组件重装 */}
      <Left width={leftWidth} />

      <DivideLine index={0} onWidthChange={handleWidthChange} />

      <Middle width={middleWidth} />

      <DivideLine index={1} onWidthChange={handleWidthChange} />

      <Right />

      {/* 挂载点 */}
      <div id="popup" className="absolute"></div>
      <div id="contextmenu" className="absolute"></div>

      {/* Git 配置弹窗（如果需要） */}
      {/*{showGitConfigModal && (*/}
      {/*  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">*/}
      {/*    <GitConfig onClose={() => setShowGitConfigModal(false)} />*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
}


interface AxDom {
  left: number
  style: {
    width: string
  }
}

function DivideLine({index, onWidthChange}: {index: number, onWidthChange: (index: number, width: string) => void}) {

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
        // 保存调整后的宽度
        if (onWidthChange) {
          onWidthChange(index, el.style.width);
        }
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
      style={{minWidth: '2px'}}
    ></div>
  )
}
