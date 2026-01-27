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
  const [keyword, setKeyword] = useState('');

  useMount(() => {
    myAgent.categoryList()
      .then(res => setFolders(res))
  })

  // Helper to find node by fullname
  function findNode(nodes, fullname) {
    for (const node of nodes) {
      if (node.fullname === fullname) return node;
      if (node.children) {
        const found = findNode(node.children, fullname);
        if (found) return found;
      }
    }
    return null;
  }

  function onTagClick(fullname, keys) {
    // Find the node in the original folders tree using fullname
    // We ignore 'keys' because they might be incorrect when filtering
    const current = findNode(folders, fullname);

    if (current) {
      if (!(current.fullname == '' && current.expand && !!useAppStore.getState().searchData.folder)) {
        current.expand = !current.expand;
      }
      setFolders([...folders]);
      
      resetSearchCondition({
        folder: current.fullname,
        keywords: '',
      })
    }
  }

  const filteredFolders = React.useMemo(() => {
    if (!keyword) return folders;

    const filterTree = (nodes) => {
      let anyChildMatch = false;
      const result = nodes.map(node => {
        const matchSelf = node.name.toLowerCase().includes(keyword.toLowerCase());
        
        if (matchSelf) {
          anyChildMatch = true;
          return {
            ...node,
            children: node.children
          };
        }

        const { filteredChildren, hasMatch: childrenMatch } = filterTree(node.children || []);
        
        if (childrenMatch) {
          anyChildMatch = true;
          return {
            ...node,
            children: filteredChildren,
            expand: true // Expand only if children match (path to match)
          };
        }
        return null;
      }).filter(Boolean);

      return { filteredChildren: result, hasMatch: anyChildMatch };
    };

    return filterTree(folders).filteredChildren;
  }, [folders, keyword]);


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
      <div className="p-4 pb-0">
        <input 
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="w-full px-3 py-1.5 bg-[#2d3748] border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 placeholder-slate-400"
          placeholder="搜索..."
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-gutter-stable left-scrollbar-fix">
        <TagFolder folders={filteredFolders} onTagClick={onTagClick} keyword={keyword}></TagFolder>
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
