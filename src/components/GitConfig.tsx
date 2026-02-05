import React, { useState, useEffect } from 'react';
import { useAppStore, useGitConfigStore } from '../store/store';
import { toast } from 'react-toastify';
import { myAgent } from '../agent/agentType';
import { checkStatusTask, delayRun } from "$source/utils/utils";
import { syncGitRepo } from "$source/utils/GitSyncUtils";
import { Loader2, Save } from 'lucide-react'; // 引入图标库

interface GitConfigProps {
  onClose?: () => void;
}

export function GitConfig({ onClose }: GitConfigProps) {
  const {
    repoUrl,
    authToken,
    syncInterval,
    setRepoUrl,
    setAuthToken,
    setSyncInterval
  } = useGitConfigStore(state => ({
    repoUrl: state.repoUrl,
    authToken: state.authToken,
    syncInterval: state.syncInterval,
    setRepoUrl: state.setRepoUrl,
    setAuthToken: state.setAuthToken,
    setSyncInterval: state.setSyncInterval
  }));

  const [localRepoUrl, setLocalRepoUrl] = useState(repoUrl);
  const [localAuthToken, setLocalAuthToken] = useState(authToken);
  const [localSyncInterval, setLocalSyncInterval] = useState(syncInterval.toString());

  // 新增：保存状态控制
  const [isSaving, setIsSaving] = useState(false);

  async function checkStatus() {
    let res = await checkStatusTask();
    if (res) {
      useAppStore.getState().setDataRebuilding(false);
      return Promise.resolve();
    }
    return delayRun(3000).then(() => checkStatus());
  }

  async function handleSave() {
    if (!localRepoUrl) {
      toast.error('请输入Git仓库地址');
      return;
    }

    if (!localAuthToken) {
      toast.error('请输入授权令牌');
      return;
    }

    const interval = parseInt(localSyncInterval);
    if (isNaN(interval) || interval <= 0) {
      toast.error('请输入有效的同步间隔');
      return;
    }

    try {
      setIsSaving(true); // 开始动画

      // 调用服务器API保存Git配置
      await myAgent.saveGitConfig({
        repoUrl: localRepoUrl,
        authToken: localAuthToken,
        syncInterval: interval
      });

      // 更新本地状态
      setRepoUrl(localRepoUrl);
      setAuthToken(localAuthToken);
      setSyncInterval(interval);

      toast.success('Git配置保存成功');

      // 重新建立索引 (不阻塞 UI 关闭)
      useAppStore.getState().setDataRebuilding(true);
      myAgent.cleanup().then(() => checkStatus());

      // 延迟关闭，让用户看清成功状态
      setTimeout(() => {
        onClose?.();
        setIsSaving(false);
      }, 500);

    } catch (error) {
      console.error('保存Git配置失败:', error);
      toast.error('保存Git配置失败：' + error);
      setIsSaving(false); // 失败时恢复按钮
    }
  }



  useEffect(() => {
    async function fetchGitConfig() {
      try {
        const config = await myAgent.getGitConfig();
        if (config) {
          setRepoUrl(config.repoUrl || '');
          setAuthToken(config.authToken || '');
          setSyncInterval(config.syncInterval || 60);

          setLocalRepoUrl(config.repoUrl || '');
          setLocalAuthToken(config.authToken || '');
          setLocalSyncInterval((config.syncInterval || 60).toString());
        }
      } catch (error) {
        console.error('获取Git配置失败:', error);
      }
    }
    fetchGitConfig();
  }, []);



  return (
    <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-md select-text border border-slate-100">
      <h2 className="text-xl font-semibold mb-4 text-slate-800 flex items-center gap-2">
        Git仓库配置
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Git仓库地址</label>
          <input
            type="text"
            value={localRepoUrl}
            onChange={(e) => setLocalRepoUrl(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition-all"
            placeholder="https://github.com/username/repo.git"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">授权令牌</label>
          <input
            type="password" // 敏感信息建议用 password 类型
            value={localAuthToken}
            onChange={(e) => setLocalAuthToken(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition-all"
            placeholder="GitHub Personal Access Token"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">同步间隔（分钟）</label>
          <input
            type="number"
            value={localSyncInterval}
            onChange={(e) => setLocalSyncInterval(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 transition-all"
            min="1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8">
        {onClose && (
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            取消
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="min-w-[100px] flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium disabled:opacity-70 disabled:cursor-wait"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? '保存中...' : '保存配置'}
        </button>
      </div>
    </div>
  );
}
