import {TagFolder} from "../components/TagFolder";
import React, {useState} from "react";
import {useAppStore} from "../store/store";
import {useMount} from "../utils/HookUtils";
import {myAgent} from "../agent/agentType";
import {checkStatusTask, delayRun} from "../utils/utils";
import {showConfirmModal} from "../utils/MessageUtils";
import {resetSearchCondition} from "$source/utils/FileUtils";
import {tokenManger} from "$source/agent/tokenManger";

export function Left() {

  const [folders, setFolders] = useState([]);

  useMount(() => {
    myAgent.categoryList()
      .then(res => setFolders(res))
  })

  function onTagClick(folder, keys) {
    let current: any = folders;

    let index = 0;
    for (let key of keys) {
      if (index++ == 0) {
        current = current[key];
      } else {
        current = current.children[key];
      }
    }

    if (!(current.fullname == '' && current.expand && !!useAppStore.getState().searchData.folder)) {
      current.expand = !current.expand;
    }

    setFolders([...folders]);

    resetSearchCondition({
      folder: current.fullname,
      keywords: '',
    })

  }


  function cleanup() {

    showConfirmModal('确认要重建数据索引吗？')
      .then(() => {
        useAppStore.getState().setDataRebuilding(true);
        myAgent.cleanup()
          .then(() => {
            return checkStatus();
          })
      })

  }

  async function checkStatus() {
    let res = await checkStatusTask();
    if (res) {
      useAppStore.getState().setDataRebuilding(false);
      return Promise.resolve();
    }
    return delayRun(3000)
      .then(() => checkStatus())
  }

  function logout() {
    tokenManger.clearToken();
  }


  return (
    <div className="w-[15%] bg-[#1e293b] text-white h-screen flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 scrollbar-gutter-stable left-scrollbar-fix">
        <TagFolder folders={folders} onTagClick={onTagClick}></TagFolder>
      </div>

      <div className='flex-shrink-0 p-4 pt-3 flex flex-col gap-2 bg-[#1e293b] border-t border-slate-700'>
        <button 
          onClick={cleanup}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          清空缓存
        </button>
        <button 
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
