import {TagFolder} from "../components/TagFolder";
import React, {useEffect, useState} from "react";
import {useAppStore, useGitConfigStore, useTokenStore} from "../store/store";
import {useMount} from "../utils/HookUtils";
import {myAgent} from "../agent/agentType";
import {resetSearchCondition} from "$source/utils/FileUtils";
import {GitConfig} from "../components/GitConfig";
import {syncGitRepo} from "$source/utils/GitSyncUtils";
import {LogOut, RefreshCw, Search, Settings} from "lucide-react";

export function Left({width}: { width: string }) {

  const [folders, setFolders] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [showGitConfig, setShowGitConfig] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'unsynced' | 'unknown'>('unknown');

  const {
    lastSyncTime,
    isSyncing,
    repoUrl,
    authToken
  } = useGitConfigStore(state => ({
    lastSyncTime: state.lastSyncTime,
    isSyncing: state.isSyncing,
    repoUrl: state.repoUrl,
    authToken: state.authToken
  }));

  async function handleManualSync() {
    if (!repoUrl || !authToken) {
      return;
    }
    await syncGitRepo();
  }

  function formatSyncTime(time: string | null) {
    if (!time) return '从未同步';
    const date = new Date(time);
    return date.toLocaleString();
  }

  useEffect(() => {
    async function fetchGitSyncStatus() {
      try {
        const status = await myAgent.getGitSyncStatus();
        if (status) {
          if (status.last_sync_time) {
            useGitConfigStore.getState().setLastSyncTime(status.last_sync_time);
          }
          // 根据服务器返回的状态设置同步状态
          if (status.has_changed) {
            setSyncStatus('unsynced');
          } else {
            setSyncStatus('synced');
          }
        }
      } catch (error) {
        console.error('获取Git同步状态失败:', error);
        setSyncStatus('unknown');
      }
    }

    useGitConfigStore.getState().setIsSyncing(false);
    fetchGitSyncStatus();

    // 定期检查同步状态
    const interval = setInterval(fetchGitSyncStatus, 15000); // 每30秒检查一次
    return () => clearInterval(interval);
  }, []);

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

        const {filteredChildren, hasMatch: childrenMatch} = filterTree(node.children || []);

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

      return {filteredChildren: result, hasMatch: anyChildMatch};
    };

    return filterTree(folders).filteredChildren;
  }, [folders, keyword]);


  function logout() {
    useTokenStore.getState().updateState({
      refresh_token: "",
      access_token: ""
    })
  }


  return (
    <div
      className="min-w-[240px] bg-[#0f172a] text-slate-300 h-screen flex flex-col border-r border-slate-800 shadow-xl"
      style={{width}}
    >
      {/* 顶部搜索区 - 增加内边距和圆润感 */}
      <div className="p-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400"/>
          </div>
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#1e293b] border border-transparent rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-500"
            placeholder="搜索标签或文档..."
          />
        </div>
      </div>

      {/* 内容滚动区 */}
      <div className="flex-1 overflow-y-auto px-2 custom-scrollbar left-scrollbar-fix">
        <TagFolder folders={filteredFolders} onTagClick={onTagClick} keyword={keyword}/>
      </div>

      {/* 底部操作栏 - 模块化设计 */}
      <div className="p-3 bg-[#0f172a]/80 backdrop-blur-sm border-t border-slate-800">

        {/* 极简同步状态栏 */}
        <div className="flex items-center justify-between px-2 mb-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}/>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            {syncStatus === 'synced' ? '已同步' : '待同步'}
          </span>
            </div>
            <span className="text-[10px] text-slate-600 mt-0.5">
          {formatSyncTime(lastSyncTime)}
        </span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing || !repoUrl}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-400' : ''}`}/>
          </button>
        </div>

        {/* 操作按钮组 - 采用侧边栏标准布局 */}
        <div className="space-y-1">
          <button
            onClick={() => setShowGitConfig(true)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg text-sm transition-colors group"
          >
            <Settings className="w-4 h-4 text-slate-500 group-hover:text-blue-400"/>
            <span>笔记设置</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-sm transition-colors group"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400"/>
            <span>退出登录</span>
          </button>
        </div>
      </div>

      {/* 配置弹窗 */}
      {showGitConfig && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
            <GitConfig onClose={() => setShowGitConfig(false)}/>
          </div>
        </div>
      )}
    </div>
  );
}
